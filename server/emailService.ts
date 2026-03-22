import nodemailer from "nodemailer";
import { getUsersWithEmailOptIn, getUltimoConcurso, getAllLoterias } from "./db";
import { syncUltimoConcurso } from "./caixaApi";

// ─── SMTP CONFIGURATION ───────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user ?? "noreply@valtor.com.br";

  if (!host || !user || !pass) {
    console.warn("[Email] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.");
    return null;
  }

  return { transporter: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

// ─── LOTERIA COLORS & EMOJIS ──────────────────────────────────────────────────
const LOTERIA_META: Record<string, { color: string; emoji: string; nome: string }> = {
  megasena:       { color: "#16a34a", emoji: "🍀", nome: "Mega-Sena" },
  lotofacil:      { color: "#7c3aed", emoji: "🎯", nome: "Lotofácil" },
  quina:          { color: "#ea580c", emoji: "🎰", nome: "Quina" },
  lotomania:      { color: "#0ea5e9", emoji: "🌀", nome: "Lotomania" },
  timemania:      { color: "#dc2626", emoji: "⚽", nome: "Timemania" },
  duplasena:      { color: "#d97706", emoji: "🎲", nome: "Dupla Sena" },
  diadesorte:     { color: "#db2777", emoji: "🌸", nome: "Dia de Sorte" },
  supersete:      { color: "#059669", emoji: "7️⃣", nome: "Super Sete" },
  maismilionaria: { color: "#6366f1", emoji: "💎", nome: "+Milionária" },
};

// ─── DATE HELPER ─────────────────────────────────────────────────────────────
// Always use BRT (UTC-3) for date display to match Brazilian users' expectations
function getBRTDate(d?: Date | string | number | null): Date {
  const base = d ? (d instanceof Date ? d : new Date(d)) : new Date();
  // Shift to BRT (UTC-3): subtract 3 hours from UTC
  return new Date(base.getTime() - 3 * 60 * 60 * 1000);
}

function formatDate(d: Date | string | number | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  // Use BRT timezone for display
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

// ─── HTML EMAIL TEMPLATE ──────────────────────────────────────────────────────
function buildEmailHtml(
  userName: string,
  resultados: Array<{
    slug: string;
    numero: number;
    dataSorteio: Date | string;
    dezenas: number[];
    acumulado: boolean;
    ganhadores?: Array<{ faixa: string; quantidade: number; premio: number }> | null;
  }>
): string {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

  const resultadosHtml = resultados.map(r => {
    const meta = LOTERIA_META[r.slug] ?? { color: "#2563eb", emoji: "🎲", nome: r.slug };
    const dezenasHtml = r.dezenas.slice(0, 20).map(d =>
      `<span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:${meta.color};color:#fff;font-weight:700;font-size:13px;line-height:32px;text-align:center;margin:2px;">${d}</span>`
    ).join("");

    const ganhadoresHtml = r.ganhadores && r.ganhadores.length > 0
      ? r.ganhadores.slice(0, 3).map(g =>
          `<tr><td style="padding:4px 8px;font-size:12px;color:#374151;">${g.faixa}</td><td style="padding:4px 8px;font-size:12px;color:#374151;text-align:center;">${g.quantidade}</td><td style="padding:4px 8px;font-size:12px;color:#16a34a;font-weight:600;text-align:right;">R$ ${Number(g.premio).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>`
        ).join("")
      : "";

    return `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:16px;overflow:hidden;">
        <div style="background:${meta.color};padding:12px 16px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">${meta.emoji}</span>
          <div>
            <div style="color:#fff;font-weight:800;font-size:15px;">${meta.nome}</div>
            <div style="color:rgba(255,255,255,0.8);font-size:12px;">Concurso #${r.numero} · ${formatDate(r.dataSorteio)}</div>
          </div>
          ${r.acumulado ? `<span style="margin-left:auto;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;">ACUMULADO</span>` : ""}
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
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0d1b3e 0%,#1a3a8f 100%);border-radius:16px 16px 0 0;padding:28px 32px;">
          <div style="margin-bottom:16px;">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/valtor_logo_email_acfa3afb.jpeg" alt="Valtor — Onde a matemática encontra a sorte." style="height:60px;width:auto;border-radius:8px;" />
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Resultados de hoje</h1>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">${today}</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="background:#fff;padding:20px 32px 8px;">
          <p style="color:#374151;font-size:15px;margin:0;">Olá, <strong>${userName}</strong>! Aqui estão os últimos resultados das suas loterias favoritas:</p>
        </td></tr>

        <!-- Results -->
        <tr><td style="background:#fff;padding:8px 32px 24px;">
          ${resultadosHtml}
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#fff;padding:0 32px 28px;text-align:center;">
          <a href="https://valtor.com.br/analise" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Ver análise completa →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">Você está recebendo este e-mail porque ativou as notificações no Valtor.</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            <a href="https://valtor.com.br/perfil" style="color:#6b7280;text-decoration:underline;">Gerenciar preferências</a> · 
            <a href="https://valtor.com.br/perfil" style="color:#6b7280;text-decoration:underline;">Cancelar inscrição</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── MAIN SEND FUNCTION ───────────────────────────────────────────────────────
export async function sendDailyResultsEmails(): Promise<{ sent: number; failed: number; skipped: number }> {
  const smtp = createTransporter();
  if (!smtp) {
    return { sent: 0, failed: 0, skipped: 0 };
  }

  // Get all loterias
  const loterias = await getAllLoterias();
  if (loterias.length === 0) {
    console.warn("[Email] No loterias found in database");
    return { sent: 0, failed: 0, skipped: 0 };
  }

  // Sync latest results from Caixa API BEFORE reading from DB
  // This ensures we always have the most up-to-date results
  console.log("[Email] Syncing latest results from Caixa API...");
  for (const loteria of loterias) {
    try {
      await syncUltimoConcurso(loteria.slug);
    } catch (err) {
      console.warn(`[Email] Failed to sync ${loteria.slug} from API:`, err);
    }
  }
  console.log("[Email] Sync complete. Fetching results from DB...");

  // Now fetch the freshly-synced results from DB
  const resultados: Array<{
    slug: string;
    numero: number;
    dataSorteio: Date | string;
    dezenas: number[];
    acumulado: boolean;
    ganhadores?: Array<{ faixa: string; quantidade: number; premio: number }> | null;
  }> = [];

  for (const loteria of loterias) {
    try {
      const concurso = await getUltimoConcurso(loteria.slug);
      if (concurso) {
        resultados.push({
          slug: loteria.slug,
          numero: concurso.numero,
          dataSorteio: concurso.dataSorteio,
          dezenas: concurso.dezenas as number[],
          acumulado: concurso.premioAcumulado,
          ganhadores: concurso.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null,
        });
      }
    } catch (err) {
      console.warn(`[Email] Failed to fetch results for ${loteria.slug}:`, err);
    }
  }

  if (resultados.length === 0) {
    console.warn("[Email] No results available to send");
    return { sent: 0, failed: 0, skipped: 0 };
  }

  // Get all users with email opt-in
  const users = await getUsersWithEmailOptIn();
  let sent = 0, failed = 0, skipped = 0;

  for (const user of users) {
    if (!user.email) { skipped++; continue; }

    // Filter loterias by user preference
    const userLoterias = (user.emailLoterias as string[] | null) ?? [];
    const filteredResultados = userLoterias.length > 0
      ? resultados.filter(r => userLoterias.includes(r.slug))
      : resultados;

    if (filteredResultados.length === 0) { skipped++; continue; }

    try {
      const html = buildEmailHtml(user.name ?? "Jogador", filteredResultados);
      await smtp.transporter.sendMail({
        from: `Valtor <${smtp.from}>`,
        to: user.email,
        subject: `🎲 Resultados de hoje — ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
        html,
      });
      sent++;
      console.log(`[Email] Sent to ${user.email}`);
    } catch (err) {
      failed++;
      console.error(`[Email] Failed to send to ${user.email}:`, err);
    }
  }

  console.log(`[Email] Daily results: sent=${sent}, failed=${failed}, skipped=${skipped}`);
  return { sent, failed, skipped };
}

