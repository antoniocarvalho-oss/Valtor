/**
 * Generate static sitemap XML files into client/public/
 * Run BEFORE vite build so they get included in the dist/public output.
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
    if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    if (u.priority) xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;
  return xml;
}

const today = new Date().toISOString().split("T")[0];

// ─── 1) sitemap-paginas.xml ───
const paginasUrls = [
  { loc: `${BASE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
  { loc: `${BASE_URL}/sobre`, lastmod: today, changefreq: "monthly", priority: "0.6" },
  { loc: `${BASE_URL}/planos`, lastmod: today, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/resultados`, lastmod: today, changefreq: "daily", priority: "0.9" },
  { loc: `${BASE_URL}/analise`, lastmod: today, changefreq: "daily", priority: "0.8" },
  { loc: `${BASE_URL}/ao-vivo`, lastmod: today, changefreq: "daily", priority: "0.7" },
  { loc: `${BASE_URL}/termos`, lastmod: today, changefreq: "yearly", priority: "0.3" },
  { loc: `${BASE_URL}/privacidade`, lastmod: today, changefreq: "yearly", priority: "0.3" },
];
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-paginas.xml"), buildUrlsetXml(paginasUrls));

// ─── 2) sitemap-loterias.xml ───
const loteriasUrls = LOTTERIES.map(slug => ({
  loc: `${BASE_URL}/${slug}`, lastmod: today, changefreq: "daily", priority: "0.9"
}));
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-loterias.xml"), buildUrlsetXml(loteriasUrls));

// ─── 3) sitemap-estatisticas.xml ───
const estatisticasUrls = LOTTERIES.map(slug => ({
  loc: `${BASE_URL}/${slug}/estatisticas`, lastmod: today, changefreq: "daily", priority: "0.8"
}));
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-estatisticas.xml"), buildUrlsetXml(estatisticasUrls));

// ─── 4) sitemap-ferramentas.xml ───
const ferramentasUrls = [
  { loc: `${BASE_URL}/gerador`, lastmod: today, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/conferidor`, lastmod: today, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/simulador`, lastmod: today, changefreq: "weekly", priority: "0.7" },
  { loc: `${BASE_URL}/extensao`, lastmod: today, changefreq: "monthly", priority: "0.5" },
];
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-ferramentas.xml"), buildUrlsetXml(ferramentasUrls));

// ─── 5) sitemap-seo.xml (36 landing pages) ───
const seoUrls = [];
for (const slug of LOTTERIES) {
  seoUrls.push({ loc: `${BASE_URL}/numeros-atrasados-${slug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
  seoUrls.push({ loc: `${BASE_URL}/numeros-mais-sorteados-${slug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
  seoUrls.push({ loc: `${BASE_URL}/frequencia-${slug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
  seoUrls.push({ loc: `${BASE_URL}/resultado-${slug}-hoje`, lastmod: today, changefreq: "daily", priority: "0.9" });
}
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-seo.xml"), buildUrlsetXml(seoUrls));

// ─── 6) sitemap-blog.xml ───
// Dynamic import of blog articles (TS compiled to JS by tsx)
let blogArticles = [];
try {
  const blogModule = await import("../shared/blogArticles.ts");
  blogArticles = blogModule.BLOG_ARTICLES || [];
} catch (e) {
  console.warn("[Sitemap] Could not import blog articles, using empty list:", e.message);
}
const blogUrls = [
  { loc: `${BASE_URL}/blog`, lastmod: today, changefreq: "weekly", priority: "0.7" },
];
for (const article of blogArticles) {
  blogUrls.push({
    loc: `${BASE_URL}/blog/${article.slug}`,
    lastmod: article.updatedAt || article.publishedAt || today,
    changefreq: "weekly",
    priority: "0.8",
  });
}
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-blog.xml"), buildUrlsetXml(blogUrls));

// ─── 7) sitemap-concursos.xml — NOT generated statically ───
// Concursos sitemap is served dynamically by Express route (needs DB access).
// New concursos are added daily for all 9 lotteries, so this must be dynamic.
// DO NOT generate a static file here — it would override the Express route.

// ─── 8) sitemap_index.xml ───
const sitemapNames = [
  "sitemap-paginas.xml",
  "sitemap-loterias.xml",
  "sitemap-estatisticas.xml",
  "sitemap-ferramentas.xml",
  "sitemap-seo.xml",
  "sitemap-concursos.xml",
  "sitemap-blog.xml",
];
let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const s of sitemapNames) {
  indexXml += `  <sitemap>\n`;
  indexXml += `    <loc>${BASE_URL}/${s}</loc>\n`;
  indexXml += `    <lastmod>${today}</lastmod>\n`;
  indexXml += `  </sitemap>\n`;
}
indexXml += `</sitemapindex>\n`;
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap_index.xml"), indexXml);

// ─── 9) sitemap.xml (copy of sitemap_index.xml for backward compat) ───
fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), indexXml);

// Count total URLs
const totalUrls = paginasUrls.length + loteriasUrls.length + estatisticasUrls.length +
  ferramentasUrls.length + seoUrls.length + blogUrls.length;
// Note: concursos URLs are dynamic (served by Express), not counted here

console.log(`[Sitemap] Generated ${sitemapNames.length + 2} XML files (${totalUrls} URLs) in ${PUBLIC_DIR}`);
