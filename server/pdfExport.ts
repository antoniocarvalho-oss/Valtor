import PDFDocument from "pdfkit";

// ─── LOTTERY COLORS ─────────────────────────────────────────────────────────
const LOTTERY_COLORS: Record<string, string> = {
  megasena: "#16a34a",
  "mega-sena": "#16a34a",
  lotofacil: "#7c3aed",
  quina: "#ea580c",
  lotomania: "#0891b2",
  timemania: "#059669",
  duplasena: "#dc2626",
  "dupla-sena": "#dc2626",
  diadesorte: "#ca8a04",
  "dia-de-sorte": "#ca8a04",
  supersete: "#65a30d",
  "super-sete": "#65a30d",
  maismilionaria: "#1d4ed8",
  "mais-milionaria": "#1d4ed8",
};

const LOTTERY_NAMES: Record<string, string> = {
  megasena: "MEGA-SENA",
  "mega-sena": "MEGA-SENA",
  lotofacil: "LOTOFÁCIL",
  quina: "QUINA",
  lotomania: "LOTOMANIA",
  timemania: "TIMEMANIA",
  duplasena: "DUPLA SENA",
  "dupla-sena": "DUPLA SENA",
  diadesorte: "DIA DE SORTE",
  "dia-de-sorte": "DIA DE SORTE",
  supersete: "SUPER SETE",
  "super-sete": "SUPER SETE",
  maismilionaria: "+MILIONÁRIA",
  "mais-milionaria": "+MILIONÁRIA",
};

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

interface GameForPDF {
  loteria: string;
  numeros: number[];
  concurso?: number | null;
  dataConcurso?: string | null;
  custo?: number | null;
}

