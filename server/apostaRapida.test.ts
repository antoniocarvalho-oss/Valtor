import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getActiveSubscription: vi.fn(),
    getActiveBets: vi.fn(),
    getSavedGamesByUser: vi.fn(),
  };
});

import { getActiveSubscription, getActiveBets, getSavedGamesByUser } from "./db";

const mockGetActiveSubscription = vi.mocked(getActiveSubscription);
const mockGetActiveBets = vi.mocked(getActiveBets);
const mockGetSavedGamesByUser = vi.mocked(getSavedGamesByUser);

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("apostaRapida.listar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.apostaRapida.listar()).rejects.toThrow();
  });

  it("rejects non-subscribers", async () => {
    mockGetActiveSubscription.mockResolvedValue(null as any);
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.apostaRapida.listar()).rejects.toThrow(
      "Aposta Rápida é exclusiva para assinantes"
    );
  });

  it("returns grouped pending bets for subscribers", async () => {
    mockGetActiveSubscription.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "active",
      plan: "premium",
    } as any);

    mockGetActiveBets.mockResolvedValue([
      {
        id: 10,
        userId: 1,
        loteriaSlug: "megasena",
        dezenas: [1, 5, 12, 23, 34, 45],
        nome: "Jogo 1",
        apostado: true,
        conferido: false,
        concursoApostado: 2987,
        createdAt: new Date(),
      },
      {
        id: 11,
        userId: 1,
        loteriaSlug: "megasena",
        dezenas: [7, 14, 21, 28, 35, 42],
        nome: "Jogo 2",
        apostado: true,
        conferido: false,
        concursoApostado: 2987,
        createdAt: new Date(),
      },
      {
        id: 12,
        userId: 1,
        loteriaSlug: "lotofacil",
        dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        nome: "LF 1",
        apostado: true,
        conferido: false,
        concursoApostado: 3200,
        createdAt: new Date(),
      },
    ] as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.apostaRapida.listar();

    expect(result.total).toBe(3);
    expect(result.jogos.megasena).toHaveLength(2);
    expect(result.jogos.lotofacil).toHaveLength(1);
    expect(result.jogos.megasena[0].dezenas).toEqual([1, 5, 12, 23, 34, 45]);
    expect(result.jogos.megasena[0].concursoApostado).toBe(2987);
  });

  it("returns empty when no pending bets", async () => {
    mockGetActiveSubscription.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "active",
    } as any);
    mockGetActiveBets.mockResolvedValue([]);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.apostaRapida.listar();

    expect(result.total).toBe(0);
    expect(result.jogos).toEqual({});
  });
});

describe("apostaRapida.todos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.apostaRapida.todos()).rejects.toThrow();
  });

  it("rejects non-subscribers", async () => {
    mockGetActiveSubscription.mockResolvedValue(null as any);
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.apostaRapida.todos()).rejects.toThrow(
      "Aposta Rápida é exclusiva para assinantes"
    );
  });

  it("returns all saved games grouped by lottery", async () => {
    mockGetActiveSubscription.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "active",
    } as any);

    mockGetSavedGamesByUser.mockResolvedValue([
      {
        id: 10,
        userId: 1,
        loteriaSlug: "megasena",
        dezenas: [1, 5, 12, 23, 34, 45],
        nome: "Jogo 1",
        apostado: true,
        conferido: false,
        concursoApostado: 2987,
        createdAt: new Date(),
      },
      {
        id: 20,
        userId: 1,
        loteriaSlug: "quina",
        dezenas: [10, 20, 30, 40, 50],
        nome: "Quina 1",
        apostado: false,
        conferido: false,
        concursoApostado: null,
        createdAt: new Date(),
      },
    ] as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.apostaRapida.todos();

    expect(result.total).toBe(2);
    expect(result.jogos.megasena).toHaveLength(1);
    expect(result.jogos.quina).toHaveLength(1);
    expect(result.jogos.megasena[0].apostado).toBe(true);
    expect(result.jogos.quina[0].apostado).toBe(false);
  });
});

// Mock generateApiToken for token tests
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getActiveSubscription: vi.fn(),
    getActiveBets: vi.fn(),
    getSavedGamesByUser: vi.fn(),
    generateApiToken: vi.fn(),
  };
});

import { generateApiToken } from "./db";
const mockGenerateApiToken = vi.mocked(generateApiToken);

describe("apostaRapida.gerarToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.apostaRapida.gerarToken()).rejects.toThrow();
  });

  it("rejects non-subscribers", async () => {
    mockGetActiveSubscription.mockResolvedValue(null as any);
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.apostaRapida.gerarToken()).rejects.toThrow(
      "Aposta Rápida é exclusiva para assinantes"
    );
  });

  it("generates and returns a token for subscribers", async () => {
    mockGetActiveSubscription.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "active",
    } as any);
    mockGenerateApiToken.mockResolvedValue("vt_test_token_123");

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.apostaRapida.gerarToken();

    expect(result.token).toBe("vt_test_token_123");
    expect(mockGenerateApiToken).toHaveBeenCalledWith(1);
  });
});
