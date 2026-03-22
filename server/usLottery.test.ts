import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { generateUsNumbers, US_LOTTERY_CONFIG } from "./usLotteryService";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── GENERATOR TESTS ─────────────────────────────────────────────────────────
describe("US Lottery Generator", () => {
  describe("Mega Millions", () => {
    it("generates valid Mega Millions numbers", () => {
      const result = generateUsNumbers("mega-millions");
      expect(result.main).toHaveLength(5);
      expect(result.main).toEqual([...result.main].sort((a, b) => a - b)); // sorted
      result.main.forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(70);
      });
      // No duplicates
      expect(new Set(result.main).size).toBe(5);
      // Special number
      expect(result.special).toBeGreaterThanOrEqual(1);
      expect(result.special).toBeLessThanOrEqual(25);
    });

    it("generates different results on multiple calls", () => {
      const results = Array.from({ length: 20 }, () => generateUsNumbers("mega-millions"));
      const uniqueMainSets = new Set(results.map((r) => r.main.join(",")));
      // With 20 random generations, we should have at least 2 unique sets
      expect(uniqueMainSets.size).toBeGreaterThan(1);
    });
  });

  describe("Powerball", () => {
    it("generates valid Powerball numbers", () => {
      const result = generateUsNumbers("powerball");
      expect(result.main).toHaveLength(5);
      expect(result.main).toEqual([...result.main].sort((a, b) => a - b)); // sorted
      result.main.forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(69);
      });
      // No duplicates
      expect(new Set(result.main).size).toBe(5);
      // Special number
      expect(result.special).toBeGreaterThanOrEqual(1);
      expect(result.special).toBeLessThanOrEqual(26);
    });
  });
});

// ─── CONFIG TESTS ────────────────────────────────────────────────────────────
describe("US Lottery Config", () => {
  it("has correct Mega Millions config", () => {
    const config = US_LOTTERY_CONFIG["mega-millions"];
    expect(config.name).toBe("Mega Millions");
    expect(config.mainMin).toBe(1);
    expect(config.mainMax).toBe(70);
    expect(config.mainCount).toBe(5);
    expect(config.specialMin).toBe(1);
    expect(config.specialMax).toBe(25);
    expect(config.specialName).toBe("Mega Ball");
  });

  it("has correct Powerball config", () => {
    const config = US_LOTTERY_CONFIG["powerball"];
    expect(config.name).toBe("Powerball");
    expect(config.mainMin).toBe(1);
    expect(config.mainMax).toBe(69);
    expect(config.mainCount).toBe(5);
    expect(config.specialMin).toBe(1);
    expect(config.specialMax).toBe(26);
    expect(config.specialName).toBe("Powerball");
  });
});

