/**
 * US Lottery Service — Mega Millions + Powerball
 * Data source: NY Open Data (free, no API key)
 * Powerball: https://data.ny.gov/resource/d6yy-54nr.json
 * Mega Millions: https://data.ny.gov/resource/5xaw-6ayf.json
 */
import { getDb } from "./db";
import { usDraws, usStatsNumberMain, usStatsNumberSpecial } from "../drizzle/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// ─── LOTTERY CONFIGS ─────────────────────────────────────────────────────────
export const US_LOTTERY_CONFIG = {
  "mega-millions": {
    name: "Mega Millions",
    slug: "mega-millions",
    mainMin: 1,
    mainMax: 70,
    mainCount: 5,
    specialMin: 1,
    specialMax: 25,
    specialName: "Mega Ball",
    multiplierName: "Megaplier",
    color: "#1a6bc4",
    colorDark: "#0d4a8a",
    apiUrl: "https://data.ny.gov/resource/5xaw-6ayf.json",
    drawDays: "Terça e Sexta",
    drawTime: "23:00 ET",
    description: "A Mega Millions é uma das maiores loterias dos Estados Unidos, com jackpots que frequentemente ultrapassam centenas de milhões de dólares. O jogador escolhe 5 números de 1 a 70 e 1 Mega Ball de 1 a 25.",
    howToPlay: "Escolha 5 números de 1 a 70 e 1 Mega Ball de 1 a 25. Os sorteios acontecem às terças e sextas-feiras às 23h (horário do leste dos EUA). Para ganhar o jackpot, é preciso acertar todos os 5 números principais e o Mega Ball.",
  },
  "powerball": {
    name: "Powerball",
    slug: "powerball",
    mainMin: 1,
    mainMax: 69,
    mainCount: 5,
    specialMin: 1,
    specialMax: 26,
    specialName: "Powerball",
    multiplierName: "Power Play",
    color: "#e63946",
    colorDark: "#b52d38",
    apiUrl: "https://data.ny.gov/resource/d6yy-54nr.json",
    drawDays: "Segunda, Quarta e Sábado",
    drawTime: "22:59 ET",
    description: "A Powerball é a loteria mais famosa dos Estados Unidos, conhecida por seus jackpots recordes que já ultrapassaram US$ 2 bilhões. O jogador escolhe 5 números de 1 a 69 e 1 Powerball de 1 a 26.",
    howToPlay: "Escolha 5 números de 1 a 69 e 1 Powerball de 1 a 26. Os sorteios acontecem às segundas, quartas e sábados às 22:59 (horário do leste dos EUA). Para ganhar o jackpot, é preciso acertar todos os 5 números principais e o Powerball.",
  },
} as const;

export type UsLotterySlug = keyof typeof US_LOTTERY_CONFIG;

// ─── FETCH FROM NY OPEN DATA ─────────────────────────────────────────────────
interface NYPowerballRow {
  draw_date: string;
  winning_numbers: string; // "14 18 19 21 69 01" (last is Powerball)
  multiplier?: string;
}

interface NYMegaMillionsRow {
  draw_date: string;
  winning_numbers: string; // "04 11 18 38 50"
  mega_ball: string;
  multiplier?: string;
}

async function fetchAllDrawsFromAPI(lottery: UsLotterySlug): Promise<{
  drawDate: Date;
  numbersMain: number[];
  numberSpecial: number;
  multiplier: number | null;
}[]> {
  const config = US_LOTTERY_CONFIG[lottery];
  const limit = 50000; // Get all records
  const url = `${config.apiUrl}?$limit=${limit}&$order=draw_date DESC`;

  console.log(`[USLottery] Fetching ${lottery} from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${lottery}: ${res.status}`);
  const data = await res.json();
  console.log(`[USLottery] Got ${data.length} records for ${lottery}`);

  if (lottery === "powerball") {
    return (data as NYPowerballRow[]).map((row) => {
      const parts = row.winning_numbers.trim().split(/\s+/).map(Number);
      const numberSpecial = parts.pop()!;
      return {
        drawDate: new Date(row.draw_date),
        numbersMain: parts.sort((a, b) => a - b),
        numberSpecial,
        multiplier: row.multiplier ? parseInt(row.multiplier) : null,
      };
    });
  } else {
    return (data as NYMegaMillionsRow[]).map((row) => {
      const parts = row.winning_numbers.trim().split(/\s+/).map(Number);
      return {
        drawDate: new Date(row.draw_date),
        numbersMain: parts.sort((a, b) => a - b),
        numberSpecial: parseInt(row.mega_ball),
        multiplier: row.multiplier ? parseInt(row.multiplier) : null,
      };
    });
  }
}

