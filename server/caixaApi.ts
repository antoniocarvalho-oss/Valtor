import axios from "axios";
import { upsertConcurso } from "./db";

// Primary API: loteriascaixa-api (works from server environments)
const BASE_URL = "https://loteriascaixa-api.herokuapp.com/api";

// Fallback: official Caixa API (may be blocked from cloud servers)
const FALLBACK_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

// Mapping: internal slug → API slug
// Internal slugs use the same value as API slugs for simplicity
const LOTERIAS_MAP: Record<string, string> = {
  "megasena": "megasena",
  "lotofacil": "lotofacil",
  "quina": "quina",
  "lotomania": "lotomania",
  "timemania": "timemania",
  "duplasena": "duplasena",
  "diadesorte": "diadesorte",
  "supersete": "supersete",
  "maismilionaria": "maismilionaria",
  // Legacy slugs for backward compatibility
  "mega-sena": "megasena",
  "dupla-sena": "duplasena",
  "dia-de-sorte": "diadesorte",
  "super-sete": "supersete",
  "mais-milionaria": "maismilionaria",
};

export interface CaixaResult {
  loteria: string;
  concurso: number;
  data: string;
  dezenas: string[];
  dezenasOrdemSorteio: string[];
  valorEstimadoProximoConcurso: number;
  acumulou: boolean;
  proximoConcurso: number;
  dataProximoConcurso: string;
  premiacoes: Array<{
    descricao: string;
    faixa: number;
    ganhadores: number;
    valorPremio: number;
  }>;
}

const HEADERS_PRIMARY = {
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (compatible; Valtor/1.0)",
};

const HEADERS_FALLBACK = {
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Origin": "https://loterias.caixa.gov.br",
  "Referer": "https://loterias.caixa.gov.br/",
};

function normalizeFallback(d: any, loteriaSlug: string): CaixaResult {
  return {
    loteria: loteriaSlug,
    concurso: d.numero,
    data: d.dataApuracao,
    dezenas: d.listaDezenas,
    dezenasOrdemSorteio: d.listaDezenas,
    valorEstimadoProximoConcurso: d.valorEstimadoProximoConcurso,
    acumulou: d.acumulado,
    proximoConcurso: d.numeroConcursoProximo,
    dataProximoConcurso: d.dataProximoConcurso,
    premiacoes: (d.listaRateioPremio || []).map((r: any) => ({
      descricao: r.descricaoFaixa,
      faixa: r.faixa,
      ganhadores: r.numeroDeGanhadores,
      valorPremio: r.valorPremio,
    })),
  };
}

export async function fetchUltimoConcurso(loteriaSlug: string): Promise<CaixaResult | null> {
  const apiSlug = LOTERIAS_MAP[loteriaSlug];
  if (!apiSlug) {
    console.warn(`[CaixaAPI] Unknown loteria slug: ${loteriaSlug}`);
    return null;
  }

  try {
    const res = await axios.get(`${BASE_URL}/${apiSlug}/latest`, {
      timeout: 15000,
      headers: HEADERS_PRIMARY,
    });
    return res.data;
  } catch (err) {
    console.warn(`[CaixaAPI] Primary API failed for ${loteriaSlug}, trying fallback...`);
    try {
      const res = await axios.get(`${FALLBACK_URL}/${apiSlug}`, {
        timeout: 10000,
        headers: HEADERS_FALLBACK,
      });
      return normalizeFallback(res.data, loteriaSlug);
    } catch (err2) {
      console.error(`[CaixaAPI] Both APIs failed for ${loteriaSlug}:`, err2);
      return null;
    }
  }
}

