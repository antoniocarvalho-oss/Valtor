import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock all DB functions before importing autoChecker
vi.mock("./db", () => ({
  getAllPendingBets: vi.fn(),
  batchUpdateGameResults: vi.fn(),
  getUsersForNotification: vi.fn(),
  getUltimoConcurso: vi.fn(),
  getConcursoByNumero: vi.fn(),
  getAllLoterias: vi.fn(),
  createBatchNotifications: vi.fn(),
}));

// Mock notification helper
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
    })),
  },
}));

import { runAutoChecker } from "./autoChecker";
import {
  getAllPendingBets,
  batchUpdateGameResults,
  getUsersForNotification,
  getUltimoConcurso,
  getConcursoByNumero,
} from "./db";

const mockedGetAllPendingBets = vi.mocked(getAllPendingBets);
const mockedBatchUpdateGameResults = vi.mocked(batchUpdateGameResults);
const mockedGetUsersForNotification = vi.mocked(getUsersForNotification);
const mockedGetUltimoConcurso = vi.mocked(getUltimoConcurso);
const mockedGetConcursoByNumero = vi.mocked(getConcursoByNumero);

beforeEach(() => {
  vi.clearAllMocks();
  // Set SMTP env vars for email sending
  process.env.SMTP_HOST = "smtp.test.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "test@test.com";
  process.env.SMTP_PASS = "testpass";
  process.env.SMTP_FROM = "noreply@valtor.com.br";
});

