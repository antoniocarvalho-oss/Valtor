import { useState } from "react";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LotteryBall from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { getLotteryColor, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, Lock, UserPlus, Hash } from "lucide-react";

import { useAuth } from "@/_core/hooks/useAuth";
import { LotteryStatsSEO } from "@/hooks/useSEO";
import { getLoginUrl } from "@/const";

// Loterias que têm acesso parcial público (top 5 sem login)
const PARTIAL_ACCESS_SLUGS = ["lotofacil", "megasena"];

export default function LotteryStats() {
  const [location] = useLocation();
  const slug = location.replace(/^\//, "").split("/")[0];
  const color = getLotteryColor(slug);
  const name = getLotteryName(slug);
  const [activeTab, setActiveTab] = useState<"frequencia" | "atraso">("frequencia");
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.assinatura.status.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = subscription?.status === "active";

  const { data: frequencia, isLoading: loadingFreq } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: slug });
  const { data: atraso, isLoading: loadingAtraso } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: slug });
  const { data: primosData, isLoading: loadingPrimos } = trpc.estatisticas.primos.useQuery({ loteriaSlug: slug });

  const freqItems = frequencia?.items ?? [];
  const atrasoItems = atraso?.items ?? [];
  const totalConcursos = frequencia?.totalConcursos ?? atraso?.totalConcursos ?? 0;

  const chartData = activeTab === "frequencia"
    ? freqItems.map((f: { numero: number; frequencia: number }) => ({ numero: f.numero, valor: f.frequencia, label: `${f.numero}` }))
    : atrasoItems.map((a: { numero: number; atraso: number; ultimoConcurso: number }) => ({ numero: a.numero, valor: a.atraso, label: `${a.numero}` }));

  const sorted = [...(chartData)].sort((a, b) => b.valor - a.valor);
  const top10 = sorted.slice(0, 10);
  const bottom10 = sorted.slice(-10).reverse();

  // Gate logic: for Lotofácil and Mega-Sena, non-logged users see top 5 only
  const hasPartialAccess = PARTIAL_ACCESS_SLUGS.includes(slug);
  const isGated = hasPartialAccess && !isAuthenticated;
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  // For the top/bottom lists, show 5 or 10 depending on gate
  const displayTop = isGated ? top5 : top10;
  const displayBottom = isGated ? bottom5 : bottom10;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <LotteryStatsSEO slug={slug} />
      <Navbar />

      {/* Header */}
      <div className="text-white py-8" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
        <div className="container">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/"><span className="hover:text-white cursor-pointer">Início</span></Link>
            <ArrowRight className="w-3 h-3" />
            <Link href={`/${slug}`}><span className="hover:text-white cursor-pointer">{name}</span></Link>
            <ArrowRight className="w-3 h-3" />
            <span>Estatísticas</span>
          </div>
          <h1 className="text-3xl font-black">
            {activeTab === "frequencia"
              ? `Números mais sorteados — ${name}`
              : `Números atrasados — ${name}`}
          </h1>
          <p className="text-white/70 mt-1">
            Frequência e atraso dos números com base em {totalConcursos > 0 ? totalConcursos.toLocaleString("pt-BR") : "todos os"} concursos
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "frequencia", label: "Números mais sorteados", icon: <BarChart3 className="w-4 h-4" /> },
            { key: "atraso", label: "Números atrasados", icon: <TrendingDown className="w-4 h-4" /> },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              className={`gap-1.5 ${activeTab === tab.key ? "text-white" : ""}`}
              style={activeTab === tab.key ? { backgroundColor: color, borderColor: color } : {}}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart — gated with blur for non-logged users */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
            <h2 className="font-bold text-[#0d1b3e] mb-1">
              {activeTab === "frequencia" ? "Frequência de Sorteio" : "Números Mais Atrasados"}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {activeTab === "frequencia"
                ? `Quantas vezes cada número foi sorteado em ${totalConcursos.toLocaleString("pt-BR")} concursos`
                : `Há quantos concursos cada número não é sorteado (${totalConcursos.toLocaleString("pt-BR")} concursos analisados)`}
            </p>

            {(loadingFreq || loadingAtraso) ? (
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <div className="relative">
                <div className={isGated ? "blur-sm pointer-events-none select-none" : ""}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 20)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number) => [value, activeTab === "frequencia" ? "Sorteios" : "Concursos"]}
                        labelFormatter={(label) => `Número ${label}`}
                      />
                      <Bar dataKey="valor" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              top10.some(t => t.numero === entry.numero)
                                ? color
                                : bottom10.some(b => b.numero === entry.numero)
                                ? "#e2e8f0"
                                : `${color}88`
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {isGated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 text-center max-w-sm mx-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-[#2563eb]" />
                      </div>
                      <p className="font-bold text-[#0d1b3e] mb-1">Gráfico completo</p>
                      <p className="text-sm text-gray-500 mb-4">Crie uma conta grátis para ver o gráfico com todos os números.</p>
                      <a href={getLoginUrl()}>
                        <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold gap-2 w-full">
                          <UserPlus className="w-4 h-4" /> Criar conta grátis
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top/Bottom lists */}
          <div className="space-y-5">
            {/* Top list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" style={{ color }} />
                <h3 className="font-bold text-[#0d1b3e] text-sm">
                  {activeTab === "frequencia" ? "Mais Sorteados" : "Mais Atrasados"}
                </h3>
                {isGated && <span className="text-[10px] text-gray-400 ml-auto">Top 5</span>}
              </div>
              <div className="space-y-2">
                {displayTop.map((item, i) => (
                  <div key={item.numero} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                      <LotteryBall number={item.numero} loteria={slug} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${Math.round((item.valor / displayTop[0].valor) * 60)}px`,
                        backgroundColor: color,
                        opacity: 0.7,
                      }} />
                      <span className="text-xs font-bold text-[#0d1b3e] w-8 text-right">{item.valor}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gate CTA after top 5 */}
              {isGated && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a href={getLoginUrl()} className="flex items-center justify-center gap-2 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
                    <Lock className="w-3.5 h-3.5" />
                    Ver análise completa → criar conta grátis
                  </a>
                </div>
              )}
            </div>

            {/* Bottom list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-[#0d1b3e] text-sm">
                  {activeTab === "frequencia" ? "Menos Sorteados" : "Menos Atrasados"}
                </h3>
                {isGated && <span className="text-[10px] text-gray-400 ml-auto">Top 5</span>}
              </div>
              <div className="space-y-2">
                {displayBottom.map((item, i) => (
                  <div key={item.numero} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                      <LotteryBall number={item.numero} loteria={slug} size="sm" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 w-8 text-right">{item.valor}</span>
                  </div>
                ))}
              </div>

              {/* Gate CTA after bottom 5 */}
              {isGated && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a href={getLoginUrl()} className="flex items-center justify-center gap-2 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
                    <Lock className="w-3.5 h-3.5" />
                    Ver análise completa → criar conta grátis
                  </a>
                </div>
              )}
            </div>

            {/* CTA — only show for non-premium users */}
            {!isPremium && (
              <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, #0d1b3e, #1a3a8f)` }}>
                <p className="font-bold text-sm mb-1">Análise Premium</p>
                <p className="text-white/70 text-xs mb-3">Acesse padrões avançados e análise de combinações.</p>
                <Link href="/planos">
                  <Button size="sm" className="w-full bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold text-xs">
                    Assinar Clube Valtor
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* All numbers grid — gated for non-logged users */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
          <h2 className="font-bold text-[#0d1b3e] mb-4">
            {activeTab === "frequencia" ? "Frequência de Todos os Números" : "Atraso de Todos os Números"}
          </h2>
          {(loadingFreq || loadingAtraso) ? (
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2 animate-pulse">
              {Array.from({ length: 60 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <div className="relative">
              {/* Show first 5 numbers clearly, rest blurred if gated */}
              <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                {chartData.map((item, idx) => {
                  const maxVal = Math.max(...chartData.map(d => d.valor));
                  const intensity = item.valor / maxVal;
                  const isBlurred = isGated && idx >= 5;
                  return (
                    <div
                      key={item.numero}
                      className={`flex flex-col items-center p-2 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors ${
                        isBlurred ? "blur-sm select-none" : ""
                      }`}
                    >
                      <LotteryBall number={item.numero} loteria={slug} size="sm" />
                      <span className="text-xs font-bold mt-1.5" style={{ color, opacity: 0.5 + intensity * 0.5 }}>
                        {item.valor}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Gate overlay */}
              {isGated && (
                <div className="absolute inset-x-0 bottom-0 h-3/4 flex items-end justify-center pb-8 bg-gradient-to-t from-white via-white/90 to-transparent">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      <Lock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      Crie uma conta grátis para ver a frequência de todos os números
                    </p>
                    <a href={getLoginUrl()}>
                      <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold gap-2">
                        <UserPlus className="w-4 h-4" /> Ver análise completa → criar conta grátis
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primos vs Não-Primos Section */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-5 h-5" style={{ color }} />
            <h2 className="font-bold text-[#0d1b3e]">Números Primos vs Não-Primos</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Análise da distribuição de números primos nos sorteios da {name}
          </p>

          {loadingPrimos ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : primosData?.primos ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color }}>{primosData.primos.primosNoRange.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Primos no range</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color }}>{primosData.primos.mediaPrimosPorConcurso}</p>
                  <p className="text-xs text-gray-500 mt-1">Média por concurso</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color }}>
                    {primosData.primos.distribuicao.reduce((max, d) => d.ocorrencias > max.ocorrencias ? d : max, { qtdPrimos: 0, ocorrencias: 0, percentual: 0 }).qtdPrimos}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Qtd mais frequente</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color }}>
                    {primosData.primos.distribuicao.reduce((max, d) => d.ocorrencias > max.ocorrencias ? d : max, { qtdPrimos: 0, ocorrencias: 0, percentual: 0 }).percentual}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">% da moda</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution chart */}
                <div>
                  <h3 className="font-bold text-sm text-[#0d1b3e] mb-3">Distribuição: quantos primos por concurso</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={primosData.primos.distribuicao} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <XAxis dataKey="qtdPrimos" tick={{ fontSize: 11 }} label={{ value: "Qtd primos", position: "insideBottom", offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number, _name: string, props: any) => [
                          `${value} concursos (${props.payload.percentual}%)`,
                          "Ocorrências"
                        ]}
                        labelFormatter={(label) => `${label} número(s) primo(s)`}
                      />
                      <Bar dataKey="ocorrencias" radius={[4, 4, 0, 0]}>
                        {primosData.primos.distribuicao.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.qtdPrimos === primosData.primos.distribuicao.reduce((max, d) => d.ocorrencias > max.ocorrencias ? d : max, { qtdPrimos: 0, ocorrencias: 0, percentual: 0 }).qtdPrimos ? color : `${color}55`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Primes list */}
                <div>
                  <h3 className="font-bold text-sm text-[#0d1b3e] mb-3">Números primos no range ({primosData.primos.primosNoRange.length} números)</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {primosData.primos.primosNoRange.map(num => {
                      const freqItem = primosData.primos.frequenciaPrimos.find(f => f.numero === num);
                      return (
                        <div key={num} className="flex flex-col items-center">
                          <LotteryBall number={num} loteria={slug} size="sm" />
                          <span className="text-[10px] text-gray-400 mt-0.5">{freqItem?.frequencia ?? 0}x</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Números primos entre {primosData.primos.primosNoRange[0]} e {primosData.primos.primosNoRange[primosData.primos.primosNoRange.length - 1]}.
                    Em média, {primosData.primos.mediaPrimosPorConcurso} primos saem por concurso.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* CTA Bar */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/gerador?loteria=${slug}`}>
              <Button className="w-full sm:w-auto h-12 gap-2 font-semibold px-8" style={{ backgroundColor: color }}>
                Gerar jogo agora
              </Button>
            </Link>
            <Link href={`/${slug}`}>
              <Button variant="outline" className="w-full sm:w-auto h-12 gap-2 font-semibold px-8">
                Ver resultado de hoje
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
