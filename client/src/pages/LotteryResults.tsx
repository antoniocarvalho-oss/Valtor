import { useState } from "react";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, formatDateShort, getLotteryColor, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search, TrendingUp, BarChart3, Zap, Calendar } from "lucide-react";
import { LotteryResultsSEO } from "@/hooks/useSEO";

export default function LotteryResults() {
  const [location] = useLocation();
  // Extract slug from URL path: /megasena → megasena
  const slug = location.replace(/^\//, "").split("/")[0];
  const color = getLotteryColor(slug);
  const name = getLotteryName(slug);
  const [page, setPage] = useState(1);
  const [searchConcurso, setSearchConcurso] = useState("");

  const { data: ultimo, isLoading: loadingUltimo } = trpc.concursos.ultimo.useQuery({ loteriaSlug: slug });
  const { data: historico, isLoading: loadingHistorico } = trpc.concursos.paginados.useQuery({
    loteriaSlug: slug,
    page,
    pageSize: 20,
  });

  const ganhadores = ultimo?.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null;
  const dezenas = (ultimo?.dezenas as number[]) ?? [];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <LotteryResultsSEO slug={slug} />
      <Navbar />

      {/* Header Banner */}
      <div className="text-white py-8" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
        <div className="container">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/"><span className="hover:text-white cursor-pointer">Início</span></Link>
            <ArrowRight className="w-3 h-3" />
            <span>{name}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">{name}</h1>
              <p className="text-white/70 mt-1">Resultados, estatísticas e análises</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/${slug}/estatisticas`}>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                  <BarChart3 className="w-4 h-4" /> Estatísticas
                </Button>
              </Link>
              <Link href={`/gerador?loteria=${slug}`}>
                <Button size="sm" className="bg-white text-[#0d1b3e] hover:bg-white/90 gap-1">
                  <Zap className="w-4 h-4" /> Gerar Jogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Último Resultado */}
          <div className="lg:col-span-2 space-y-5">
            {/* Último Concurso */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-[#0d1b3e]">Último Resultado</h2>
                {ultimo && (
                  <Badge variant="outline" className="text-xs">
                    Concurso {ultimo.numero}
                  </Badge>
                )}
              </div>
              <div className="p-6">
                {loadingUltimo ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="flex gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-10 h-10 rounded-full bg-gray-200" />)}</div>
                  </div>
                ) : ultimo ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(ultimo.dataSorteio as Date)}
                    </p>
                    <BallRow numbers={dezenas} loteria={slug} size="lg" className="mb-6" />

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: "Soma", value: dezenas.reduce((a, b) => a + b, 0) },
                        { label: "Pares", value: dezenas.filter(n => n % 2 === 0).length },
                        { label: "Ímpares", value: dezenas.filter(n => n % 2 !== 0).length },
                      ].map(s => (
                        <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
                          <p className="text-xl font-black" style={{ color }}>{s.value}</p>
                          <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Ganhadores */}
                    {ganhadores && ganhadores.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-[#0d1b3e] mb-3 text-sm">Premiação</h3>
                        <div className="space-y-2">
                          {ganhadores.slice(0, 4).map((g, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <span className="text-sm text-gray-600">{g.faixa}</span>
                              <div className="text-right">
                                <span className="text-sm font-bold text-[#0d1b3e]">{formatCurrency(g.premio)}</span>
                                {g.quantidade > 0 && (
                                  <span className="text-xs text-gray-400 ml-2">({g.quantidade} ganhador{g.quantidade !== 1 ? "es" : ""})</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Resultado não disponível.</p>
                )}
              </div>
            </div>

            {/* Histórico */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-[#0d1b3e]">Histórico de Concursos</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Nº concurso"
                      className="pl-8 h-8 w-32 text-xs"
                      value={searchConcurso}
                      onChange={e => setSearchConcurso(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Concurso</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Data</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Dezenas</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistorico ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-12 animate-pulse" /></td>
                          <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-20 animate-pulse" /></td>
                          <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-40 animate-pulse" /></td>
                          <td className="px-4 py-3" />
                        </tr>
                      ))
                    ) : historico?.data?.map((c) => {
                      const dez = (c.dezenas as number[]) ?? [];
                      return (
                        <tr key={c.numero} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#0d1b3e]">#{c.numero}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{formatDateShort(c.dataSorteio as Date)}</td>
                          <td className="px-4 py-3">
                            <BallRow numbers={dez} loteria={slug} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/${slug}/concurso/${c.numero}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" style={{ color }}>
                                Ver <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {historico && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Página {page} de {Math.ceil((historico.total ?? 0) / 20)}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= Math.ceil((historico.total ?? 0) / 20)} onClick={() => setPage(p => p + 1)}>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-4">Ferramentas {name}</h3>
              <div className="space-y-2">
                {[
                  { label: `Gerador ${name}`, href: `/gerador?loteria=${slug}`, icon: <Zap className="w-4 h-4" /> },
                  { label: `Conferidor ${name}`, href: `/conferidor?loteria=${slug}`, icon: <Search className="w-4 h-4" /> },
                  { label: `Simulador ${name}`, href: `/simulador?loteria=${slug}`, icon: <TrendingUp className="w-4 h-4" /> },
                  { label: `Estatísticas ${name}`, href: `/${slug}/estatisticas`, icon: <BarChart3 className="w-4 h-4" /> },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <span style={{ color }}>{item.icon}</span>
                      <span className="text-sm text-[#0d1b3e]">{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Premium CTA */}
            <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, #0d1b3e, #1a3a8f)` }}>
              <p className="font-bold mb-1">Clube Valtor Premium</p>
              <p className="text-white/70 text-sm mb-4">Acesse análises exclusivas e ferramentas avançadas.</p>
              <Link href="/planos">
                <Button size="sm" className="w-full bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold">
                  Assinar por R$ 47,80/mês
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bar — Ações rápidas */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container">
          <h3 className="font-bold text-[#0d1b3e] text-center mb-4">O que você quer fazer agora?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href={`/gerador?loteria=${slug}`}>
              <Button className="w-full h-12 gap-2 font-semibold" style={{ backgroundColor: color }}>
                <Zap className="w-4 h-4" /> Gerar jogo
              </Button>
            </Link>
            <Link href={`/${slug}/estatisticas`}>
              <Button variant="outline" className="w-full h-12 gap-2 font-semibold">
                <TrendingUp className="w-4 h-4" /> Números atrasados
              </Button>
            </Link>
            <Link href={`/${slug}/estatisticas`}>
              <Button variant="outline" className="w-full h-12 gap-2 font-semibold">
                <BarChart3 className="w-4 h-4" /> Mais sorteados
              </Button>
            </Link>
            <Link href={`/conferidor?loteria=${slug}`}>
              <Button variant="outline" className="w-full h-12 gap-2 font-semibold">
                <Search className="w-4 h-4" /> Conferir jogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
