import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Flame, TrendingUp, Calendar, Radio, Clock } from "lucide-react";

export const ALL_LOTTERIES = [
  { slug: "megasena",       shortName: "MEGA-SENA",    color: "#16a34a", colorLight: "#dcfce7", icon: "🍀", draws: "Ter, Qui e Sáb" },
  { slug: "lotofacil",      shortName: "LOTOFÁCIL",    color: "#7c3aed", colorLight: "#ede9fe", icon: "🎯", draws: "Seg a Sáb" },
  { slug: "quina",          shortName: "QUINA",        color: "#ea580c", colorLight: "#ffedd5", icon: "🎰", draws: "Seg a Sáb" },
  { slug: "lotomania",      shortName: "LOTOMANIA",    color: "#0ea5e9", colorLight: "#e0f2fe", icon: "🌀", draws: "Seg, Qua e Sex" },
  { slug: "timemania",      shortName: "TIMEMANIA",    color: "#dc2626", colorLight: "#fee2e2", icon: "⚽", draws: "Ter, Qui e Sáb" },
  { slug: "duplasena",      shortName: "DUPLA SENA",   color: "#d97706", colorLight: "#fef3c7", icon: "🎲", draws: "Ter, Qui e Sáb" },
  { slug: "diadesorte",     shortName: "DIA DE SORTE", color: "#db2777", colorLight: "#fce7f3", icon: "🌸", draws: "Ter, Qui e Sáb" },
  { slug: "supersete",      shortName: "SUPER SETE",   color: "#059669", colorLight: "#d1fae5", icon: "7️⃣", draws: "Seg, Qua e Sex" },
  { slug: "maismilionaria", shortName: "+MILIONÁRIA",  color: "#6366f1", colorLight: "#e0e7ff", icon: "💎", draws: "Qua e Sáb" },
  // Loterias Americanas
  { slug: "mega-millions",  shortName: "MEGA MILLIONS", color: "#1d4ed8", colorLight: "#dbeafe", icon: "🇺🇸", draws: "Ter e Sex (EUA)" },
  { slug: "powerball",      shortName: "POWERBALL",     color: "#dc2626", colorLight: "#fee2e2", icon: "🇺🇸", draws: "Seg, Qua e Sáb (EUA)" },
];

// Dias em que cada loteria sorteia (0=Dom, 1=Seg, ..., 6=Sáb)
const SORTEIO_DIAS: Record<string, number[]> = {
  megasena:       [2, 4, 6],
  lotofacil:      [1, 2, 3, 4, 5, 6],
  quina:          [1, 2, 3, 4, 5, 6],
  lotomania:      [1, 3, 5],
  timemania:      [2, 4, 6],
  duplasena:      [2, 4, 6],
  diadesorte:     [2, 4, 6],
  supersete:      [1, 3, 5],
  maismilionaria: [3, 6],
  "mega-millions": [2, 5],
  powerball:       [1, 3, 6],
};

function useIsAoVivo(slug: string): boolean {
  const [aoVivo, setAoVivo] = useState(false);
  useEffect(() => {
    function check() {
      const now = new Date();
      const dia = now.getDay();
      const min = now.getHours() * 60 + now.getMinutes();
      const dias = SORTEIO_DIAS[slug] ?? [];
      setAoVivo(dias.includes(dia) && min >= 20 * 60 + 45 && min < 21 * 60 + 30);
    }
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [slug]);
  return aoVivo;
}

function useCountdown(targetDateStr: string | null | undefined) {
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

function formatCountdown(t: { d: number; h: number; m: number; s: number }): string {
  if (t.d > 0) return `${t.d}d ${pad(t.h)}h ${pad(t.m)}m`;
  if (t.h > 0) return `${pad(t.h)}h ${pad(t.m)}m ${pad(t.s)}s`;
  return `${pad(t.m)}m ${pad(t.s)}s`;
}

function LotteryCard({ slug, shortName, color, colorLight, icon, draws }: (typeof ALL_LOTTERIES)[0]) {
  const { data: proximo, isLoading } = trpc.concursos.proximoSorteio.useQuery({ loteriaSlug: slug });
  const aoVivo = useIsAoVivo(slug);
  const countdown = useCountdown(proximo?.dataProximoConcurso);

  const isAccumulated = proximo?.acumulou ?? false;
  const valorEstimado = proximo?.valorEstimadoProximo ?? 0;
  const prizeDisplay = valorEstimado > 0 ? formatCurrency(valorEstimado) : "A confirmar";
  const nextConcurso = proximo?.proximoConcurso;
  const ultimoConcurso = proximo?.ultimoConcurso;
  const dataUltimoSorteio = proximo?.dataUltimoSorteio;

  const href = aoVivo ? "/tv-valtor" : `/${slug}`;

  return (
    <Link href={href}>
      <div
        className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${aoVivo ? "ring-2 ring-red-500 ring-offset-1" : ""}`}
        style={{
          background: "#ffffff",
          border: `1.5px solid ${colorLight}`,
          boxShadow: `0 2px 10px ${color}10`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 20px ${color}22`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 10px ${color}10`;
        }}
      >
        {/* Barra colorida no topo */}
        <div className="h-1 w-full" style={{ background: color }} />

        <div className="px-4 py-3 flex items-start gap-3">
          {/* Ícone */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
            style={{ background: colorLight }}
          >
            {icon}
          </div>

          {/* Info central */}
          <div className="flex-1 min-w-0">
            {/* Nome + badge acumulado */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-black tracking-widest uppercase" style={{ color }}>
                {shortName}
              </span>
              {aoVivo && (
                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex items-center gap-0.5 bg-red-600 text-white animate-pulse">
                  <Radio className="w-2.5 h-2.5" /> AO VIVO
                </span>
              )}
              {!aoVivo && isAccumulated && (
                <span
                  className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                  style={{ background: `${color}18`, color }}
                >
                  <Flame className="w-2.5 h-2.5" /> ACUMULADO
                </span>
              )}
            </div>

            {/* Último concurso + data */}
            {!isLoading && ultimoConcurso && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-gray-400">
                  Último: <span className="font-semibold text-gray-500">#{ultimoConcurso}</span>
                  {dataUltimoSorteio && <span className="ml-1">({dataUltimoSorteio})</span>}
                </span>
              </div>
            )}

            {/* Valor estimado */}
            {isLoading ? (
              <div className="h-5 w-28 bg-gray-100 rounded animate-pulse mb-1" />
            ) : (
              <div className="flex items-center gap-1 mb-1">
                {isAccumulated
                  ? <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  : <TrendingUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                }
                <span
                  className="text-sm font-black"
                  style={{ color: isAccumulated ? color : "#0d1b3e" }}
                >
                  {prizeDisplay}
                </span>
              </div>
            )}

            {/* Contagem regressiva individual */}
            {isLoading ? (
              <div className="h-3 w-36 bg-gray-100 rounded animate-pulse" />
            ) : countdown ? (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-[10px] text-gray-500 font-medium">
                  {countdown.d === 0 && countdown.h === 0 && countdown.m === 0 && countdown.s === 0
                    ? "Sorteio encerrado"
                    : `Próximo em ${formatCountdown(countdown)}`
                  }
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-[10px] text-gray-500">{draws}</span>
              </div>
            )}
          </div>

          {/* Concurso próximo + seta */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0 mt-0.5">
            {nextConcurso && (
              <span className="text-[10px] text-gray-400 font-medium">#{nextConcurso}</span>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LotteryHeroCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full pb-4">
      {ALL_LOTTERIES.map((lottery) => (
        <LotteryCard key={lottery.slug} {...lottery} />
      ))}
    </div>
  );
}