export async function fetchConcursoByNumero(loteriaSlug: string, numero: number): Promise<CaixaResult | null> {
  const apiSlug = LOTERIAS_MAP[loteriaSlug];
  if (!apiSlug) return null;

  try {
    const res = await axios.get(`${BASE_URL}/${apiSlug}/${numero}`, {
      timeout: 15000,
      headers: HEADERS_PRIMARY,
    });
    return res.data;
  } catch (err) {
    console.warn(`[CaixaAPI] Primary API failed for ${loteriaSlug} #${numero}, trying fallback...`);
    try {
      const res = await axios.get(`${FALLBACK_URL}/${apiSlug}/${numero}`, {
        timeout: 10000,
        headers: HEADERS_FALLBACK,
      });
      return normalizeFallback(res.data, loteriaSlug);
    } catch (err2) {
      console.error(`[CaixaAPI] Both APIs failed for ${loteriaSlug} #${numero}:`, err2);
      return null;
    }
  }
}

function calcStats(dezenas: number[]) {
  const soma = dezenas.reduce((a, b) => a + b, 0);
  const pares = dezenas.filter(n => n % 2 === 0).length;
  const impares = dezenas.length - pares;
  const primos = dezenas.filter(n => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }).length;
  return { soma, pares, impares, primos };
}

// ─── CACHE DE FREQUÊNCIA (dados completos da API) ──────────────────────────
interface FreqCache {
  frequencia: Array<{ numero: number; frequencia: number }>;
  atraso: Array<{ numero: number; atraso: number; ultimoConcurso: number }>;
  primos: {
    primosNoRange: number[];
    mediaPrimosPorConcurso: number;
    distribuicao: Array<{ qtdPrimos: number; ocorrencias: number; percentual: number }>;
    frequenciaPrimos: Array<{ numero: number; frequencia: number; isPrimo: boolean }>;
  };
  totalConcursos: number;
  fetchedAt: number;
}

const freqCache: Record<string, FreqCache> = {};
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchAllConcursos(loteriaSlug: string): Promise<Array<{ concurso: number; dezenas: number[] }>> {
  const slug = loteriaSlug.replace(/-/g, "");
  const apiSlug = LOTERIAS_MAP[slug];
  if (!apiSlug) return [];

  // Helper to parse response data safely
  const parseData = (data: any): Array<{ concurso: number; dezenas: number[] }> => {
    // If it's an array, map it
    if (Array.isArray(data)) {
      return data
        .filter((d: any) => d && d.concurso && d.dezenas && Array.isArray(d.dezenas))
        .map((d: any) => ({
          concurso: d.concurso,
          dezenas: (d.dezenas as string[]).map(Number).sort((a: number, b: number) => a - b),
        }));
    }
    // If it's a single object (some APIs return latest only without array)
    if (data && typeof data === "object" && data.concurso && Array.isArray(data.dezenas)) {
      return [{
        concurso: data.concurso,
        dezenas: (data.dezenas as string[]).map(Number).sort((a: number, b: number) => a - b),
      }];
    }
    console.warn(`[CaixaAPI] Unexpected data format for ${slug}:`, typeof data);
    return [];
  };

  // Try primary API with retry (up to 3 attempts)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[CaixaAPI] Fetching all concursos for ${slug} (attempt ${attempt}/3)...`);
      const res = await axios.get(`${BASE_URL}/${apiSlug}`, {
        timeout: 120000, // 2 min timeout for large payloads
        headers: HEADERS_PRIMARY,
        maxContentLength: 100 * 1024 * 1024, // 100MB max
        maxBodyLength: 100 * 1024 * 1024,
      });
      const result = parseData(res.data);
      if (result.length > 10) {
        console.log(`[CaixaAPI] Primary API returned ${result.length} concursos for ${slug}`);
        return result;
      }
      console.warn(`[CaixaAPI] Primary API returned only ${result.length} concursos for ${slug}, retrying...`);
    } catch (err: any) {
      console.warn(`[CaixaAPI] Primary API attempt ${attempt} failed for ${slug}: ${err.message}`);
      if (attempt < 3) {
        // Wait before retry (exponential backoff: 2s, 4s)
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }
  }

  // Try fallback API (Caixa official) — usually returns only latest concurso
  try {
    const res = await axios.get(`${FALLBACK_URL}/${apiSlug}`, {
      timeout: 30000,
      headers: HEADERS_FALLBACK,
    });
    const data = res.data;
    if (data && data.numero && data.listaDezenas) {
      console.warn(`[CaixaAPI] Fallback only returned latest concurso for ${slug} (#${data.numero})`);
      return [{
        concurso: data.numero,
        dezenas: (data.listaDezenas as string[]).map(Number).sort((a: number, b: number) => a - b),
      }];
    }
  } catch (err: any) {
    console.error(`[CaixaAPI] Both APIs failed for all concursos ${slug}: ${err.message}`);
  }

  return [];
}

