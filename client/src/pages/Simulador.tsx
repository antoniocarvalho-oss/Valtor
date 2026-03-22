import { useState } from "react";
import { Link, useSearch } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { getLotteryColor, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Play, TrendingUp, Trophy, BarChart3, RefreshCw, Lock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import SEO from "@/hooks/useSEO";

type LotterySlug = "mega-sena" | "lotofacil" | "quina";

const LOTTERY_CONFIG = {
  "mega-sena": { min: 1, max: 60, qtd: 6, name: "Mega-Sena", color: "#16a34a" },
  lotofacil: { min: 1, max: 25, qtd: 15, name: "Lotofácil", color: "#7c3aed" },
  quina: { min: 1, max: 80, qtd: 5, name: "Quina", color: "#ea580c" },
};

export default function Simulador() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialSlug = (params.get("loteria") as LotterySlug) ?? "mega-sena";

  const [slug, setSlug] = useState<LotterySlug>(initialSlug);
  const [inputValue, setInputValue] = useState("");
  const [dezenas, setDezenas] = useState<number[]>([]);
  const [ultimosConcursos, setUltimosConcursos] = useState(20);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.assinatura.status.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = subscription?.status === "active";

  const config = LOTTERY_CONFIG[slug];
  const color = config.color;

  const simularQuery = trpc.simulador.simular.useQuery(
    { loteriaSlug: slug, dezenas, ultimosConcursos },
    { enabled: false }
  );

  function handleAddNumber(input: string) {
    const num = parseInt(input.trim());
    if (isNaN(num) || num < config.min || num > config.max) {
      toast.error(`Número inválido. Use entre ${config.min} e ${config.max}`);
      return;
    }
    if (dezenas.includes(num)) {
      toast.error("Número já adicionado");
      return;
    }
    if (dezenas.length >= config.qtd) {
      toast.error(`Máximo de ${config.qtd} números para ${config.name}`);
      return;
    }
    setDezenas(prev => [...prev, num].sort((a, b) => a - b));
    setInputValue("");
  }

  function handleRemove(num: number) {
    setDezenas(prev => prev.filter(n => n !== num));
    setResultado(null);
  }

  async function handleSimular() {
    if (dezenas.length < config.qtd) {
      toast.error(`Adicione ${config.qtd} números para simular`);
      return;
    }
    setLoading(true);
    try {
      const res = await simularQuery.refetch();
      if (res.data) setResultado(res.data);
    } catch (e) {
      toast.error("Erro ao simular. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Simulador Histórico"
        description="Simule seus jogos contra todos os concursos passados. Descubra quantas vezes você teria acertado na Mega-Sena, Lotofácil e Quina."
        path="/simulador"
      />
      <Navbar />

      {/* Header */}
      <div className="text-white py-8" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
        <div className="container">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/"><span className="hover:text-white cursor-pointer">Início</span></Link>
            <span>/</span>
            <span>Simulador Histórico</span>
          </div>
          <h1 className="text-3xl font-black">Simulador Histórico</h1>
          <p className="text-white/70 mt-1">Teste seus números em concursos passados e veja como teriam ido</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Lottery selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-3">Loteria</h3>
              <div className="flex flex-col gap-2">
                {(["mega-sena", "lotofacil", "quina"] as LotterySlug[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSlug(s); setDezenas([]); setResultado(null); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      slug === s ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                    style={slug === s ? { backgroundColor: LOTTERY_CONFIG[s].color } : {}}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LOTTERY_CONFIG[s].color }} />
                    {LOTTERY_CONFIG[s].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Number input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#0d1b3e]">Seus Números</h3>
                <span className="text-xs text-muted-foreground">{dezenas.length}/{config.qtd}</span>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddNumber(inputValue); }}
                  placeholder={`1–${config.max}`}
                  min={config.min}
                  max={config.max}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  size="sm"
                  onClick={() => handleAddNumber(inputValue)}
                  disabled={dezenas.length >= config.qtd}
                  style={{ backgroundColor: color }}
                  className="text-white"
                >
                  +
                </Button>
              </div>

              {dezenas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {dezenas.map(n => (
                    <button
                      key={n}
                      onClick={() => handleRemove(n)}
                      className="w-8 h-8 rounded-full text-white text-xs font-bold hover:opacity-75 transition-opacity"
                      style={{ backgroundColor: color }}
                      title="Clique para remover"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Adicione {config.qtd} números para simular
                </p>
              )}

              {dezenas.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-gray-400"
                  onClick={() => { setDezenas([]); setResultado(null); }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Limpar
                </Button>
              )}
            </div>

            {/* Concursos range */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-3">Período de análise</h3>
              <div className="flex gap-2">
                {[10, 20, 30, 50].map(n => (
                  <button
                    key={n}
                    onClick={() => setUltimosConcursos(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${
                      ultimosConcursos === n ? "text-white border-transparent" : "text-gray-500 border-gray-200"
                    }`}
                    style={ultimosConcursos === n ? { backgroundColor: color } : {}}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">últimos concursos</p>
            </div>

            <Button
              className="w-full gap-2 font-bold"
              size="lg"
              style={{ backgroundColor: color }}
              disabled={dezenas.length < config.qtd || loading}
              onClick={handleSimular}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? "Simulando..." : "Simular"}
            </Button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {!resultado ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
                <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-muted-foreground">Configure seus números e clique em Simular para ver os resultados históricos.</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Concursos analisados", value: resultado.concursosAnalisados, icon: <BarChart3 className="w-4 h-4" /> },
                    { label: "Melhor resultado", value: `${resultado.melhorResultado.acertos} acertos`, icon: <Trophy className="w-4 h-4" /> },
                    { label: "Média de acertos", value: resultado.mediaAcertos.toFixed(2), icon: <TrendingUp className="w-4 h-4" /> },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                      <div className="flex justify-center mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                          {s.icon}
                        </div>
                      </div>
                      <p className="text-xl font-black text-[#0d1b3e]">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-bold text-[#0d1b3e] mb-4">Distribuição de Acertos</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={resultado.resultado.sort((a: any, b: any) => a.acertos - b.acertos)}>
                      <XAxis dataKey="acertos" tick={{ fontSize: 12 }} label={{ value: "Acertos", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [value, "Concursos"]}
                        labelFormatter={(label: number) => `${label} acerto${label !== 1 ? "s" : ""}`}
                      />
                      <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                        {resultado.resultado.map((_: any, i: number) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Melhor concurso */}
                {resultado.melhorResultado.concurso > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4" style={{ color }} />
                      <h3 className="font-bold text-[#0d1b3e]">Melhor Resultado</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Seus números teriam acertado <strong style={{ color }}>{resultado.melhorResultado.acertos} dezenas</strong> no concurso{" "}
                      <Link href={`/${slug}/concurso/${resultado.melhorResultado.concurso}`}>
                        <span className="text-[#2563eb] hover:underline cursor-pointer">#{resultado.melhorResultado.concurso}</span>
                      </Link>.
                    </p>
                  </div>
                )}

                {/* Premium CTA — only show for non-premium users */}
                {!isPremium && (
                  <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #0d1b3e, #1a3a8f)" }}>
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-[#f5a623] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-1">Análise Premium</p>
                        <p className="text-white/70 text-sm mb-3">Simule em até 500 concursos e salve seus jogos na carteira.</p>
                        <Link href="/planos">
                          <Button size="sm" className="bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold">
                            Assinar Clube Valtor
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
