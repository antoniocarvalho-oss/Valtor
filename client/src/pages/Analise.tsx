import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Flame,
  Clock,
  ArrowRight,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import SEO from "@/hooks/useSEO";

const LOTERIAS = [
  { slug: "megasena",       label: "Mega-Sena",    color: "#16a34a", bg: "#dcfce7", emoji: "🍀" },
  { slug: "lotofacil",      label: "Lotofácil",    color: "#7c3aed", bg: "#ede9fe", emoji: "🎯" },
  { slug: "quina",          label: "Quina",        color: "#ea580c", bg: "#ffedd5", emoji: "🎰" },
  { slug: "lotomania",      label: "Lotomania",    color: "#0ea5e9", bg: "#e0f2fe", emoji: "🌀" },
  { slug: "timemania",      label: "Timemania",    color: "#dc2626", bg: "#fee2e2", emoji: "⚽" },
  { slug: "duplasena",      label: "Dupla Sena",   color: "#d97706", bg: "#fef3c7", emoji: "🎲" },
  { slug: "diadesorte",     label: "Dia de Sorte", color: "#db2777", bg: "#fce7f3", emoji: "🌸" },
  { slug: "supersete",      label: "Super Sete",   color: "#059669", bg: "#d1fae5", emoji: "7️⃣" },
  { slug: "maismilionaria", label: "+Milionária",  color: "#6366f1", bg: "#e0e7ff", emoji: "💎" },
];

function LastResult({ dezenas, color }: { dezenas: number[]; color: string }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-2">Último resultado</p>
      <div className="flex flex-wrap gap-1">
        {dezenas.slice(0, 6).map((d) => (
          <span
            key={d}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: color }}
          >
            {d}
          </span>
        ))}
        {dezenas.length > 6 && (
          <span className="text-xs text-gray-400 self-center">+{dezenas.length - 6}</span>
        )}
      </div>
    </div>
  );
}

function LotteryAnalysisCard({ loteria }: { loteria: typeof LOTERIAS[0] }) {
  const { data: freq, isLoading: freqLoading } = trpc.estatisticas.frequencia.useQuery(
    { loteriaSlug: loteria.slug },
    { staleTime: 5 * 60 * 1000 }
  );
  const { data: ultimo } = trpc.concursos.ultimo.useQuery(
    { loteriaSlug: loteria.slug },
    { staleTime: 5 * 60 * 1000 }
  );

  const freqItems = freq?.items ?? [];
  const topQuentes = freqItems.slice(0, 5);
  const topFrios = [...freqItems].sort((a, b) => a.frequencia - b.frequencia).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: loteria.bg }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{loteria.emoji}</span>
          <div>
            <h3 className="font-black text-[#0d1b3e] text-base leading-tight">{loteria.label}</h3>
            {ultimo && (
              <p className="text-xs text-gray-500">Concurso #{ultimo.numero}</p>
            )}
          </div>
        </div>
        <Link href={`/${loteria.slug}/estatisticas`}>
          <Button size="sm" variant="ghost" className="text-xs gap-1 h-7 px-2" style={{ color: loteria.color }}>
            Ver tudo <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Body */}
      <div className="p-5">
        {freqLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Mais sorteados */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mais Sorteados</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topQuentes.map((item: { numero: number; frequencia: number }) => (
                  <div key={item.numero} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: loteria.color }}
                    >
                      {item.numero}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: loteria.color }}>
                      {item.frequencia}x
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Menos sorteados */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Menos Sorteados</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topFrios.map((item: { numero: number; frequencia: number }) => (
                  <div key={item.numero} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2"
                      style={{ borderColor: loteria.color, color: loteria.color, background: loteria.bg }}
                    >
                      {item.numero}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {item.frequencia}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Last result */}
        {ultimo?.dezenas ? (
          <LastResult dezenas={ultimo.dezenas as number[]} color={loteria.color} />
        ) : null}
      </div>
    </div>
  );
}

export default function Analise() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Análise de Loterias"
        description="Análise completa de todas as loterias da Caixa. Números quentes, frios, tendências e padrões para Mega-Sena, Lotofácil, Quina e mais."
        path="/analise"
      />
      <Navbar />

      {/* Hero */}
      <section
        className="py-16 text-white"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 100%)" }}
      >
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/40 hover:bg-[#f5a623]/20">
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" /> Análise Estatística
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Análise das{" "}
            <span style={{ color: "#f5a623" }}>9 Loterias</span>
          </h1>
          <p className="text-white/70 max-w-xl text-lg leading-relaxed">
            Visualize os números mais e menos sorteados, tendências e padrões de cada loteria da Caixa em tempo real.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { icon: <TrendingUp className="w-4 h-4" />, label: "Mais Sorteados", desc: "Top 5 mais sorteados" },
              { icon: <TrendingDown className="w-4 h-4" />, label: "Menos Sorteados", desc: "Top 5 menos sorteados" },
              { icon: <BarChart2 className="w-4 h-4" />, label: "9 loterias", desc: "Dados em tempo real" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 text-white/80">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-bold">{s.label}</p>
                  <p className="text-xs text-white/50">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="container py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedSlug(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSlug === null
                  ? "bg-[#0d1b3e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            {LOTERIAS.map(l => (
              <button
                key={l.slug}
                onClick={() => setSelectedSlug(selectedSlug === l.slug ? null : l.slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSlug === l.slug
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={selectedSlug === l.slug ? { background: l.color } : {}}
              >
                <span>{l.emoji}</span> {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de análises */}
      <section className="py-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LOTERIAS.filter(l => selectedSlug === null || l.slug === selectedSlug).map(loteria => (
              <LotteryAnalysisCard key={loteria.slug} loteria={loteria} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA premium */}
      <section className="py-16 bg-white">
        <div className="container">
          <div
            className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 100%)" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="relative">
              <Badge className="mb-4 bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/40 hover:bg-[#f5a623]/20">
                <Flame className="w-3.5 h-3.5 mr-1.5" /> Clube Valtor Premium
              </Badge>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                Análises ainda mais profundas
              </h2>
              <p className="text-white/70 max-w-lg mx-auto mb-6">
                Acesse estatísticas avançadas, análise de padrões, pares quentes/frios e muito mais com o Clube Valtor.
              </p>
              <Link href="/planos">
                <Button
                  size="lg"
                  className="font-bold gap-2 text-[#0d1b3e] hover:opacity-90"
                  style={{ background: "#f5a623" }}
                >
                  Ver planos <ArrowRight className="w-4 h-4" />
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
