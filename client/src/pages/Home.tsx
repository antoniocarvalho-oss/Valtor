import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/hooks/useSEO";
import LotteryHeroCards from "@/components/LotteryHeroCards";
import { ALL_LOTTERIES } from "@/components/LotteryHeroCards";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

import {
  BarChart3, Zap, Shield, CheckCircle2, ArrowRight, Star,
  Clock, Trophy, Calendar, Gift, TrendingUp, Target, Bell,
  Wallet, Users, ChevronRight, ChevronDown,
  ChevronLeft, Flame, Mail, History, PieChart, Search,
  FileDown, Share2, Tv, Brain, Upload, TestTube2, Rewind, BellRing,
} from "lucide-react";

// ─── LOTTERY LINKS CONFIG ────────────────────────────────────────────────────
const MAIN_LOTTERIES = [
  { slug: "lotofacil", name: "Lotofácil", color: "#7c3aed", icon: "🎯" },
  { slug: "megasena", name: "Mega-Sena", color: "#16a34a", icon: "🍀" },
  { slug: "quina", name: "Quina", color: "#ea580c", icon: "🎰" },
  { slug: "lotomania", name: "Lotomania", color: "#0ea5e9", icon: "🌀" },
  { slug: "timemania", name: "Timemania", color: "#dc2626", icon: "⚽" },
  { slug: "diadesorte", name: "Dia de Sorte", color: "#db2777", icon: "🌸" },
];

// ─── FAQ DATA ────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "O que são números atrasados?",
    a: "Números atrasados são aqueles que não aparecem nos resultados há vários concursos consecutivos. Por exemplo, se o número 14 não sai há 36 sorteios da Mega-Sena, seu atraso é 36. Esse dado é puramente histórico e não indica probabilidade futura.",
  },
  {
    q: "Número atrasado tem mais chance de sair?",
    a: "Não. Cada sorteio é independente e aleatório. O fato de um número estar atrasado não aumenta nem diminui sua probabilidade. Valtor apresenta esses dados como indicadores históricos para análise, sem promessas de resultado.",
  },
  {
    q: "Qual o número mais sorteado da Lotofácil?",
    a: "Os números mais sorteados da Lotofácil variam conforme novos concursos acontecem. No Valtor, você pode consultar o ranking atualizado em tempo real com base em todos os concursos desde o início da loteria.",
  },
  {
    q: "Como o Valtor calcula a frequência?",
    a: "A frequência é calculada contando quantas vezes cada número apareceu em todos os concursos realizados desde o primeiro sorteio de cada loteria. Os dados são obtidos diretamente da API oficial da Caixa Econômica Federal.",
  },
  {
    q: "Posso salvar meus jogos e acompanhar os resultados?",
    a: "Sim. Com uma conta gratuita você pode gerar jogos. Assinantes do Clube Valtor podem salvar jogos na carteira, marcar apostas ativas, conferir resultados automaticamente e acompanhar o retorno sobre investimento (ROI).",
  },
  {
    q: "Valtor é gratuito?",
    a: "Sim, Valtor oferece acesso gratuito a resultados, estatísticas básicas e geração de jogos. O Clube Valtor (premium) desbloqueia filtros avançados, carteira ilimitada, alertas por e-mail e análises exclusivas.",
  },
];

// ─── FAQ SCHEMA JSON-LD ──────────────────────────────────────────────────────
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