// ─── tRPC ROUTE TESTS ───────────────────────────────────────────────────────
describe("US Lottery tRPC Routes", () => {
  const ctx = createPublicContext();

  describe("config", () => {
    it("returns Mega Millions config", async () => {
      const caller = appRouter.createCaller(ctx);
      const config = await caller.usLottery.config({ lottery: "mega-millions" });
      expect(config.name).toBe("Mega Millions");
      expect(config.mainMax).toBe(70);
      expect(config.specialMax).toBe(25);
    });

    it("returns Powerball config", async () => {
      const caller = appRouter.createCaller(ctx);
      const config = await caller.usLottery.config({ lottery: "powerball" });
      expect(config.name).toBe("Powerball");
      expect(config.mainMax).toBe(69);
      expect(config.specialMax).toBe(26);
    });
  });

  describe("generate", () => {
    it("generates requested number of Mega Millions games", async () => {
      const caller = appRouter.createCaller(ctx);
      const games = await caller.usLottery.generate({ lottery: "mega-millions", count: 5 });
      expect(games).toHaveLength(5);
      games.forEach((game) => {
        expect(game.main).toHaveLength(5);
        expect(new Set(game.main).size).toBe(5);
        game.main.forEach((n) => {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(70);
        });
        expect(game.special).toBeGreaterThanOrEqual(1);
        expect(game.special).toBeLessThanOrEqual(25);
      });
    });

    it("generates requested number of Powerball games", async () => {
      const caller = appRouter.createCaller(ctx);
      const games = await caller.usLottery.generate({ lottery: "powerball", count: 3 });
      expect(games).toHaveLength(3);
      games.forEach((game) => {
        expect(game.main).toHaveLength(5);
        expect(new Set(game.main).size).toBe(5);
        game.main.forEach((n) => {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(69);
        });
        expect(game.special).toBeGreaterThanOrEqual(1);
        expect(game.special).toBeLessThanOrEqual(26);
      });
    });

    it("defaults to 1 game when count not specified", async () => {
      const caller = appRouter.createCaller(ctx);
      const games = await caller.usLottery.generate({ lottery: "mega-millions" });
      expect(games).toHaveLength(1);
    });
  });

  describe("latestDraw", () => {
    it("returns latest draw for Mega Millions (or null if no data)", async () => {
      const caller = appRouter.createCaller(ctx);
      const draw = await caller.usLottery.latestDraw({ lottery: "mega-millions" });
      if (draw) {
        expect(draw.lottery).toBe("mega-millions");
        expect(Array.isArray(draw.numbersMain)).toBe(true);
        expect((draw.numbersMain as number[]).length).toBe(5);
        expect(typeof draw.numberSpecial).toBe("number");
        expect(draw.numberSpecial).toBeGreaterThanOrEqual(1);
        expect(draw.numberSpecial).toBeLessThanOrEqual(25);
      }
    });

    it("returns latest draw for Powerball (or null if no data)", async () => {
      const caller = appRouter.createCaller(ctx);
      const draw = await caller.usLottery.latestDraw({ lottery: "powerball" });
      if (draw) {
        expect(draw.lottery).toBe("powerball");
        expect(Array.isArray(draw.numbersMain)).toBe(true);
        expect((draw.numbersMain as number[]).length).toBe(5);
        expect(typeof draw.numberSpecial).toBe("number");
        expect(draw.numberSpecial).toBeGreaterThanOrEqual(1);
        expect(draw.numberSpecial).toBeLessThanOrEqual(26);
      }
    });
  });

  describe("statsMain", () => {
    it("returns stats for all Mega Millions main numbers", async () => {
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.usLottery.statsMain({ lottery: "mega-millions" });
      if (stats.length > 0) {
        expect(stats.length).toBe(70);
        stats.forEach((s) => {
          expect(s.lottery).toBe("mega-millions");
          expect(s.number).toBeGreaterThanOrEqual(1);
          expect(s.number).toBeLessThanOrEqual(70);
          expect(s.frequency).toBeGreaterThanOrEqual(0);
          expect(s.delay).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it("returns stats for all Powerball main numbers", async () => {
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.usLottery.statsMain({ lottery: "powerball" });
      if (stats.length > 0) {
        expect(stats.length).toBe(69);
        stats.forEach((s) => {
          expect(s.lottery).toBe("powerball");
          expect(s.number).toBeGreaterThanOrEqual(1);
          expect(s.number).toBeLessThanOrEqual(69);
        });
      }
    });
  });

  describe("statsSpecial", () => {
    it("returns stats for all Mega Millions Mega Ball numbers", async () => {
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.usLottery.statsSpecial({ lottery: "mega-millions" });
      if (stats.length > 0) {
        expect(stats.length).toBe(25);
        stats.forEach((s) => {
          expect(s.lottery).toBe("mega-millions");
          expect(s.number).toBeGreaterThanOrEqual(1);
          expect(s.number).toBeLessThanOrEqual(25);
        });
      }
    });

    it("returns stats for all Powerball special numbers", async () => {
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.usLottery.statsSpecial({ lottery: "powerball" });
      if (stats.length > 0) {
        expect(stats.length).toBe(26);
        stats.forEach((s) => {
          expect(s.lottery).toBe("powerball");
          expect(s.number).toBeGreaterThanOrEqual(1);
          expect(s.number).toBeLessThanOrEqual(26);
        });
      }
    });
  });

  describe("mostDrawnMain", () => {
    it("returns top drawn main numbers for Mega Millions", async () => {
      const caller = appRouter.createCaller(ctx);
      const top = await caller.usLottery.mostDrawnMain({ lottery: "mega-millions", limit: 5 });
      if (top.length > 0) {
        expect(top.length).toBeLessThanOrEqual(5);
        // Should be sorted by frequency descending
        for (let i = 1; i < top.length; i++) {
          expect(top[i].frequency).toBeLessThanOrEqual(top[i - 1].frequency);
        }
      }
    });
  });

  describe("mostDelayedMain", () => {
    it("returns most delayed main numbers for Powerball", async () => {
      const caller = appRouter.createCaller(ctx);
      const delayed = await caller.usLottery.mostDelayedMain({ lottery: "powerball", limit: 5 });
      if (delayed.length > 0) {
        expect(delayed.length).toBeLessThanOrEqual(5);
        // Should be sorted by delay descending
        for (let i = 1; i < delayed.length; i++) {
          expect(delayed[i].delay).toBeLessThanOrEqual(delayed[i - 1].delay);
        }
      }
    });
  });

  describe("recentDraws", () => {
    it("returns recent draws for Mega Millions", async () => {
      const caller = appRouter.createCaller(ctx);
      const draws = await caller.usLottery.recentDraws({ lottery: "mega-millions", limit: 5 });
      if (draws.length > 0) {
        expect(draws.length).toBeLessThanOrEqual(5);
        // Should be sorted by date descending
        for (let i = 1; i < draws.length; i++) {
          expect(new Date(draws[i].drawDate).getTime()).toBeLessThanOrEqual(
            new Date(draws[i - 1].drawDate).getTime()
          );
        }
      }
    });
  });

  describe("drawsPaginated", () => {
    it("returns paginated draws for Powerball", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.usLottery.drawsPaginated({ lottery: "powerball", page: 1, perPage: 10 });
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
      if (result.draws.length > 0) {
        expect(result.draws.length).toBeLessThanOrEqual(10);
        expect(result.total).toBeGreaterThan(0);
      }
    });
  });
});
