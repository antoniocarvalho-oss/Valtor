import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LotteryBall from "@/components/LotteryBall";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, Lock, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { getLotteryColor, getLotteryName } from "@/lib/utils";
import SEO from "@/hooks/useSEO";

// ─── Types ──────────────────────────────────────────────────────────────────
interface DataItem {
  numero: number;
  valor: number;
}

interface InternalLink {
  label: string;
  href: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOLandingPageProps {
  slug: string;
  mode: "frequencia" | "atraso";
  title: string;
  metaTitle: string;
  metaDescription: string;
  path: string;
  heading: string;
  description: string;
  items: DataItem[];
  totalConcursos: number;
  isLoading: boolean;
  topLabel: string;
  bottomLabel: string;
  valueLabel: string;
  links: InternalLink[];
  faq?: FAQItem[];
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function SEOLandingPage({
  slug,
  mode,
  title,
  metaTitle,
  metaDescription,
  path,
  heading,
  description,
  items,
  totalConcursos,
  isLoading,
  topLabel,
  bottomLabel,
  valueLabel,
  links,
  faq,
}: SEOLandingPageProps) {
  const color = getLotteryColor(slug);
  const name = getLotteryName(slug);
  const { isAuthenticated } = useAuth();
  const isGated = !isAuthenticated;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sort items
  const sorted = [...items].sort((a, b) => b.valor - a.valor);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();
  const top10 = sorted.slice(0, 10);
  const bottom10 = sorted.slice(-10).reverse();

  const displayTop = isGated ? top5 : top10;
  const displayBottom = isGated ? bottom5 : bottom10;

  // Chart data (sorted by number for chart)
  const chartData = items.map((item) => ({
    numero: item.numero,
    valor: item.valor,
    label: `${item.numero}`,
  }));

  const CTA_TEXT = "Ver todos os números e análise completa → criar conta grátis";

  // Schema.org for the page
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: metaTitle,
    description: metaDescription,
    url: `https://www.valtor.com.br${path}`,
    isPartOf: { "@type": "WebSite", name: "Valtor", url: "https://www.valtor.com.br" },
  };

  // Add FAQ schema if present
  if (faq && faq.length > 0) {
    schema["@type"] = "FAQPage";
    schema.mainEntity = faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    }));
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title={metaTitle}
        description={metaDescription}
        path={path}
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
            <span>{title}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">{heading}</h1>
          <p className="text-white/70 mt-1">{description}</p>
          {totalConcursos > 0 && (
            <p className="text-white/50 text-sm mt-1">
              Dados baseados em {totalConcursos.toLocaleString("pt-BR")} concursos
            </p>
          )}
        </div>
      </div>

      <div className="container py-8">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
            <h2 className="font-bold text-[#0d1b3e] mb-1">
              {mode === "frequencia" ? "Frequência de Sorteio" : "Atraso por Número"}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {mode === "frequencia"
                ? `Quantas vezes cada número foi sorteado em ${totalConcursos.toLocaleString("pt-BR")} concursos`
                : `Há quantos concursos consecutivos cada número não aparece`}
            </p>

            {isLoading ? (
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <div className="relative">
                <div className={isGated ? "blur-sm pointer-events-none select-none" : ""}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 20)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number) => [value, valueLabel]}
                        labelFormatter={(label) => `Número ${label}`}
                      />
                      <Bar dataKey="valor" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              top10.some((t) => t.numero === entry.numero)
                                ? color
                                : bottom10.some((b) => b.numero === entry.numero)
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
                      <p className="text-sm text-gray-500 mb-4">
                        Crie uma conta grátis para ver o gráfico com todos os números.
                      </p>
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

          {/* Sidebar: Top/Bottom lists */}
          <div className="space-y-5">
            {/* Top list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" style={{ color }} />
                <h3 className="font-bold text-[#0d1b3e] text-sm">{topLabel}</h3>
                {isGated && <span className="text-[10px] text-gray-400 ml-auto">Top 5</span>}
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayTop.map((item, i) => (
                    <div key={item.numero} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                        <LotteryBall number={item.numero} loteria={slug} size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.round((item.valor / displayTop[0].valor) * 60)}px`,
                            backgroundColor: color,
                            opacity: 0.7,
                          }}
                        />
                        <span className="text-xs font-bold text-[#0d1b3e] w-8 text-right">{item.valor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isGated && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={getLoginUrl()}
                    className="flex items-center justify-center gap-2 text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors text-center"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    {CTA_TEXT}
                  </a>
                </div>
              )}
            </div>

            {/* Bottom list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-[#0d1b3e] text-sm">{bottomLabel}</h3>
                {isGated && <span className="text-[10px] text-gray-400 ml-auto">Top 5</span>}
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
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
              )}

              {isGated && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={getLoginUrl()}
                    className="flex items-center justify-center gap-2 text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors text-center"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    {CTA_TEXT}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All numbers grid — gated */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
          <h2 className="font-bold text-[#0d1b3e] mb-4">
            {mode === "frequencia" ? "Frequência de Todos os Números" : "Atraso de Todos os Números"}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2 animate-pulse">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                {chartData.map((item, idx) => {
                  const maxVal = Math.max(...chartData.map((d) => d.valor));
                  const intensity = maxVal > 0 ? item.valor / maxVal : 0;
                  const isBlurred = isGated && idx >= 5;
                  return (
                    <div
                      key={item.numero}
                      className={`flex flex-col items-center p-2 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors ${
                        isBlurred ? "blur-sm select-none" : ""
                      }`}
                    >
                      <LotteryBall number={item.numero} loteria={slug} size="sm" />
                      <span
                        className="text-xs font-bold mt-1.5"
                        style={{ color, opacity: 0.5 + intensity * 0.5 }}
                      >
                        {item.valor}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isGated && (
                <div className="absolute inset-x-0 bottom-0 h-3/4 flex items-end justify-center pb-8 bg-gradient-to-t from-white via-white/90 to-transparent">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      <Lock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      {CTA_TEXT}
                    </p>
                    <a href={getLoginUrl()}>
                      <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold gap-2">
                        <UserPlus className="w-4 h-4" /> Criar conta grátis
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        {faq && faq.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-bold text-[#0d1b3e] text-lg mb-4">Perguntas Frequentes</h2>
            <div className="space-y-0 divide-y divide-gray-100">
              {faq.map((item, idx) => (
                <div key={idx}>
                  <button
                    className="w-full flex items-center justify-between py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="font-medium text-[#0d1b3e] text-sm pr-4">{item.question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <p className="text-sm text-gray-600 pb-4 leading-relaxed">{item.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal links */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-[#0d1b3e] text-sm mb-3">Veja também</h2>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:bg-gray-50">
                  <ArrowRight className="w-3 h-3" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
