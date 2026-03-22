import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, loterias, concursos, savedGames, simulations, subscriptions, gameFolders, notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserProfile(id: number, data: {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  emailOptIn?: boolean;
  emailLoterias?: string[] | null;
  emailHorario?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function getUsersWithEmailOptIn() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.emailOptIn, true));
}

// ─── API TOKEN (Aposta Rápida) ──────────────────────────────────────────────
export async function generateApiToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const crypto = await import("crypto");
  const token = `vt_${crypto.randomBytes(24).toString("hex")}`;
  await db.update(users).set({ apiToken: token }).where(eq(users.id, userId));
  return token;
}

export async function getUserByApiToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.apiToken, token)).limit(1);
  return result[0];
}

// ─── SLUG NORMALIZATION ───────────────────────────────────────────────────────
// Canonical slugs in DB have no hyphens: megasena, lotofacil, duplasena, etc.
// But some parts of the system may send slugs with hyphens: mega-sena, dupla-sena, etc.
// This function normalizes to the canonical form.
export function normalizeSlug(slug: string): string {
  return slug.replace(/-/g, "");
}

// ─── LOTERIAS ─────────────────────────────────────────────────────────────────
export async function getAllLoterias() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loterias);
}

export async function getLoteriaBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalized = normalizeSlug(slug);
  const result = await db.select().from(loterias).where(eq(loterias.slug, normalized)).limit(1);
  return result[0];
}

// ─── CONCURSOS ────────────────────────────────────────────────────────────────
export async function getUltimoConcurso(loteriaSlug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const slug = normalizeSlug(loteriaSlug);
  const result = await db.select().from(concursos)
    .where(eq(concursos.loteriaSlug, slug))
    .orderBy(desc(concursos.numero))
    .limit(1);
  return result[0];
}

export async function getConcursoByNumero(loteriaSlug: string, numero: number) {
  const db = await getDb();
  if (!db) return undefined;
  const slug = normalizeSlug(loteriaSlug);
  const result = await db.select().from(concursos)
    .where(and(eq(concursos.loteriaSlug, slug), eq(concursos.numero, numero)))
    .limit(1);
  return result[0];
}

export async function getConcursosRecentes(loteriaSlug: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const slug = normalizeSlug(loteriaSlug);
  return db.select().from(concursos)
    .where(eq(concursos.loteriaSlug, slug))
    .orderBy(desc(concursos.numero))
    .limit(limit);
}

export async function getConcursosPaginados(loteriaSlug: string, page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const slug = normalizeSlug(loteriaSlug);
  const offset = (page - 1) * pageSize;
  const data = await db.select().from(concursos)
    .where(eq(concursos.loteriaSlug, slug))
    .orderBy(desc(concursos.numero))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(concursos)
    .where(eq(concursos.loteriaSlug, slug));
  return { data, total: Number(countResult[0]?.count ?? 0) };
}

export async function upsertConcurso(data: typeof concursos.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(concursos).values(data).onDuplicateKeyUpdate({ set: { dezenas: data.dezenas, updatedAt: new Date() } });
}

// ─── ESTATÍSTICAS ─────────────────────────────────────────────────────────────
export async function getFrequenciaNumeros(loteriaSlug: string) {
  const db = await getDb();
  if (!db) return [];
  const slug = normalizeSlug(loteriaSlug);
  // Get all concursos and compute frequency in JS
  const all = await db.select({ dezenas: concursos.dezenas }).from(concursos)
    .where(eq(concursos.loteriaSlug, slug));
  const freq: Record<number, number> = {};
  for (const c of all) {
    const dezenas = c.dezenas as number[];
    for (const d of dezenas) {
      freq[d] = (freq[d] || 0) + 1;
    }
  }
  return Object.entries(freq).map(([num, count]) => ({ numero: Number(num), frequencia: count }))
    .sort((a, b) => b.frequencia - a.frequencia);
}

