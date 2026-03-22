import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { Flame, Clock, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const LOTTERIES = [
  { slug: "megasena",       name: "Mega-Sena",    color: "#16a34a", colorDark: "#14532d", colorLight: "#dcfce7", icon: "🍀" },
  { slug: "lotofacil",      name: "Lotofácil",    color: "#7c3aed", colorDark: "#4c1d95", colorLight: "#ede9fe", icon: "🎯" },
  { slug: "quina",          name: "Quina",        color: "#ea580c", colorDark: "#7c2d12", colorLight: "#ffedd5", icon: "🎰" },
  { slug: "lotomania",      name: "Lotomania",    color: "#0ea5e9", colorDark: "#0c4a6e", colorLight: "#e0f2fe", icon: "🌀" },
  { slug: "timemania",      name: "Timemania",    color: "#dc2626", colorDark: "#7f1d1d", colorLight: "#fee2e2", icon: "⚽" },
  { slug: "duplasena",      name: "Dupla Sena",   color: "#d97706", colorDark: "#78350f", colorLight: "#fef3c7", icon: "🎲" },
  { slug: "diadesorte",     name: "Dia de Sorte", color: "#db2777", colorDark: "#831843", colorLight: "#fce7f3", icon: "🌸" },
  { slug: "supersete",      name: "Super Sete",   color: "#059669", colorDark: "#064e3b", colorLight: "#d1fae5", icon: "7️⃣" },
  { slug: "maismilionaria", name: "+Milionária",  color: "#6366f1", colorDark: "#312e81", colorLight: "#e0e7ff", icon: "💎" },
];

function useCountdown(targetDateStr: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDateStr) { setTimeLeft(null); return; }

    const parseTarget = () => {
      try {
        // Format: "DD/MM/YYYY"
        const [day, month, year] = targetDateStr.split("/");
        // Sorteios às 21h Brasília (UTC-3) — desde 03/11/2025
        return new Date(`${year}-${month}-${day}T21:00:00-03:00`).getTime();
      } catch { return null; }
    };

    const target = parseTarget();
    if (!target) { setTimeLeft(null); return; }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return timeLeft;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatDataProximo(dataStr: string | null | undefined): string {
  if (!dataStr) return "";
  try {
    const [day, month, year] = dataStr.split("/");
    const date = new Date(`${year}-${month}-${day}T21:00:00-03:00`);
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}/${month} às 21h`;
  } catch { return dataStr; }
}

function CarouselCard({ slug, name, color, colorDark, colorLight, icon }: (typeof LOTTERIES)[0]) {
  const { data: proximo, isLoading } = trpc.concursos.proximoSorteio.useQuery({ loteriaSlug: slug });
  const countdown = useCountdown(proximo?.dataProximoConcurso);

  const isAccumulated = proximo?.acumulou ?? false;
  const valorEstimado = proximo?.valorEstimadoProximo ?? 0;
  const prizeDisplay = valorEstimado > 0 ? formatCurrency(valorEstimado) : "A confirmar";
  const nextConcurso = proximo?.proximoConcurso;
  const dataFormatada = formatDataProximo(proximo?.dataProximoConcurso);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colorDark} 0%, ${color} 60%, ${color}cc 100%)`,
        minHeight: "320px",
      }}
    >
      {/* Círculos decorativos de fundo */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
        style={{ background: "white" }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: "white" }}
      />

      <div className="relative z-10 p-7 flex flex-col h-full" style={{ minHeight: "320px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <h3 className="text-white font-black text-xl leading-tight">{name}</h3>
              {nextConcurso && (
                <span className="text-white/70 text-sm font-medium">Concurso #{nextConcurso}</span>
              )}
            </div>
          </div>
          {isAccumulated && (
            <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5" /> ACUMULADO
            </span>
          )}
        </div>

        {/* Valor do prêmio */}
        <div className="mb-5">
          <p className="text-white/70 text-sm mb-1">
            {isAccumulated ? "Prêmio acumulado estimado" : "Prêmio estimado"}
          </p>
          {isLoading ? (
            <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <p className="text-white font-black text-4xl leading-none tracking-tight">
              {prizeDisplay}
            </p>
          )}
        </div>

        {/* Data do sorteio */}
        {dataFormatada && (
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-white/70" />
            <span className="text-white/90 text-sm font-medium">{dataFormatada}</span>
          </div>
        )}

        {/* Contagem regressiva */}
        <div className="mb-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2 font-semibold">
            Encerra em
          </p>
          {countdown ? (
            <div className="flex items-center gap-2">
              {[
                { label: "horas", value: countdown.hours },
                { label: "min", value: countdown.minutes },
                { label: "seg", value: countdown.seconds },
              ].map(({ label, value }, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="text-center">
                    <div
                      className="text-white font-black text-2xl w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
                    >
                      {pad(value)}
                    </div>
                    <span className="text-white/60 text-[10px] uppercase tracking-wide mt-1 block">{label}</span>
                  </div>
                  {i < 2 && <span className="text-white/60 font-bold text-xl mb-4">:</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-14 h-14 rounded-xl bg-white/20 animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link href={`/${slug}`}>
            <button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Ver análise completa <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LotteryCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % LOTTERIES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + LOTTERIES.length) % LOTTERIES.length), []);

  // Avança automaticamente a cada 5 segundos
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const lottery = LOTTERIES[current];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card principal */}
      <div className="relative">
        <CarouselCard key={lottery.slug} {...lottery} />

        {/* Botões de navegação */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-20"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", color: "white" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-20"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", color: "white" }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicadores / dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {LOTTERIES.map((l, i) => (
          <button
            key={l.slug}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
              background: i === current ? lottery.color : "#cbd5e1",
            }}
          />
        ))}
      </div>

      {/* Miniaturas das outras loterias */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        {LOTTERIES.map((l, i) => (
          <button
            key={l.slug}
            onClick={() => setCurrent(i)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
            style={{
              background: i === current ? l.color : `${l.color}18`,
              color: i === current ? "white" : l.color,
              border: `1px solid ${l.color}40`,
            }}
          >
            <span>{l.icon}</span>
            <span className="hidden sm:inline">{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
