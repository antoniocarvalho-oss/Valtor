import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { ALL_LOTTERIES } from "@/components/LotteryHeroCards";
import { ArrowRight, Calendar, Trophy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SEO from "@/hooks/useSEO";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function ResultCard({ slug, shortName, color, colorLight, icon }: (typeof ALL_LOTTERIES)[0]) {
  const { data: concurso, isLoading } = trpc.concursos.ultimo.useQuery({ loteriaSlug: slug });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2 mb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-9 h-9 rounded-full bg-gray-100" />
          ))}
        </div>
        <div className="h-3 w-40 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!concurso) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: colorLight }}>
            {icon}
          </div>
          <span className="text-sm font-black tracking-widest uppercase" style={{ color }}>{shortName}</span>
        </div>
        <p className="text-sm text-gray-400">Resultado ainda não disponível.</p>
      </div>
    );
  }

  const dezenas = concurso.dezenas as number[];
  const ganhadores = concurso.ganhadores as Array<{ faixa: string; ganhadores: number; premio: string }> | null;
  const temGanhador = ganhadores?.some(g => g.faixa?.includes("6") && g.ganhadores > 0);

  return (
    <Link href={`/${slug}/concurso/${concurso.numero}`}>
      <div
        className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
        style={{ borderTopColor: color, borderTopWidth: 3 }}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: colorLight }}>
                {icon}
              </div>
              <div>
                <span className="text-xs font-black tracking-widest uppercase block" style={{ color }}>{shortName}</span>
                <span className="text-[10px] text-gray-400">Concurso {concurso.numero}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>

          {/* Dezenas */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {dezenas.map((n) => (
              <span
                key={n}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={{ backgroundColor: color }}
              >
                {String(n).padStart(2, "0")}
              </span>
            ))}
          </div>

          {/* Data + ganhador */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(concurso.dataSorteio instanceof Date ? concurso.dataSorteio.toISOString() : concurso.dataSorteio)}
            </div>
            {temGanhador && (
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] gap-1">
                <Trophy className="w-2.5 h-2.5" /> Ganhador
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Resultados() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Resultados das Loterias"
        description="Resultados atualizados de todas as loterias da Caixa: Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária."
        path="/resultados"
      />
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#0d1b3e] pt-16 pb-12">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Últimos Resultados</h1>
          <p className="text-white/60 max-w-lg mx-auto">
            Confira o resultado mais recente de cada uma das 9 loterias da Caixa Econômica Federal.
          </p>
        </div>
      </section>

      {/* Grid de resultados */}
      <section className="py-10">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_LOTTERIES.map((lottery) => (
              <ResultCard key={lottery.slug} {...lottery} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