export async function getAtrasoNumeros(loteriaSlug: string) {
  const db = await getDb();
  if (!db) return [];
  const slug = normalizeSlug(loteriaSlug);
  const all = await db.select({ dezenas: concursos.dezenas, numero: concursos.numero })
    .from(concursos).where(eq(concursos.loteriaSlug, slug))
    .orderBy(desc(concursos.numero));
  // Collect all numbers that ever appeared
  const allNumbers = new Set<number>();
  for (const c of all) {
    const dezenas = c.dezenas as number[];
    for (const d of dezenas) allNumbers.add(d);
  }
  // For each number, count consecutive concursos without appearing from most recent
  const result: Array<{ numero: number; atraso: number; ultimoConcurso: number }> = [];
  for (const num of Array.from(allNumbers)) {
    let consecutiveAbsent = 0;
    let ultimoAppareceu = all[0]?.numero ?? 0;
    for (const c of all) {
      const dezenas = c.dezenas as number[];
      if (dezenas.includes(num)) {
        ultimoAppareceu = c.numero;
        break;
      }
      consecutiveAbsent++;
    }
    result.push({ numero: num, atraso: consecutiveAbsent, ultimoConcurso: ultimoAppareceu });
  }
  return result.sort((a, b) => b.atraso - a.atraso);
}

// ─── GAME FOLDERS ───────────────────────────────────────────────────────────────────
export async function getFoldersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gameFolders).where(eq(gameFolders.userId, userId)).orderBy(desc(gameFolders.createdAt));
}

export async function createFolder(userId: number, nome: string, descricao?: string, cor?: string) {
  const db = await getDb();
  if (!db) return null;
  // Check for duplicate folder name for this user
  const existing = await db.select({ id: gameFolders.id })
    .from(gameFolders)
    .where(and(eq(gameFolders.userId, userId), eq(gameFolders.nome, nome)))
    .limit(1);
  if (existing.length > 0) {
    return { id: existing[0].id, duplicate: true };
  }
  const result = await db.insert(gameFolders).values({ userId, nome, descricao: descricao ?? null, cor: cor ?? '#16a34a' });
  return { id: (result as any)[0].insertId };
}

export async function updateFolder(id: number, userId: number, data: { nome?: string; descricao?: string; cor?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(gameFolders).set(data).where(and(eq(gameFolders.id, id), eq(gameFolders.userId, userId)));
}

export async function deleteFolder(id: number, userId: number, excluirJogos = false) {
  const db = await getDb();
  if (!db) return;
  if (excluirJogos) {
    // Delete all games inside the folder
    await db.delete(savedGames).where(and(eq(savedGames.folderId, id), eq(savedGames.userId, userId)));
  } else {
    // Remove folder reference from games (games become "sem pasta")
    await db.update(savedGames).set({ folderId: null }).where(and(eq(savedGames.folderId, id), eq(savedGames.userId, userId)));
  }
  await db.delete(gameFolders).where(and(eq(gameFolders.id, id), eq(gameFolders.userId, userId)));
}

export async function countGamesInFolder(folderId: number, userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(savedGames).where(and(eq(savedGames.folderId, folderId), eq(savedGames.userId, userId)));
  return Number(result[0]?.count ?? 0);
}

export async function moveGameToFolder(gameId: number, userId: number, folderId: number | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(savedGames).set({ folderId }).where(and(eq(savedGames.id, gameId), eq(savedGames.userId, userId)));
}

// ─── SAVED GAMES ───────────────────────────────────────────────────────────────────
export async function getSavedGamesByUser(userId: number, loteriaSlug?: string) {
  const db = await getDb();
  if (!db) return [];
  const slug = loteriaSlug ? normalizeSlug(loteriaSlug) : undefined;
  const conditions = slug
    ? and(eq(savedGames.userId, userId), eq(savedGames.loteriaSlug, slug))
    : eq(savedGames.userId, userId);
  return db.select().from(savedGames).where(conditions).orderBy(desc(savedGames.createdAt));
}

// Check if user already has a game with the same numbers for the same lottery
export async function checkDuplicateGame(userId: number, loteriaSlug: string, dezenas: number[]): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select({ id: savedGames.id, dezenas: savedGames.dezenas })
    .from(savedGames)
    .where(and(
      eq(savedGames.userId, userId),
      eq(savedGames.loteriaSlug, loteriaSlug),
    ));
  const sortedNew = [...dezenas].sort((a, b) => a - b).join(',');
  return existing.some(g => {
    const sortedExisting = [...(g.dezenas as number[])].sort((a, b) => a - b).join(',');
    return sortedExisting === sortedNew;
  });
}

