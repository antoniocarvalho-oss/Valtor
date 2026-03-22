import "dotenv/config";
import nodemailer from "nodemailer";

// ─── SMTP CONFIG ─────────────────────────────────────────────────────────────
const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT ?? "465");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? user;

if (!host || !user || !pass) {
  console.error("SMTP not configured");
  process.exit(1);
}

const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

// ─── FETCH ALL LOTTERY RESULTS ───────────────────────────────────────────────
const API_URL = "https://loteriascaixa-api.herokuapp.com/api";
const LOTERIAS = [
  { slug: "megasena", nome: "Mega-Sena", color: "#16a34a", emoji: "🍀" },
  { slug: "lotofacil", nome: "Lotofácil", color: "#7c3aed", emoji: "🎯" },
  { slug: "quina", nome: "Quina", color: "#ea580c", emoji: "🎰" },
  { slug: "lotomania", nome: "Lotomania", color: "#0ea5e9", emoji: "🌀" },
  { slug: "timemania", nome: "Timemania", color: "#dc2626", emoji: "⚽" },
  { slug: "duplasena", nome: "Dupla Sena", color: "#d97706", emoji: "🎲" },
  { slug: "diadesorte", nome: "Dia de Sorte", color: "#db2777", emoji: "🌸" },
  { slug: "supersete", nome: "Super Sete", color: "#059669", emoji: "7️⃣" },
  { slug: "maismilionaria", nome: "+Milionária", color: "#6366f1", emoji: "💎" },
];

async function fetchLatest(slug) {
  try {
    const apiSlug = slug === "maismilionaria" ? "maismilionaria" : slug === "duplasena" ? "duplasena" : slug === "diadesorte" ? "diadesorte" : slug === "supersete" ? "supersete" : slug;
    const res = await fetch(`${API_URL}/${apiSlug}/latest`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      slug,
      numero: data.concurso ?? data.numero ?? 0,
      dataSorteio: data.data ?? data.dataSorteio ?? new Date().toISOString(),
      dezenas: (data.dezenas ?? data.listaDezenas ?? []).map(d => parseInt(d)),
      acumulado: data.acumulou ?? data.acumulado ?? false,
      ganhadores: data.premiacoes?.slice(0, 3)?.map(p => ({
        faixa: p.descricao ?? p.faixa ?? "",
        quantidade: p.ganhadores ?? p.quantidade ?? 0,
        premio: p.valorPremio ?? p.premio ?? 0,
      })) ?? [],
    };
  } catch (err) {
    console.warn(`Failed to fetch ${slug}:`, err.message);
    return null;
  }
}

// ─── BUILD HTML ──────────────────────────────────────────────────────────────
function buildHtml(resultados) {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const resultadosHtml = resultados.map(r => {
    const meta = LOTERIAS.find(l => l.slug === r.slug) ?? { color: "#2563eb", emoji: "🎲", nome: r.slug };
    const dezenasHtml = r.dezenas.slice(0, 20).map(d =>
      `<span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:${meta.color};color:#fff;font-weight:700;font-size:13px;line-height:32px;text-align:center;margin:2px;">${d}</span>`
    ).join("");

    const ganhadoresHtml = r.ganhadores && r.ganhadores.length > 0
      ? r.ganhadores.map(g =>
          `<tr><td style="padding:4px 8px;font-size:12px;color:#374151;">${g.faixa}</td><td style="padding:4px 8px;font-size:12px;color:#374151;text-align:center;">${g.quantidade}</td><td style="padding:4px 8px;font-size:12px;color:#16a34a;font-weight:600;text-align:right;">R$ ${Number(g.premio).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>`
        ).join("")
      : "";

    return `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:16px;overflow:hidden;">
        <div style="background:${meta.color};padding:12px 16px;">
          <span style="font-size:20px;">${meta.emoji}</span>
          <span style="color:#fff;font-weight:800;font-size:15px;margin-left:8px;">${meta.nome}</span>
          <span style="color:rgba(255,255,255,0.8);font-size:12px;margin-left:8px;">Concurso #${r.numero} · ${new Date(r.dataSorteio).toLocaleDateString("pt-BR")}</span>
          ${r.acumulado ? `<span style="margin-left:12px;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;">ACUMULADO</span>` : ""}
        </div>
        <div style="padding:16px;">
          <div style="margin-bottom:12px;">${dezenasHtml}</div>
          ${ganhadoresHtml ? `
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #f3f4f6;margin-top:8px;">
            <tr style="background:#f9fafb;">
              <th style="padding:4px 8px;font-size:11px;color:#6b7280;text-align:left;">Faixa</th>
              <th style="padding:4px 8px;font-size:11px;color:#6b7280;text-align:center;">Ganhadores</th>
              <th style="padding:4px 8px;font-size:11px;color:#6b7280;text-align:right;">Prêmio</th>
            </tr>
            ${ganhadoresHtml}
          </table>` : ""}
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Resultados Valtor</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#0d1b3e 0%,#1a3a8f 100%);border-radius:16px 16px 0 0;padding:28px 32px;">
          <div style="margin-bottom:16px;">
            <span style="display:inline-block;width:36px;height:36px;background:#f5a623;border-radius:8px;text-align:center;line-height:36px;">
              <span style="color:#0d1b3e;font-weight:900;font-size:18px;">V</span>
            </span>
            <span style="color:#fff;font-weight:900;font-size:20px;margin-left:8px;">Valtor</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Resultados de hoje</h1>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">${today}</p>
        </td></tr>
        <tr><td style="background:#fff;padding:20px 32px 8px;">
          <p style="color:#374151;font-size:15px;margin:0;">Olá, <strong>Antonio</strong>! Aqui estão os últimos resultados de todas as loterias:</p>
        </td></tr>
        <tr><td style="background:#fff;padding:8px 32px 24px;">
          ${resultadosHtml}
        </td></tr>
        <tr><td style="background:#fff;padding:0 32px 28px;text-align:center;">
          <a href="https://www.valtor.com.br/analise" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Ver análise completa →
          </a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">Você está recebendo este e-mail porque ativou as notificações no Valtor.</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            <a href="https://www.valtor.com.br/perfil" style="color:#6b7280;text-decoration:underline;">Gerenciar preferências</a> · 
            <a href="https://www.valtor.com.br/perfil" style="color:#6b7280;text-decoration:underline;">Cancelar inscrição</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching latest results from all 9 lotteries...");
  
  const resultados = [];
  for (const loteria of LOTERIAS) {
    console.log(`  Fetching ${loteria.nome}...`);
    const result = await fetchLatest(loteria.slug);
    if (result) {
      resultados.push(result);
      console.log(`    ✓ Concurso #${result.numero} — ${result.dezenas.length} dezenas`);
    } else {
      console.log(`    ✗ Failed`);
    }
  }

  console.log(`\nFetched ${resultados.length}/${LOTERIAS.length} lotteries.`);
  
  if (resultados.length === 0) {
    console.error("No results to send!");
    process.exit(1);
  }

  const html = buildHtml(resultados);
  const to = "antonniocarvalho1979@gmail.com";
  
  console.log(`\nSending email to ${to}...`);
  
  await transporter.sendMail({
    from: `Valtor <${from}>`,
    to,
    subject: `🎲 Resultados das Loterias — ${new Date().toLocaleDateString("pt-BR")}`,
    html,
  });

  console.log("✓ Email sent successfully!");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