// Minimum concursos threshold: if API returns fewer than this, it's likely incomplete data
// Don't cache incomplete data so it retries on next request
const MIN_CONCURSOS_THRESHOLD = 50;

export async function getFullFrequencia(loteriaSlug: string): Promise<FreqCache> {
  const slug = loteriaSlug.replace(/-/g, "");
  const cached = freqCache[slug];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    // If cached data has very few concursos, don't trust it — try fetching again
    if (cached.totalConcursos >= MIN_CONCURSOS_THRESHOLD) {
      return cached;
    }
    console.warn(`[Stats] Cached data for ${slug} has only ${cached.totalConcursos} concursos, refetching...`);
  }

  console.log(`[Stats] Fetching full history for ${slug}...`);
  const all = await fetchAllConcursos(slug);
  
  if (all.length === 0) {
    // Return empty if API fails entirely
    return { frequencia: [], atraso: [], primos: { primosNoRange: [], mediaPrimosPorConcurso: 0, distribuicao: [], frequenciaPrimos: [] }, totalConcursos: 0, fetchedAt: Date.now() };
  }

  // Calculate frequency
  const freq: Record<number, number> = {};
  for (const c of all) {
    for (const d of c.dezenas) {
      freq[d] = (freq[d] || 0) + 1;
    }
  }
  const frequencia = Object.entries(freq)
    .map(([num, count]) => ({ numero: Number(num), frequencia: count }))
    .sort((a, b) => b.frequencia - a.frequencia);

  // Calculate atraso (consecutive concursos without appearing, from most recent)
  // Sort concursos from most recent to oldest
  const sorted = [...all].sort((a, b) => b.concurso - a.concurso);
  // Build a set of dezenas for each concurso for fast lookup
  // For each number, walk from the most recent concurso backwards
  // and count how many consecutive concursos it was absent
  const allNumbers = new Set<number>();
  for (const c of all) {
    for (const d of c.dezenas) allNumbers.add(d);
  }
  const atraso: Array<{ numero: number; atraso: number; ultimoConcurso: number }> = [];
  for (const num of Array.from(allNumbers)) {
    let consecutiveAbsent = 0;
    let ultimoAppareceu = sorted[0]?.concurso ?? 0;
    for (const c of sorted) {
      if (c.dezenas.includes(num)) {
        ultimoAppareceu = c.concurso;
        break;
      }
      consecutiveAbsent++;
    }
    atraso.push({
      numero: num,
      atraso: consecutiveAbsent,
      ultimoConcurso: ultimoAppareceu,
    });
  }
  atraso.sort((a, b) => b.atraso - a.atraso);

  // ─── ANÁLISE DE PRIMOS ──────────────────────────────────────────────────
  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  };

  // Determine the range of numbers for this lottery
  const allNums = Array.from(allNumbers).sort((a, b) => a - b);
  const minNum = allNums[0] ?? 1;
  const maxNum = allNums[allNums.length - 1] ?? 60;
  const primosNoRange = Array.from({ length: maxNum - minNum + 1 }, (_, i) => minNum + i).filter(isPrime);

  // Count primos per concurso
  const primosCounts: number[] = all.map(c => c.dezenas.filter(isPrime).length);
  const totalPrimos = primosCounts.reduce((a, b) => a + b, 0);
  const mediaPrimosPorConcurso = all.length > 0 ? Math.round((totalPrimos / all.length) * 100) / 100 : 0;

  // Distribution: how many concursos had 0, 1, 2, ... primos
  const distMap: Record<number, number> = {};
  for (const count of primosCounts) {
    distMap[count] = (distMap[count] || 0) + 1;
  }
  const maxPrimosInConcurso = Math.max(...primosCounts, 0);
  const distribuicao = Array.from({ length: maxPrimosInConcurso + 1 }, (_, i) => ({
    qtdPrimos: i,
    ocorrencias: distMap[i] || 0,
    percentual: all.length > 0 ? Math.round(((distMap[i] || 0) / all.length) * 10000) / 100 : 0,
  }));

  // Frequency of each number annotated with isPrimo
  const frequenciaPrimos = frequencia.map(f => ({
    numero: f.numero,
    frequencia: f.frequencia,
    isPrimo: isPrime(f.numero),
  }));

  const primos = {
    primosNoRange,
    mediaPrimosPorConcurso,
    distribuicao,
    frequenciaPrimos,
  };

  const result: FreqCache = {
    frequencia,
    atraso,
    primos,
    totalConcursos: all.length,
    fetchedAt: Date.now(),
  };

  // Only cache if we got a meaningful amount of data
  if (all.length >= MIN_CONCURSOS_THRESHOLD) {
    freqCache[slug] = result;
    console.log(`[Stats] Cached ${slug}: ${all.length} concursos, ${frequencia.length} numbers tracked`);
  } else {
    console.warn(`[Stats] NOT caching ${slug}: only ${all.length} concursos (below threshold of ${MIN_CONCURSOS_THRESHOLD}). Will retry on next request.`);
  }

  return result;
}