export async function saveGame(data: typeof savedGames.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(savedGames).values(data);
}

export async function deleteSavedGame(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(savedGames).where(and(eq(savedGames.id, id), eq(savedGames.userId, userId)));
}

export async function updateGameBet(id: number, userId: number, data: {
  apostado: boolean;
  concursoApostado?: number | null;
  valorAposta?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(savedGames)
    .set({
      apostado: data.apostado,
      concursoApostado: data.concursoApostado ?? null,
      valorAposta: data.valorAposta ?? null,
    })
    .where(and(eq(savedGames.id, id), eq(savedGames.userId, userId)));
}

export async function updateGameResult(id: number, userId: number, data: {
  valorGanho?: string | null;
  acertos?: number | null;
  conferido?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = {};
  if (data.valorGanho !== undefined) updateData.valorGanho = data.valorGanho;
  if (data.acertos !== undefined) updateData.acertos = data.acertos;
  if (data.conferido !== undefined) updateData.conferido = data.conferido;
  await db.update(savedGames)
    .set(updateData)
    .where(and(eq(savedGames.id, id), eq(savedGames.userId, userId)));
}

export async function getROIByLoteria(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get all games that have been bet on
  const games = await db.select().from(savedGames)
    .where(and(eq(savedGames.userId, userId), eq(savedGames.apostado, true)));
  
  // Group by loteria and compute totals
  const roiMap: Record<string, { slug: string; totalApostado: number; totalGanho: number; qtdApostas: number; qtdAcertos: number }> = {};
  for (const g of games) {
    if (!roiMap[g.loteriaSlug]) {
      roiMap[g.loteriaSlug] = { slug: g.loteriaSlug, totalApostado: 0, totalGanho: 0, qtdApostas: 0, qtdAcertos: 0 };
    }
    const entry = roiMap[g.loteriaSlug];
    entry.qtdApostas++;
    entry.totalApostado += Number(g.valorAposta ?? 0);
    entry.totalGanho += Number(g.valorGanho ?? 0);
    if ((g.acertos ?? 0) > 0) entry.qtdAcertos++;
  }
  return Object.values(roiMap);
}

export async function getActiveBets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedGames)
    .where(and(
      eq(savedGames.userId, userId),
      eq(savedGames.apostado, true),
      eq(savedGames.conferido, false),
    ))
    .orderBy(desc(savedGames.createdAt));
}

// Get active bets filtered to only include games whose concurso hasn't been drawn yet
export async function getActiveBetsForExtension(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const bets = await db.select().from(savedGames)
    .where(and(
      eq(savedGames.userId, userId),
      eq(savedGames.apostado, true),
      eq(savedGames.conferido, false),
    ))
    .orderBy(desc(savedGames.createdAt));
  
  // Filter out bets whose concurso has already been drawn
  const filtered = [];
  const concursoCache: Record<string, number | null> = {};
  for (const bet of bets) {
    if (!bet.concursoApostado) {
      filtered.push(bet); // No concurso specified, include it
      continue;
    }
    const slug = bet.loteriaSlug;
    if (!(slug in concursoCache)) {
      // Get the latest concurso number from DB for this lottery
      const latest = await db.select({ numero: concursos.numero })
        .from(concursos)
        .where(eq(concursos.loteriaSlug, slug))
        .orderBy(desc(concursos.numero))
        .limit(1);
      concursoCache[slug] = latest.length > 0 ? latest[0].numero : null;
    }
    const latestNum = concursoCache[slug];
    // Only include if the concurso hasn't been drawn yet (concursoApostado > latest drawn)
    if (!latestNum || bet.concursoApostado > latestNum) {
      filtered.push(bet);
    }
  }
  return filtered;
}

