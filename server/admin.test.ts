import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("admin.overview", () => {
  it("returns overview metrics for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.overview();

    expect(result).toBeDefined();
    expect(typeof result.totalUsers).toBe("number");
    expect(typeof result.premiumUsers).toBe("number");
    expect(typeof result.freeUsers).toBe("number");
    expect(typeof result.totalBets).toBe("number");
    expect(typeof result.checkedBets).toBe("number");
    expect(typeof result.totalSubscriptions).toBe("number");
    expect(typeof result.activeSubscriptions).toBe("number");
    expect(typeof result.totalConcursos).toBe("number");
    expect(typeof result.totalSimulations).toBe("number");
    expect(result.totalUsers).toBeGreaterThanOrEqual(0);
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.overview()).rejects.toThrow();
  });
});

describe("admin.users", () => {
  it("returns paginated user list for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.users({ page: 1, pageSize: 10 });

    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("supports search filter", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.users({ page: 1, pageSize: 10, search: "nonexistent_xyz" });

    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users({ page: 1, pageSize: 10 })).rejects.toThrow();
  });
});

describe("admin.signupsByDay", () => {
  it("returns signup data for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.signupsByDay({ days: 30 });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((item) => {
      expect(typeof item.date).toBe("string");
      expect(typeof item.count).toBe("number");
    });
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.signupsByDay({ days: 30 })).rejects.toThrow();
  });
});

describe("admin.recentActivity", () => {
  it("returns recent activity for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.recentActivity();

    expect(result).toBeDefined();
    expect(Array.isArray(result.recentUsers)).toBe(true);
    expect(Array.isArray(result.recentBets)).toBe(true);
    expect(Array.isArray(result.recentSubscriptions)).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.recentActivity()).rejects.toThrow();
  });
});

describe("admin.revenue", () => {
  it("returns revenue data for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.revenue();

    expect(result).toBeDefined();
    expect(typeof result.totalRevenue).toBe("number");
    expect(typeof result.monthlyRevenue).toBe("number");
    expect(typeof result.activeCount).toBe("number");
    expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(result.monthlyRevenue).toBeGreaterThanOrEqual(0);
    expect(result.activeCount).toBeGreaterThanOrEqual(0);
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.revenue()).rejects.toThrow();
  });
});
