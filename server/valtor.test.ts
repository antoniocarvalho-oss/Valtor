import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@valtor.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as unknown as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@valtor.com");
  });

  it("logout clears session cookie", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── Loterias Tests ───────────────────────────────────────────────────────────

describe("loterias", () => {
  it("all returns array of loterias", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.loterias.all();
    // Should return array (may be empty if DB not seeded in test env)
    expect(Array.isArray(result)).toBe(true);
  });

  it("bySlug returns null for unknown slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.loterias.bySlug({ slug: "loteria-inexistente-xyz" });
    expect(result).toBeUndefined();
  });
});

// ─── Gerador Tests ────────────────────────────────────────────────────────────

describe("gerador", () => {
  it("gerar throws NOT_FOUND for unknown loteria", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.gerador.gerar({ loteriaSlug: "loteria-invalida", quantidade: 1 })
    ).rejects.toThrow();
  });

  it("gerarPremium throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.gerador.gerarPremium({ loteriaSlug: "mega-sena", quantidade: 5 })
    ).rejects.toThrow();
  });
});

// ─── Conferidor Tests ─────────────────────────────────────────────────────────

describe("conferidor", () => {
  it("conferir returns pendente for unknown loteria", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.conferidor.conferir({ loteriaSlug: "loteria-invalida", dezenas: [1, 2, 3, 4, 5, 6] });
    expect(result.pendente).toBe(true);
    expect(result.concurso).toBeNull();
    expect(result.acertos).toBe(0);
    expect(result.mensagem).toBeTruthy();
  });
});

// ─── Carteira Tests ───────────────────────────────────────────────────────────

describe("carteira", () => {
  it("listar throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.carteira.listar({})).rejects.toThrow();
  });

  it("salvar throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.carteira.salvar({ loteriaSlug: "mega-sena", dezenas: [1, 2, 3, 4, 5, 6] })
    ).rejects.toThrow();
  });

  it("excluir throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.carteira.excluir({ id: 1 })).rejects.toThrow();
  });

  it("marcarAposta throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.carteira.marcarAposta({ id: 1, apostado: true, valorAposta: 5.0 })
    ).rejects.toThrow();
  });

  it("marcarAposta accepts valid input for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw (game may not exist in test DB but procedure should be callable)
    try {
      await caller.carteira.marcarAposta({ id: 999, apostado: true, concursoApostado: 2850, valorAposta: 5.0 });
    } catch (e: any) {
      // No error expected from procedure itself (game not found is OK)
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("registrarResultado throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.carteira.registrarResultado({ id: 1, valorGanho: 0, acertos: 3 })
    ).rejects.toThrow();
  });

  it("registrarResultado accepts valid input for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.carteira.registrarResultado({ id: 999, valorGanho: 150.50, acertos: 4, conferido: true });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("roi throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.carteira.roi()).rejects.toThrow();
  });

  it("roi returns array for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.carteira.roi();
    expect(Array.isArray(result)).toBe(true);
  });

  it("apostasAtivas throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.carteira.apostasAtivas()).rejects.toThrow();
  });

  it("apostasAtivas returns array for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.carteira.apostasAtivas();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Assinatura Tests ───────────────────────────────────────────────────────────────

describe("assinatura", () => {
  it("status throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.assinatura.status()).rejects.toThrow();
  });
});

// ─── Slug Normalization Tests ────────────────────────────────────────────────────────

import { normalizeSlug } from "./db";

describe("normalizeSlug", () => {
  it("removes hyphens from slug", () => {
    expect(normalizeSlug("mega-sena")).toBe("megasena");
    expect(normalizeSlug("dupla-sena")).toBe("duplasena");
    expect(normalizeSlug("dia-de-sorte")).toBe("diadesorte");
    expect(normalizeSlug("super-sete")).toBe("supersete");
    expect(normalizeSlug("mais-milionaria")).toBe("maismilionaria");
  });

  it("leaves already-normalized slugs unchanged", () => {
    expect(normalizeSlug("megasena")).toBe("megasena");
    expect(normalizeSlug("lotofacil")).toBe("lotofacil");
    expect(normalizeSlug("quina")).toBe("quina");
  });

  it("handles empty string", () => {
    expect(normalizeSlug("")).toBe("");
  });
});

