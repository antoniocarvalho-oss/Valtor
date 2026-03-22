/**
 * generate-sitemap-concursos.mjs
 * 
 * Runs at BUILD TIME to generate a static sitemap-concursos.xml
 * by querying the database for all unique concurso numbers.
 * 
 * The Manus deployment platform serves static files via CDN before
 * Express routes, so dynamic .xml routes get intercepted by the
 * SPA catch-all and return HTML instead of XML. This script solves
 * that by generating the XML as a static file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../client/public");
const BASE_URL = "https://www.valtor.com.br";
const LOTTERIES = [
  "megasena", "lotofacil", "quina", "lotomania", "timemania",
  "duplasena", "diadesorte", "supersete", "maismilionaria"
];

function buildUrlsetXml(urls) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;
  return xml;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const urls = [];

  // Try to connect to database and get real concurso numbers
  if (process.env.DATABASE_URL) {
    try {
      const mysql = await import("mysql2/promise");
      const conn = await mysql.createConnection(process.env.DATABASE_URL);

      for (const slug of LOTTERIES) {
        const [rows] = await conn.execute(
          "SELECT DISTINCT numero FROM concursos WHERE loteriaSlug = ? ORDER BY numero DESC",
          [slug]
        );
        for (const row of rows) {
          urls.push({
            loc: `${BASE_URL}/${slug}/concurso/${row.numero}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          });
        }
      }

      await conn.end();
      console.log(`[Sitemap-Concursos] Generated from database: ${urls.length} unique concurso URLs`);
    } catch (err) {
      console.warn("[Sitemap-Concursos] Database connection failed, using fallback:", err.message);
    }
  }

  // Fallback: if no DB or no results, generate URLs for recent concurso ranges
  if (urls.length === 0) {
    console.log("[Sitemap-Concursos] Using fallback: generating URLs from known ranges");
    const ranges = {
      megasena: { max: 2986, count: 50 },
      lotofacil: { max: 3640, count: 50 },
      quina: { max: 6980, count: 50 },
      lotomania: { max: 2901, count: 50 },
      timemania: { max: 2369, count: 50 },
      duplasena: { max: 2938, count: 50 },
      diadesorte: { max: 1190, count: 50 },
      supersete: { max: 824, count: 50 },
      maismilionaria: { max: 338, count: 50 },
    };
    for (const slug of LOTTERIES) {
      const r = ranges[slug];
      for (let n = r.max; n > r.max - r.count && n > 0; n--) {
        urls.push({
          loc: `${BASE_URL}/${slug}/concurso/${n}`,
          lastmod: today,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    }
    console.log(`[Sitemap-Concursos] Fallback generated: ${urls.length} concurso URLs`);
  }

  const outPath = path.join(PUBLIC_DIR, "sitemap-concursos.xml");
  fs.writeFileSync(outPath, buildUrlsetXml(urls));
  console.log(`[Sitemap-Concursos] Written ${urls.length} URLs to ${outPath}`);
}

main().catch(console.error);
