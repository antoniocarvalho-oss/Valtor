import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/hooks/useSEO";
import { Link } from "wouter";
import {
  TrendingUp,
  Clock,
  BarChart2,
  ArrowLeft,
  Star,
  ChevronRight,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type StatsType = "mais-sorteados" | "atrasados" | "frequencia";
type LotterySlug = "mega-millions" | "powerball";

const LOTTERY_META: Record<LotterySlug, {
  name: string;
  color: string;
  colorDark: string;
  gradient: string;
  specialName: string;
  mainMax: number;
  specialMax: number;
}> = {
  "mega-millions": {
    name: "Mega Millions",
    color: "#1a6bc4",
    colorDark: "#0d4a8a",
    gradient: "linear-gradient(135deg, #0d4a8a 0%, #1a6bc4 50%, #2980d9 100%)",
    specialName: "Mega Ball",
    mainMax: 70,
    specialMax: 25,
  },
  "powerball": {
    name: "Powerball",
    color: "#e63946",
    colorDark: "#b52d38",
    gradient: "linear-gradient(135deg, #b52d38 0%, #e63946 50%, #ef5350 100%)",
    specialName: "Powerball",
    mainMax: 69,
    specialMax: 26,
  },
};

const STATS_META: Record<StatsType, {
  title: (name: string) => string;
  h1: (name: string) => string;
  seoTitle: (name: string) => string;
  seoDesc: (name: string) => string;
  seoKeywords: (name: string, slug: string) => string;
  icon: typeof TrendingUp;
  subtitle: (name: string) => string;
}> = {
  "mais-sorteados": {
    title: (name) => `Números Mais Sorteados — ${name}`,
    h1: (name) => `Números Mais Sorteados da ${name} — Ranking Completo`,
    seoTitle: (name) => `Números Mais Sorteados ${name} — Ranking Atualizado de Frequência`,
    seoDesc: (name) => `Confira o ranking completo dos números mais sorteados na ${name}. Veja a frequência de cada número, atraso e último sorteio. Dados históricos atualizados.`,
    seoKeywords: (_name, slug) => `números mais sorteados ${slug}, frequência ${slug}, estatísticas ${slug}, números quentes ${slug}`,
    icon: TrendingUp,
    subtitle: (name) => `Ranking completo dos números que mais saíram nos sorteios da ${name}. Dados baseados em todo o histórico oficial disponível.`,
  },
  "atrasados": {
    title: (name) => `Números Atrasados — ${name}`,
    h1: (name) => `Números Atrasados da ${name} — Quais Estão Devendo`,
    seoTitle: (name) => `Números Atrasados ${name} — Quais Números Estão Devendo`,
    seoDesc: (name) => `Descubra quais números da ${name} estão há mais tempo sem ser sorteados. Veja o atraso de cada número e a data do último sorteio. Análise atualizada.`,
    seoKeywords: (_name, slug) => `números atrasados ${slug}, números devendo ${slug}, atraso ${slug}, números frios ${slug}`,
    icon: Clock,
    subtitle: (name) => `Números que estão há mais sorteios sem aparecer na ${name}. Quanto maior o atraso, mais tempo o número não sai.`,
  },
  "frequencia": {
    title: (name) => `Frequência Completa — ${name}`,
    h1: (name) => `Frequência Completa da ${name} — Todos os Números`,
    seoTitle: (name) => `Frequência Completa ${name} — Tabela de Todos os Números`,
    seoDesc: (name) => `Tabela completa de frequência de todos os números da ${name}, incluindo números principais e bola especial. Frequência, atraso e último sorteio de cada número.`,
    seoKeywords: (_name, slug) => `frequência ${slug}, tabela frequência ${slug}, todos números ${slug}, estatísticas completas ${slug}`,
    icon: BarChart2,
    subtitle: (name) => `Tabela completa com a frequência de cada número nos sorteios da ${name}, incluindo a bola especial.`,
  },
};

function formatDate(d: string | Date | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function NumberBall({ num, color, size = "sm", special = false }: {
  num: number;
  color: string;
  size?: "sm" | "md";
  special?: boolean;
}) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm" };
  if (typeof num !== "number" || isNaN(num)) return null;
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-sm ${special ? "ring-2 ring-yellow-400 ring-offset-1" : ""}`}
      style={{ background: special ? "#f5a623" : color }}
    >
      {String(num).padStart(2, "0")}
    </div>
  );
}

// ─── FREQUENCY BAR ───────────────────────────────────────────────────────────
function FrequencyBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: color, minWidth: value > 0 ? "8px" : "0" }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function UsLotteryStatsPage({ lottery, statsType }: { lottery: LotterySlug; statsType: StatsType }) {
  const meta = LOTTERY_META[lottery];
  const statsMeta = STATS_META[statsType];
  const Icon = statsMeta.icon;

  const { data: statsMain, isLoading: loadingMain } = trpc.usLottery.statsMain.useQuery({ lottery });
  const { data: statsSpecial, isLoading: loadingSpecial } = trpc.usLottery.statsSpecial.useQuery({ lottery });

  const sortedMain = statsMain ? [...statsMain].sort((a, b) => {
    if (statsType === "mais-sorteados") return b.frequency - a.frequency;
    if (statsType === "atrasados") return b.delay - a.delay;
    return a.number - b.number;
  }) : [];

  const sortedSpecial = statsSpecial ? [...statsSpecial].sort((a, b) => {
    if (statsType === "mais-sorteados") return b.frequency - a.frequency;
    if (statsType === "atrasados") return b.delay - a.delay;
    return a.number - b.number;
  }) : [];

  const maxMainFreq = statsMain ? Math.max(...statsMain.map(s => s.frequency)) : 1;
  const maxSpecialFreq = statsSpecial ? Math.max(...statsSpecial.map(s => s.frequency)) : 1;
  const maxMainDelay = statsMain ? Math.max(...statsMain.map(s => s.delay)) : 1;
  const maxSpecialDelay = statsSpecial ? Math.max(...statsSpecial.map(s => s.delay)) : 1;
  const totalDraws = statsMain?.[0]?.totalDraws || 0;

  const isLoading = loadingMain || loadingSpecial;

  const seoPath = `/${statsType === "mais-sorteados" ? "numeros-mais-sorteados" : statsType === "atrasados" ? "numeros-atrasados" : "frequencia"}-${lottery}`;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={statsMeta.seoTitle(meta.name)}
        description={statsMeta.seoDesc(meta.name)}
        path={seoPath}
        keywords={statsMeta.seoKeywords(meta.name, lottery)}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: statsMeta.h1(meta.name),
          description: statsMeta.seoDesc(meta.name),
          url: `https://www.valtor.com.br${seoPath}`,
          isPartOf: { "@type": "WebSite", name: "Valtor", url: "https://www.valtor.com.br" },
        }}
      />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-10 md:py-12 text-white" style={{ background: meta.gradient }}>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="container relative">
          <Link href={`/${lottery}`} className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para {meta.name}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-7 h-7" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">{statsMeta.h1(meta.name)}</h1>
          </div>
          <p className="text-white/70 max-w-2xl leading-relaxed text-sm md:text-base">{statsMeta.subtitle(meta.name)}</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {totalDraws > 0 && (
              <Badge className="bg-white/15 text-white border-white/30 hover:bg-white/15">
                Baseado em {totalDraws.toLocaleString("pt-BR")} sorteios
              </Badge>
            )}
            <a href={`/${lottery}#gerador`}>
              <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 font-bold gap-1.5 shadow-lg">
                <Zap className="w-3.5 h-3.5" />
                Gerar jogo agora
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── MAIN NUMBERS TABLE ── */}
      <section className="py-10">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" style={{ color: meta.color }} />
              Números Principais (1–{meta.mainMax})
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 mt-3">Carregando estatísticas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-12">#</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-20">Número</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-24">Frequência</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600">Barra</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-28">Atraso</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-28 hidden md:table-cell">Último Sorteio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMain.map((stat, idx) => (
                      <tr key={stat.number} className={`border-b border-gray-100 ${idx < 5 ? "bg-gray-50/50" : ""}`}>
                        <td className="py-2.5 px-2 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <NumberBall num={stat.number} color={meta.color} size="sm" />
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-gray-800">{stat.frequency}x</td>
                        <td className="py-2.5 px-2">
                          <FrequencyBar
                            value={statsType === "atrasados" ? stat.delay : stat.frequency}
                            max={statsType === "atrasados" ? maxMainDelay : maxMainFreq}
                            color={meta.color}
                          />
                        </td>
                        <td className="py-2.5 px-2 text-gray-600">{stat.delay} sorteios</td>
                        <td className="py-2.5 px-2 text-gray-400 text-xs hidden md:table-cell">{formatDate(stat.lastDrawn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SPECIAL NUMBER TABLE ── */}
      <section className="py-10 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              {meta.specialName} (1–{meta.specialMax})
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-12">#</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-20">Número</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-24">Frequência</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600">Barra</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-28">Atraso</th>
                      <th className="text-left py-3 px-2 font-bold text-gray-600 w-28 hidden md:table-cell">Último Sorteio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSpecial.map((stat, idx) => (
                      <tr key={stat.number} className={`border-b border-gray-100 ${idx < 3 ? "bg-yellow-50/50" : ""}`}>
                        <td className="py-2.5 px-2 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <NumberBall num={stat.number} color="#f5a623" size="sm" special />
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-gray-800">{stat.frequency}x</td>
                        <td className="py-2.5 px-2">
                          <FrequencyBar
                            value={statsType === "atrasados" ? stat.delay : stat.frequency}
                            max={statsType === "atrasados" ? maxSpecialDelay : maxSpecialFreq}
                            color="#f5a623"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-gray-600">{stat.delay} sorteios</td>
                        <td className="py-2.5 px-2 text-gray-400 text-xs hidden md:table-cell">{formatDate(stat.lastDrawn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA GERADOR ── */}
      <section className="py-10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-black text-gray-900 mb-2">Quer testar sua sorte?</h3>
            <p className="text-sm text-gray-500 mb-4">Gere combinações aleatórias válidas para a {meta.name} com base no histórico.</p>
            <Link href={`/${lottery}#gerador`}>
              <Button size="lg" className="font-bold gap-2 text-white shadow-lg" style={{ background: meta.color }}>
                <Zap className="w-4 h-4" />
                Gerar jogo agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NAVIGATION ── */}
      <section className="py-10 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Veja Também</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {statsType !== "mais-sorteados" && (
                <Link href={`/numeros-mais-sorteados-${lottery}`}>
                  <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer group">
                    <TrendingUp className="w-4 h-4 mb-1" style={{ color: meta.color }} />
                    <span className="font-semibold text-sm text-gray-800 group-hover:underline">Números Mais Sorteados</span>
                  </div>
                </Link>
              )}
              {statsType !== "atrasados" && (
                <Link href={`/numeros-atrasados-${lottery}`}>
                  <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer group">
                    <Clock className="w-4 h-4 mb-1 text-orange-600" />
                    <span className="font-semibold text-sm text-gray-800 group-hover:underline">Números Atrasados</span>
                  </div>
                </Link>
              )}
              {statsType !== "frequencia" && (
                <Link href={`/frequencia-${lottery}`}>
                  <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer group">
                    <BarChart2 className="w-4 h-4 mb-1 text-yellow-600" />
                    <span className="font-semibold text-sm text-gray-800 group-hover:underline">Frequência Completa</span>
                  </div>
                </Link>
              )}
              <Link href={`/${lottery}`}>
                <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <ArrowRight className="w-4 h-4 mb-1" style={{ color: meta.color }} />
                  <span className="font-semibold text-sm text-gray-800 group-hover:underline">Página Principal {meta.name}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section className="py-6 border-t border-gray-100">
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
