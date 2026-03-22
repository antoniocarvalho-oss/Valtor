import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Subscription layer: 1=visitor(no account), 2=free, 3=premium
  layer: mysqlEnum("layer", ["2", "3"]).default("2").notNull(),
  // Profile fields
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  // Email notification preferences
  emailOptIn: boolean("emailOptIn").default(true).notNull(),
  emailLoterias: json("emailLoterias"), // string[] - slugs das loterias que quer receber
  emailHorario: varchar("emailHorario", { length: 8 }).default("08:00"), // horário de envio
  // Aposta Rápida API token
  apiToken: varchar("apiToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  plan: varchar("plan", { length: 32 }).default("premium").notNull(),
  planType: varchar("planType", { length: 32 }).default("mensal").notNull(), // mensal | anual
  priceMonthly: decimal("priceMonthly", { precision: 10, scale: 2 }).default("47.80").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  cancelledAt: timestamp("cancelledAt"),
  // Stripe identifiers (legacy)
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  // Mercado Pago identifiers
  mpPaymentId: varchar("mpPaymentId", { length: 128 }),
  mpPreferenceId: varchar("mpPreferenceId", { length: 128 }),
  mpPaymentMethod: varchar("mpPaymentMethod", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;

// ─── LOTERIAS ─────────────────────────────────────────────────────────────────
export const loterias = mysqlTable("loterias", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(), // mega-sena, lotofacil, quina
  nome: varchar("nome", { length: 64 }).notNull(),
  cor: varchar("cor", { length: 16 }).notNull(), // hex color
  minNumero: int("minNumero").notNull(),
  maxNumero: int("maxNumero").notNull(),
  qtdNumeros: int("qtdNumeros").notNull(), // numbers per game
  diasSorteio: varchar("diasSorteio", { length: 128 }).notNull(), // "Quarta,Sábado"
  horarioSorteio: varchar("horarioSorteio", { length: 8 }).notNull(), // "20:00"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Loteria = typeof loterias.$inferSelect;

// ─── CONCURSOS ────────────────────────────────────────────────────────────────
export const concursos = mysqlTable("concursos", {
  id: int("id").autoincrement().primaryKey(),
  loteriaSlug: varchar("loteriaSlug", { length: 32 }).notNull(),
  numero: int("numero").notNull(),
  dataSorteio: timestamp("dataSorteio").notNull(),
  dezenas: json("dezenas").notNull(), // number[]
  premioEstimado: decimal("premioEstimado", { precision: 15, scale: 2 }),
  premioAcumulado: boolean("premioAcumulado").default(false).notNull(),
  ganhadores: json("ganhadores"), // { faixa: string, quantidade: number, premio: number }[]
  somaDezenas: int("somaDezenas"),
  qtdPares: int("qtdPares"),
  qtdImpares: int("qtdImpares"),
  qtdPrimos: int("qtdPrimos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Concurso = typeof concursos.$inferSelect;

// // ─── SAVED GAMES (CARTEIRA) ─────────────────────────────────────────────
// ─── GAME FOLDERS ──────────────────────────────────────────────────────────────
export const gameFolders = mysqlTable("game_folders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: varchar("descricao", { length: 255 }),
  cor: varchar("cor", { length: 7 }).default("#16a34a"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameFolder = typeof gameFolders.$inferSelect;

export const savedGames = mysqlTable("saved_games", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loteriaSlug: varchar("loteriaSlug", { length: 32 }).notNull(),
  dezenas: json("dezenas").notNull(), // number[]
  nome: varchar("nome", { length: 64 }),
  score: decimal("score", { precision: 5, scale: 2 }),
  somaDezenas: int("somaDezenas"),
  qtdPares: int("qtdPares"),
  qtdImpares: int("qtdImpares"),
  qtdPrimos: int("qtdPrimos"),
  // Betting tracking fields
  apostado: boolean("apostado").default(false).notNull(), // marked as bet on next draw
  concursoApostado: int("concursoApostado"), // which draw number this was bet on
  valorAposta: decimal("valorAposta", { precision: 10, scale: 2 }), // bet cost in R$
  valorGanho: decimal("valorGanho", { precision: 15, scale: 2 }), // prize won in R$
  acertos: int("acertos"), // how many numbers matched
  conferido: boolean("conferido").default(false).notNull(), // whether result was checked
  folderId: int("folderId"), // optional folder for organizing games
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedGame = typeof savedGames.$inferSelect;

// ─── SIMULATION RESULTS ───────────────────────────────────────────────────────
export const simulations = mysqlTable("simulations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loteriaSlug: varchar("loteriaSlug", { length: 32 }).notNull(),
  dezenas: json("dezenas").notNull(), // number[]
  concursosAnalisados: int("concursosAnalisados").notNull(),
  resultado: json("resultado").notNull(), // { acertos: number, quantidade: number }[]
  melhorResultado: json("melhorResultado"), // { acertos: number, concurso: number }
  mediaAcertos: decimal("mediaAcertos", { precision: 5, scale: 3 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Simulation = typeof simulations.$inferSelect;

// ─── US LOTTERIES (Mega Millions + Powerball) ────────────────────────────────
export const usDraws = mysqlTable("us_draws", {
  id: int("id").autoincrement().primaryKey(),
  lottery: varchar("lottery", { length: 32 }).notNull(), // mega-millions | powerball
  drawNumber: int("drawNumber"), // draw number if available
  drawDate: timestamp("drawDate").notNull(),
  numbersMain: json("numbersMain").notNull(), // number[] (5 main numbers)
  numberSpecial: int("numberSpecial").notNull(), // Mega Ball or Powerball
  jackpot: varchar("jackpot", { length: 64 }), // e.g. "$500 Million"
  jackpotValue: decimal("jackpotValue", { precision: 15, scale: 2 }), // numeric value in USD
  multiplier: int("multiplier"), // Megaplier or Power Play value
  nextDrawDate: timestamp("nextDrawDate"),
  nextJackpot: varchar("nextJackpot", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsDraw = typeof usDraws.$inferSelect;
export type InsertUsDraw = typeof usDraws.$inferInsert;

export const usStatsNumberMain = mysqlTable("us_stats_number_main", {
  id: int("id").autoincrement().primaryKey(),
  lottery: varchar("lottery", { length: 32 }).notNull(), // mega-millions | powerball
  number: int("number").notNull(),
  frequency: int("frequency").default(0).notNull(),
  lastDrawn: timestamp("lastDrawn"),
  delay: int("delay").default(0).notNull(), // draws since last appearance
  totalDraws: int("totalDraws").default(0).notNull(), // total draws analyzed
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsStatsNumberMain = typeof usStatsNumberMain.$inferSelect;

export const usStatsNumberSpecial = mysqlTable("us_stats_number_special", {
  id: int("id").autoincrement().primaryKey(),
  lottery: varchar("lottery", { length: 32 }).notNull(), // mega-millions | powerball
  number: int("number").notNull(),
  frequency: int("frequency").default(0).notNull(),
  lastDrawn: timestamp("lastDrawn"),
  delay: int("delay").default(0).notNull(),
  totalDraws: int("totalDraws").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsStatsNumberSpecial = typeof usStatsNumberSpecial.$inferSelect;

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tipo: varchar("tipo", { length: 32 }).notNull(), // resultado, premiado, sistema
  titulo: varchar("titulo", { length: 256 }).notNull(),
  mensagem: text("mensagem").notNull(),
  loteriaSlug: varchar("loteriaSlug", { length: 32 }),
  concursoNumero: int("concursoNumero"),
  acertos: int("acertos"),
  valorGanho: decimal("valorGanho", { precision: 15, scale: 2 }),
  lida: boolean("lida").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
