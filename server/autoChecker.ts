import nodemailer from "nodemailer";
import {
  getAllPendingBets,
  batchUpdateGameResults,
  getUsersForNotification,
  getUltimoConcurso,
  getConcursoByNumero,
  getAllLoterias,
  createBatchNotifications,
} from "./db";
import { notifyOwner } from "./_core/notification";


// ─── SMTP CONFIGURATION ───────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user ?? "noreply@valtor.com.br";

  if (!host || !user || !pass) {
    console.warn("[AutoChecker] SMTP not configured.");
    return null;
  }

  return { transporter: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

// ─── LOTERIA METADATA ────────────────────────────────────────────────────────
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

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface CheckResult {
  gameId: number;
  userId: number;
  loteriaSlug: string;
  gameName: string | null;
  dezenas: number[];
  dezenasResult: number[];
  acertos: number;
  concursoNumero: number;
}

interface UserNotification {
  userId: number;
  userName: string;
  email: string;
  results: CheckResult[];
}

// ─── CORE AUTO-CHECKER LOGIC ─────────────────────────────────────────────────
export async function runAutoChecker(): Promise<{
  checked: number;
  notified: number;
  errors: number;
}> {
  console.log("[AutoChecker] Starting auto-check run...");

  // 1. Get all pending bets (apostado=true, conferido=false)
  const pendingBets = await getAllPendingBets();
  if (pendingBets.length === 0) {
    console.log("[AutoChecker] No pending bets to check.");
    return { checked: 0, notified: 0, errors: 0 };
  }

  console.log(`[AutoChecker] Found ${pendingBets.length} pending bets to check.`);

  // 2. Get latest results for all loterias involved, including prize data
  const slugsNeeded = Array.from(new Set(pendingBets.map(b => b.loteriaSlug)));
  const latestResults: Record<string, { numero: number; dezenas: number[]; ganhadores: Array<{ faixa: string; quantidade: number; premio: number }> | null }> = {};

  // Also cache specific concurso lookups for bets targeting a specific draw
  const concursoCache: Record<string, { numero: number; dezenas: number[]; ganhadores: Array<{ faixa: string; quantidade: number; premio: number }> | null }> = {};

  for (const slug of slugsNeeded) {
    const concurso = await getUltimoConcurso(slug);
    if (concurso) {
      latestResults[slug] = {
        numero: concurso.numero,
        dezenas: concurso.dezenas as number[],
        ganhadores: concurso.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null,
      };
    }
  }

  // 3. Compare each bet against the latest result
  const checkResults: CheckResult[] = [];
  const dbUpdates: Array<{ id: number; userId: number; acertos: number; conferido: boolean; valorGanho?: string }> = [];

  for (const bet of pendingBets) {
    // If bet targets a specific concurso, try to get that exact concurso
    let result = latestResults[bet.loteriaSlug];
    if (bet.concursoApostado) {
      const cacheKey = `${bet.loteriaSlug}_${bet.concursoApostado}`;
      if (!concursoCache[cacheKey]) {
        const specificConcurso = await getConcursoByNumero(bet.loteriaSlug, bet.concursoApostado);
        if (specificConcurso) {
          concursoCache[cacheKey] = {
            numero: specificConcurso.numero,
            dezenas: specificConcurso.dezenas as number[],
            ganhadores: specificConcurso.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null,
          };
        }
      }
      if (concursoCache[cacheKey]) {
        result = concursoCache[cacheKey];
      } else if (result && bet.concursoApostado > result.numero) {
        continue; // Bet is for a future draw, skip
      }
    }

    if (!result) continue;

    // Only check if the bet was for this concurso or earlier
    if (bet.concursoApostado && bet.concursoApostado > result.numero) {
      continue;
    }

    const betDezenas = bet.dezenas as number[];
    const resultDezenas = result.dezenas;
    const acertos = betDezenas.filter(d => resultDezenas.includes(d)).length;

    // Calculate prize value based on ganhadores data
    let valorGanho: string | undefined;
    if (result.ganhadores && result.ganhadores.length > 0) {
      // Find the prize tier that matches the number of acertos
      // Ganhadores faixas typically go from highest to lowest acertos
      const matchingFaixa = result.ganhadores.find(g => {
        // Parse faixa string to extract the number of acertos
        // Common formats: "6 acertos", "Sena", "Quina", "5 acertos", etc.
        const faixaLower = g.faixa.toLowerCase();
        if (faixaLower.includes(`${acertos} acerto`)) return true;
        // Map common names
        if (acertos === 6 && (faixaLower.includes('sena') || faixaLower.includes('6'))) return true;
        if (acertos === 5 && (faixaLower.includes('quina') || faixaLower.includes('5'))) return true;
        if (acertos === 4 && (faixaLower.includes('quadra') || faixaLower.includes('4'))) return true;
        if (acertos === 3 && (faixaLower.includes('terno') || faixaLower.includes('3'))) return true;
        if (acertos === 15 && faixaLower.includes('15')) return true;
        if (acertos === 14 && faixaLower.includes('14')) return true;
        if (acertos === 13 && faixaLower.includes('13')) return true;
        if (acertos === 12 && faixaLower.includes('12')) return true;
        if (acertos === 11 && faixaLower.includes('11')) return true;
        return false;
      });

      if (matchingFaixa && matchingFaixa.premio > 0) {
        valorGanho = matchingFaixa.premio.toFixed(2);
        console.log(`[AutoChecker] Game ${bet.id}: ${acertos} acertos in ${bet.loteriaSlug} → prize R$ ${valorGanho}`);
      }
    }

    checkResults.push({
      gameId: bet.id,
      userId: bet.userId,
      loteriaSlug: bet.loteriaSlug,
      gameName: bet.nome,
      dezenas: betDezenas,
      dezenasResult: resultDezenas,
      acertos,
      concursoNumero: result.numero,
    });

    dbUpdates.push({
      id: bet.id,
      userId: bet.userId,
      acertos,
      conferido: true,
      valorGanho,
    });
  }

  // 4. Update database with results
  if (dbUpdates.length > 0) {
    await batchUpdateGameResults(dbUpdates);
    console.log(`[AutoChecker] Updated ${dbUpdates.length} bets in database.`);
  }

  // 4b. Create in-app notifications for each checked bet
  if (checkResults.length > 0) {
    const notifItems = checkResults.map(cr => {
      const meta = LOTERIA_META[cr.loteriaSlug] ?? { emoji: "\ud83c\udfb2", nome: cr.loteriaSlug };
      const isPrize = cr.acertos >= 4;
      const dbUpdate = dbUpdates.find(u => u.id === cr.gameId);
      const valorGanho = dbUpdate?.valorGanho;
      return {
        userId: cr.userId,
        tipo: isPrize ? "premiado" : "resultado",
        titulo: isPrize
          ? `${meta.emoji} Parab\u00e9ns! ${cr.acertos} acertos na ${meta.nome}!`
          : `${meta.emoji} ${meta.nome} #${cr.concursoNumero} conferido`,
        mensagem: isPrize
          ? `Voc\u00ea acertou ${cr.acertos} n\u00fameros no concurso #${cr.concursoNumero} da ${meta.nome}!${valorGanho ? ` Pr\u00eamio: R$ ${Number(valorGanho).toFixed(2).replace(".", ",")}` : " Confira na lot\u00e9rica!"}`
          : `Seu jogo foi conferido: ${cr.acertos} acerto${cr.acertos !== 1 ? "s" : ""} no concurso #${cr.concursoNumero}.`,
        loteriaSlug: cr.loteriaSlug,
        concursoNumero: cr.concursoNumero,
        acertos: cr.acertos,
        valorGanho: valorGanho ?? undefined,
      };
    });
    try {
      await createBatchNotifications(notifItems);
      console.log(`[AutoChecker] Created ${notifItems.length} in-app notifications.`);
    } catch (err) {
      console.error("[AutoChecker] Failed to create in-app notifications:", err);
    }

    // Also notify project owner via push notification
    try {
      const totalChecked = checkResults.length;
      const prizes = checkResults.filter(cr => cr.acertos >= 4);
      const summary = prizes.length > 0
        ? `${totalChecked} apostas conferidas, ${prizes.length} premiada(s)!`
        : `${totalChecked} apostas conferidas automaticamente.`;
      await notifyOwner({
        title: `\ud83c\udfb0 Confer\u00eancia Autom\u00e1tica Valtor`,
        content: summary,
      });
    } catch (err) {
      console.warn("[AutoChecker] Failed to send owner notification:", err);
    }
  }

  // 5. Group results by user for notification
  const userResultsMap: Record<number, CheckResult[]> = {};
  for (const cr of checkResults) {
    if (!userResultsMap[cr.userId]) userResultsMap[cr.userId] = [];
    userResultsMap[cr.userId].push(cr);
  }

  // 6. Get user info for notifications
  const userIds = Object.keys(userResultsMap).map(Number);
  const usersInfo = await getUsersForNotification(userIds);

  // 7. Build notifications
  const notifications: UserNotification[] = [];
  for (const user of usersInfo) {
    if (!user.email || !user.emailOptIn) continue;
    notifications.push({
      userId: user.id,
      userName: user.name ?? "Jogador",
      email: user.email,
      results: userResultsMap[user.id] ?? [],
    });
  }

  // 8. Send emails
  let notified = 0;
  let errors = 0;
  const smtp = createTransporter();

  if (smtp && notifications.length > 0) {
    for (const notif of notifications) {
      try {
        const html = buildAutoCheckerEmailHtml(notif.userName, notif.results);
        const bestResult = notif.results.reduce((best, r) => r.acertos > best.acertos ? r : best, notif.results[0]);
        const meta = LOTERIA_META[bestResult.loteriaSlug] ?? { emoji: "🎲", nome: bestResult.loteriaSlug };
        
        const subject = bestResult.acertos >= 4
          ? `🎉 Parabéns! Você acertou ${bestResult.acertos} números na ${meta.nome}!`
          : `📊 Conferência automática — ${notif.results.length} jogo(s) conferido(s)`;

        await smtp.transporter.sendMail({
          from: `Valtor <${smtp.from}>`,
          to: notif.email,
          subject,
          html,
        });
        notified++;
        console.log(`[AutoChecker] Notification sent to ${notif.email} (${notif.results.length} games)`);
      } catch (err) {
        errors++;
        console.error(`[AutoChecker] Failed to send to ${notif.email}:`, err);
      }
    }
  }

  console.log(`[AutoChecker] Run complete: checked=${checkResults.length}, notified=${notified}, errors=${errors}`);
  return { checked: checkResults.length, notified, errors };
}

// ─── AUTO-CHECKER EMAIL TEMPLATE ─────────────────────────────────────────────
function buildAutoCheckerEmailHtml(userName: string, results: CheckResult[]): string {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

  // Sort results: most matches first
  const sorted = [...results].sort((a, b) => b.acertos - a.acertos);
  const totalAcertos = sorted.reduce((sum, r) => sum + r.acertos, 0);
  const bestResult = sorted[0];
  const hasBigWin = bestResult && bestResult.acertos >= 4;

  const resultsHtml = sorted.map(r => {
    const meta = LOTERIA_META[r.loteriaSlug] ?? { color: "#2563eb", emoji: "🎲", nome: r.loteriaSlug };
    
    // Highlight matching numbers
    const dezenasHtml = r.dezenas.map(d => {
      const matched = r.dezenasResult.includes(d);
      return `<span style="display:inline-block;width:34px;height:34px;border-radius:50%;background:${matched ? meta.color : '#e5e7eb'};color:${matched ? '#fff' : '#6b7280'};font-weight:700;font-size:13px;line-height:34px;text-align:center;margin:2px;${matched ? 'box-shadow:0 2px 8px ' + meta.color + '40;' : ''}">${String(d).padStart(2, '0')}</span>`;
    }).join("");

    // Result numbers (the draw)
    const resultDezenasHtml = r.dezenasResult.slice(0, 20).map(d => {
      const matched = r.dezenas.includes(d);
      return `<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${matched ? meta.color : '#f3f4f6'};color:${matched ? '#fff' : '#9ca3af'};font-weight:600;font-size:11px;line-height:28px;text-align:center;margin:1px;">${String(d).padStart(2, '0')}</span>`;
    }).join("");

    // Acertos badge
    const acertosColor = r.acertos >= 4 ? "#16a34a" : r.acertos >= 2 ? "#f59e0b" : "#6b7280";
    const acertosLabel = r.acertos >= 4 ? "PREMIADO!" : `${r.acertos} acerto${r.acertos !== 1 ? 's' : ''}`;

    return `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:16px;overflow:hidden;">
        <div style="background:${meta.color};padding:12px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">${meta.emoji}</span>
            <div style="flex:1;">
              <div style="color:#fff;font-weight:800;font-size:15px;">${meta.nome} — Concurso #${r.concursoNumero}</div>
              ${r.gameName ? `<div style="color:rgba(255,255,255,0.7);font-size:12px;">Jogo: ${r.gameName}</div>` : ''}
            </div>
            <span style="background:${acertosColor};color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;">${acertosLabel}</span>
          </div>
        </div>
        <div style="padding:16px;">
          <p style="color:#6b7280;font-size:12px;font-weight:600;margin:0 0 6px;text-transform:uppercase;">Seus números:</p>
          <div style="margin-bottom:12px;">${dezenasHtml}</div>
          <p style="color:#6b7280;font-size:12px;font-weight:600;margin:0 0 6px;text-transform:uppercase;">Resultado do sorteio:</p>
          <div>${resultDezenasHtml}</div>
        </div>
      </div>`;
  }).join("");

  // Hero section based on results
  const heroMessage = hasBigWin
    ? `<div style="background:linear-gradient(135deg,#16a34a 0%,#059669 100%);border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
        <div style="font-size:48px;margin-bottom:8px;">🎉</div>
        <h2 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 4px;">Parabéns!</h2>
        <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;">Você acertou <strong>${bestResult.acertos} números</strong> na ${LOTERIA_META[bestResult.loteriaSlug]?.nome ?? bestResult.loteriaSlug}!</p>
       </div>`
    : `<div style="background:#f0f4f8;border-radius:12px;padding:20px;text-align:center;margin-bottom:16px;">
        <div style="font-size:36px;margin-bottom:8px;">📊</div>
        <h2 style="color:#0d1b3e;font-size:18px;font-weight:700;margin:0 0 4px;">Conferência Automática</h2>
        <p style="color:#6b7280;font-size:14px;margin:0;">${results.length} jogo(s) conferido(s) · ${totalAcertos} acerto(s) no total</p>
       </div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Conferência Automática — Valtor</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0d1b3e 0%,#1a3a8f 100%);border-radius:16px 16px 0 0;padding:28px 32px;">
          <div style="margin-bottom:16px;">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/valtor_logo_email_acfa3afb.jpeg" alt="Valtor" style="height:60px;width:auto;border-radius:8px;" />
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Conferência Automática</h1>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">${today}</p>
        </td></tr>

        <!-- Greeting + Hero -->
        <tr><td style="background:#fff;padding:20px 32px 8px;">
          <p style="color:#374151;font-size:15px;margin:0 0 16px;">Olá, <strong>${userName}</strong>! Seus jogos foram conferidos automaticamente:</p>
          ${heroMessage}
        </td></tr>

        <!-- Results -->
        <tr><td style="background:#fff;padding:8px 32px 24px;">
          ${resultsHtml}
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#fff;padding:0 32px 28px;text-align:center;">
          <a href="https://valtor.com.br/clube/carteira" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;margin-right:8px;">
            Ver minha carteira →
          </a>
          <a href="https://valtor.com.br/gerador" style="display:inline-block;background:#0d1b3e;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Gerar novo jogo
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">Conferência automática ativada para seus jogos marcados como apostados.</p>
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
