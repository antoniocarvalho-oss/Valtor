import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  getNotificationsByUser: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  // Other db functions that routers.ts imports
  getAllLoterias: vi.fn().mockResolvedValue([]),
  getLoteriaBySlug: vi.fn(),
  getUltimoConcurso: vi.fn(),
  getConcursoByNumero: vi.fn(),
  getConcursosRecentes: vi.fn(),
  getConcursosPaginados: vi.fn(),
  getFrequenciaNumeros: vi.fn(),
  getAtrasoNumeros: vi.fn(),
  getSavedGamesByUser: vi.fn(),
  saveGame: vi.fn(),
  deleteSavedGame: vi.fn(),
  updateGameBet: vi.fn(),
  updateGameResult: vi.fn(),
  getROIByLoteria: vi.fn(),
  getActiveBets: vi.fn(),
  getActiveSubscription: vi.fn(),
  createSubscription: vi.fn(),
  getUserById: vi.fn(),
  updateUserProfile: vi.fn(),
  normalizeSlug: vi.fn((s: string) => s),
  getAdminOverview: vi.fn(),
  getAdminUsersList: vi.fn(),
  getAdminSignupsByDay: vi.fn(),
  getAdminRecentActivity: vi.fn(),
  getAdminRevenue: vi.fn(),
  getFoldersByUser: vi.fn(),
  createFolder: vi.fn(),
  updateFolder: vi.fn(),
  deleteFolder: vi.fn(),
  moveGameToFolder: vi.fn(),
  backtestGame: vi.fn(),
  reuseGame: vi.fn(),
  upsertUser: vi.fn(),
  createBatchNotifications: vi.fn(),
}));

// Mock other imports that routers.ts needs
vi.mock("./caixaApi", () => ({
  syncUltimoConcurso: vi.fn(),
  fetchConcursoByNumero: vi.fn(),
  fetchUltimoConcurso: vi.fn(),
  getFullFrequencia: vi.fn(),
}));

vi.mock("./emailService", () => ({
  sendDailyResultsEmails: vi.fn(),
  sendTestEmail: vi.fn(),
}));

vi.mock("./autoChecker", () => ({
  runAutoChecker: vi.fn(),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(),
  Preference: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  getNotificationsByUser,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./db";

const mockedGetNotifications = vi.mocked(getNotificationsByUser);
const mockedGetUnreadCount = vi.mocked(getUnreadNotificationCount);
const mockedMarkRead = vi.mocked(markNotificationRead);
const mockedMarkAllRead = vi.mocked(markAllNotificationsRead);

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notificacoes router", () => {
  it("listar returns notifications for the authenticated user", async () => {
    const mockNotifs = [
      {
        id: 1,
        userId: 42,
        tipo: "resultado",
        titulo: "🍀 Mega-Sena #2986 conferido",
        mensagem: "Seu jogo foi conferido: 3 acertos no concurso #2986.",
        loteriaSlug: "megasena",
        concursoNumero: 2986,
        acertos: 3,
        valorGanho: null,
        lida: false,
        createdAt: new Date("2026-03-20T22:30:00Z"),
      },
      {
        id: 2,
        userId: 42,
        tipo: "premiado",
        titulo: "🎯 Parabéns! 14 acertos na Lotofácil!",
        mensagem: "Você acertou 14 números no concurso #3640 da Lotofácil! Prêmio: R$ 1.500,00",
        loteriaSlug: "lotofacil",
        concursoNumero: 3640,
        acertos: 14,
        valorGanho: "1500.00",
        lida: false,
        createdAt: new Date("2026-03-20T22:30:00Z"),
      },
    ];
    mockedGetNotifications.mockResolvedValue(mockNotifs);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.listar({ limit: 20 });

    expect(result).toEqual(mockNotifs);
    expect(mockedGetNotifications).toHaveBeenCalledWith(42, 20);
  });

  it("contarNaoLidas returns unread count", async () => {
    mockedGetUnreadCount.mockResolvedValue(5);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.contarNaoLidas();

    expect(result).toBe(5);
    expect(mockedGetUnreadCount).toHaveBeenCalledWith(42);
  });

  it("marcarLida marks a notification as read", async () => {
    mockedMarkRead.mockResolvedValue(undefined);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.marcarLida({ id: 1 });

    expect(result).toEqual({ ok: true });
    expect(mockedMarkRead).toHaveBeenCalledWith(1, 42);
  });

  it("marcarTodasLidas marks all notifications as read", async () => {
    mockedMarkAllRead.mockResolvedValue(undefined);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.marcarTodasLidas();

    expect(result).toEqual({ ok: true });
    expect(mockedMarkAllRead).toHaveBeenCalledWith(42);
  });
});

describe("BRT date formatting", () => {
  it("formats dates with America/Sao_Paulo timezone", () => {
    // At 00:30 UTC on March 21, BRT should show March 20
    const utcMidnight = new Date("2026-03-21T00:30:00Z");
    const formatted = utcMidnight.toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    // In BRT (UTC-3), 00:30 UTC = 21:30 BRT on March 20
    expect(formatted).toBe("20/03/2026");
  });

  it("formats full date string with BRT timezone", () => {
    const utcMidnight = new Date("2026-03-21T00:30:00Z");
    const formatted = utcMidnight.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
    // Should show "sexta-feira, 20 de março de 2026" (BRT time)
    expect(formatted).toContain("20");
    expect(formatted).toContain("março");
    expect(formatted).toContain("2026");
  });

  it("correctly shows same day when UTC time is after 03:00", () => {
    // At 15:00 UTC on March 21, BRT should show March 21 (12:00 BRT)
    const utcAfternoon = new Date("2026-03-21T15:00:00Z");
    const formatted = utcAfternoon.toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    expect(formatted).toBe("21/03/2026");
  });
});