export async function syncUltimoConcurso(loteriaSlug: string) {
  const data = await fetchUltimoConcurso(loteriaSlug);
  if (!data) return null;

  const dezenas = data.dezenas.map(Number).sort((a, b) => a - b);
  const stats = calcStats(dezenas);

  // Parse date: format "DD/MM/YYYY"
  const [day, month, year] = data.data.split("/");
  const dataSorteio = new Date(`${year}-${month}-${day}T21:00:00-03:00`);

  // Normalize slug to canonical form (no hyphens) before saving
  const normalizedSlug = loteriaSlug.replace(/-/g, "");

  await upsertConcurso({
    loteriaSlug: normalizedSlug,
    numero: data.concurso,
    dataSorteio,
    dezenas,
    premioEstimado: data.valorEstimadoProximoConcurso?.toString(),
    premioAcumulado: data.acumulou,
    ganhadores: data.premiacoes?.map(r => ({
      faixa: r.descricao,
      quantidade: r.ganhadores,
      premio: r.valorPremio,
    })),
    somaDezenas: stats.soma,
    qtdPares: stats.pares,
    qtdImpares: stats.impares,
    qtdPrimos: stats.primos,
  });

  // Ping Google to re-crawl sitemap after new concurso is saved
  pingGoogleSitemap().catch(() => {});

  return {
    numero: data.concurso,
    dezenas,
    dataSorteio,
    premioAcumulado: data.acumulou,
    premioEstimado: data.valorEstimadoProximoConcurso,
    proximoConcurso: data.proximoConcurso,
    dataProximoConcurso: data.dataProximoConcurso,
    stats,
  };
}

// ─── GOOGLE SITEMAP PING ──────────────────────────────────────────────────────
// Notifies Google that the sitemap was updated (new concurso added).
// Google deprecated the old ping API but still supports it as a hint.
// Also uses the Indexing-like approach via sitemap URL.
let lastPingTime = 0;
const PING_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes between pings

async function pingGoogleSitemap() {
  const now = Date.now();
  if (now - lastPingTime < PING_COOLDOWN_MS) {
    return; // Don't spam Google
  }
  lastPingTime = now;

  const sitemapUrl = encodeURIComponent("https://www.valtor.com.br/sitemap.xml");
  try {
    const response = await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`);
    console.log(`[SEO] Google sitemap ping: ${response.status}`);
  } catch (err) {
    console.warn("[SEO] Google sitemap ping failed:", err);
  }
}
