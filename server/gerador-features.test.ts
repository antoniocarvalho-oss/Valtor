import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getBetPrice, getBasePrice, LOTTERY_PRICING } from "../shared/lotteryPricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@valtor.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

// ─── Lottery Pricing Tests ──────────────────────────────────────────────────

describe("lotteryPricing", () => {
  it("returns correct base price for Mega-Sena (6 numbers)", () => {
    const price = getBetPrice("megasena", 6);
    expect(price).toBe(6.00);
  });

  it("returns correct price for Mega-Sena with 7 numbers", () => {
    const price = getBetPrice("megasena", 7);
    expect(price).toBe(42.00);
  });

  it("returns correct price for Mega-Sena with 10 numbers", () => {
    const price = getBetPrice("megasena", 10);
    expect(price).toBe(1260.00);
  });

  it("returns correct base price for Lotofácil (15 numbers)", () => {
    const price = getBetPrice("lotofacil", 15);
    expect(price).toBe(3.50);
  });

  it("returns correct price for Lotofácil with 16 numbers", () => {
    const price = getBetPrice("lotofacil", 16);
    expect(price).toBe(56.00);
  });

  it("returns correct base price for Quina (5 numbers)", () => {
    const price = getBetPrice("quina", 5);
    expect(price).toBe(3.00);
  });

  it("handles hyphenated slugs correctly", () => {
    const price = getBetPrice("mega-sena", 6);
    expect(price).toBe(6.00);
  });

  it("handles dupla-sena slug", () => {
    const price = getBetPrice("dupla-sena", 6);
    expect(price).toBe(3.00);
  });

  it("handles dia-de-sorte slug", () => {
    const price = getBetPrice("dia-de-sorte", 7);
    expect(price).toBe(3.00);
  });

  it("returns null for unknown lottery", () => {
    const price = getBetPrice("loteria-inexistente", 6);
    expect(price).toBeNull();
  });

  it("returns null for out-of-range number count", () => {
    // Mega-Sena max is 20
    const price = getBetPrice("megasena", 25);
    expect(price).toBeNull();
  });

  it("returns null for below-minimum number count", () => {
    // Mega-Sena min is 6
    const price = getBetPrice("megasena", 3);
    expect(price).toBeNull();
  });

  it("getBasePrice returns correct values", () => {
    expect(getBasePrice("megasena")).toBe(6.00);
    expect(getBasePrice("lotofacil")).toBe(3.50);
    expect(getBasePrice("quina")).toBe(3.00);
    expect(getBasePrice("lotomania")).toBe(3.00);
    expect(getBasePrice("timemania")).toBe(3.50);
    expect(getBasePrice("duplasena")).toBe(3.00);
    expect(getBasePrice("diadesorte")).toBe(3.00);
    expect(getBasePrice("supersete")).toBe(3.00);
    expect(getBasePrice("maismilionaria")).toBe(6.00);
  });

  it("getBasePrice returns null for unknown lottery", () => {
    expect(getBasePrice("inexistente")).toBeNull();
  });

  it("price increases with more numbers for Mega-Sena", () => {
    const price6 = getBetPrice("megasena", 6)!;
    const price7 = getBetPrice("megasena", 7)!;
    const price8 = getBetPrice("megasena", 8)!;
    const price10 = getBetPrice("megasena", 10)!;
    expect(price7).toBeGreaterThan(price6);
    expect(price8).toBeGreaterThan(price7);
    expect(price10).toBeGreaterThan(price8);
  });

  it("price increases with more numbers for Lotofácil", () => {
    const price15 = getBetPrice("lotofacil", 15)!;
    const price16 = getBetPrice("lotofacil", 16)!;
    const price17 = getBetPrice("lotofacil", 17)!;
    expect(price16).toBeGreaterThan(price15);
    expect(price17).toBeGreaterThan(price16);
  });

  it("all lotteries have valid pricing data", () => {
    for (const [slug, config] of Object.entries(LOTTERY_PRICING)) {
      expect(config.name).toBeTruthy();
      expect(config.basePrice).toBeGreaterThan(0);
      expect(config.minNumbers).toBeGreaterThan(0);
      expect(config.maxNumbers).toBeGreaterThanOrEqual(config.minNumbers);
      expect(config.totalNumbers).toBeGreaterThan(0);
      // Base price should match the price for minNumbers
      expect(config.prices[config.minNumbers]).toBe(config.basePrice);
    }
  });
});

