import { Link } from "wouter";
import { BallRow } from "./LotteryBall";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";

const LOTTERY_CONFIG: Record<string, {
  name: string;
  color: string;
  lightColor: string;
  borderColor: string;
  icon: string;
  ballCount: number;
}> = {
  "megasena": {
    name: "Mega-Sena",
    color: "#16a34a",
    lightColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: "🍀",
    ballCount: 6,
  },
  "mega-sena": {
    name: "Mega-Sena",
    color: "#16a34a",
    lightColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: "🍀",
    ballCount: 6,
  },
  "lotofacil": {
    name: "Lotofácil",
    color: "#7c3aed",
    lightColor: "#faf5ff",
    borderColor: "#e9d5ff",
    icon: "🎯",
    ballCount: 15,
  },
  "quina": {
    name: "Quina",
    color: "#ea580c",
    lightColor: "#fff7ed",
    borderColor: "#fed7aa",
    icon: "🎰",
    ballCount: 5,
  },
  "lotomania": {
    name: "Lotomania",
    color: "#0ea5e9",
    lightColor: "#e0f2fe",
    borderColor: "#bae6fd",
    icon: "🌀",
    ballCount: 20,
  },
  "timemania": {
    name: "Timemania",
    color: "#dc2626",
    lightColor: "#fee2e2",
    borderColor: "#fca5a5",
    icon: "⚽",
    ballCount: 7,
  },
  "duplasena": {
    name: "Dupla Sena",
    color: "#d97706",
    lightColor: "#fef3c7",
    borderColor: "#fde68a",
    icon: "🎲",
    ballCount: 6,
  },
  "diadesorte": {
    name: "Dia de Sorte",
    color: "#db2777",
    lightColor: "#fce7f3",
    borderColor: "#f9a8d4",
    icon: "🌸",
    ballCount: 7,
  },
  "supersete": {
    name: "Super Sete",
    color: "#059669",
    lightColor: "#d1fae5",
    borderColor: "#6ee7b7",
    icon: "7️⃣",
    ballCount: 7,
  },
  "maismilionaria": {
    name: "+Milionária",
    color: "#6366f1",
    lightColor: "#e0e7ff",
    borderColor: "#c7d2fe",
    icon: "💎",
    ballCount: 6,
  },
};

interface LotteryCardProps {
  slug: string;
}

export default function LotteryCard({ slug }: LotteryCardProps) {
  const config = LOTTERY_CONFIG[slug] ?? {
    name: slug,
    color: "#6b7280",
    lightColor: "#f9fafb",
    borderColor: "#e5e7eb",
    icon: "🎱",
    ballCount: 6,
  };

  const { data: concurso, isLoading } = trpc.concursos.ultimo.useQuery({ loteriaSlug: slug });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-14 w-full" style={{ backgroundColor: config.color }} />
        <div className="p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: Math.min(config.ballCount, 10) }).map((_, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-gray-200" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const dezenas = (concurso?.dezenas as number[]) ?? [];
  const ganhadores = concurso?.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null;
  const premioMaximo = ganhadores?.[0];

  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: config.borderColor }}>
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between text-white"
        style={{ backgroundColor: config.color }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <span className="font-bold text-lg">{config.name}</span>
        </div>
        {concurso && (
          <span className="text-sm opacity-80">Concurso {concurso.numero}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {concurso ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {formatDate(concurso.dataSorteio as Date)}
            </p>

            {/* Balls */}
            <div className="mb-4">
              <BallRow
                numbers={dezenas.slice(0, config.ballCount)}
                loteria={slug as any}
                size={config.ballCount > 10 ? "sm" : "md"}
              />
            </div>

            {/* Prize */}
            {premioMaximo && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">{premioMaximo.faixa}</p>
                  <p className="font-bold text-[#0d1b3e]">
                    {premioMaximo.quantidade > 0
                      ? formatCurrency(premioMaximo.premio)
                      : <span className="text-amber-600">Acumulado</span>
                    }
                  </p>
                </div>
                {premioMaximo.quantidade > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {premioMaximo.quantidade} ganhador{premioMaximo.quantidade !== 1 ? "es" : ""}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Carregando resultado...
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1"
              style={{ borderColor: config.color, color: config.color }}>
              Ver Análise <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
          <Link href={`/gerador?loteria=${slug}`} className="flex-1">
            <Button size="sm" className="w-full text-xs text-white"
              style={{ backgroundColor: config.color }}>
              Gerar Jogo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