// ─── SYNC DRAWS TO DATABASE ──────────────────────────────────────────────────
export async function syncUsLotteryDraws(lottery: UsLotterySlug): Promise<{ inserted: number; total: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const draws = await fetchAllDrawsFromAPI(lottery);
  let inserted = 0;

  for (const draw of draws) {
    try {
      await db.insert(usDraws).values({
        lottery,
        drawDate: draw.drawDate,
        numbersMain: draw.numbersMain,
        numberSpecial: draw.numberSpecial,
        multiplier: draw.multiplier,
      }).onDuplicateKeyUpdate({
        set: {
          numbersMain: draw.numbersMain,
          numberSpecial: draw.numberSpecial,
          multiplier: draw.multiplier,
        },
      });
      inserted++;
    } catch (err: any) {
      // Skip duplicates silently
      if (!err.message?.includes("Duplicate")) {
        console.error(`[USLottery] Error inserting draw:`, err.message);
      }
    }
  }

  console.log(`[USLottery] Synced ${lottery}: ${inserted} draws processed, ${draws.length} total from API`);
  return { inserted, total: draws.length };
}

// ─── CALCULATE & SAVE STATISTICS ─────────────────────────────────────────────
export async function calculateUsStats(lottery: UsLotterySlug): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const config = US_LOTTERY_CONFIG[lottery];

  // Get all draws ordered by date
  const allDraws = await db
    .select()
    .from(usDraws)
    .where(eq(usDraws.lottery, lottery))
    .orderBy(asc(usDraws.drawDate));

  if (allDraws.length === 0) {
    console.log(`[USLottery] No draws found for ${lottery}, skipping stats`);
    return;
  }

  const totalDraws = allDraws.length;
  const latestDraw = allDraws[allDraws.length - 1];

  // ── Main numbers stats ──
  const mainFreq: Record<number, { freq: number; lastDrawn: Date | null; lastIndex: number }> = {};
  for (let n = config.mainMin; n <= config.mainMax; n++) {
    mainFreq[n] = { freq: 0, lastDrawn: null, lastIndex: -1 };
  }

  allDraws.forEach((draw, idx) => {
    const nums = draw.numbersMain as number[];
    nums.forEach((n) => {
      if (mainFreq[n]) {
        mainFreq[n].freq++;
        mainFreq[n].lastDrawn = draw.drawDate;
        mainFreq[n].lastIndex = idx;
      }
    });
  });

  // Save main number stats
  for (const [numStr, stat] of Object.entries(mainFreq)) {
    const num = parseInt(numStr);
    const delay = stat.lastIndex >= 0 ? totalDraws - 1 - stat.lastIndex : totalDraws;
    await db.insert(usStatsNumberMain).values({
      lottery,
      number: num,
      frequency: stat.freq,
      lastDrawn: stat.lastDrawn,
      delay,
      totalDraws,
    }).onDuplicateKeyUpdate({
      set: {
        frequency: stat.freq,
        lastDrawn: stat.lastDrawn,
        delay,
        totalDraws,
      },
    });
  }

  // ── Special number stats ──
  const specialFreq: Record<number, { freq: number; lastDrawn: Date | null; lastIndex: number }> = {};
  for (let n = config.specialMin; n <= config.specialMax; n++) {
    specialFreq[n] = { freq: 0, lastDrawn: null, lastIndex: -1 };
  }

  allDraws.forEach((draw, idx) => {
    const n = draw.numberSpecial;
    if (specialFreq[n]) {
      specialFreq[n].freq++;
      specialFreq[n].lastDrawn = draw.drawDate;
      specialFreq[n].lastIndex = idx;
    }
  });

  // Save special number stats
  for (const [numStr, stat] of Object.entries(specialFreq)) {
    const num = parseInt(numStr);
    const delay = stat.lastIndex >= 0 ? totalDraws - 1 - stat.lastIndex : totalDraws;
    await db.insert(usStatsNumberSpecial).values({
      lottery,
      number: num,
      frequency: stat.freq,
      lastDrawn: stat.lastDrawn,
      delay,
      totalDraws,
    }).onDuplicateKeyUpdate({
      set: {
        frequency: stat.freq,
        lastDrawn: stat.lastDrawn,
        delay,
        totalDraws,
      },
    });
  }

  console.log(`[USLottery] Stats calculated for ${lottery}: ${totalDraws} draws, ${config.mainMax} main numbers, ${config.specialMax} special numbers`);
}