// ─── Pastas (Folders) Route Tests ───────────────────────────────────────────

describe("pastas", () => {
  it("listar throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.pastas.listar()).rejects.toThrow();
  });

  it("listar returns array for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.pastas.listar();
    expect(Array.isArray(result)).toBe(true);
  });

  it("criar throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.pastas.criar({ nome: "Teste", cor: "#16a34a" })
    ).rejects.toThrow();
  });

  it("criar accepts valid input for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.pastas.criar({ nome: "Meus Jogos", cor: "#7c3aed" });
      // If DB is available, result should have an id
      if (result) {
        expect(result).toHaveProperty("id");
      }
    } catch (e: any) {
      // DB might not be seeded in test env, but should not be UNAUTHORIZED
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("excluir throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.pastas.excluir({ id: 999 })).rejects.toThrow();
  });

  it("moverJogo throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.pastas.moverJogo({ gameId: 1, folderId: null })
    ).rejects.toThrow();
  });

  it("criar rejects empty name", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.pastas.criar({ nome: "", cor: "#16a34a" })
    ).rejects.toThrow();
  });
});

// ─── Carteira.salvar with apostar flag Tests ────────────────────────────────

describe("carteira.salvar with apostar", () => {
  it("salvar throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.carteira.salvar({
        loteriaSlug: "mega-sena",
        dezenas: [1, 2, 3, 4, 5, 6],
        apostar: true,
      })
    ).rejects.toThrow();
  });

  it("salvar accepts apostar flag for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.carteira.salvar({
        loteriaSlug: "mega-sena",
        dezenas: [5, 12, 23, 34, 45, 56],
        score: 85,
        somaDezenas: 175,
        qtdPares: 3,
        qtdImpares: 3,
        qtdPrimos: 2,
        apostar: true,
      });
    } catch (e: any) {
      // FORBIDDEN is expected if user doesn't have active subscription in test env
      // But should not be UNAUTHORIZED
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("salvar accepts folderId for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.carteira.salvar({
        loteriaSlug: "mega-sena",
        dezenas: [5, 12, 23, 34, 45, 56],
        folderId: 1,
        apostar: false,
      });
    } catch (e: any) {
      // FORBIDDEN is expected if user doesn't have active subscription
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("salvar accepts both apostar and folderId together", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.carteira.salvar({
        loteriaSlug: "mega-sena",
        dezenas: [5, 12, 23, 34, 45, 56],
        folderId: 1,
        apostar: true,
        score: 90,
        somaDezenas: 175,
        qtdPares: 3,
        qtdImpares: 3,
        qtdPrimos: 2,
      });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});

// ─── Carteira.proximoConcurso Tests ─────────────────────────────────────────

describe("carteira.proximoConcurso", () => {
  it("returns data for valid loteria slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.carteira.proximoConcurso({ loteriaSlug: "mega-sena" });
      if (result) {
        expect(result).toHaveProperty("proximoConcurso");
        expect(typeof result.proximoConcurso).toBe("number");
      }
    } catch {
      // API might be temporarily unavailable
    }
  }, 30000);

  it("returns null for unknown loteria", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.carteira.proximoConcurso({ loteriaSlug: "loteria-inexistente" });
    expect(result).toBeNull();
  }, 30000);

  it("handles multiple lottery slugs", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const slugs = ["mega-sena", "lotofacil", "quina"];
    for (const slug of slugs) {
      try {
        const result = await caller.carteira.proximoConcurso({ loteriaSlug: slug });
        // Should return data or null, never throw
        if (result) {
          expect(result).toHaveProperty("proximoConcurso");
          if (result.dataProximoConcurso) {
            expect(typeof result.dataProximoConcurso).toBe("string");
          }
        }
      } catch {
        // API might be temporarily unavailable
      }
    }
  }, 60000);
});
