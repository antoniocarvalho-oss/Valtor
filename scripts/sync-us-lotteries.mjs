#!/usr/bin/env node
/**
 * Sync US lottery data from NY Open Data API
 * Run: node scripts/sync-us-lotteries.mjs
 */
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const LOTTERIES = {
  "mega-millions": {
    apiUrl: "https://data.ny.gov/resource/5xaw-6ayf.json",
    parser: "mega-millions",
  },
  "powerball": {
    apiUrl: "https://data.ny.gov/resource/d6yy-54nr.json",
    parser: "powerball",
  },
};

async function fetchDraws(lottery, config) {
  const url = `${config.apiUrl}?$limit=50000&$order=draw_date DESC`;
  console.log(`[Sync] Fetching ${lottery} from API...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  console.log(`[Sync] Got ${data.length} records for ${lottery}`);

  return data.map((row) => {
    if (config.parser === "powerball") {
      const parts = row.winning_numbers.trim().split(/\s+/).map(Number);
      const special = parts.pop();
      return {
        drawDate: new Date(row.draw_date),
        numbersMain: JSON.stringify(parts.sort((a, b) => a - b)),
        numberSpecial: special,
        multiplier: row.multiplier ? parseInt(row.multiplier) : null,
      };
    } else {
      const parts = row.winning_numbers.trim().split(/\s+/).map(Number);
      return {
        drawDate: new Date(row.draw_date),
        numbersMain: JSON.stringify(parts.sort((a, b) => a - b)),
        numberSpecial: parseInt(row.mega_ball),
        multiplier: row.multiplier ? parseInt(row.multiplier) : null,
      };
    }
  });
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("[Sync] Connected to database");

  for (const [lottery, config] of Object.entries(LOTTERIES)) {
    try {
      const draws = await fetchDraws(lottery, config);
      let inserted = 0;

      for (const draw of draws) {
        try {
          await conn.execute(
            `INSERT INTO us_draws (lottery, drawDate, numbersMain, numberSpecial, multiplier)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE numbersMain=VALUES(numbersMain), numberSpecial=VALUES(numberSpecial), multiplier=VALUES(multiplier)`,
            [lottery, draw.drawDate, draw.numbersMain, draw.numberSpecial, draw.multiplier]
          );
          inserted++;
        } catch (err) {
          if (!err.message?.includes("Duplicate")) {
            console.error(`  Error:`, err.message);
          }
        }
      }
      console.log(`[Sync] ${lottery}: ${inserted} draws synced`);
    } catch (err) {
      console.error(`[Sync] Failed ${lottery}:`, err.message);
    }
  }

  // Calculate stats
  console.log("[Sync] Calculating statistics...");

  for (const lottery of ["mega-millions", "powerball"]) {
    const [rows] = await conn.execute(
      "SELECT numbersMain, numberSpecial, drawDate FROM us_draws WHERE lottery = ? ORDER BY drawDate ASC",
      [lottery]
    );

    if (rows.length === 0) continue;

    const totalDraws = rows.length;
    const mainMax = lottery === "mega-millions" ? 70 : 69;
    const specialMax = lottery === "mega-millions" ? 25 : 26;

    // Main numbers
    const mainFreq = {};
    for (let n = 1; n <= mainMax; n++) {
      mainFreq[n] = { freq: 0, lastDrawn: null, lastIndex: -1 };
    }

    rows.forEach((row, idx) => {
      const nums = typeof row.numbersMain === "string" ? JSON.parse(row.numbersMain) : row.numbersMain;
      nums.forEach((n) => {
        if (mainFreq[n]) {
          mainFreq[n].freq++;
          mainFreq[n].lastDrawn = row.drawDate;
          mainFreq[n].lastIndex = idx;
        }
      });
    });

    for (const [numStr, stat] of Object.entries(mainFreq)) {
      const num = parseInt(numStr);
      const delay = stat.lastIndex >= 0 ? totalDraws - 1 - stat.lastIndex : totalDraws;
      await conn.execute(
        `INSERT INTO us_stats_number_main (lottery, number, frequency, lastDrawn, delay, totalDraws)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE frequency=VALUES(frequency), lastDrawn=VALUES(lastDrawn), delay=VALUES(delay), totalDraws=VALUES(totalDraws)`,
        [lottery, num, stat.freq, stat.lastDrawn, delay, totalDraws]
      );
    }

    // Special numbers
    const specialFreq = {};
    for (let n = 1; n <= specialMax; n++) {
      specialFreq[n] = { freq: 0, lastDrawn: null, lastIndex: -1 };
    }

    rows.forEach((row, idx) => {
      const n = row.numberSpecial;
      if (specialFreq[n]) {
        specialFreq[n].freq++;
        specialFreq[n].lastDrawn = row.drawDate;
        specialFreq[n].lastIndex = idx;
      }
    });

    for (const [numStr, stat] of Object.entries(specialFreq)) {
      const num = parseInt(numStr);
      const delay = stat.lastIndex >= 0 ? totalDraws - 1 - stat.lastIndex : totalDraws;
      await conn.execute(
        `INSERT INTO us_stats_number_special (lottery, number, frequency, lastDrawn, delay, totalDraws)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE frequency=VALUES(frequency), lastDrawn=VALUES(lastDrawn), delay=VALUES(delay), totalDraws=VALUES(totalDraws)`,
        [lottery, num, stat.freq, stat.lastDrawn, delay, totalDraws]
      );
    }

    console.log(`[Sync] Stats for ${lottery}: ${totalDraws} draws, ${mainMax} main numbers, ${specialMax} special numbers`);
  }

  await conn.end();
  console.log("[Sync] Done!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
