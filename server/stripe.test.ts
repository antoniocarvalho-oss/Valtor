import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user-openid",
    email: "test@valtor.com.br",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
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

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("assinatura.criarCheckout (Mercado Pago)", () => {
  it("rejeita usuário não autenticado com UNAUTHORIZED", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assinatura.criarCheckout({ origin: "https://valtor.com.br", planType: "parcelado" })
    ).rejects.toThrow();
  });

  it("rejeita origin inválida (não-URL)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assinatura.criarCheckout({ origin: "nao-e-uma-url", planType: "parcelado" })
    ).rejects.toThrow();
  });

  it("rejeita planType inválido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assinatura.criarCheckout({ origin: "https://valtor.com.br", planType: "invalido" as any })
    ).rejects.toThrow();
  });

  it("aceita plano parcelado com origin válida (pode falhar por MP key inválida)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.assinatura.criarCheckout({ origin: "https://valtor.com.br", planType: "parcelado" });
    } catch (err: unknown) {
      const error = err as Error;
      expect(error.message).not.toContain("Invalid url");
      expect(error.message).not.toContain("Expected string");
      expect(error.message).not.toContain("invalid_enum_value");
    }
  });

  it("aceita plano avista com origin válida (pode falhar por MP key inválida)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.assinatura.criarCheckout({ origin: "https://valtor.com.br", planType: "avista" });
    } catch (err: unknown) {
      const error = err as Error;
      expect(error.message).not.toContain("Invalid url");
      expect(error.message).not.toContain("Expected string");
      expect(error.message).not.toContain("invalid_enum_value");
    }
  });

  it("rejeita planType teste (removido após homologação)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assinatura.criarCheckout({ origin: "https://valtor.com.br", planType: "teste" as any })
    ).rejects.toThrow();
  });

  it("usa plano avista como default quando planType não é fornecido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // planType tem default "avista", então não deve dar erro de validação
    try {
      await caller.assinatura.criarCheckout({ origin: "https://valtor.com.br" });
    } catch (err: unknown) {
      const error = err as Error;
      expect(error.message).not.toContain("Required");
      expect(error.message).not.toContain("invalid_enum_value");
    }
  });
});

describe("assinatura.status", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.assinatura.status()).rejects.toThrow();
  });

  it("retorna null para usuário sem assinatura", async () => {
    const ctx = createAuthContext({ id: 99999 }); // ID que não existe no banco
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assinatura.status();
    expect(result == null).toBe(true);
  });
});

describe("perfil.get", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.perfil.get()).rejects.toThrow();
  });
});

describe("perfil.update - validação de input", () => {
  it("rejeita nome muito curto", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.perfil.update({ name: "A" }) // menos de 2 chars
    ).rejects.toThrow();
  });

  it("rejeita nome muito longo", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.perfil.update({ name: "A".repeat(129) }) // mais de 128 chars
    ).rejects.toThrow();
  });

  it("rejeita horário de e-mail inválido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.perfil.update({ emailHorario: "25:00" }) // hora inválida
    ).rejects.toThrow();
  });

  it("aceita horário de e-mail válido (22:00)", async () => {
    const ctx = createAuthContext({ id: 99999 }); // ID que não existe no banco
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.perfil.update({ emailHorario: "22:00" });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      expect(error.message).not.toContain("Invalid");
    }
  });
});

describe("importar.salvarLote - validação de input", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.importar.salvarLote({
        jogos: [{ loteriaSlug: "megasena", dezenas: [1, 2, 3, 4, 5, 6] }],
      })
    ).rejects.toThrow();
  });

  it("rejeita lote vazio", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.importar.salvarLote({ jogos: [] })
    ).rejects.toThrow();
  });
});

describe("Mercado Pago Webhook Handler", () => {
  it("módulo mercadopagoWebhook exporta handleMercadoPagoWebhook", async () => {
    const mod = await import("./mercadopagoWebhook");
    expect(mod.handleMercadoPagoWebhook).toBeDefined();
    expect(typeof mod.handleMercadoPagoWebhook).toBe("function");
  });
});