// ─── SEND TEST EMAIL ──────────────────────────────────────────────────────────
export async function sendTestEmail(to: string, userName: string): Promise<boolean> {
  const smtp = createTransporter();
  if (!smtp) return false;

  const loterias = await getAllLoterias();
  const resultados: Array<{
    slug: string;
    numero: number;
    dataSorteio: Date | string;
    dezenas: number[];
    acumulado: boolean;
    ganhadores?: Array<{ faixa: string; quantidade: number; premio: number }> | null;
  }> = [];

  for (const loteria of loterias.slice(0, 3)) {
    const concurso = await getUltimoConcurso(loteria.slug);
    if (concurso) {
      resultados.push({
        slug: loteria.slug,
        numero: concurso.numero,
        dataSorteio: concurso.dataSorteio,
        dezenas: concurso.dezenas as number[],
        acumulado: concurso.premioAcumulado,
        ganhadores: concurso.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null,
      });
    }
  }

  try {
    const html = buildEmailHtml(userName, resultados);
    await smtp.transporter.sendMail({
      from: `Valtor <${smtp.from}>`,
      to,
      subject: `[TESTE] 🎲 Resultados de hoje — Valtor`,
      html,
    });
    return true;
  } catch (err) {
    console.error("[Email] Test send failed:", err);
    return false;
  }
}
