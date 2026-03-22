import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, getLotteryColor, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, Zap, Calendar, Trophy } from "lucide-react";
import SEO from "@/hooks/useSEO";

export default function ResultadoMegasenaHoje() {
  const slug = "megasena";
  const color = getLotteryColor(slug);
  const name = getLotteryName(slug);

  const { data: ultimo, isLoading } = trpc.concursos.ultimo.useQuery({ loteriaSlug: slug });

  const ganhadores = ultimo?.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }> | null;
  const dezenas = (ultimo?.dezenas as number[]) ?? [];
  const dataStr = ultimo?.dataSorteio ? formatDate(ultimo.dataSorteio) : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Resultado da Mega-Sena Hoje — Valtor`,
    description: `Confira o último resultado da Mega-Sena. Números sorteados, prêmios e ganhadores atualizados.`,
    url: "https://www.valtor.com.br/resultado-megasena-hoje",
    isPartOf: { "@type": "WebSite", name: "Valtor", url: "https://www.valtor.com.br" },
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Resultado da Mega-Sena Hoje — Último Concurso"
        description="Confira o resultado mais recente da Mega-Sena com números sorteados, prêmios e ganhadores. Atualizado após cada sorteio."
        path="/resultado-megasena-hoje"
        schema={schema}
      />
      <Navbar />

      {/* Header */}
      <div
        className="text-white py-8"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="container">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/">
              <span className="hover:text-white cursor-pointer">Início</span>
            </Link>
            <ArrowRight className="w-3 h-3" />
            <Link href={`/${slug}`}>
              <span className="hover:text-white cursor-pointer">{name}</span>
            </Link>
            <ArrowRight className="w-3 h-3" />
            <span>Resultado de Hoje</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Resultado da Mega-Sena hoje</h1>
          <p className="text-white/70 mt-1">
            Confira os números sorteados no último concurso da Mega-Sena
          </p>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-48 mb-4" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-12 h-12 bg-gray-100 rounded-full" />
              ))}
            </div>
          </div>
        ) : ultimo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main result */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[#0d1b3e]">Concurso {ultimo.numero}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{dataStr}</p>
                  </div>
                  {ultimo.premioAcumulado && (
                    <Badge className="bg-red-500 text-white text-xs">Acumulou!</Badge>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Números sorteados</p>
                  <BallRow numbers={dezenas} loteria={slug} size="lg" />

                  {ultimo.premioEstimado && (
                    <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-green-700 font-medium">Prêmio estimado</p>
                          <p className="text-lg font-black text-green-800">
                            {formatCurrency(Number(ultimo.premioEstimado))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Premiação */}
              {ganhadores && ganhadores.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-[#0d1b3e]">Premiação</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {ganhadores.map((g, i) => (
                      <div key={i} className="px-6 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#0d1b3e]">{g.faixa}</p>
                          <p className="text-xs text-gray-500">
                            {g.quantidade} {g.quantidade === 1 ? "ganhador" : "ganhadores"}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#0d1b3e]">{formatCurrency(g.premio)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] text-sm mb-3">Análises da Mega-Sena</h3>
                <div className="space-y-2">
                  <Link href="/numeros-mais-sorteados-megasena">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                      <TrendingUp className="w-4 h-4" style={{ color }} />
                      Números mais sorteados
                    </Button>
                  </Link>
                  <Link href="/numeros-atrasados-megasena">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                      <TrendingDown className="w-4 h-4" style={{ color }} />
                      Números atrasados
                    </Button>
                  </Link>
                  <Link href="/frequencia-megasena">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                      <BarChart3 className="w-4 h-4" style={{ color }} />
                      Frequência completa
                    </Button>
                  </Link>
                  <Link href={`/gerador?loteria=${slug}`}>
                    <Button size="sm" className="w-full justify-start gap-2 text-xs bg-[#0d1b3e] hover:bg-[#162a5c] text-white">
                      <Zap className="w-4 h-4" />
                      Gerar jogo da Mega-Sena
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" style={{ color }} />
                  <h3 className="font-bold text-[#0d1b3e] text-sm">Próximo sorteio</h3>
                </div>
                <p className="text-sm text-gray-600">
                  A Mega-Sena é sorteada terças e sábados, às 20h. Os resultados são atualizados automaticamente após cada sorteio.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] text-sm mb-3">Histórico completo</h3>
                <Link href={`/${slug}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <ArrowRight className="w-3 h-3" />
                    Ver todos os concursos da Mega-Sena
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
            <p className="text-gray-500">Nenhum resultado disponível no momento.</p>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-[#0d1b3e] text-lg mb-4">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-[#0d1b3e] text-sm">Que horas sai o resultado da Mega-Sena?</h3>
              <p className="text-sm text-gray-600 mt-1">O sorteio da Mega-Sena acontece terças e sábados, às 20h. Os resultados são publicados minutos após o sorteio.</p>
            </div>
            <div>
              <h3 className="font-medium text-[#0d1b3e] text-sm">Quantos números são sorteados na Mega-Sena?</h3>
              <p className="text-sm text-gray-600 mt-1">São sorteados 6 números de um total de 01 a 60.</p>
            </div>
            <div>
              <h3 className="font-medium text-[#0d1b3e] text-sm">Quanto custa apostar na Mega-Sena?</h3>
              <p className="text-sm text-gray-600 mt-1">A aposta mínima custa R$ 5,00. Quanto mais números marcar, maior o valor da aposta e as chances de ganhar.</p>
            </div>
          </div>
        </div>

        {/* Internal links */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-[#0d1b3e] text-sm mb-3">Veja também</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/numeros-mais-sorteados-megasena">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:bg-gray-50">
                <ArrowRight className="w-3 h-3" /> Números mais sorteados da Mega-Sena
              </Button>
            </Link>
            <Link href="/numeros-atrasados-megasena">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:bg-gray-50">
                <ArrowRight className="w-3 h-3" /> Números atrasados da Mega-Sena
              </Button>
            </Link>
            <Link href={`/gerador?loteria=${slug}`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:bg-gray-50">
                <ArrowRight className="w-3 h-3" /> Gerador da Mega-Sena
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