// ─── SYNC ALL (draws + stats) ────────────────────────────────────────────────
export async function syncAllUsLotteries(): Promise<Record<string, { inserted: number; total: number }>> {
  const results: Record<string, { inserted: number; total: number }> = {};

  for (const lottery of ["mega-millions", "powerball"] as UsLotterySlug[]) {
    try {
      const syncResult = await syncUsLotteryDraws(lottery);
      await calculateUsStats(lottery);
      results[lottery] = syncResult;
    } catch (err: any) {
      console.error(`[USLottery] Failed to sync ${lottery}:`, err.message);
      results[lottery] = { inserted: 0, total: 0 };
    }
  }

  return results;
}

// ─── QUERY HELPERS ───────────────────────────────────────────────────────────
export async function getUsLatestDraw(lottery: UsLotterySlug) {
  const db = await getDb();
  if (!db) return null;

  const [draw] = await db
    .select()
    .from(usDraws)
    .where(eq(usDraws.lottery, lottery))
    .orderBy(desc(usDraws.drawDate))
    .limit(1);

  return draw || null;
}

export async function getUsRecentDraws(lottery: UsLotterySlug, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usDraws)
    .where(eq(usDraws.lottery, lottery))
    .orderBy(desc(usDraws.drawDate))
    .limit(limit);
}

export async function getUsDrawsPaginated(lottery: UsLotterySlug, page = 1, perPage = 20) {
  const db = await getDb();
  if (!db) return { draws: [], total: 0, page, perPage };

  const offset = (page - 1) * perPage;

  const [draws, countResult] = await Promise.all([
    db
      .select()
      .from(usDraws)
      .where(eq(usDraws.lottery, lottery))
      .orderBy(desc(usDraws.drawDate))
      .limit(perPage)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(usDraws)
      .where(eq(usDraws.lottery, lottery)),
  ]);

  return {
    draws,
    total: countResult[0]?.count || 0,
    page,
    perPage,
  };
}

export async function getUsStatsMain(lottery: UsLotterySlug) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberMain)
    .where(eq(usStatsNumberMain.lottery, lottery))
    .orderBy(asc(usStatsNumberMain.number));
}

export async function getUsStatsSpecial(lottery: UsLotterySlug) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberSpecial)
    .where(eq(usStatsNumberSpecial.lottery, lottery))
    .orderBy(asc(usStatsNumberSpecial.number));
}

export async function getUsMostDrawnMain(lottery: UsLotterySlug, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberMain)
    .where(eq(usStatsNumberMain.lottery, lottery))
    .orderBy(desc(usStatsNumberMain.frequency))
    .limit(limit);
}

export async function getUsLeastDrawnMain(lottery: UsLotterySlug, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberMain)
    .where(eq(usStatsNumberMain.lottery, lottery))
    .orderBy(asc(usStatsNumberMain.frequency))
    .limit(limit);
}

export async function getUsMostDelayedMain(lottery: UsLotterySlug, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberMain)
    .where(eq(usStatsNumberMain.lottery, lottery))
    .orderBy(desc(usStatsNumberMain.delay))
    .limit(limit);
}

export async function getUsMostDrawnSpecial(lottery: UsLotterySlug, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberSpecial)
    .where(eq(usStatsNumberSpecial.lottery, lottery))
    .orderBy(desc(usStatsNumberSpecial.frequency))
    .limit(limit);
}

export async function getUsMostDelayedSpecial(lottery: UsLotterySlug, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(usStatsNumberSpecial)
    .where(eq(usStatsNumberSpecial.lottery, lottery))
    .orderBy(desc(usStatsNumberSpecial.delay))
    .limit(limit);
}

// ─── SIMPLE GENERATOR ────────────────────────────────────────────────────────
export function generateUsNumbers(lottery: UsLotterySlug): { main: number[]; special: number } {
  const config = US_LOTTERY_CONFIG[lottery];

  // Generate main numbers (no duplicates)
  const mainPool = Array.from({ length: config.mainMax - config.mainMin + 1 }, (_, i) => i + config.mainMin);
  const main: number[] = [];
  for (let i = 0; i < config.mainCount; i++) {
    const idx = Math.floor(Math.random() * mainPool.length);
    main.push(mainPool.splice(idx, 1)[0]);
  }
  main.sort((a, b) => a - b);

  // Generate special number
  const special = Math.floor(Math.random() * (config.specialMax - config.specialMin + 1)) + config.specialMin;

  return { main, special };
}