// Get ALL pending bets across all users (for auto-checker cron)
export async function getAllPendingBets() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: savedGames.id,
    userId: savedGames.userId,
    loteriaSlug: savedGames.loteriaSlug,
    dezenas: savedGames.dezenas,
    concursoApostado: savedGames.concursoApostado,
    nome: savedGames.nome,
  }).from(savedGames)
    .where(and(
      eq(savedGames.apostado, true),
      eq(savedGames.conferido, false),
    ));
}

// Batch update game results after auto-check
export async function batchUpdateGameResults(updates: Array<{
  id: number;
  userId: number;
  acertos: number;
  conferido: boolean;
  valorGanho?: string;
}>) {
  const db = await getDb();
  if (!db) return;
  for (const u of updates) {
    await db.update(savedGames)
      .set({
        acertos: u.acertos,
        conferido: u.conferido,
        valorGanho: u.valorGanho ?? null,
      })
      .where(and(eq(savedGames.id, u.id), eq(savedGames.userId, u.userId)));
  }
}

// Get user by ID with email info for notifications
export async function getUsersForNotification(userIds: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (userIds.length === 0) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    emailOptIn: users.emailOptIn,
  }).from(users)
    .where(sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`);
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
    .limit(1);
  return result[0];
}

export async function createSubscription(userId: number) {
  const db = await getDb();
  if (!db) return;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  await db.insert(subscriptions).values({ userId, status: 'active', expiresAt });
  // Update user layer to 3
  await db.update(users).set({ layer: '3' }).where(eq(users.id, userId));
}

export async function createStripeSubscription(data: {
  userId: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSessionId: string;
}) {
  const db = await getDb();
  if (!db) return;
  // Cancel any existing active subscription first
  await db.update(subscriptions)
    .set({ status: 'cancelled', cancelledAt: new Date() })
    .where(and(eq(subscriptions.userId, data.userId), eq(subscriptions.status, 'active')));
  // Create new subscription
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  await db.insert(subscriptions).values({
    userId: data.userId,
    status: 'active',
    expiresAt,
    stripeCustomerId: data.stripeCustomerId,
    stripeSubscriptionId: data.stripeSubscriptionId,
    stripeSessionId: data.stripeSessionId,
  });
  // Upgrade user to layer 3 (premium)
  await db.update(users).set({ layer: '3' }).where(eq(users.id, data.userId));
}

export async function createMPSubscription(data: {
  userId: number;
  planType: string;
  priceMonthly: string;
  mpPaymentId: string;
  mpPreferenceId: string;
  mpPaymentMethod: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) return;
  // Cancel any existing active subscription first
  await db.update(subscriptions)
    .set({ status: 'cancelled', cancelledAt: new Date() })
    .where(and(eq(subscriptions.userId, data.userId), eq(subscriptions.status, 'active')));
  // Create new subscription
  await db.insert(subscriptions).values({
    userId: data.userId,
    status: 'active',
    planType: data.planType,
    priceMonthly: data.priceMonthly,
    expiresAt: data.expiresAt,
    mpPaymentId: data.mpPaymentId,
    mpPreferenceId: data.mpPreferenceId,
    mpPaymentMethod: data.mpPaymentMethod,
  });
  // Upgrade user to layer 3 (premium)
  await db.update(users).set({ layer: '3' }).where(eq(users.id, data.userId));
}

export async function cancelStripeSubscription(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  if (!result[0]) return;
  const sub = result[0];
  await db.update(subscriptions)
    .set({ status: 'cancelled', cancelledAt: new Date() })
    .where(eq(subscriptions.id, sub.id));
  // Downgrade user to layer 2 (free)
  await db.update(users).set({ layer: '2' }).where(eq(users.id, sub.userId));
}

// ─── ADMIN METRICS ───────────────────────────────────────────────────────────
export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, premiumUsers: 0, freeUsers: 0, totalBets: 0, checkedBets: 0, totalSubscriptions: 0, activeSubscriptions: 0, totalConcursos: 0, totalSimulations: 0 };

  const [userCounts] = await db.select({
    total: sql<number>`count(*)`,
    premium: sql<number>`sum(case when layer = '3' then 1 else 0 end)`,
    free: sql<number>`sum(case when layer = '2' then 1 else 0 end)`,
  }).from(users);

  const [betCounts] = await db.select({
    total: sql<number>`count(*)`,
    checked: sql<number>`sum(case when conferido = true then 1 else 0 end)`,
    pending: sql<number>`sum(case when apostado = true and conferido = false then 1 else 0 end)`,
  }).from(savedGames).where(eq(savedGames.apostado, true));

  const [subCounts] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`sum(case when status = 'active' then 1 else 0 end)`,
  }).from(subscriptions);

  const [concursoCount] = await db.select({ total: sql<number>`count(*)` }).from(concursos);
  const [simCount] = await db.select({ total: sql<number>`count(*)` }).from(simulations);

  return {
    totalUsers: Number(userCounts?.total ?? 0),
    premiumUsers: Number(userCounts?.premium ?? 0),
    freeUsers: Number(userCounts?.free ?? 0),
    totalBets: Number(betCounts?.total ?? 0),
    checkedBets: Number(betCounts?.checked ?? 0),
    pendingBets: Number(betCounts?.pending ?? 0),
    totalSubscriptions: Number(subCounts?.total ?? 0),
    activeSubscriptions: Number(subCounts?.active ?? 0),
    totalConcursos: Number(concursoCount?.total ?? 0),
    totalSimulations: Number(simCount?.total ?? 0),
  };
}

export async function getAdminUsersList(page = 1, pageSize = 20, search?: string) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;

  const baseWhere = search
    ? sql`(${users.name} LIKE ${`%${search}%`} OR ${users.email} LIKE ${`%${search}%`})`
    : undefined;

  const data = baseWhere
    ? await db.select().from(users).where(baseWhere).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset)
    : await db.select().from(users).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset);

  const [countResult] = baseWhere
    ? await db.select({ count: sql<number>`count(*)` }).from(users).where(baseWhere)
    : await db.select({ count: sql<number>`count(*)` }).from(users);

  return { data, total: Number(countResult?.count ?? 0) };
}

export async function getAdminSignupsByDay(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await db.execute(
    sql`SELECT DATE(createdAt) as signup_date, count(*) as signup_count FROM users WHERE createdAt >= ${since} GROUP BY signup_date ORDER BY signup_date`
  );

  const rows = (result as any)[0] as Array<{ signup_date: string; signup_count: number }>;
  return (rows || []).map(r => ({ date: String(r.signup_date), count: Number(r.signup_count) }));
}

export async function getAdminRecentActivity(limit = 20) {
  const db = await getDb();
  if (!db) return { recentUsers: [], recentBets: [], recentSubscriptions: [] };

  const recentUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    layer: users.layer,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt)).limit(limit);

  const recentBets = await db.select({
    id: savedGames.id,
    userId: savedGames.userId,
    loteriaSlug: savedGames.loteriaSlug,
    dezenas: savedGames.dezenas,
    acertos: savedGames.acertos,
    conferido: savedGames.conferido,
    createdAt: savedGames.createdAt,
  }).from(savedGames)
    .where(eq(savedGames.apostado, true))
    .orderBy(desc(savedGames.createdAt))
    .limit(limit);

  const recentSubscriptions = await db.select({
    id: subscriptions.id,
    userId: subscriptions.userId,
    status: subscriptions.status,
    planType: subscriptions.planType,
    priceMonthly: subscriptions.priceMonthly,
    startedAt: subscriptions.startedAt,
    expiresAt: subscriptions.expiresAt,
  }).from(subscriptions).orderBy(desc(subscriptions.createdAt)).limit(limit);

  return { recentUsers, recentBets, recentSubscriptions };
}

export async function getAdminRevenue() {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, monthlyRevenue: 0, activeCount: 0 };

  const [active] = await db.select({
    count: sql<number>`count(*)`,
    totalMonthly: sql<number>`COALESCE(sum(CAST(priceMonthly AS DECIMAL(10,2))), 0)`,
  }).from(subscriptions).where(eq(subscriptions.status, 'active'));

  // Total revenue from all subscriptions ever
  const [allTime] = await db.select({
    total: sql<number>`COALESCE(sum(CAST(priceMonthly AS DECIMAL(10,2))), 0)`,
  }).from(subscriptions);

  return {
    totalRevenue: Number(allTime?.total ?? 0),
    monthlyRevenue: Number(active?.totalMonthly ?? 0),
    activeCount: Number(active?.count ?? 0),
  };
}


// ─── BACKTEST ──────────────────────────────────────────────────────────────────
// Prize tier labels per lottery
const PRIZE_TIERS: Record<string, Record<number, string>> = {
  megasena: { 4: "Quadra", 5: "Quina", 6: "Sena" },
  lotofacil: { 11: "11 acertos", 12: "12 acertos", 13: "13 acertos", 14: "14 acertos", 15: "15 acertos" },
  quina: { 2: "Duque", 3: "Terno", 4: "Quadra", 5: "Quina" },
  lotomania: { 0: "0 acertos", 15: "15 acertos", 16: "16 acertos", 17: "17 acertos", 18: "18 acertos", 19: "19 acertos", 20: "20 acertos" },
  timemania: { 3: "Terno", 4: "Quadra", 5: "Quina", 6: "Sena", 7: "7 acertos" },
  duplasena: { 3: "Terno", 4: "Quadra", 5: "Quina", 6: "Sena" },
  diadesorte: { 4: "Quadra", 5: "Quina", 6: "Sena", 7: "7 acertos" },
  supersete: { 3: "3 acertos", 4: "4 acertos", 5: "5 acertos", 6: "6 acertos", 7: "7 acertos" },
  maismilionaria: { 2: "2 acertos", 3: "3 acertos", 4: "4 acertos", 5: "5 acertos", 6: "6 acertos" },
};

// In-memory cache for API concursos data (avoids re-fetching on every backtest)
const backtestCache: Record<string, { data: Array<{ concurso: number; dezenas: number[] }>; timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function getPrizeTierLabel(slug: string, acertos: number): string | null {
  const tiers = PRIZE_TIERS[slug];
  return tiers?.[acertos] ?? null;
}

export function getPrizeTiers(slug: string): Record<number, string> {
  return PRIZE_TIERS[slug] ?? {};
}

export async function backtestGame(
  loteriaSlug: string,
  dezenas: number[],
  minAcertos: number,
  limit: number = 50,
  offset: number = 0,
) {
  const slug = normalizeSlug(loteriaSlug);

  // Try to get data from cache first
  let allConcursos: Array<{ concurso: number; dezenas: number[] }>;
  const cached = backtestCache[slug];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    allConcursos = cached.data;
  } else {
    // Fetch from Caixa API for full historical data
    const { fetchAllConcursos } = await import("./caixaApi");
    allConcursos = await fetchAllConcursos(slug);
    if (allConcursos.length > 0) {
      backtestCache[slug] = { data: allConcursos, timestamp: Date.now() };
    }
  }

  if (allConcursos.length === 0) {
    return { total: 0, maxAcertos: 0, totalConcursos: 0, distribuicao: [], prizeTiers: PRIZE_TIERS[slug] ?? {}, results: [] };
  }

  // Sort descending by concurso number
  allConcursos.sort((a, b) => b.concurso - a.concurso);

  // Check each concurso for matches
  type MatchResult = {
    numero: number;
    dezenasSorteadas: number[];
    acertos: number;
    numerosAcertados: number[];
    faixa: string | null;
  };

  const matches: MatchResult[] = [];
  for (const c of allConcursos) {
    const numerosAcertados = dezenas.filter((d) => c.dezenas.includes(d));
    if (numerosAcertados.length >= minAcertos) {
      matches.push({
        numero: c.concurso,
        dezenasSorteadas: c.dezenas,
        acertos: numerosAcertados.length,
        numerosAcertados,
        faixa: getPrizeTierLabel(slug, numerosAcertados.length),
      });
    }
  }

  // Build distribution of acertos
  const distribuicao: Record<number, number> = {};
  let maxAcertos = 0;
  for (const m of matches) {
    distribuicao[m.acertos] = (distribuicao[m.acertos] || 0) + 1;
    if (m.acertos > maxAcertos) maxAcertos = m.acertos;
  }

  return {
    total: matches.length,
    maxAcertos,
    totalConcursos: allConcursos.length,
    prizeTiers: PRIZE_TIERS[slug] ?? {},
    distribuicao: Object.entries(distribuicao)
      .map(([acertos, qtd]) => ({
        acertos: Number(acertos),
        quantidade: qtd,
        faixa: getPrizeTierLabel(slug, Number(acertos)),
      }))
      .sort((a, b) => b.acertos - a.acertos),
    results: matches.slice(offset, offset + limit),
  };
}

// ─── REUSE GAME (Jogar novamente) ──────────────────────────────────────────────
export async function reuseGame(
  gameId: number,
  userId: number,
  concursoApostado: number | null,
  valorAposta: string | null,
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Get the original game
  const [original] = await db
    .select()
    .from(savedGames)
    .where(and(eq(savedGames.id, gameId), eq(savedGames.userId, userId)));

  if (!original) throw new Error("Jogo não encontrado");

  // Create a new game with same numbers but fresh bet info
  const [result] = await db.insert(savedGames).values({
    userId,
    loteriaSlug: original.loteriaSlug,
    dezenas: original.dezenas,
    nome: original.nome ? `${original.nome} (cópia)` : null,
    score: original.score,
    somaDezenas: original.somaDezenas,
    qtdPares: original.qtdPares,
    qtdImpares: original.qtdImpares,
    qtdPrimos: original.qtdPrimos,
    folderId: original.folderId,
    apostado: true,
    concursoApostado,
    valorAposta,
    valorGanho: null,
    acertos: null,
    conferido: false,
  });

  return { id: result.insertId };
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
export async function createNotification(data: {
  userId: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  loteriaSlug?: string;
  concursoNumero?: number;
  acertos?: number;
  valorGanho?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    userId: data.userId,
    tipo: data.tipo,
    titulo: data.titulo,
    mensagem: data.mensagem,
    loteriaSlug: data.loteriaSlug ?? null,
    concursoNumero: data.concursoNumero ?? null,
    acertos: data.acertos ?? null,
    valorGanho: data.valorGanho ?? null,
    lida: false,
  });
}

export async function createBatchNotifications(items: Array<{
  userId: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  loteriaSlug?: string;
  concursoNumero?: number;
  acertos?: number;
  valorGanho?: string;
}>) {
  const db = await getDb();
  if (!db) return;
  if (items.length === 0) return;
  await db.insert(notifications).values(
    items.map(item => ({
      userId: item.userId,
      tipo: item.tipo,
      titulo: item.titulo,
      mensagem: item.mensagem,
      loteriaSlug: item.loteriaSlug ?? null,
      concursoNumero: item.concursoNumero ?? null,
      acertos: item.acertos ?? null,
      valorGanho: item.valorGanho ?? null,
      lida: false,
    }))
  );
}

export async function getNotificationsByUser(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.lida, false)));
  return Number(result?.count ?? 0);
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ lida: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ lida: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.lida, false)));
}
