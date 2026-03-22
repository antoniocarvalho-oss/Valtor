import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/hooks/useSEO";
import { Link } from "wouter";
import {
  Trophy,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart2,
  ArrowRight,
  RefreshCw,
  Calendar,
  Hash,
  Star,
  Info,
  ChevronRight,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const LOTTERY_META: Record<string, {
  name: string;
  slug: string;
  color: string;
  colorDark: string;
  colorLight: string;
  gradient: string;
  specialName: string;
  mainMax: number;
  specialMax: number;
  mainCount: number;
  drawDays: string;
  description: string;
  howToPlay: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string;
  h1: string;
}> = {
  "mega-millions": {
    name: "Mega Millions",
    slug: "mega-millions",
    color: "#1a6bc4",
    colorDark: "#0d4a8a",
    colorLight: "#dbeafe",
    gradient: "linear-gradient(135deg, #0d4a8a 0%, #1a6bc4 50%, #2980d9 100%)",
    specialName: "Mega Ball",
    mainMax: 70,
    specialMax: 25,
    mainCount: 5,
    drawDays: "Terça e Sexta",
    description: "A Mega Millions é uma das maiores loterias dos Estados Unidos, com jackpots que frequentemente ultrapassam centenas de milhões de dólares. O jogador escolhe 5 números de 1 a 70 e 1 Mega Ball de 1 a 25.",
    howToPlay: "Escolha 5 números de 1 a 70 e 1 Mega Ball de 1 a 25. Os sorteios acontecem às terças e sextas-feiras às 23h (horário do leste dos EUA). Para ganhar o jackpot, é preciso acertar todos os 5 números principais e o Mega Ball. Existem 9 faixas de premiação — mesmo acertando apenas o Mega Ball, você pode ganhar US$ 2.",
    seoTitle: "Resultado Mega Millions Hoje — Números Sorteados, Estatísticas e Gerador",
    seoDesc: "Confira o último resultado da Mega Millions atualizado. Veja os números mais sorteados, números atrasados, frequência completa e gere seus jogos. Histórico com mais de 2.400 sorteios.",
    seoKeywords: "mega millions resultado, mega millions números sorteados, mega millions hoje, mega millions estatísticas, gerador mega millions, números mais sorteados mega millions",
    h1: "Resultado Mega Millions — Último Sorteio e Estatísticas",
  },
  "powerball": {
    name: "Powerball",
    slug: "powerball",
    color: "#e63946",
    colorDark: "#b52d38",
    colorLight: "#fee2e2",
    gradient: "linear-gradient(135deg, #b52d38 0%, #e63946 50%, #ef5350 100%)",
    specialName: "Powerball",
    mainMax: 69,
    specialMax: 26,
    mainCount: 5,
    drawDays: "Segunda, Quarta e Sábado",
    description: "A Powerball é a loteria mais famosa dos Estados Unidos, conhecida por seus jackpots recordes que já ultrapassaram US$ 2 bilhões. O jogador escolhe 5 números de 1 a 69 e 1 Powerball de 1 a 26.",
    howToPlay: "Escolha 5 números de 1 a 69 e 1 Powerball de 1 a 26. Os sorteios acontecem às segundas, quartas e sábados às 22:59 (horário do leste dos EUA). Para ganhar o jackpot, é preciso acertar todos os 5 números principais e o Powerball. Existem 9 faixas de premiação — mesmo acertando apenas o Powerball, você pode ganhar US$ 4.",
    seoTitle: "Resultado Powerball Hoje — Números Sorteados, Estatísticas e Gerador",
    seoDesc: "Confira o último resultado da Powerball atualizado. Veja os números mais sorteados, números atrasados, frequência completa e gere seus jogos. Histórico com mais de 1.900 sorteios.",
    seoKeywords: "powerball resultado, powerball números sorteados, powerball hoje, powerball estatísticas, gerador powerball, números mais sorteados powerball",
    h1: "Resultado Powerball — Último Sorteio e Estatísticas",
  },
};

function formatDate(d: string | Date) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── NUMBER BALL COMPONENT ───────────────────────────────────────────────────
function NumberBall({ num, color, size = "md", special = false }: {
  num: number;
  color: string;
  size?: "sm" | "md" | "lg";
  special?: boolean;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };
  if (typeof num !== "number" || isNaN(num)) return null;
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-md ${special ? "ring-2 ring-yellow-400 ring-offset-2" : ""}`}
      style={{ background: special ? "#f5a623" : color }}
    >
      {String(num).padStart(2, "0")}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function UsLotteryPage({ lottery }: { lottery: "mega-millions" | "powerball" }) {
  const meta = LOTTERY_META[lottery];
  const [generatedGames, setGeneratedGames] = useState<{ main: number[]; special: number }[]>([]);

  const { data: latestDraw, isLoading: loadingDraw } = trpc.usLottery.latestDraw.useQuery({ lottery });
  const { data: recentDraws } = trpc.usLottery.recentDraws.useQuery({ lottery, limit: 5 });
  const { data: mostDrawn } = trpc.usLottery.mostDrawnMain.useQuery({ lottery, limit: 5 });
  const { data: mostDelayed } = trpc.usLottery.mostDelayedMain.useQuery({ lottery, limit: 5 });
  const { data: mostDrawnSpecial } = trpc.usLottery.mostDrawnSpecial.useQuery({ lottery, limit: 5 });
  const { data: generatedFromServer } = trpc.usLottery.generate.useQuery(
    { lottery, count: 3 },
    { enabled: generatedGames.length === 0 }
  );

  const handleGenerate = () => {
    const config = meta;
    const games = Array.from({ length: 3 }, () => {
      const mainPool = Array.from({ length: config.mainMax }, (_, i) => i + 1);
      const main: number[] = [];
      for (let i = 0; i < config.mainCount; i++) {
        const idx = Math.floor(Math.random() * mainPool.length);
        main.push(mainPool.splice(idx, 1)[0]);
      }
      main.sort((a, b) => a - b);
      const special = Math.floor(Math.random() * config.specialMax) + 1;
      return { main, special };
    });
    setGeneratedGames(games);
  };

  const displayGames = generatedGames.length > 0 ? generatedGames : (generatedFromServer || []);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={meta.seoTitle}
        description={meta.seoDesc}
        path={`/${meta.slug}`}
        keywords={meta.seoKeywords}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: meta.h1,
          description: meta.seoDesc,
          url: `https://www.valtor.com.br/${meta.slug}`,
          isPartOf: { "@type": "WebSite", name: "Valtor", url: "https://www.valtor.com.br" },
          about: {
            "@type": "Thing",
            name: meta.name,
            description: meta.description,
          },
        }}
      />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO 1 — RESULTADO NO TOPO (prioridade máxima)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ background: meta.gradient }}>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="container relative py-10 md:py-14">
          <Badge className="mb-3 bg-white/15 text-white border-white/30 hover:bg-white/15">
            <Star className="w-3 h-3 mr-1" /> Loterias Americanas
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">{meta.h1}</h1>

          {/* ── Resultado inline no hero ── */}
          {loadingDraw ? (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mt-4 max-w-2xl">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-white/60 text-sm mt-2 text-center">Carregando resultado...</p>
            </div>
          ) : latestDraw ? (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 md:p-6 mt-4 max-w-2xl border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-lg">Último Resultado</span>
                </div>
                <span className="text-white/60 text-sm">Sorteio de {formatDate(latestDraw.drawDate)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                {Array.isArray(latestDraw.numbersMain) && (latestDraw.numbersMain as number[]).map((n, i) => (
                  <NumberBall key={i} num={n} color="rgba(255,255,255,0.2)" size="lg" />
                ))}
                <span className="text-white/40 text-2xl font-light mx-1">+</span>
                <NumberBall num={latestDraw.numberSpecial} color="#f5a623" size="lg" special />
              </div>
              <p className="text-white/50 text-xs">
                {meta.specialName}: {String(latestDraw.numberSpecial ?? "").padStart(2, "0")}
                {latestDraw.multiplier ? ` · Multiplicador: ${latestDraw.multiplier}x` : ""}
                {latestDraw.jackpot ? ` · Jackpot: ${latestDraw.jackpot}` : ""}
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mt-4 max-w-2xl text-white/60 text-sm">
              Nenhum resultado disponível no momento.
            </div>
          )}

          {/* ── CTA principal ── */}
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="#gerador">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold gap-2 shadow-lg text-base px-6">
                <Zap className="w-4 h-4" />
                Gerar jogo agora
              </Button>
            </a>
            <a href="#estatisticas">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2 text-base px-6">
                <BarChart2 className="w-4 h-4" />
                Ver estatísticas
              </Button>
            </a>
          </div>

          {/* ── Info tags ── */}
          <div className="flex flex-wrap gap-2 mt-5 text-xs text-white/50">
            <div className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1">
              <Calendar className="w-3 h-3" /> Sorteios: {meta.drawDays}
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1">
              <Hash className="w-3 h-3" /> {meta.mainCount} números + 1 {meta.specialName}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO 2 — COMO FUNCIONA (breve, informativo)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 border-b border-gray-100">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" style={{ color: meta.color }} />
              Como Funciona a {meta.name}
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">{meta.howToPlay}</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO 3 — RESULTADOS ANTERIORES
          ══════════════════════════════════════════════════════════════════════ */}
      {recentDraws && recentDraws.length > 1 && (
        <section className="py-10 bg-gray-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: meta.color }} />
                Resultados Anteriores
              </h2>
              <div className="space-y-2.5">
                {recentDraws.slice(1).map((draw) => (
                  <div key={draw.id} className="bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium min-w-[100px]">{formatDate(draw.drawDate)}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Array.isArray(draw.numbersMain) && (draw.numbersMain as number[]).map((n, i) => (
                        <NumberBall key={i} num={n} color={meta.color} size="sm" />
                      ))}
                      <span className="text-gray-300 mx-0.5">+</span>
                      <NumberBall num={draw.numberSpecial} color="#f5a623" size="sm" special />
                    </div>
                    {draw.multiplier && (
                      <span className="text-xs text-gray-400 ml-auto">{draw.multiplier}x</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO 4 — ESTATÍSTICAS RESUMIDAS (reforçadas)
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="estatisticas" className="py-12 scroll-mt-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
              <BarChart2 className="w-6 h-6" style={{ color: meta.color }} />
              Estatísticas da {meta.name}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Dados baseados em todo o histórico oficial de sorteios. Use como referência para montar seus jogos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ── Mais Sorteados ── */}
              <div className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}15` }}>
                    <TrendingUp className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <h3 className="font-bold text-gray-900">Mais Sorteados</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">Números que mais saíram no histórico</p>
                {mostDrawn && mostDrawn.length > 0 ? (
                  <div className="space-y-2.5">
                    {mostDrawn.map((s, idx) => (
                      <div key={s.number} className="flex items-center gap-3">
                        <span className="text-xs text-gray-300 w-4 text-right">{idx + 1}.</span>
                        <NumberBall num={s.number} color={meta.color} size="sm" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s.frequency / (mostDrawn[0]?.frequency || 1)) * 100}%`, background: meta.color }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 min-w-[40px] text-right">{s.frequency}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
                )}
                <Link href={`/numeros-mais-sorteados-${meta.slug}`}>
                  <Button variant="ghost" size="sm" className="w-full mt-4 font-bold gap-1 text-xs" style={{ color: meta.color }}>
                    Ver números mais sorteados <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* ── Mais Atrasados ── */}
              <div className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Mais Atrasados</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">Números que não saem há mais tempo</p>
                {mostDelayed && mostDelayed.length > 0 ? (
                  <div className="space-y-2.5">
                    {mostDelayed.map((s, idx) => (
                      <div key={s.number} className="flex items-center gap-3">
                        <span className="text-xs text-gray-300 w-4 text-right">{idx + 1}.</span>
                        <NumberBall num={s.number} color={meta.color} size="sm" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-orange-500" style={{ width: `${(s.delay / (mostDelayed[0]?.delay || 1)) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 min-w-[65px] text-right">{s.delay} sorteios</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
                )}
                <Link href={`/numeros-atrasados-${meta.slug}`}>
                  <Button variant="ghost" size="sm" className="w-full mt-4 font-bold gap-1 text-xs text-orange-600">
                    Ver números atrasados <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* ── Bola Especial ── */}
              <div className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-50">
                    <Target className="w-4 h-4 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">{meta.specialName}</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">Frequência da bola especial</p>
                {mostDrawnSpecial && mostDrawnSpecial.length > 0 ? (
                  <div className="space-y-2.5">
                    {mostDrawnSpecial.map((s, idx) => (
                      <div key={s.number} className="flex items-center gap-3">
                        <span className="text-xs text-gray-300 w-4 text-right">{idx + 1}.</span>
                        <NumberBall num={s.number} color="#f5a623" size="sm" special />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-yellow-500" style={{ width: `${(s.frequency / (mostDrawnSpecial[0]?.frequency || 1)) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 min-w-[40px] text-right">{s.frequency}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
                )}
                <Link href={`/frequencia-${meta.slug}`}>
                  <Button variant="ghost" size="sm" className="w-full mt-4 font-bold gap-1 text-xs text-yellow-700">
                    Ver frequência completa <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO 5 — GERADOR (CTA forte, destaque visual)
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="gerador" className="py-12 bg-gray-50 scroll-mt-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" style={{ color: meta.color }} />
                  Gerador de Números — {meta.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Gere combinações aleatórias válidas. Use como inspiração para seus jogos.
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                className="font-bold gap-2 text-white shadow-lg text-base px-6 shrink-0"
                style={{ background: meta.color }}
                size="lg"
              >
                <RefreshCw className="w-4 h-4" />
                Gerar jogo agora
              </Button>
            </div>

            <div className="space-y-3">
              {displayGames.map((game, idx) => (
                <div key={idx} className="bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
                  <span className="text-xs font-bold text-gray-400 min-w-[60px] uppercase tracking-wide">Jogo {idx + 1}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {game.main.map((n, i) => (
                      <NumberBall key={i} num={n} color={meta.color} size="md" />
                    ))}
                    <span className="text-gray-300 mx-0.5">+</span>
                    <NumberBall num={game.special} color="#f5a623" size="md" special />
                  </div>
                </div>
              ))}
            </div>

            {displayGames.length === 0 && (
              <div className="bg-white rounded-xl border p-8 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400 text-sm">Clique em "Gerar jogo agora" para criar suas combinações.</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                onClick={handleGenerate}
                variant="outline"
                className="font-bold gap-2 text-sm"
                style={{ borderColor: meta.color, color: meta.color }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Gerar mais números
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO 6 — LINKS INTERNOS (SEO + navegação)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Explore Mais Sobre a {meta.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href={`/numeros-mais-sorteados-${meta.slug}`}>
                <div className="rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group h-full" style={{ borderColor: `${meta.color}30` }}>
                  <TrendingUp className="w-5 h-5 mb-2" style={{ color: meta.color }} />
                  <h3 className="font-bold text-gray-800 group-hover:underline text-sm">Números Mais Sorteados</h3>
                  <p className="text-xs text-gray-500 mt-1">Ranking completo de frequência de todos os números.</p>
                </div>
              </Link>
              <Link href={`/numeros-atrasados-${meta.slug}`}>
                <div className="rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group h-full" style={{ borderColor: `${meta.color}30` }}>
                  <Clock className="w-5 h-5 mb-2 text-orange-600" />
                  <h3 className="font-bold text-gray-800 group-hover:underline text-sm">Números Atrasados</h3>
                  <p className="text-xs text-gray-500 mt-1">Quais números estão há mais tempo sem ser sorteados.</p>
                </div>
              </Link>
              <Link href={`/frequencia-${meta.slug}`}>
                <div className="rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group h-full" style={{ borderColor: `${meta.color}30` }}>
                  <BarChart2 className="w-5 h-5 mb-2 text-yellow-600" />
                  <h3 className="font-bold text-gray-800 group-hover:underline text-sm">Frequência Completa</h3>
                  <p className="text-xs text-gray-500 mt-1">Tabela completa com frequência e atraso de cada número.</p>
                </div>
              </Link>
            </div>

            {/* Cross-link to other lottery */}
            <div className="mt-8 p-5 rounded-xl border bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Veja também</p>
                <Link
                  href={lottery === "mega-millions" ? "/powerball" : "/mega-millions"}
                  className="flex items-center gap-2 font-bold text-lg hover:underline"
                  style={{ color: lottery === "mega-millions" ? "#e63946" : "#1a6bc4" }}
                >
                  {lottery === "mega-millions" ? "Powerball" : "Mega Millions"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <Link href={lottery === "mega-millions" ? "/powerball" : "/mega-millions"}>
                <Button variant="outline" size="sm" className="font-semibold gap-1" style={{ borderColor: lottery === "mega-millions" ? "#e63946" : "#1a6bc4", color: lottery === "mega-millions" ? "#e63946" : "#1a6bc4" }}>
                  Ver resultados <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section className="py-8 border-t border-gray-100">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>Aviso:</strong> As estatísticas apresentadas são baseadas no histórico oficial de sorteios e servem apenas como referência informativa.
              Loterias são jogos de azar e resultados passados não garantem resultados futuros. O Valtor não faz previsões nem garante ganhos.
              Jogue com responsabilidade.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