// ─── CONTADOR REGRESSIVO INDIVIDUAL POR LOTERIA ─────────────────────────────
function useIndividualCountdown(targetDateStr: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!targetDateStr) { setTimeLeft(null); return; }

    const parseTarget = () => {
      try {
        const [day, month, year] = targetDateStr.split("/");
        return new Date(`${year}-${month}-${day}T21:00:00-03:00`).getTime();
      } catch { return null; }
    };

    const target = parseTarget();
    if (!target) { setTimeLeft(null); return; }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        d: Math.floor(totalSeconds / 86400),
        h: Math.floor((totalSeconds % 86400) / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: totalSeconds % 60,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return timeLeft;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

// ─── QUICK RESULT CARD (R2: resultado destaque — bolas maiores, fundo colorido, alto contraste) ──
function QuickResultCard({ slug, name, color, icon }: { slug: string; name: string; color: string; icon: string }) {
  const { data, isLoading } = trpc.concursos.proximoSorteio.useQuery({ loteriaSlug: slug });
  const dezenas = data?.dezenas ?? [];
  const concurso = data?.ultimoConcurso;
  const dataStr = data?.dataUltimoSorteio;

  return (
    <Link href={`/${slug}`}>
      <div
        className="rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all cursor-pointer border-2 relative overflow-hidden"
        style={{ borderColor: color, backgroundColor: `${color}08` }}
      >
        {/* Decorative circle */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: color }} />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-2xl">{icon}</span>
            <span className="font-black text-lg text-[#0d1b3e]">{name}</span>
            {concurso && (
              <span className="text-xs text-gray-500 ml-auto font-medium bg-white/80 px-2 py-0.5 rounded-full">
                #{concurso}{dataStr ? ` (${dataStr})` : ''}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-3 font-medium">Confira se seus números saíram</p>

          {isLoading ? (
            <div className="flex gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : dezenas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dezenas.map((n: number) => (
                <div
                  key={n}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white text-base md:text-lg font-black shadow-md"
                  style={{ backgroundColor: color }}
                >
                  {n}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-600 font-medium">Resultado em breve</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDataProximo(dataStr: string | null | undefined): string {
  if (!dataStr) return "";
  try {
    const [day, month, year] = dataStr.split("/");
    const date = new Date(`${year}-${month}-${day}T21:00:00-03:00`);
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}/${month} às 21h`;
  } catch { return dataStr; }
}

// ─── GRADIENTES DAS LOTERIAS ─────────────────────────────────────────────────
const LOTTERY_GRADIENTS: Record<string, string> = {
  megasena:       "from-[#16a34a] to-[#15803d]",
  lotofacil:      "from-[#7c3aed] to-[#6d28d9]",
  quina:          "from-[#ea580c] to-[#c2410c]",
  lotomania:      "from-[#0ea5e9] to-[#0284c7]",
  timemania:      "from-[#dc2626] to-[#b91c1c]",
  duplasena:      "from-[#d97706] to-[#b45309]",
  diadesorte:     "from-[#db2777] to-[#be185d]",
  supersete:      "from-[#059669] to-[#047857]",
  maismilionaria: "from-[#6366f1] to-[#4f46e5]",
};

// ─── CARROSSEL DE LOTERIAS ──────────────────────────────────────────────────
function LotteryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lottery = ALL_LOTTERIES[currentIndex];
  const { data, isLoading } = trpc.concursos.proximoSorteio.useQuery({ loteriaSlug: lottery.slug });
  const countdown = useIndividualCountdown(data?.dataProximoConcurso);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % ALL_LOTTERIES.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + ALL_LOTTERIES.length) % ALL_LOTTERIES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(goNext, 6000);
    return () => clearInterval(id);
  }, [goNext]);

  const minSwipeDistance = 50;
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) goNext(); else goPrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, goNext, goPrev]);

  const isAccumulated = data?.acumulou ?? false;
  const valor = data?.valorEstimadoProximo ?? 0;
  const prizeDisplay = valor > 0 ? formatCurrency(valor) : "A confirmar";
  const gradient = LOTTERY_GRADIENTS[lottery.slug] ?? "from-[#2563eb] to-[#1d4ed8]";
  const nextConcurso = data?.proximoConcurso;
  const ultimoConcurso = data?.ultimoConcurso;
  const dataUltimoSorteio = data?.dataUltimoSorteio;
  const dataProximoFormatada = formatDataProximo(data?.dataProximoConcurso);
  const isEnded = countdown && countdown.d === 0 && countdown.h === 0 && countdown.m === 0 && countdown.s === 0;

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} px-12 py-6 text-white transition-all duration-300 select-none`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{lottery.icon}</span>
              <div>
                <h3 className="text-lg font-black leading-tight">{lottery.shortName}</h3>
                {nextConcurso && (
                  <span className="text-white/60 text-xs font-medium">Concurso #{nextConcurso}</span>
                )}
              </div>
            </div>
            {isAccumulated && (
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-[10px] font-bold tracking-wider">
                <Flame className="w-3 h-3 mr-1" /> ACUMULADO
              </Badge>
            )}
          </div>

          {!isLoading && ultimoConcurso && (
            <p className="text-xs text-white/50 mb-2">
              Último: #{ultimoConcurso}{dataUltimoSorteio ? ` (${dataUltimoSorteio})` : ""}
            </p>
          )}

          <p className="text-xs text-white/70 mb-0.5">
            {isAccumulated ? "Prêmio acumulado estimado" : "Prêmio estimado"}
          </p>
          {isLoading ? (
            <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-3" />
          ) : (
            <p className="text-4xl font-black mb-3 tracking-tight">{prizeDisplay}</p>
          )}

          {dataProximoFormatada && (
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs text-white/60">{dataProximoFormatada}</span>
            </div>
          )}

          {countdown && !isEnded && (
            <div className="mb-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1.5 font-semibold">Encerra em</p>
              <div className="flex items-center gap-1.5">
                {countdown.d > 0 && (
                  <>
                    <div className="text-center">
                      <div className="bg-black/25 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xl font-black font-mono min-w-[44px]">
                        {pad(countdown.d)}
                      </div>
                      <span className="text-[9px] text-white/50 uppercase mt-0.5 block">dias</span>
                    </div>
                    <span className="text-white/40 font-bold text-lg mb-3">:</span>
                  </>
                )}
                <div className="text-center">
                  <div className="bg-black/25 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xl font-black font-mono min-w-[44px]">
                    {pad(countdown.h)}
                  </div>
                  <span className="text-[9px] text-white/50 uppercase mt-0.5 block">horas</span>
                </div>
                <span className="text-white/40 font-bold text-lg mb-3">:</span>
                <div className="text-center">
                  <div className="bg-black/25 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xl font-black font-mono min-w-[44px]">
                    {pad(countdown.m)}
                  </div>
                  <span className="text-[9px] text-white/50 uppercase mt-0.5 block">min</span>
                </div>
                <span className="text-white/40 font-bold text-lg mb-3">:</span>
                <div className="text-center">
                  <div className="bg-black/25 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xl font-black font-mono min-w-[44px]">
                    {pad(countdown.s)}
                  </div>
                  <span className="text-[9px] text-white/50 uppercase mt-0.5 block">seg</span>
                </div>
              </div>
            </div>
          )}

          <Link href={`/${lottery.slug}`}>
            <Button size="sm" className="bg-white text-gray-900 hover:bg-white/90 font-bold gap-1">
              Ver análise completa <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <button
        onClick={goPrev}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors z-10"
        aria-label="Loteria anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={goNext}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors z-10"
        aria-label="Próxima loteria"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {ALL_LOTTERIES.map((l, i) => (
          <button
            key={l.slug}
            onClick={() => setCurrentIndex(i)}
            className={`rounded-full transition-all duration-200 ${
              i === currentIndex ? "w-6 h-2" : "w-2 h-2 opacity-40 hover:opacity-70"
            }`}
            style={{ backgroundColor: i === currentIndex ? ALL_LOTTERIES[currentIndex].color : "#94a3b8" }}
            aria-label={l.shortName}
          />
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ACCORDION ───────────────────────────────────────────────────────────
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-[#0d1b3e] text-sm pr-4">{item.q}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Resultado da Lotofácil e Mega-Sena Hoje | Números Atrasados e Gerador — Valtor"
        description="Resultado da Lotofácil e Mega-Sena de hoje, números atrasados, estatísticas completas e gerador de jogos. Dados oficiais de 11 loterias incluindo Mega Millions e Powerball."
        path="/"
        keywords="resultado lotofácil hoje, resultado mega-sena hoje, números atrasados lotofácil, gerador de jogos loteria, números mais sorteados, powerball, mega millions"
        schema={FAQ_SCHEMA}
      />
      <Navbar />

      {/* ── R1. HERO — título direto + subtítulo orientado à ação ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#0d1b3e] pt-16 pb-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.15)_0%,_transparent_70%)] pointer-events-none" />

        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-5 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/20 text-xs font-semibold tracking-wide">
                <BarChart3 className="w-3 h-3 mr-1.5" /> Dados atualizados de 11 loterias
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-4">
                Resultado da Lotofácil e Mega-Sena hoje, números atrasados e estatísticas completas
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-lg font-medium">
                Veja os resultados atualizados e gere jogos com base em dados reais
              </p>

              {/* R3: CTAs com textos mais específicos */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/resultados">
                  <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] gap-2 shadow-xl shadow-yellow-900/30 font-bold h-12 md:h-14 text-sm md:text-base">
                    <Target className="w-4 h-4" /> Ver resultado de hoje
                  </Button>
                </Link>
                <Link href="/gerador">
                  <Button size="lg" className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white gap-2 shadow-xl shadow-purple-900/40 font-bold h-12 md:h-14 text-sm md:text-base">
                    <Zap className="w-4 h-4" /> Gerar jogo inteligente
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                {[
                  { value: "15K+", label: "Concursos analisados" },
                  { value: "11", label: "Loterias" },
                  { value: "100%", label: "Dados oficiais" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <LotteryCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ── R2. RESULTADO VISÍVEL — destaque máximo, impossível ignorar ── */}
      <section className="py-10 bg-[#f0f4f8]">
        <div className="container">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-[#0d1b3e]">Resultado de hoje</h2>
            <p className="text-sm text-gray-500 mt-1">Últimos números sorteados — clique para ver detalhes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <QuickResultCard slug="megasena" name="Mega-Sena" color="#16a34a" icon="🍀" />
            <QuickResultCard slug="lotofacil" name="Lotofácil" color="#7c3aed" icon="🎯" />
          </div>
        </div>
      </section>

      {/* ── R5. BLOCO DE AÇÃO REFORÇADO + R3 CTAs + R4 micro-ganchos ── */}
      <section className="py-10 bg-[#f0f4f8]">
        <div className="container">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-[#0d1b3e]">O que você quer fazer agora?</h2>
            <p className="text-sm text-gray-500 mt-1">Escolha uma ação rápida</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Ver resultado de hoje", sub: "Confira os últimos números", href: "/resultados", icon: <Target className="w-7 h-7" />, color: "#f5a623", bg: "#fffbeb", border: "#f5a623" },
              { label: "Gerar jogo com base nos dados", sub: "Analise antes de jogar", href: "/gerador", icon: <Zap className="w-7 h-7" />, color: "#7c3aed", bg: "#f5f3ff", border: "#7c3aed" },
              { label: "Ver números mais atrasados agora", sub: "Veja quais números estão devendo", href: "/lotofacil/estatisticas", icon: <Clock className="w-7 h-7" />, color: "#ea580c", bg: "#fff7ed", border: "#ea580c" },
              { label: "Ver análise completa dos números", sub: "Descubra os que mais saíram", href: "/megasena/estatisticas", icon: <TrendingUp className="w-7 h-7" />, color: "#16a34a", bg: "#f0fdf4", border: "#16a34a" },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <div
                  className="flex flex-col items-center gap-3 bg-white rounded-2xl p-5 md:p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-center min-h-[140px] md:min-h-[160px] justify-center shadow-sm border-t-[3px]"
                  style={{ borderTopColor: item.border }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.bg, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#0d1b3e] block leading-tight">{item.label}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">{item.sub}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── R6. LOTERIAS EUA — bloco dedicado visível ── */}
      <section className="py-8 bg-[#f0f4f8]">
        <div className="container">
          <div className="bg-gradient-to-r from-[#1a237e] to-[#b71c1c] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col md:flex-row items-center gap-5 md:gap-8">
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="text-3xl">🇺🇸</span>
                  <h3 className="text-xl md:text-2xl font-black">Mega Millions e Powerball</h3>
                </div>
                <p className="text-white/70 text-sm">Acompanhe as maiores loterias dos Estados Unidos direto do Brasil</p>
              </div>
              <div className="flex gap-3">
                <Link href="/mega-millions">
                  <Button className="bg-white text-[#1a237e] hover:bg-white/90 font-bold gap-1.5 h-12 shadow-lg">
                    Ver Mega Millions <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/powerball">
                  <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/30 font-bold gap-1.5 h-12">
                    Ver Powerball <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRÓXIMOS SORTEIOS ── */}
      <section className="py-12 bg-[#f0f4f8]">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0d1b3e]">Próximos Sorteios</h2>
              <p className="text-sm text-gray-500 mt-0.5">Prêmios estimados e datas dos concursos</p>
            </div>
            <Link href="/resultados">
              <span className="text-sm text-[#2563eb] hover:underline cursor-pointer flex items-center gap-1 font-medium">
                Últimos resultados <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
          <LotteryHeroCards />
        </div>
      </section>

      {/* ── BLOCO DE LOTERIAS (com 3 links por card + R4 micro-gancho) ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
              <BarChart3 className="w-3 h-3 mr-1" /> Estatísticas das Loterias
            </Badge>
            <h2 className="text-3xl font-black text-[#0d1b3e] mb-3">Análise completa por loteria</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Analise padrões antes de montar seu jogo. Frequência, atraso e rankings atualizados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MAIN_LOTTERIES.map((lot) => (
              <div
                key={lot.slug}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                style={{ borderTopColor: lot.color, borderTopWidth: 3 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{lot.icon}</span>
                  <h3 className="font-bold text-lg text-[#0d1b3e]">{lot.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Veja números mais sorteados, atrasados e frequência da {lot.name}.
                </p>
                <div className="space-y-2">
                  <Link href={`/${lot.slug}/estatisticas`}>
                    <span className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:underline" style={{ color: lot.color }}>
                      <TrendingUp className="w-3.5 h-3.5" /> Ver números mais sorteados
                    </span>
                  </Link>
                  <Link href={`/${lot.slug}/estatisticas`}>
                    <span className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:underline" style={{ color: lot.color }}>
                      <Clock className="w-3.5 h-3.5" /> Ver números mais atrasados agora
                    </span>
                  </Link>
                  <Link href={`/${lot.slug}/estatisticas`}>
                    <span className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:underline" style={{ color: lot.color }}>
                      <PieChart className="w-3.5 h-3.5" /> Ver frequência completa
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LINKS SEO (acesso rápido) — R8: compactado visualmente ── */}
      <section className="py-8 bg-[#f0f4f8]">
        <div className="container">
          <h2 className="text-lg font-bold text-[#0d1b3e] mb-3">Acesso rápido</h2>
          <div className="flex flex-wrap gap-2 max-w-4xl">
            {[
              { label: "Números mais sorteados da Lotofácil", href: "/lotofacil/estatisticas" },
              { label: "Números atrasados da Lotofácil", href: "/lotofacil/estatisticas" },
              { label: "Resultado da Lotofácil hoje", href: "/lotofacil" },
              { label: "Gerador da Lotofácil", href: "/gerador?loteria=lotofacil" },
              { label: "Números mais sorteados da Mega-Sena", href: "/megasena/estatisticas" },
              { label: "Números atrasados da Mega-Sena", href: "/megasena/estatisticas" },
              { label: "Resultado da Mega-Sena hoje", href: "/megasena" },
              { label: "Gerador da Mega-Sena", href: "/gerador?loteria=megasena" },
              { label: "Estatísticas da Quina", href: "/quina/estatisticas" },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <span className="inline-flex items-center gap-1.5 bg-white rounded-full border border-gray-200 px-3 py-1.5 text-xs text-[#0d1b3e] hover:bg-[#2563eb] hover:text-white hover:border-[#2563eb] transition-all cursor-pointer font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── R8: DIFERENCIAIS CONDENSADOS (8 features em vez de 12) ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50">
              <Star className="w-3 h-3 mr-1 fill-current" /> Plataforma completa
            </Badge>
            <h2 className="text-3xl font-black text-[#0d1b3e] mb-3">Mais do que gerar números</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Ferramentas para acompanhar, organizar e analisar seus jogos de forma profissional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Gerador inteligente",
                desc: "Gere combinações com filtros avançados: frequência, atraso, pares/ímpares e distribuição.",
                color: "#f59e0b",
                bg: "#fffbeb",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Conferidor automático",
                desc: "Confira seus jogos automaticamente assim que o resultado sai. Acertos e prêmios em tempo real.",
                color: "#16a34a",
                bg: "#f0fdf4",
              },
              {
                icon: <Wallet className="w-6 h-6" />,
                title: "Carteira de jogos",
                desc: "Salve seus jogos, organize em pastas e acompanhe resultados automaticamente.",
                color: "#7c3aed",
                bg: "#f5f3ff",
              },
              {
                icon: <TestTube2 className="w-6 h-6" />,
                title: "Simulador histórico",
                desc: "Teste seus números em todos os concursos passados e descubra quanto teria ganho.",
                color: "#2563eb",
                bg: "#eff6ff",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Análise com IA",
                desc: "Inteligência artificial analisa padrões e sugere combinações baseadas em dados.",
                color: "#ec4899",
                bg: "#fdf2f8",
              },
              {
                icon: <BellRing className="w-6 h-6" />,
                title: "Notificações e alertas",
                desc: "Alertas sonoros no site e resultados por e-mail todo dia às 22h.",
                color: "#8b5cf6",
                bg: "#f5f3ff",
              },
              {
                icon: <Rewind className="w-6 h-6" />,
                title: "Backtest de estratégias",
                desc: "Analise o desempenho de qualquer estratégia em concursos reais passados.",
                color: "#ea580c",
                bg: "#fff7ed",
              },
              {
                icon: <FileDown className="w-6 h-6" />,
                title: "PDF e WhatsApp",
                desc: "Exporte jogos em PDF para a lotérica ou compartilhe pelo WhatsApp.",
                color: "#16a34a",
                bg: "#f0fdf4",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#0d1b3e] mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTOMAÇÃO ── */}
      <section className="py-16 bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/10 text-xs">
              <Bell className="w-3 h-3 mr-1.5" /> Automação
            </Badge>
            <h2 className="text-3xl font-black mb-4">Receba os resultados automaticamente</h2>
            <p className="text-white/60 mb-8 leading-relaxed max-w-xl mx-auto">
              Programe o horário e receba os resultados dos seus jogos por e-mail, sem precisar conferir manualmente.
            </p>
            <Link href="/perfil">
              <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold gap-2 h-12">
                <Mail className="w-4 h-4" /> Configurar alertas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="py-16 bg-[#f0f4f8]">
        <div className="container">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-green-50 text-green-700 border-green-100 hover:bg-green-50">
              <Users className="w-3 h-3 mr-1" /> Comunidade
            </Badge>
            <h2 className="text-3xl font-black text-[#0d1b3e] mb-3">O que dizem nossos usuários</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Carlos M.",
                city: "São Paulo, SP",
                text: "Uso o Valtor há 3 meses para analisar a Mega-Sena. A ferramenta de frequência me ajudou a montar jogos muito mais equilibrados.",
                stars: 5,
                initials: "CM",
                color: "#2563eb",
              },
              {
                name: "Ana P.",
                city: "Belo Horizonte, MG",
                text: "O conferidor automático é incrível! Antes eu ficava conferindo na mão. Agora em segundos sei se ganhei alguma coisa.",
                stars: 5,
                initials: "AP",
                color: "#7c3aed",
              },
              {
                name: "Roberto S.",
                city: "Curitiba, PR",
                text: "O e-mail diário com os resultados é muito prático. Chega todo dia às 22h com tudo organizado. Recomendo demais!",
                stars: 5,
                initials: "RS",
                color: "#16a34a",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0d1b3e]">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── R9. CTA INTERMEDIÁRIO — "Pronto para montar seu jogo?" ── */}
      <section className="py-12 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Pronto para montar seu jogo?</h2>
            <p className="text-white/70 mb-6 text-sm md:text-base">Use os dados a seu favor. Gere combinações inteligentes baseadas em estatísticas reais.</p>
            <Link href="/gerador">
              <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold gap-2 shadow-xl h-14 text-base">
                <Zap className="w-5 h-5" /> Gerar jogo agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#0d1b3e] mb-3">Perguntas frequentes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tire suas dúvidas sobre a plataforma e as análises.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ── BANNER MONETIZAÇÃO EUA ── */}
      <section className="py-6 bg-[#f0f4f8]">
        <div className="container">
          <Link href="/blog/mega-millions-vs-powerball-comparativo-completo">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <p className="font-semibold text-[#0d1b3e] group-hover:text-[#2563eb] transition-colors">Saiba como jogar nos EUA com segurança</p>
                <p className="text-xs text-gray-500">Mega Millions e Powerball — entenda como funciona e como participar do Brasil.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#2563eb] ml-auto flex-shrink-0 transition-colors" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── CTA PREMIUM ── */}
      <section className="py-16 bg-[#f0f4f8]">
        <div className="container">
          <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] rounded-3xl p-10 md:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20">
                <Trophy className="w-3 h-3 mr-1 fill-current" /> Clube Valtor Premium
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Leve seu jogo para o próximo nível</h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                Acesso completo a todas as ferramentas, carteira ilimitada e alertas automáticos.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
                {[
                  "Gerador com filtros avançados",
                  "Simulador histórico ilimitado",
                  "Conferidor automático",
                  "Backtest de estratégias",
                  "Carteira de jogos ilimitada",
                  "Análise com inteligência artificial",
                  "TV Valtor ao vivo",
                  "Controle de ROI por loteria",
                  "Exportar jogos em PDF",
                  "Compartilhar no WhatsApp",
                  "Notificações em tempo real",
                  "Alertas por e-mail",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-left">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-white/70">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/planos">
                <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold gap-2 shadow-xl h-14 text-base">
                  <Gift className="w-5 h-5" /> Ver planos e preços
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
