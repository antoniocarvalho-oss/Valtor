import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripeWebhook";
import { handleMercadoPagoWebhook } from "../mercadopagoWebhook";
import { sendDailyResultsEmails } from "../emailService";
import { runAutoChecker } from "../autoChecker";
import { BLOG_ARTICLES } from "../../shared/blogArticles";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Stripe webhook MUST use raw body BEFORE express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  // Mercado Pago webhook (uses JSON body)
  app.post("/api/mercadopago/webhook", express.json(), handleMercadoPagoWebhook);

  // ========== SITEMAP INDEX + SITEMAPS POR CATEGORIA ==========
  const SITEMAP_BASE_URL = "https://www.valtor.com.br";
  const SITEMAP_LOTTERIES = ["megasena", "lotofacil", "quina", "lotomania", "timemania", "duplasena", "diadesorte", "supersete", "maismilionaria"];

  // Helper: wrap URLs into a <urlset> XML
  function buildUrlsetXml(urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>): string {
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
    xml += `</urlset>`;
    return xml;
  }

  // 1) SITEMAP INDEX — /sitemap_index.xml (also served at /sitemap.xml for backward compat)
  function buildSitemapIndex(): string {
    const today = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const sitemaps = [
      "sitemap-paginas.xml",
      "sitemap-loterias.xml",
      "sitemap-estatisticas.xml",
      "sitemap-ferramentas.xml",
      "sitemap-seo.xml",
      "sitemap-concursos.xml",
      "sitemap-blog.xml",
      "sitemap-us-lotteries.xml",
    ];
    for (const s of sitemaps) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${SITEMAP_BASE_URL}/${s}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `  </sitemap>\n`;
    }
    xml += `</sitemapindex>`;
    return xml;
  }

  app.get("/sitemap_index.xml", (_req, res) => {
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildSitemapIndex());
  });

  // Backward compatibility: /sitemap.xml also returns the index
  app.get("/sitemap.xml", (_req, res) => {
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildSitemapIndex());
  });

  // 2) PÁGINAS ESTÁTICAS — /sitemap-paginas.xml
  app.get("/sitemap-paginas.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls = [
      { loc: `${SITEMAP_BASE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
      { loc: `${SITEMAP_BASE_URL}/sobre`, lastmod: today, changefreq: "monthly", priority: "0.6" },
      { loc: `${SITEMAP_BASE_URL}/planos`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${SITEMAP_BASE_URL}/resultados`, lastmod: today, changefreq: "daily", priority: "0.9" },
      { loc: `${SITEMAP_BASE_URL}/analise`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${SITEMAP_BASE_URL}/ao-vivo`, lastmod: today, changefreq: "daily", priority: "0.7" },
      { loc: `${SITEMAP_BASE_URL}/termos`, lastmod: today, changefreq: "yearly", priority: "0.3" },
      { loc: `${SITEMAP_BASE_URL}/privacidade`, lastmod: today, changefreq: "yearly", priority: "0.3" },
    ];
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // 3) LOTERIAS — /sitemap-loterias.xml (resultados de cada loteria)
  app.get("/sitemap-loterias.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    for (const slug of SITEMAP_LOTTERIES) {
      urls.push({ loc: `${SITEMAP_BASE_URL}/${slug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
    }
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // 4) ESTATÍSTICAS — /sitemap-estatisticas.xml
  app.get("/sitemap-estatisticas.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    for (const slug of SITEMAP_LOTTERIES) {
      urls.push({ loc: `${SITEMAP_BASE_URL}/${slug}/estatisticas`, lastmod: today, changefreq: "daily", priority: "0.8" });
    }
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // 5) FERRAMENTAS — /sitemap-ferramentas.xml
  app.get("/sitemap-ferramentas.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls = [
      { loc: `${SITEMAP_BASE_URL}/gerador`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${SITEMAP_BASE_URL}/conferidor`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${SITEMAP_BASE_URL}/simulador`, lastmod: today, changefreq: "weekly", priority: "0.7" },
      { loc: `${SITEMAP_BASE_URL}/extensao`, lastmod: today, changefreq: "monthly", priority: "0.5" },
    ];
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // 6) PÁGINAS SEO / LANDING PAGES — /sitemap-seo.xml (36 páginas: 9 loterias x 4 tipos)
  const SEO_URL_SLUGS: Record<string, string> = {
    megasena: "megasena",
    lotofacil: "lotofacil",
    quina: "quina",
    lotomania: "lotomania",
    timemania: "timemania",
    duplasena: "duplasena",
    diadesorte: "diadesorte",
    supersete: "supersete",
    maismilionaria: "maismilionaria",
  };

  app.get("/sitemap-seo.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    for (const slug of SITEMAP_LOTTERIES) {
      const urlSlug = SEO_URL_SLUGS[slug] || slug;
      urls.push({ loc: `${SITEMAP_BASE_URL}/numeros-atrasados-${urlSlug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
      urls.push({ loc: `${SITEMAP_BASE_URL}/numeros-mais-sorteados-${urlSlug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
      urls.push({ loc: `${SITEMAP_BASE_URL}/frequencia-${urlSlug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
      urls.push({ loc: `${SITEMAP_BASE_URL}/resultado-${urlSlug}-hoje`, lastmod: today, changefreq: "daily", priority: "0.9" });
    }
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // 7) CONCURSOS — /sitemap-concursos.xml (TODOS os concursos de cada loteria)
  // Cada concurso é uma página indexável. Novos concursos entram automaticamente.
  app.get("/sitemap-concursos.xml", async (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    try {
      const { getDb } = await import("../db");
      const schema = await import("../../drizzle/schema");
      const { desc, sql } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      for (const slug of SITEMAP_LOTTERIES) {
        // Get ALL concursos — each one is a unique page for Google
        const allConcursos = await db
          .select({ numero: schema.concursos.numero })
          .from(schema.concursos)
          .where(sql`${schema.concursos.loteriaSlug} = ${slug}`)
          .orderBy(desc(schema.concursos.numero));

        for (const c of allConcursos) {
          urls.push({
            loc: `${SITEMAP_BASE_URL}/${slug}/concurso/${c.numero}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          });
        }
      }
    } catch (err) {
      console.error("[Sitemap] Error generating concursos sitemap:", err);
    }
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });
  // 8) BLOG — /sitemap-blog.xml
  app.get("/sitemap-blog.xml", (_req, res) => {
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    // Use imported BLOG_ARTICLES from shared
    urls.push({ loc: `${SITEMAP_BASE_URL}/blog`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.7" });
    for (const article of BLOG_ARTICLES) {
      urls.push({
        loc: `${SITEMAP_BASE_URL}/blog/${article.slug}`,
        lastmod: article.updatedAt || article.publishedAt,
        changefreq: "weekly",
        priority: "0.8",
      });
    }
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // 9) US LOTTERIES — /sitemap-us-lotteries.xml
  app.get("/sitemap-us-lotteries.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const US_LOTTERIES = ["mega-millions", "powerball"];
    const SEO_TYPES = ["numeros-mais-sorteados", "numeros-atrasados", "frequencia"];
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    // Main lottery pages
    for (const slug of US_LOTTERIES) {
      urls.push({ loc: `${SITEMAP_BASE_URL}/${slug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
    }
    // SEO stats pages
    for (const slug of US_LOTTERIES) {
      for (const seoType of SEO_TYPES) {
        urls.push({ loc: `${SITEMAP_BASE_URL}/${seoType}-${slug}`, lastmod: today, changefreq: "daily", priority: "0.9" });
      }
    }
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buildUrlsetXml(urls));
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // PDF export route
  app.post("/api/export-pdf", async (req, res) => {
    try {
      const { generateGamesPDF } = await import("../pdfExport");
      const { games, title, userName } = req.body;
      if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: "Nenhum jogo para exportar" });
      }
      const pdfBuffer = await generateGamesPDF(games, { title, userName });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="valtor-jogos.pdf"');
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[PDF Export] Error:", err);
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });

  // ─── APOSTA RÁPIDA REST API (Chrome Extension) ───────────────────────────
  // This endpoint uses Bearer token auth instead of cookies because
  // Chrome extensions can't send cookies cross-origin to the Valtor domain.
  app.get("/api/aposta-rapida/jogos", async (req, res) => {
    // CORS for extension
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "not-logged", message: "Token não fornecido" });
      }
      const token = authHeader.slice(7);
      const { getUserByApiToken, getActiveBetsForExtension, getSavedGamesByUser, getActiveSubscription } = await import("../db");
      const user = await getUserByApiToken(token);
      if (!user) {
        return res.status(401).json({ error: "not-logged", message: "Token inválido" });
      }
      const sub = await getActiveSubscription(user.id);
      if (!sub) {
        return res.status(403).json({ error: "not-subscriber", message: "Assinatura necessária" });
      }
      const mode = req.query.mode === "todos" ? "todos" : "pendentes";
      // For "pendentes" mode, use getActiveBetsForExtension which filters out already-drawn concursos
      const games = mode === "todos" ? await getSavedGamesByUser(user.id) : await getActiveBetsForExtension(user.id);
      const grouped: Record<string, any[]> = {};
      for (const g of games) {
        const slug = g.loteriaSlug;
        if (!grouped[slug]) grouped[slug] = [];
        grouped[slug].push({
          id: g.id,
          dezenas: g.dezenas as number[],
          nome: g.nome,
          apostado: g.apostado,
          concursoApostado: g.concursoApostado,
        });
      }
      return res.json({ jogos: grouped, total: games.length });
    } catch (err) {
      console.error("[ApostaRapida API]", err);
      return res.status(500).json({ error: "server", message: "Erro interno" });
    }
  });
  // CORS preflight for extension
  app.options("/api/aposta-rapida/jogos", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.sendStatus(204);
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // ─── CRON: Daily email dispatch ─────────────────────────────────────────────
  // Sorteios são às 21h BRT. Disparar e-mails às 23:00 BRT (02:00 UTC) — AFTER auto-checker (22:30 BRT).
  // Runs every minute and checks if it's the right time.
  const DISPATCH_HOUR_UTC = 2;   // 23h BRT = 02h UTC (next day)
  const DISPATCH_MINUTE = 0;     // 23:00 BRT = 02:00 UTC
  let lastDispatchDate = "";

  setInterval(async () => {
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const dateKey = now.toISOString().split("T")[0];

    // Only dispatch once per day at the target time
    if (utcH === DISPATCH_HOUR_UTC && utcM === DISPATCH_MINUTE && lastDispatchDate !== dateKey) {
      lastDispatchDate = dateKey;
      console.log(`[Cron] Triggering daily email dispatch at ${now.toISOString()}`);
      try {
        const result = await sendDailyResultsEmails();
        console.log(`[Cron] Email dispatch complete: sent=${result.sent}, failed=${result.failed}, skipped=${result.skipped}`);
      } catch (err) {
        console.error("[Cron] Email dispatch error:", err);
      }
    }
  }, 60_000); // Check every minute

  console.log("[Cron] Daily email dispatch scheduled for 23:00 BRT (02:00 UTC)");

  // ─── CRON: Auto-checker (conferidor automático) ──────────────────────────────
  // Runs at 22:30 BRT (01:30 UTC) — 1h30 after draws close (21h), before email dispatch.
  // This ensures results are fully published before checking bets.
  const CHECKER_HOUR_UTC = 1;   // 22h BRT = 01h UTC (next day)
  const CHECKER_MINUTE = 30;    // 22:30 BRT = 01:30 UTC
  let lastCheckerDate = "";

  setInterval(async () => {
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const dateKey = now.toISOString().split("T")[0];

    if (utcH === CHECKER_HOUR_UTC && utcM === CHECKER_MINUTE && lastCheckerDate !== dateKey) {
      lastCheckerDate = dateKey;
      console.log(`[Cron] Triggering auto-checker at ${now.toISOString()}`);
      try {
        const result = await runAutoChecker();
        console.log(`[Cron] Auto-checker complete: checked=${result.checked}, notified=${result.notified}, errors=${result.errors}`);
      } catch (err) {
        console.error("[Cron] Auto-checker error:", err);
      }
    }
  }, 60_000);

  console.log("[Cron] Auto-checker scheduled for 22:30 BRT (01:30 UTC)");
}

startServer().catch(console.error);
