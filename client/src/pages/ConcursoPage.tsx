import { useParams, Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, getLotteryColor, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, BarChart3, Zap, Calendar, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ConcursoSEO } from "@/hooks/useSEO";
import { useEffect } from "react";

export default function ConcursoPage() {
  const params = useParams<{ slug: string; numero: string }>();
  const [, navigate] = useLocation();

  // Extract slug from URL path if not in params
  const slug = params.slug ?? window.location.pathname.replace(/^\//, "").split("/")[0];
  
  // Check if user requested "ultimo"
  const rawNumero = params.numero ?? window.location.pathname.split("/concurso/")[1]?.split(/[/?#]/)[0];
  const isUltimo = rawNumero?.toLowerCase() === "ultimo" || rawNumero?.toLowerCase() === "último";
  
  // Parse numero — only if not "ultimo"
  const parsedNumero = (!isUltimo && rawNumero) ? parseInt(rawNumero, 10) : NaN;
  const isValidNumero = !isNaN(parsedNumero) && parsedNumero > 0;
  const numero = isValidNumero ? parsedNumero : 0;
  
  const color = getLotteryColor(slug);
  const name = getLotteryName(slug);
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.assinatura.status.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = subscription?.status === "active";

  // Fetch ultimo concurso when "ultimo" is in the URL
  const { data: ultimoConcurso } = trpc.concursos.ultimo.useQuery(
    { loteriaSlug: slug },
    { enabled: isUltimo }
  );

  // Redirect "ultimo" to the real concurso number
  useEffect(() => {
    if (isUltimo && ultimoConcurso?.numero) {
      navigate(`/${slug}/concurso/${ultimoConcurso.numero}`, { replace: true });
    }
  }, [isUltimo, ultimoConcurso, slug, navigate]);

  // Only query by numero if we have a valid one (not "ultimo")
  const { data: concurso, isLoading } = trpc.concursos.byNumero.useQuery(
    { loteriaSlug: slug, numero },
    { enabled: isValidNumero && !isUltimo }
  );

  // If "ultimo", show loading while we redirect
  if (isUltimo) {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        <ConcursoSEO slug={slug} />
        <Navbar />
        <div className="text-white py-8" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
          <div className="container">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
              <Link href="/"><span className="hover:text-white cursor-pointer">Início</span></Link>
              <ArrowRight className="w-3 h-3" />
              <Link href={`/${slug}`}><span className="hover:text-white cursor-pointer">{name}</span></Link>
              <ArrowRight className="w-3 h-3" />
              <span>Último Concurso</span>
            </div>
            <h1 className="text-3xl font-black">
              {name} — Último Concurso
            </h1>
          </div>
        </div>
        <div className="container py-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="flex gap-2 mb-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-12 h-12 rounded-full bg-gray-200" />)}</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Use concurso.numero from API response as the source of truth for display
  const displayNumero = concurso?.numero ?? (isValidNumero ? numero : null);
  const displayNumeroText = displayNumero ? String(displayNumero) : "Último concurso";

  const dezenas = (concurso?.dezenas as number[]) ?? [];
  const ganhadores = (concurso?.ganhadores as Array<{ faixa: string; quantidade: number; premio: number }>) ?? [];

  const soma = dezenas.reduce((a, b) => a + b, 0);
  const pares = dezenas.filter(n => n % 2 === 0).length;
  const impares = dezenas.filter(n => n % 2 !== 0).length;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <ConcursoSEO slug={slug} numero={displayNumero ? String(displayNumero) : undefined} />
      <Navbar />

      {/* Header */}
      <div className="text-white py-8" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
        <div className="container">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/"><span className="hover:text-white cursor-pointer">Início</span></Link>
            <ArrowRight className="w-3 h-3" />
            <Link href={`/${slug}`}><span className="hover:text-white cursor-pointer">{name}</span></Link>
            <ArrowRight className="w-3 h-3" />
            <span>Concurso {displayNumeroText}</span>
          </div>
          <h1 className="text-3xl font-black">
            {name} — Concurso {displayNumeroText}
          </h1>
          {concurso && (
            <p className="text-white/70 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(concurso.dataSorteio as Date)}
            </p>
          )}
        </div>
      </div>

      <div className="container py-8">
        {!isValidNumero ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-muted-foreground">Número de concurso inválido.</p>
            <Link href={`/${slug}`}>
              <Button variant="outline" className="mt-4">Ver concursos de {name}</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="flex gap-2 mb-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-12 h-12 rounded-full bg-gray-200" />)}</div>
          </div>
        ) : concurso ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Resultado principal */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#0d1b3e]">Resultado Oficial</h2>
                  {concurso.premioAcumulado && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">Acumulado</Badge>
                  )}
                </div>
                <BallRow numbers={dezenas} loteria={slug} size="lg" className="mb-6" />

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Soma", value: soma },
                    { label: "Pares", value: pares },
                    { label: "Ímpares", value: impares },
                    { label: "Dezenas", value: dezenas.length },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
                      <p className="text-xl font-black" style={{ color }}>{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premiação */}
              {ganhadores.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4" style={{ color }} />
                    <h2 className="font-bold text-[#0d1b3e]">Premiação</h2>
                  </div>
                  <div className="space-y-2">
                    {ganhadores.map((g, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-600">{g.faixa}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#0d1b3e]">{formatCurrency(g.premio)}</span>
                          {g.quantidade > 0 && (
                            <span className="text-xs text-gray-400 ml-2">
                              {g.quantidade} ganhador{g.quantidade !== 1 ? "es" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análise estatística */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color }} />
                  <h2 className="font-bold text-[#0d1b3e]">Análise do Concurso</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Média das dezenas", value: dezenas.length ? (soma / dezenas.length).toFixed(1) : "—" },
                    { label: "Menor dezena", value: dezenas.length ? Math.min(...dezenas) : "—" },
                    { label: "Maior dezena", value: dezenas.length ? Math.max(...dezenas) : "—" },
                    { label: "Amplitude", value: dezenas.length ? Math.max(...dezenas) - Math.min(...dezenas) : "—" },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className="text-lg font-black" style={{ color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Navigation */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] mb-4">Navegar</h3>
                <div className="flex gap-2">
                  {numero > 1 && (
                    <Link href={`/${slug}/concurso/${numero - 1}`}>
                      <Button variant="outline" size="sm" className="gap-1 flex-1">
                        <ArrowLeft className="w-3.5 h-3.5" /> Anterior
                      </Button>
                    </Link>
                  )}
                  <Link href={`/${slug}/concurso/${numero + 1}`}>
                    <Button variant="outline" size="sm" className="gap-1 flex-1">
                      Próximo <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <Link href={`/${slug}`}>
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" style={{ color }}>
                    Ver todos os concursos
                  </Button>
                </Link>
              </div>

              {/* Tools */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] mb-4">Ferramentas</h3>
                <div className="space-y-2">
                  {[
                    { label: `Conferir aposta`, href: `/conferidor?loteria=${slug}`, icon: <Zap className="w-4 h-4" /> },
                    { label: `Estatísticas ${name}`, href: `/${slug}/estatisticas`, icon: <BarChart3 className="w-4 h-4" /> },
                    { label: `Gerar jogo ${name}`, href: `/gerador?loteria=${slug}`, icon: <Zap className="w-4 h-4" /> },
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

              {/* Premium CTA — only show for non-premium users */}
              {!isPremium && (
                <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, #0d1b3e, #1a3a8f)` }}>
                  <p className="font-bold mb-1">Análise Premium</p>
                  <p className="text-white/70 text-sm mb-4">Compare este concurso com padrões históricos.</p>
                  <Link href="/planos">
                    <Button size="sm" className="w-full bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold">
                      Assinar Clube Valtor
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-muted-foreground">Concurso não encontrado.</p>
            <Link href={`/${slug}`}>
              <Button variant="outline" className="mt-4">Voltar para {name}</Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