describe("runAutoChecker", () => {
  it("returns zeros when there are no pending bets", async () => {
    mockedGetAllPendingBets.mockResolvedValue([]);

    const result = await runAutoChecker();

    expect(result).toEqual({ checked: 0, notified: 0, errors: 0 });
    expect(mockedGetAllPendingBets).toHaveBeenCalledOnce();
    expect(mockedBatchUpdateGameResults).not.toHaveBeenCalled();
  });

  it("checks bets against latest results and calculates acertos correctly", async () => {
    mockedGetAllPendingBets.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        loteriaSlug: "megasena",
        dezenas: [5, 12, 23, 34, 45, 56],
        concursoApostado: null,
        nome: "Meu jogo",
      },
      {
        id: 2,
        userId: 10,
        loteriaSlug: "megasena",
        dezenas: [1, 2, 3, 4, 5, 6],
        concursoApostado: null,
        nome: "Outro jogo",
      },
    ]);

    mockedGetUltimoConcurso.mockResolvedValue({
      id: 100,
      loteriaSlug: "megasena",
      numero: 2986,
      dezenas: [5, 12, 23, 34, 45, 56],
      dataSorteio: "2026-03-19",
      ganhadores: [
        { faixa: "6 acertos", quantidade: 0, premio: 50000000 },
        { faixa: "5 acertos", quantidade: 120, premio: 35000 },
        { faixa: "4 acertos", quantidade: 8500, premio: 800 },
      ],
      premiacoes: [],
      acumulou: false,
      valorAcumulado: null,
      createdAt: new Date(),
    } as any);

    mockedGetUsersForNotification.mockResolvedValue([
      { id: 10, name: "Antonio", email: "antonio@test.com", emailOptIn: true },
    ]);

    const result = await runAutoChecker();

    // First bet: 6 acertos (all match), Second bet: 1 acerto (only 5 matches)
    expect(result.checked).toBe(2);
    expect(mockedBatchUpdateGameResults).toHaveBeenCalledOnce();

    const updates = mockedBatchUpdateGameResults.mock.calls[0][0];
    expect(updates).toHaveLength(2);

    // First bet should have 6 acertos and prize value
    const bet1Update = updates.find((u: any) => u.id === 1);
    expect(bet1Update?.acertos).toBe(6);
    expect(bet1Update?.conferido).toBe(true);
    expect(bet1Update?.valorGanho).toBe("50000000.00");

    // Second bet should have 1 acerto (only number 5 matches), no prize
    const bet2Update = updates.find((u: any) => u.id === 2);
    expect(bet2Update?.acertos).toBe(1);
    expect(bet2Update?.conferido).toBe(true);
    expect(bet2Update?.valorGanho).toBeUndefined();
  });

  it("skips bets for future draws", async () => {
    mockedGetAllPendingBets.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        loteriaSlug: "megasena",
        dezenas: [5, 12, 23, 34, 45, 56],
        concursoApostado: 3000, // Future draw
        nome: "Jogo futuro",
      },
    ]);

    mockedGetUltimoConcurso.mockResolvedValue({
      id: 100,
      loteriaSlug: "megasena",
      numero: 2986, // Current draw is 2986, bet is for 3000
      dezenas: [5, 12, 23, 34, 45, 56],
      dataSorteio: "2026-03-19",
      ganhadores: [],
      premiacoes: [],
      acumulou: false,
      valorAcumulado: null,
      createdAt: new Date(),
    } as any);

    // getConcursoByNumero returns null for future draw
    mockedGetConcursoByNumero.mockResolvedValue(undefined);

    const result = await runAutoChecker();

    // Should not check future bets
    expect(result.checked).toBe(0);
    expect(mockedBatchUpdateGameResults).not.toHaveBeenCalled();
  });

  it("fetches specific concurso when bet targets a specific draw number", async () => {
    mockedGetAllPendingBets.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        loteriaSlug: "megasena",
        dezenas: [5, 12, 23, 34, 45, 56],
        concursoApostado: 2985, // Specific past draw
        nome: "Jogo específico",
      },
    ]);

    // Latest concurso is 2986
    mockedGetUltimoConcurso.mockResolvedValue({
      id: 100,
      loteriaSlug: "megasena",
      numero: 2986,
      dezenas: [1, 2, 3, 4, 5, 6],
      dataSorteio: "2026-03-19",
      ganhadores: [],
      premiacoes: [],
      acumulou: false,
      valorAcumulado: null,
      createdAt: new Date(),
    } as any);

    // Specific concurso 2985 has different numbers
    mockedGetConcursoByNumero.mockResolvedValue({
      id: 99,
      loteriaSlug: "megasena",
      numero: 2985,
      dezenas: [5, 12, 23, 34, 45, 56],
      dataSorteio: "2026-03-18",
      ganhadores: [
        { faixa: "6 acertos", quantidade: 1, premio: 45000000 },
        { faixa: "5 acertos", quantidade: 100, premio: 30000 },
      ],
      premiacoes: [],
      acumulou: false,
      valorAcumulado: null,
      createdAt: new Date(),
    } as any);

    mockedGetUsersForNotification.mockResolvedValue([
      { id: 10, name: "Antonio", email: "antonio@test.com", emailOptIn: true },
    ]);

    const result = await runAutoChecker();

    expect(result.checked).toBe(1);
    expect(mockedGetConcursoByNumero).toHaveBeenCalledWith("megasena", 2985);

    const updates = mockedBatchUpdateGameResults.mock.calls[0][0];
    expect(updates[0].acertos).toBe(6);
    expect(updates[0].valorGanho).toBe("45000000.00");
  });

  it("does not send email when user has emailOptIn=false", async () => {
    mockedGetAllPendingBets.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        loteriaSlug: "lotofacil",
        dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        concursoApostado: null,
        nome: "Jogo LF",
      },
    ]);

    mockedGetUltimoConcurso.mockResolvedValue({
      id: 200,
      loteriaSlug: "lotofacil",
      numero: 3640,
      dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      dataSorteio: "2026-03-19",
      ganhadores: [
        { faixa: "15 acertos", quantidade: 1, premio: 2000000 },
      ],
      premiacoes: [],
      acumulou: false,
      valorAcumulado: null,
      createdAt: new Date(),
    } as any);

    // User opted out of emails
    mockedGetUsersForNotification.mockResolvedValue([
      { id: 10, name: "Antonio", email: "antonio@test.com", emailOptIn: false },
    ]);

    const result = await runAutoChecker();

    expect(result.checked).toBe(1);
    expect(result.notified).toBe(0); // No email sent
  });

  it("handles multiple loterias in a single run", async () => {
    mockedGetAllPendingBets.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        loteriaSlug: "megasena",
        dezenas: [5, 12, 23, 34, 45, 56],
        concursoApostado: null,
        nome: "Mega",
      },
      {
        id: 2,
        userId: 10,
        loteriaSlug: "lotofacil",
        dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        concursoApostado: null,
        nome: "LF",
      },
    ]);

    mockedGetUltimoConcurso
      .mockResolvedValueOnce({
        id: 100,
        loteriaSlug: "megasena",
        numero: 2986,
        dezenas: [5, 12, 23, 34, 45, 56],
        dataSorteio: "2026-03-19",
        ganhadores: [
          { faixa: "Sena", quantidade: 0, premio: 50000000 },
          { faixa: "Quina", quantidade: 120, premio: 35000 },
        ],
        premiacoes: [],
        acumulou: false,
        valorAcumulado: null,
        createdAt: new Date(),
      } as any)
      .mockResolvedValueOnce({
        id: 200,
        loteriaSlug: "lotofacil",
        numero: 3640,
        dezenas: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25],
        dataSorteio: "2026-03-19",
        ganhadores: [
          { faixa: "15 acertos", quantidade: 0, premio: 2000000 },
          { faixa: "14 acertos", quantidade: 5, premio: 1500 },
          { faixa: "13 acertos", quantidade: 200, premio: 25 },
          { faixa: "12 acertos", quantidade: 3000, premio: 10 },
          { faixa: "11 acertos", quantidade: 20000, premio: 6 },
        ],
        premiacoes: [],
        acumulou: false,
        valorAcumulado: null,
        createdAt: new Date(),
      } as any);

    mockedGetUsersForNotification.mockResolvedValue([
      { id: 10, name: "Antonio", email: "antonio@test.com", emailOptIn: true },
    ]);

    const result = await runAutoChecker();

    // Both bets checked
    expect(result.checked).toBe(2);
    expect(mockedGetUltimoConcurso).toHaveBeenCalledTimes(2);

    const updates = mockedBatchUpdateGameResults.mock.calls[0][0];
    // Mega-Sena bet: 6 acertos → Sena prize
    const megaUpdate = updates.find((u: any) => u.id === 1);
    expect(megaUpdate?.acertos).toBe(6);
    expect(megaUpdate?.valorGanho).toBe("50000000.00");

    // Lotofácil bet: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] vs [1,3,5,7,9,11,13,15,17,19,20,21,22,23,25]
    // Matching: 1,3,5,7,9,11,13,15 = 8 acertos → no prize tier for 8
    const lfUpdate = updates.find((u: any) => u.id === 2);
    expect(lfUpdate?.acertos).toBe(8);
    expect(lfUpdate?.valorGanho).toBeUndefined();
  });

  it("calculates prize using faixa name patterns like Sena/Quina/Quadra", async () => {
    mockedGetAllPendingBets.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        loteriaSlug: "megasena",
        dezenas: [5, 12, 23, 34, 45, 56],
        concursoApostado: null,
        nome: "Jogo Quina",
      },
    ]);

    mockedGetUltimoConcurso.mockResolvedValue({
      id: 100,
      loteriaSlug: "megasena",
      numero: 2986,
      dezenas: [5, 12, 23, 34, 45, 60], // 5 match (56 != 60)
      dataSorteio: "2026-03-19",
      ganhadores: [
        { faixa: "Sena", quantidade: 0, premio: 50000000 },
        { faixa: "Quina", quantidade: 120, premio: 35000 },
        { faixa: "Quadra", quantidade: 8500, premio: 800 },
      ],
      premiacoes: [],
      acumulou: false,
      valorAcumulado: null,
      createdAt: new Date(),
    } as any);

    mockedGetUsersForNotification.mockResolvedValue([
      { id: 10, name: "Antonio", email: "antonio@test.com", emailOptIn: true },
    ]);

    const result = await runAutoChecker();

    expect(result.checked).toBe(1);
    const updates = mockedBatchUpdateGameResults.mock.calls[0][0];
    expect(updates[0].acertos).toBe(5);
    expect(updates[0].valorGanho).toBe("35000.00"); // Quina prize
  });
});
