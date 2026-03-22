import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAllLoterias,
  getLoteriaBySlug,
  getUltimoConcurso,
  getConcursoByNumero,
  getConcursosRecentes,
  getConcursosPaginados,
  getFrequenciaNumeros,
  getAtrasoNumeros,
  getSavedGamesByUser,
  saveGame,
  deleteSavedGame,
  updateGameBet,
  updateGameResult,
  getROIByLoteria,
  getActiveBets,
  getActiveBetsForExtension,
  checkDuplicateGame,
  getActiveSubscription,
  createSubscription,
  getUserById,
  updateUserProfile,
  normalizeSlug,
  getAdminOverview,
  getAdminUsersList,
  getAdminSignupsByDay,
  getAdminRecentActivity,
  getAdminRevenue,
  getFoldersByUser,
  createFolder,
  updateFolder,
  deleteFolder,
  countGamesInFolder,
  moveGameToFolder,
  backtestGame,
  reuseGame,
  getNotificationsByUser,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  generateApiToken,
  getUserByApiToken,
} from "./db";
import { syncUltimoConcurso, fetchConcursoByNumero, fetchUltimoConcurso, getFullFrequencia } from "./caixaApi";
import { sendDailyResultsEmails, sendTestEmail } from "./emailService";
import { runAutoChecker } from "./autoChecker";
import { TRPCError } from "@trpc/server";
import { getBetPrice, LOTTERY_PRICING } from "../shared/lotteryPricing";
import { MercadoPagoConfig, Preference } from "mercadopago";
import {
  US_LOTTERY_CONFIG,
  type UsLotterySlug,
  getUsLatestDraw,
  getUsRecentDraws,
  getUsDrawsPaginated,
  getUsStatsMain,
  getUsStatsSpecial,
  getUsMostDrawnMain,
  getUsLeastDrawnMain,
  getUsMostDelayedMain,
  getUsMostDrawnSpecial,
  getUsMostDelayedSpecial,
  generateUsNumbers,
  syncAllUsLotteries,
} from "./usLotteryService";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN ?? "" });

// ─── PLANOS VALTOR ─────────────────────────────────────────────────────────
const PLANOS = {
  parcelado: {
    title: "Clube Valtor — 12x de R$ 47,80",
    description: "Acesso completo por 12 meses. Parcelado em 12x no cartão de crédito.",
    price: 573.60,
    installments: 12,
    months: 12,
  },
  avista: {
    title: "Clube Valtor — Anual à Vista",
    description: "Acesso completo por 12 meses com 25% de desconto! Economia de R$ 144,00. Pague via Pix, cartão ou boleto.",
    price: 429.60,
    installments: 1,
    months: 12,
  },
} as const;

// ─── GAME GENERATOR LOGIC ─────────────────────────────────────────────────────
function gerarJogo(min: number, max: number, qtd: number, frequencias: Record<number, number>): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  // Weight by frequency (hot numbers slightly more likely)
  const weights = pool.map(n => (frequencias[n] || 1) + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const selected: number[] = [];
  const poolCopy = [...pool];
  const weightsCopy = [...weights];

  while (selected.length < qtd) {
    let rand = Math.random() * weightsCopy.reduce((a, b) => a + b, 0);
    for (let i = 0; i < poolCopy.length; i++) {
      rand -= weightsCopy[i];
      if (rand <= 0) {
        selected.push(poolCopy[i]);
        poolCopy.splice(i, 1);
        weightsCopy.splice(i, 1);
        break;
      }
    }
  }
  return selected.sort((a, b) => a - b);
}

function calcGameStats(dezenas: number[]) {
  const soma = dezenas.reduce((a, b) => a + b, 0);
  const pares = dezenas.filter(n => n % 2 === 0).length;
  const impares = dezenas.length - pares;
  const primos = dezenas.filter(n => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }).length;
  // Score 0-100 based on balanced stats
  const somaIdeal = dezenas.length * (dezenas[0] + dezenas[dezenas.length - 1]) / 2;
  const somaScore = Math.max(0, 100 - Math.abs(soma - somaIdeal) / somaIdeal * 100);
  const parScore = Math.abs(pares - dezenas.length / 2) < 2 ? 100 : 60;
  const score = Math.round((somaScore * 0.5 + parScore * 0.5));
  return { soma, pares, impares, primos, score };
}