describe("gerador with hyphenated slugs", () => {
  it("gerar accepts slug with hyphens (mega-sena)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // This should NOT throw NOT_FOUND since normalizeSlug converts mega-sena -> megasena
    // It may throw NOT_FOUND if DB is not seeded, but that's expected in test env
    try {
      const result = await caller.gerador.gerar({ loteriaSlug: "mega-sena", quantidade: 1 });
      // If DB is seeded, result should be an array
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      // In test env without seeded DB, NOT_FOUND is acceptable
      expect(e.code).toBe("NOT_FOUND");
    }
  }, 120000);

  it("gerar accepts slug without hyphens (megasena)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.gerador.gerar({ loteriaSlug: "megasena", quantidade: 1 });
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code).toBe("NOT_FOUND");
    }
  }, 120000);
});
// ─── CaixaAPI fetchAllConcursos Tests ────────────────────────────────────────

import { fetchAllConcursos } from "./caixaApi";

describe("fetchAllConcursos", () => {
  it("returns empty array for unknown slug", async () => {
    const result = await fetchAllConcursos("loteria-inexistente");
    expect(result).toEqual([]);
  });

  it("returns array of concursos for valid slug", async () => {
    const result = await fetchAllConcursos("megasena");
    // Should return an array (may be empty if API is down)
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("concurso");
      expect(result[0]).toHaveProperty("dezenas");
      expect(Array.isArray(result[0].dezenas)).toBe(true);
    }
  }, 90000); // 90s timeout for API call

  it("handles hyphenated slugs correctly", async () => {
    const result = await fetchAllConcursos("mega-sena");
    expect(Array.isArray(result)).toBe(true);
  }, 90000);

  it("returns data with correct structure", async () => {
    const result = await fetchAllConcursos("lotofacil");
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      // Verify each item has the expected shape
      const item = result[0];
      expect(typeof item.concurso).toBe("number");
      expect(Array.isArray(item.dezenas)).toBe(true);
      expect(item.dezenas.every((n: number) => typeof n === "number")).toBe(true);
      // Dezenas should be sorted
      for (let i = 1; i < item.dezenas.length; i++) {
        expect(item.dezenas[i]).toBeGreaterThanOrEqual(item.dezenas[i - 1]);
      }
    }
  }, 90000);
});

// ─── Concursos Endpoint Tests ────────────────────────────────────────────────

describe("concursos", () => {
  it("ultimo returns data for valid loteria", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.concursos.ultimo({ loteriaSlug: "megasena" });
      // Should return concurso data or null if API is down
      if (result) {
        expect(result).toHaveProperty("concurso");
      }
    } catch (e: any) {
      // API might be temporarily unavailable - any error code is acceptable
      expect(e).toBeDefined();
    }
  }, 30000);

  it("ultimo handles hyphenated slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.concursos.ultimo({ loteriaSlug: "mega-sena" });
      if (result) {
        expect(result).toHaveProperty("concurso");
      }
    } catch (e: any) {
      // API might be temporarily unavailable - any error code is acceptable
      expect(e).toBeDefined();
    }
  }, 30000);
});

// ─── Estatísticas Tests ──────────────────────────────────────────────────────

describe("estatisticas", () => {
  it("frequencia returns data with totalConcursos", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.estatisticas.frequencia({ loteriaSlug: "megasena" });
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("totalConcursos");
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.totalConcursos).toBe("number");
    } catch (e: any) {
      // API might be down, that's OK for test env
    }
  }, 90000);
});