export function generateGamesPDF(
  games: GameForPDF[],
  options?: { title?: string; userName?: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: "Jogos Valtor - Cola para Lotérica",
        Author: "Valtor",
        Subject: "Jogos de Loteria",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 80; // margins
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    // ─── HEADER ─────────────────────────────────────────────────────────
    // Navy background header
    doc.rect(0, 0, doc.page.width, 80).fill("#0d1b3e");

    // Valtor logo text
    doc.font("Helvetica-Bold").fontSize(28).fillColor("#f5a623");
    doc.text("V", 40, 20, { continued: true });
    doc.fillColor("#ffffff").text(" Valtor", { continued: false });

    // Subtitle
    doc.font("Helvetica").fontSize(10).fillColor("#94a3b8");
    doc.text("Onde a matemática encontra a sorte", 40, 52);

    // Date on the right
    doc.font("Helvetica").fontSize(9).fillColor("#94a3b8");
    doc.text(dateStr, doc.page.width - 200, 30, { width: 160, align: "right" });

    if (options?.userName) {
      doc.font("Helvetica").fontSize(9).fillColor("#cbd5e1");
      doc.text(`Jogador: ${options.userName}`, doc.page.width - 200, 45, { width: 160, align: "right" });
    }

    doc.moveDown(1);
    let y = 100;

    // ─── TITLE ──────────────────────────────────────────────────────────
    const title = options?.title || "Meus Jogos";
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#0d1b3e");
    doc.text(title, 40, y);
    y += 30;

    doc.font("Helvetica").fontSize(10).fillColor("#64748b");
    doc.text(`${games.length} jogo${games.length !== 1 ? "s" : ""} para apostar`, 40, y);
    y += 25;

    // ─── SEPARATOR ──────────────────────────────────────────────────────
    doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor("#e2e8f0").lineWidth(1).stroke();
    y += 15;

    // ─── GROUP GAMES BY LOTTERY ─────────────────────────────────────────
    const grouped: Record<string, GameForPDF[]> = {};
    for (const game of games) {
      const key = game.loteria.toLowerCase().replace(/\s+/g, "");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(game);
    }

    let totalCusto = 0;

    for (const [loteriaKey, loteriaGames] of Object.entries(grouped)) {
      // Check if we need a new page
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 40;
      }

      const color = LOTTERY_COLORS[loteriaKey] || "#333333";
      const name = LOTTERY_NAMES[loteriaKey] || loteriaKey.toUpperCase();
      const [r, g, b] = hexToRGB(color);

      // Lottery header bar
      doc.roundedRect(40, y, pageWidth, 32, 6).fill(color);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#ffffff");
      doc.text(name, 52, y + 8);

      // Game count on the right
      doc.font("Helvetica").fontSize(10).fillColor("#ffffff");
      doc.text(`${loteriaGames.length} jogo${loteriaGames.length !== 1 ? "s" : ""}`, 40, y + 10, {
        width: pageWidth - 12,
        align: "right",
      });
      y += 42;

      // Concurso info if available
      const firstWithConcurso = loteriaGames.find((g) => g.concurso);
      if (firstWithConcurso?.concurso) {
        doc.font("Helvetica").fontSize(9).fillColor("#64748b");
        let concursoText = `Concurso #${firstWithConcurso.concurso}`;
        if (firstWithConcurso.dataConcurso) {
          concursoText += ` — ${firstWithConcurso.dataConcurso}`;
        }
        doc.text(concursoText, 52, y);
        y += 16;
      }

      // Each game
      for (let i = 0; i < loteriaGames.length; i++) {
        const game = loteriaGames[i];

        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 40;
        }

        // Game row background
        const rowBg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.roundedRect(40, y, pageWidth, 44, 4).fill(rowBg);

        // Game number label
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#94a3b8");
        doc.text(`JOGO ${i + 1}`, 52, y + 4);

        // Numbers as circles
        const numeros = game.numeros.sort((a, b) => a - b);
        const circleRadius = 14;
        const circleSpacing = 32;
        const startX = 52;
        const circleY = y + 28;

        // Calculate how many numbers fit per row
        const maxPerRow = Math.floor((pageWidth - 24) / circleSpacing);

        for (let j = 0; j < numeros.length; j++) {
          const row = Math.floor(j / maxPerRow);
          const col = j % maxPerRow;
          const cx = startX + col * circleSpacing + circleRadius;
          const cy = circleY + row * 30;

          // Circle
          doc.circle(cx, cy, circleRadius).fill(color);

          // Number text
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff");
          const numStr = numeros[j].toString().padStart(2, "0");
          const textWidth = doc.widthOfString(numStr);
          doc.text(numStr, cx - textWidth / 2, cy - 5);
        }

        // Cost on the right side
        if (game.custo && game.custo > 0) {
          totalCusto += game.custo;
          doc.font("Helvetica").fontSize(9).fillColor("#64748b");
          doc.text(
            `R$ ${game.custo.toFixed(2).replace(".", ",")}`,
            40,
            y + 4,
            { width: pageWidth - 12, align: "right" }
          );
        }

        // Calculate row height based on number of rows needed
        const numRows = Math.ceil(numeros.length / maxPerRow);
        const rowHeight = 20 + numRows * 30;
        y += Math.max(48, rowHeight);
      }

      y += 10;
    }

    // ─── FOOTER SUMMARY ─────────────────────────────────────────────────
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 40;
    }

    // Separator
    doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor("#e2e8f0").lineWidth(1).stroke();
    y += 15;

    // Total
    if (totalCusto > 0) {
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#0d1b3e");
      doc.text("Custo Total:", 40, y);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#16a34a");
      doc.text(
        `R$ ${totalCusto.toFixed(2).replace(".", ",")}`,
        40,
        y,
        { width: pageWidth, align: "right" }
      );
      y += 30;
    }

    // Tip
    doc.font("Helvetica").fontSize(8).fillColor("#94a3b8");
    doc.text(
      "Dica: Apresente este documento ao atendente da lotérica para facilitar o registro dos seus jogos.",
      40,
      y,
      { width: pageWidth, align: "center" }
    );
    y += 15;

    // Footer branding
    doc.font("Helvetica").fontSize(7).fillColor("#cbd5e1");
    doc.text("Gerado por Valtor — valtor.com.br", 40, y, { width: pageWidth, align: "center" });

    doc.end();
  });
}