function conferirJogo(jogo: number[], dezenasSorteadas: number[]): number {
  return jogo.filter(n => dezenasSorteadas.includes(n)).length;
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── LOTERIAS ───────────────────────────────────────────────────────────────
  loterias: router({
    all: publicProcedure.query(() => getAllLoterias()),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) =>
      getLoteriaBySlug(input.slug)
    ),
  }),

  // ─── CONCURSOS ──────────────────────────────────────────────────────────────
  concursos: router({
    ultimo: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .query(async ({ input }) => {
        // Always check API for the latest concurso number to keep DB up-to-date
        try {
          const apiData = await fetchUltimoConcurso(input.loteriaSlug);
          if (apiData) {
            const dbConcurso = await getUltimoConcurso(input.loteriaSlug);
            // If API has a newer concurso, sync it
            if (!dbConcurso || apiData.concurso > dbConcurso.numero) {
              await syncUltimoConcurso(input.loteriaSlug);
            }
          }
        } catch {
          // API unavailable, fall back to DB
        }
        const concurso = await getUltimoConcurso(input.loteriaSlug);
        return concurso ?? null;
      }),

    byNumero: publicProcedure
      .input(z.object({ loteriaSlug: z.string(), numero: z.number() }))
      .query(async ({ input }) => {
        let concurso = await getConcursoByNumero(input.loteriaSlug, input.numero);
        if (!concurso) {
          const data = await fetchConcursoByNumero(input.loteriaSlug, input.numero);
          if (data) {
            await syncUltimoConcurso(input.loteriaSlug);
            concurso = await getConcursoByNumero(input.loteriaSlug, input.numero);
          }
        }
        return concurso ?? null;
      }),

    recentes: publicProcedure
      .input(z.object({ loteriaSlug: z.string(), limit: z.number().default(10) }))
      .query(({ input }) => getConcursosRecentes(input.loteriaSlug, input.limit)),

    paginados: publicProcedure
      .input(z.object({ loteriaSlug: z.string(), page: z.number().default(1), pageSize: z.number().default(20) }))
      .query(({ input }) => getConcursosPaginados(input.loteriaSlug, input.page, input.pageSize)),

    sync: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .mutation(({ input }) => syncUltimoConcurso(input.loteriaSlug)),

    // Returns live data from API: next draw date, estimated prize, accumulated status, and last draw info
    proximoSorteio: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .query(async ({ input }) => {
        try {
          const { fetchUltimoConcurso } = await import('./caixaApi');
          const data = await fetchUltimoConcurso(input.loteriaSlug);
          if (!data) return null;
          return {
            acumulou: data.acumulou,
            valorEstimadoProximo: data.valorEstimadoProximoConcurso ?? 0,
            proximoConcurso: data.proximoConcurso,
            dataProximoConcurso: data.dataProximoConcurso ?? null,
            // Último sorteio
            ultimoConcurso: data.concurso ?? null,
            dataUltimoSorteio: data.data ?? null,
            dezenas: data.dezenas?.map(Number).sort((a, b) => a - b) ?? [],
          };
        } catch {
          return null;
        }
      }),
  }),

   // ─── ESTATÍSTICAS (dados completos da API) ────────────────────────────────────────
  estatisticas: router({
    frequencia: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .query(async ({ input }) => {
        const data = await getFullFrequencia(input.loteriaSlug);
        return { items: data.frequencia, totalConcursos: data.totalConcursos };
      }),

    atraso: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .query(async ({ input }) => {
        const data = await getFullFrequencia(input.loteriaSlug);
        return { items: data.atraso, totalConcursos: data.totalConcursos };
      }),

    primos: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .query(async ({ input }) => {
        const data = await getFullFrequencia(input.loteriaSlug);
        return { primos: data.primos, totalConcursos: data.totalConcursos };
      }),
  }),

  // ─── GERADOR ────────────────────────────────────────────────────────────────
  gerador: router({
    gerar: publicProcedure
      .input(z.object({
        loteriaSlug: z.string(),
        quantidade: z.number().min(1).max(5), // free: up to 5 games
        qtdNumeros: z.number().optional(), // optional: override default number count
      }))
      .query(async ({ input, ctx }) => {
        const loteria = await getLoteriaBySlug(input.loteriaSlug);
        if (!loteria) throw new TRPCError({ code: "NOT_FOUND", message: "Loteria não encontrada" });

        // Determine how many numbers per game
        const qtdNums = input.qtdNumeros ?? loteria.qtdNumeros;
        // Validate range using LOTTERY_PRICING
        const normalizedSlug = input.loteriaSlug.replace(/-/g, "");
        const pricing = LOTTERY_PRICING[normalizedSlug];
        if (pricing && (qtdNums < pricing.minNumbers || qtdNums > pricing.maxNumbers)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Quantidade deve ser entre ${pricing.minNumbers} e ${pricing.maxNumbers}` });
        }

        const fullFreq = await getFullFrequencia(input.loteriaSlug);
        const freqMap: Record<number, number> = {};
        for (const f of fullFreq.frequencia) freqMap[f.numero] = f.frequencia;

        // Generate unique games (no duplicates within the batch)
        const jogos: Array<{ dezenas: number[]; soma: number; pares: number; impares: number; primos: number; score: number }> = [];
        const seen = new Set<string>();
        let attempts = 0;
        const maxAttempts = input.quantidade * 50;
        while (jogos.length < input.quantidade && attempts < maxAttempts) {
          attempts++;
          const dezenas = gerarJogo(loteria.minNumero, loteria.maxNumero, qtdNums, freqMap);
          const key = dezenas.join(',');
          if (seen.has(key)) continue;
          seen.add(key);
          const stats = calcGameStats(dezenas);
          jogos.push({ dezenas, ...stats });
        }

        return jogos;
      }),
    gerarPremium: protectedProcedure
      .input(z.object({
        loteriaSlug: z.string(),
        quantidade: z.number().min(1).max(100),
        qtdNumeros: z.number().optional(), // optional: override default number count
        filtros: z.object({
          somaMin: z.number().optional(),
          somaMax: z.number().optional(),
          paresMin: z.number().optional(),
          paresMax: z.number().optional(),
          imparesMin: z.number().optional(),
          imparesMax: z.number().optional(),
          primosMin: z.number().optional(),
          primosMax: z.number().optional(),
          primosExato: z.number().optional(),
          excluir: z.array(z.number()).optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user has premium
        const sub = await getActiveSubscription(ctx.user.id);
        if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Assinatura premium necess\u00e1ria" });
        const loteria = await getLoteriaBySlug(input.loteriaSlug);
        if (!loteria) throw new TRPCError({ code: "NOT_FOUND" });

        // Determine how many numbers per game
        const qtdNums = input.qtdNumeros ?? loteria.qtdNumeros;
        const normalizedSlug = input.loteriaSlug.replace(/-/g, "");
        const pricing = LOTTERY_PRICING[normalizedSlug];
        if (pricing && (qtdNums < pricing.minNumbers || qtdNums > pricing.maxNumbers)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Quantidade deve ser entre ${pricing.minNumbers} e ${pricing.maxNumbers}` });
        }

        const fullFreq = await getFullFrequencia(input.loteriaSlug);
        const freqMap: Record<number, number> = {};
        for (const f of fullFreq.frequencia) freqMap[f.numero] = f.frequencia;
        const excludeSet = new Set(input.filtros?.excluir ?? []);
        const jogos: Array<{ dezenas: number[]; soma: number; pares: number; impares: number; primos: number; score: number }> = [];
        let tentativas = 0;
        const maxTentativas = Math.max(input.quantidade * 100, 2000);
        while (jogos.length < input.quantidade && tentativas < maxTentativas) {
          tentativas++;
          const dezenas = gerarJogo(loteria.minNumero, loteria.maxNumero, qtdNums, freqMap);
          // Check excluded numbers first (cheap check)
          if (excludeSet.size > 0 && dezenas.some(d => excludeSet.has(d))) continue;
          const stats = calcGameStats(dezenas);
          const { filtros } = input;
          if (filtros) {
            if (filtros.somaMin !== undefined && stats.soma < filtros.somaMin) continue;
            if (filtros.somaMax !== undefined && stats.soma > filtros.somaMax) continue;
            if (filtros.paresMin !== undefined && stats.pares < filtros.paresMin) continue;
            if (filtros.paresMax !== undefined && stats.pares > filtros.paresMax) continue;
            if (filtros.imparesMin !== undefined && stats.impares < filtros.imparesMin) continue;
            if (filtros.imparesMax !== undefined && stats.impares > filtros.imparesMax) continue;
            if (filtros.primosExato !== undefined && stats.primos !== filtros.primosExato) continue;
            if (filtros.primosMin !== undefined && stats.primos < filtros.primosMin) continue;
            if (filtros.primosMax !== undefined && stats.primos > filtros.primosMax) continue;
          }
          // Check for duplicates within the batch
          const key = dezenas.join(',');
          if (jogos.some(j => j.dezenas.join(',') === key)) continue;
          jogos.push({ dezenas, ...stats });
        }
        return jogos;
      }),
  }),

  // ─── CONFERIDOR ─────────────────────────────────────────────────────────────
  conferidor: router({
    conferir: publicProcedure
      .input(z.object({
        loteriaSlug: z.string(),
        dezenas: z.array(z.number()),
        concursoNumero: z.number().optional(),
      }))
      .query(async ({ input }) => {
        // Try to sync latest result from Caixa API first
        try {
          await syncUltimoConcurso(input.loteriaSlug);
        } catch { /* ignore sync errors */ }

        const concurso = input.concursoNumero
          ? await getConcursoByNumero(input.loteriaSlug, input.concursoNumero)
          : await getUltimoConcurso(input.loteriaSlug);

        if (!concurso) {
          // Return a "pending" result instead of throwing an error
          return {
            pendente: true as const,
            mensagem: "Resultado ainda não disponível. O sorteio pode não ter ocorrido ou o resultado ainda não foi publicado pela Caixa.",
            concurso: null,
            acertos: 0,
            numerosAcertados: [] as number[],
            ganhadores: null,
          };
        }

        const dezenasSorteadas = concurso.dezenas as number[];
        const acertos = conferirJogo(input.dezenas, dezenasSorteadas);
        const numerosAcertados = input.dezenas.filter(n => dezenasSorteadas.includes(n));
        const ganhadores = concurso.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null;

        return {
          pendente: false as const,
          mensagem: null,
          concurso: { numero: concurso.numero, dataSorteio: concurso.dataSorteio, dezenas: dezenasSorteadas },
          acertos,
          numerosAcertados,
          ganhadores,
        };
      }),
  }),

  // ─── SIMULADOR ──────────────────────────────────────────────────────────────
  simulador: router({
    simular: publicProcedure
      .input(z.object({
        loteriaSlug: z.string(),
        dezenas: z.array(z.number()),
        ultimosConcursos: z.number().min(10).max(50).default(20),
      }))
      .query(async ({ input }) => {
        const { data: concursosData } = await getConcursosPaginados(input.loteriaSlug, 1, input.ultimosConcursos);
        const resultado: Record<number, number> = {};
        let melhorAcertos = 0;
        let melhorConcurso = 0;

        for (const c of concursosData) {
          const dezenasSorteadas = c.dezenas as number[];
          const acertos = conferirJogo(input.dezenas, dezenasSorteadas);
          resultado[acertos] = (resultado[acertos] || 0) + 1;
          if (acertos > melhorAcertos) { melhorAcertos = acertos; melhorConcurso = c.numero; }
        }

        const totalAcertos = Object.entries(resultado).reduce((sum, [acertos, qtd]) => sum + Number(acertos) * qtd, 0);
        const mediaAcertos = concursosData.length > 0 ? totalAcertos / concursosData.length : 0;

        return {
          resultado: Object.entries(resultado).map(([acertos, qtd]) => ({ acertos: Number(acertos), quantidade: qtd })),
          melhorResultado: { acertos: melhorAcertos, concurso: melhorConcurso },
          mediaAcertos,
          concursosAnalisados: concursosData.length,
        };
      }),
  }),

  // ─── BACKTEST VALTOR ──────────────────────────────────────────────────────
  backtest: router({
    analisar: publicProcedure
      .input(z.object({
        loteriaSlug: z.string(),
        dezenas: z.array(z.number()).min(1),
        minAcertos: z.number().min(1).max(20).default(3),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return backtestGame(
          input.loteriaSlug,
          input.dezenas,
          input.minAcertos,
          input.limit,
          input.offset,
        );
      }),
  }),

  // ─── CARTEIRA ───────────────────────────────────────────────────────────────
  carteira: router({
    listar: protectedProcedure
      .input(z.object({ loteriaSlug: z.string().optional() }))
      .query(({ input, ctx }) => getSavedGamesByUser(ctx.user.id, input.loteriaSlug)),

    salvar: protectedProcedure
      .input(z.object({
        loteriaSlug: z.string(),
        dezenas: z.array(z.number()),
        nome: z.string().optional(),
        score: z.number().optional(),
        somaDezenas: z.number().optional(),
        qtdPares: z.number().optional(),
        qtdImpares: z.number().optional(),
        qtdPrimos: z.number().optional(),
        folderId: z.number().optional(),
        apostar: z.boolean().optional(), // se true, insere custo automático e próximo sorteio
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getActiveSubscription(ctx.user.id);
        if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Carteira de jogos é exclusiva para assinantes do Clube Valtor. Assine em /planos" });

        const slug = normalizeSlug(input.loteriaSlug);

        // Check for duplicate game
        const isDuplicate = await checkDuplicateGame(ctx.user.id, slug, input.dezenas);
        if (isDuplicate) {
          throw new TRPCError({ code: "CONFLICT", message: "Você já tem um jogo com esses mesmos números nessa loteria." });
        }

        let apostado = false;
        let concursoApostado: number | null = null;
        let valorAposta: string | null = null;

        if (input.apostar) {
          apostado = true;
          // Calcular custo automático baseado na quantidade de números
          const preco = getBetPrice(slug, input.dezenas.length);
          if (preco) {
            valorAposta = preco.toFixed(2);
          }
          // Identificar próximo sorteio automaticamente
          try {
            const ultimoResult = await fetchUltimoConcurso(slug);
            if (ultimoResult?.proximoConcurso) {
              concursoApostado = ultimoResult.proximoConcurso;
            }
          } catch (err) {
            console.warn("[Carteira] Não foi possível obter próximo concurso:", err);
          }
        }

        return saveGame({
          loteriaSlug: slug,
          userId: ctx.user.id,
          dezenas: input.dezenas,
          nome: input.nome,
          score: input.score?.toString(),
          somaDezenas: input.somaDezenas,
          qtdPares: input.qtdPares,
          qtdImpares: input.qtdImpares,
          qtdPrimos: input.qtdPrimos,
          folderId: input.folderId ?? null,
          apostado,
          concursoApostado,
          valorAposta,
        });
      }),

    excluir: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input, ctx }) => deleteSavedGame(input.id, ctx.user.id)),

    // Mark game as bet on a specific draw
    marcarAposta: protectedProcedure
      .input(z.object({
        id: z.number(),
        apostado: z.boolean(),
        concursoApostado: z.number().optional(),
        valorAposta: z.number().min(0).optional(),
      }))
      .mutation(({ input, ctx }) => updateGameBet(input.id, ctx.user.id, {
        apostado: input.apostado,
        concursoApostado: input.concursoApostado ?? null,
        valorAposta: input.valorAposta?.toFixed(2) ?? null,
      })),

    // Register result (prize won, acertos)
    registrarResultado: protectedProcedure
      .input(z.object({
        id: z.number(),
        valorGanho: z.number().min(0).optional(),
        acertos: z.number().min(0).optional(),
        conferido: z.boolean().optional(),
      }))
      .mutation(({ input, ctx }) => updateGameResult(input.id, ctx.user.id, {
        valorGanho: input.valorGanho?.toFixed(2) ?? null,
        acertos: input.acertos ?? null,
        conferido: input.conferido ?? true,
      })),

    // Get ROI summary by loteria
    roi: protectedProcedure
      .query(({ ctx }) => getROIByLoteria(ctx.user.id)),

    // Get active bets (not yet checked)
    apostasAtivas: protectedProcedure
      .query(({ ctx }) => getActiveBets(ctx.user.id)),

    // Get bet price for a lottery and number count
    preco: publicProcedure
      .input(z.object({ loteriaSlug: z.string(), qtdNumeros: z.number() }))
      .query(({ input }) => {
        const preco = getBetPrice(input.loteriaSlug, input.qtdNumeros);
        return { preco };
      }),

    // Get next draw info for a lottery
    proximoConcurso: publicProcedure
      .input(z.object({ loteriaSlug: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await fetchUltimoConcurso(normalizeSlug(input.loteriaSlug));
          if (!result) return null;
          return {
            proximoConcurso: result.proximoConcurso,
            dataProximoConcurso: result.dataProximoConcurso,
            ultimoConcurso: result.concurso,
          };
        } catch {
          return null;
        }
      }),
    // Reutilizar jogo (jogar novamente com mesmos números)
    reutilizar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getActiveSubscription(ctx.user.id);
        if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Carteira de jogos é exclusiva para assinantes do Clube Valtor." });

        // Get original game to know the lottery
        const games = await getSavedGamesByUser(ctx.user.id);
        const original = games.find((g: { id: number }) => g.id === input.id);
        if (!original) throw new TRPCError({ code: "NOT_FOUND", message: "Jogo não encontrado" });

        const slug = normalizeSlug(original.loteriaSlug);
        let concursoApostado: number | null = null;
        let valorAposta: string | null = null;

        // Get next draw info
        try {
          const ultimoResult = await fetchUltimoConcurso(slug);
          if (ultimoResult?.proximoConcurso) {
            concursoApostado = ultimoResult.proximoConcurso;
          }
        } catch (err) {
          console.warn("[Carteira] Não foi possível obter próximo concurso:", err);
        }

        // Calculate bet price
        const dezenas = original.dezenas as number[];
        const preco = getBetPrice(slug, dezenas.length);
        if (preco) valorAposta = preco.toFixed(2);

        return reuseGame(input.id, ctx.user.id, concursoApostado, valorAposta);
      }),
  }),

  // ─── PASTAS DE JOGOS ─────────────────────────────────────────────────────────
  pastas: router({
    listar: protectedProcedure
      .query(({ ctx }) => getFoldersByUser(ctx.user.id)),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string().min(1).max(100),
        descricao: z.string().max(255).optional(),
        cor: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createFolder(ctx.user.id, input.nome, input.descricao, input.cor);
        if (result && (result as any).duplicate) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Já existe uma pasta com esse nome' });
        }
        return result;
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).max(100).optional(),
        descricao: z.string().max(255).optional(),
        cor: z.string().optional(),
      }))
      .mutation(({ input, ctx }) => updateFolder(input.id, ctx.user.id, {
        nome: input.nome,
        descricao: input.descricao,
        cor: input.cor,
      })),

    contarJogos: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input, ctx }) => countGamesInFolder(input.id, ctx.user.id)),

    excluir: protectedProcedure
      .input(z.object({ id: z.number(), excluirJogos: z.boolean().optional() }))
      .mutation(({ input, ctx }) => deleteFolder(input.id, ctx.user.id, input.excluirJogos ?? false)),

    moverJogo: protectedProcedure
      .input(z.object({ gameId: z.number(), folderId: z.number().nullable() }))
      .mutation(({ input, ctx }) => moveGameToFolder(input.gameId, ctx.user.id, input.folderId)),
  }),

  // ─── ASSINATURA ─────────────────────────────────────────────────────────────────
  assinatura: router({
    status: protectedProcedure.query(({ ctx }) => getActiveSubscription(ctx.user.id)),
    ativar: protectedProcedure.mutation(({ ctx }) => createSubscription(ctx.user.id)),

    // Cria preferência de checkout Mercado Pago para assinar o Clube Valtor
    criarCheckout: protectedProcedure
      .input(z.object({
        origin: z.string().url(),
        planType: z.enum(["parcelado", "avista"]).default("avista"),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        const plano = PLANOS[input.planType];

        const preferenceApi = new Preference(mpClient);
        const preference = await preferenceApi.create({
          body: {
            items: [{
              id: `valtor-${input.planType}`,
              title: plano.title,
              description: plano.description,
              quantity: 1,
              unit_price: plano.price,
              currency_id: "BRL",
            }],
            payment_methods: input.planType === "parcelado" ? {
              installments: 12,
              default_installments: 12,
            } : undefined,
            payer: {
              email: user.email ?? undefined,
              name: user.name ?? undefined,
            },
            metadata: {
              user_id: user.id.toString(),
              plan_type: input.planType,
              customer_email: user.email ?? "",
              customer_name: user.name ?? "",
            },
            back_urls: {
              success: `${input.origin}/planos?sucesso=1`,
              failure: `${input.origin}/planos?cancelado=1`,
              pending: `${input.origin}/planos?pendente=1`,
            },
            auto_return: "approved",
            notification_url: `${input.origin}/api/mercadopago/webhook`,
            external_reference: `user_${user.id}_${input.planType}_${Date.now()}`,
          },
        });

        return { url: preference.init_point };
      }),
  }),

  // ─── PERFIL DO USUMÁRIO ────────────────────────────────────────────────────────────────
  perfil: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        emailOptIn: user.emailOptIn,
        emailLoterias: (user.emailLoterias as string[] | null) ?? [],
        emailHorario: user.emailHorario ?? "08:00",
        layer: user.layer,
        role: user.role,
        createdAt: user.createdAt,
      };
    }),

    update: protectedProcedure
      .input(z.object({
        name: z.string().min(2).max(128).optional(),
        phone: z.string().max(20).nullable().optional(),
        bio: z.string().max(500).nullable().optional(),
        emailOptIn: z.boolean().optional(),
        emailLoterias: z.array(z.string()).nullable().optional(),
        emailHorario: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    sendTestEmail: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "E-mail n\u00e3o encontrado no perfil" });
      const ok = await sendTestEmail(user.email, user.name ?? "Jogador");
      return { success: ok };
    }),
  }),

  // IMPORTAÇÃO EM LOTE DE JOGOS
  importar: router({
    // Recebe array de jogos (loteriaSlug + dezenas) e salva na carteira do usuário
    // Usado pela extensão Chrome e pela página /importar
    salvarLote: protectedProcedure
      .input(z.object({
        jogos: z.array(z.object({
          loteriaSlug: z.string(),
          dezenas: z.array(z.number().int().positive()),
          nome: z.string().optional(),
        })).min(1).max(100),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getActiveSubscription(ctx.user.id);
        if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Importação de jogos é exclusiva para assinantes do Clube Valtor. Assine em /planos" });
        const resultados: { ok: boolean; id?: number; erro?: string }[] = [];
        for (const jogo of input.jogos) {
          try {
            const soma = jogo.dezenas.reduce((a, b) => a + b, 0);
            const pares = jogo.dezenas.filter(n => n % 2 === 0).length;
            const impares = jogo.dezenas.length - pares;
            const primos = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
            const qtdPrimos = jogo.dezenas.filter(n => primos.includes(n)).length;
            await saveGame({
              userId: ctx.user.id,
              loteriaSlug: normalizeSlug(jogo.loteriaSlug),
              dezenas: jogo.dezenas,
              nome: jogo.nome ?? `Jogo importado`,
              somaDezenas: soma,
              qtdPares: pares,
              qtdImpares: impares,
              qtdPrimos: qtdPrimos,
            });
            resultados.push({ ok: true });
          } catch (e) {
            resultados.push({ ok: false, erro: String(e) });
          }
        }
        const salvos = resultados.filter(r => r.ok).length;
        return { salvos, total: input.jogos.length, resultados };
      }),

    // Endpoint público para a extensão verificar se o usuário está logado
    // e obter o token de sessão para importação autenticada
    status: protectedProcedure.query(async ({ ctx }) => {
      return {
        logado: true,
        nome: ctx.user.name,
        email: ctx.user.email,
        userId: ctx.user.id,
      };
    }),
  }),

  // CONFERIDOR AUTOMÁTICO
  autoChecker: router({
    // Admin-only: trigger auto-checker manually
    executar: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const result = await runAutoChecker();
      return result;
    }),
  }),

  // ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
  admin: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAdminOverview();
    }),

    users: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        search: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return getAdminUsersList(input.page, input.pageSize, input.search);
      }),

    signupsByDay: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return getAdminSignupsByDay(input.days);
      }),

    recentActivity: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAdminRecentActivity();
    }),

    revenue: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAdminRevenue();
    }),
  }),

  // ─── US LOTTERIES (Mega Millions + Powerball) ───────────────────────────────
  usLottery: router({
    config: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]) }))
      .query(({ input }) => {
        return US_LOTTERY_CONFIG[input.lottery];
      }),

    latestDraw: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]) }))
      .query(async ({ input }) => {
        return getUsLatestDraw(input.lottery);
      }),

    recentDraws: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), limit: z.number().min(1).max(50).default(10) }))
      .query(async ({ input }) => {
        return getUsRecentDraws(input.lottery, input.limit);
      }),

    drawsPaginated: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), page: z.number().min(1).default(1), perPage: z.number().min(1).max(100).default(20) }))
      .query(async ({ input }) => {
        return getUsDrawsPaginated(input.lottery, input.page, input.perPage);
      }),

    statsMain: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]) }))
      .query(async ({ input }) => {
        return getUsStatsMain(input.lottery);
      }),

    statsSpecial: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]) }))
      .query(async ({ input }) => {
        return getUsStatsSpecial(input.lottery);
      }),

    mostDrawnMain: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), limit: z.number().min(1).max(30).default(10) }))
      .query(async ({ input }) => {
        return getUsMostDrawnMain(input.lottery, input.limit);
      }),

    leastDrawnMain: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), limit: z.number().min(1).max(30).default(10) }))
      .query(async ({ input }) => {
        return getUsLeastDrawnMain(input.lottery, input.limit);
      }),

    mostDelayedMain: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), limit: z.number().min(1).max(30).default(10) }))
      .query(async ({ input }) => {
        return getUsMostDelayedMain(input.lottery, input.limit);
      }),

    mostDrawnSpecial: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), limit: z.number().min(1).max(30).default(10) }))
      .query(async ({ input }) => {
        return getUsMostDrawnSpecial(input.lottery, input.limit);
      }),

    mostDelayedSpecial: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), limit: z.number().min(1).max(30).default(10) }))
      .query(async ({ input }) => {
        return getUsMostDelayedSpecial(input.lottery, input.limit);
      }),

    generate: publicProcedure
      .input(z.object({ lottery: z.enum(["mega-millions", "powerball"]), count: z.number().min(1).max(20).default(1) }))
      .query(({ input }) => {
        const games = Array.from({ length: input.count }, () => generateUsNumbers(input.lottery));
        return games;
      }),

    // Admin: sync data from API
    sync: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return syncAllUsLotteries();
    }),
  }),

  // ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
  notificacoes: router({
    listar: protectedProcedure
      .input(z.object({ limit: z.number().default(30) }).optional())
      .query(async ({ ctx, input }) => {
        return getNotificationsByUser(ctx.user.id, input?.limit ?? 30);
      }),

    contarNaoLidas: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadNotificationCount(ctx.user.id);
    }),

    marcarLida: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { ok: true };
      }),

    marcarTodasLidas: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { ok: true };
    }),
  }),

  // ─── APOSTA RÁPIDA (Extensão Chrome) ─────────────────────────────────────
  apostaRapida: router({
    // Lista jogos apostados pendentes (não conferidos) para preencher no site da Caixa
    listar: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Aposta Rápida é exclusiva para assinantes do Clube Valtor." });
      const games = await getActiveBets(ctx.user.id);
      // Group by lottery for the extension
      const grouped: Record<string, { id: number; dezenas: number[]; nome: string | null; concursoApostado: number | null }[]> = {};
      for (const g of games) {
        const slug = g.loteriaSlug;
        if (!grouped[slug]) grouped[slug] = [];
        grouped[slug].push({
          id: g.id,
          dezenas: g.dezenas as number[],
          nome: g.nome,
          concursoApostado: g.concursoApostado,
        });
      }
      return { jogos: grouped, total: games.length };
    }),

    // Lista TODOS os jogos salvos (apostados ou não) para o carrinho da extensão
    todos: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Aposta Rápida é exclusiva para assinantes do Clube Valtor." });
      const games = await getSavedGamesByUser(ctx.user.id);
      const grouped: Record<string, { id: number; dezenas: number[]; nome: string | null; apostado: boolean; concursoApostado: number | null }[]> = {};
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
      return { jogos: grouped, total: games.length };
    }),

    // Gerar/regenerar token de API para a extensão
    gerarToken: protectedProcedure.mutation(async ({ ctx }) => {
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Aposta Rápida é exclusiva para assinantes do Clube Valtor." });
      const token = await generateApiToken(ctx.user.id);
      return { token };
    }),

    // Obter token atual
    meuToken: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Aposta Rápida é exclusiva para assinantes do Clube Valtor." });
      return { token: ctx.user.apiToken || null };
    }),
  }),

  // EMAIL CRON
  email: router({
    // Admin-only: trigger daily email dispatch manually
    dispararDiario: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const result = await sendDailyResultsEmails();
      return result;
    }),
    // Admin-only: send test email to specific address
    sendTest: protectedProcedure
      .input(z.object({ to: z.string().email(), userName: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const ok = await sendTestEmail(input.to, input.userName ?? "Jogador");
        return { success: ok };
      }),
  }),
});

export type AppRouter = typeof appRouter;
