import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Star,
  Zap,
  ArrowRight,
  BarChart2,
  ShieldCheck,
  Sparkles,
  Clock,
  Bell,
  BookOpen,
  TrendingUp,
  Lock,
  AlertCircle,
  PartyPopper,
  CreditCard,
  Percent,
  QrCode,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SEO from "@/hooks/useSEO";

const COMPARISON = [
  { feature: "Resultados das últimas 5 edições", free: true, premium: true },
  { feature: "Histórico completo de todos os concursos", free: false, premium: true },
  { feature: "Gerador básico (3 jogos/dia)", free: true, premium: true },
  { feature: "Gerador inteligente ilimitado com filtros avançados", free: false, premium: true },
  { feature: "Conferidor básico", free: true, premium: true },
  { feature: "Conferidor automático de apostas", free: false, premium: true },
  { feature: "Estatísticas gerais", free: true, premium: true },
  { feature: "Estatísticas avançadas e análise de padrões", free: false, premium: true },
  { feature: "Carteira de jogos ilimitada", free: false, premium: true },
  { feature: "Simulador histórico completo", free: false, premium: true },
  { feature: "Alertas de sorteios por e-mail", free: false, premium: true },
  { feature: "Extensão Chrome para importar jogos", free: false, premium: true },
  { feature: "Análise de combinações premium", free: false, premium: true },
  { feature: "Acesso antecipado a novas ferramentas", free: false, premium: true },
  { feature: "Suporte prioritário", free: false, premium: true },
];

const BENEFITS = [
  {
    icon: <BarChart2 className="w-6 h-6" />,
    color: "#2563eb",
    bg: "#dbeafe",
    title: "Análise Estatística Profunda",
    desc: "Acesse frequências, atrasos, pares quentes, sequências e dezenas de métricas para cada loteria.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    color: "#7c3aed",
    bg: "#ede9fe",
    title: "Gerador Inteligente",
    desc: "Gere jogos com base em filtros estatísticos avançados — não apenas aleatórios, mas orientados por dados.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "#059669",
    bg: "#d1fae5",
    title: "Conferidor Automático",
    desc: "Salve seus jogos e confira automaticamente após cada sorteio. Nunca perca um prêmio.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    color: "#d97706",
    bg: "#fef3c7",
    title: "Simulador Histórico",
    desc: "Teste estratégias no histórico completo de concursos e veja como sua abordagem teria performado.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    color: "#dc2626",
    bg: "#fee2e2",
    title: "Alertas de Sorteios",
    desc: "Receba notificações por e-mail antes de cada sorteio para nunca esquecer de apostar.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    color: "#0891b2",
    bg: "#cffafe",
    title: "Histórico Completo",
    desc: "Acesse todos os concursos desde o início de cada loteria, com análise detalhada de cada resultado.",
  },
];

const FAQ = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas. O acesso continua até o fim do período pago.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Você pode pagar parcelado em 12x de R$ 47,80 no cartão de crédito, ou à vista por R$ 429,60 via Pix, cartão ou boleto. Ambas as opções dão acesso por 12 meses completos.",
  },
  {
    q: "Qual a diferença entre parcelado e à vista?",
    a: "No pagamento à vista você economiza R$ 144,00 (25% de desconto). Em vez de pagar R$ 573,60 parcelado, paga apenas R$ 429,60. O acesso é idêntico nos dois casos: 12 meses completos.",
  },
  {
    q: "Tenho direito a reembolso?",
    a: "Sim! Oferecemos reembolso integral em até 7 dias corridos após a primeira cobrança, conforme o Código de Defesa do Consumidor.",
  },
  {
    q: "Os dados são oficiais da Caixa?",
    a: "Sim! Todos os resultados e estatísticas são obtidos diretamente da API oficial das Loterias Caixa.",
  },
  {
    q: "O Valtor garante que vou ganhar?",
    a: "Não. Nenhuma ferramenta pode garantir ganhos em jogos de azar. O Valtor oferece análises estatísticas para auxiliar na escolha de números, mas os sorteios são aleatórios.",
  },
  {
    q: "Quantas loterias estão disponíveis?",
    a: "O Valtor cobre 9 loterias da Caixa: Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária.",
  },
  {
    q: "Posso usar o Valtor no celular?",
    a: "Sim! O Valtor é totalmente responsivo e funciona em qualquer dispositivo — computador, tablet ou smartphone.",
  },
  {
    q: "Posso pagar com Pix?",
    a: "Sim! No pagamento à vista, aceitamos Pix (processamento instantâneo), cartão de crédito/débito e boleto bancário.",
  },
];

type PlanType = "parcelado" | "avista";

const PREMIUM_FEATURES = [
  "Tudo do plano gratuito",
  "Gerador inteligente ilimitado",
  "Conferidor automático de apostas",
  "Estatísticas avançadas e padrões",
  "Carteira de jogos ilimitada",
  "Simulador histórico completo",
  "Alertas por e-mail",
  "Extensão Chrome",
  "Análise de combinações premium",
  "Suporte prioritário",
  "Acesso antecipado a novidades",
];

export default function Planos() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PlanType>("avista");

  const { data: assinatura } = trpc.assinatura.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const criarCheckout = trpc.assinatura.criarCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Você está sendo redirecionado para o Mercado Pago para concluir o pagamento.", { duration: 6000 });
        setIsLoading(false);
      }
    },
    onError: (err) => {
      toast.error("Erro ao iniciar pagamento: " + err.message);
      setIsLoading(false);
    },
  });

  // Verificar parâmetros de retorno do Mercado Pago
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sucesso") === "1") {
      toast.success("Assinatura ativada com sucesso! Bem-vindo ao Clube Valtor!", {
        duration: 8000,
      });
      window.history.replaceState({}, "", "/planos");
    } else if (params.get("cancelado") === "1") {
      toast.info("Pagamento cancelado. Você pode assinar quando quiser.");
      window.history.replaceState({}, "", "/planos");
    } else if (params.get("pendente") === "1") {
      toast.info("Pagamento pendente. Assim que for confirmado, sua assinatura será ativada automaticamente.", {
        duration: 8000,
      });
      window.history.replaceState({}, "", "/planos");
    }
  }, []);

  const handleAssinar = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!aceiteTermos) {
      toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    setIsLoading(true);
    criarCheckout.mutate({ origin: window.location.origin, planType: paymentMode });
  };

  const isAssinante = assinatura?.status === "active";

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Planos e Preços"
        description="Assine o Clube Valtor: gerador inteligente, conferidor automático, estatísticas avançadas e mais. Plano anual à vista com 25% de desconto. Aceita Pix."
        path="/planos"
      />
      <Navbar />

      {/* ── BANNER DE SUCESSO (pós-pagamento) ── */}
      {isAssinante && (
        <div className="bg-green-50 border-b border-green-200 py-3">
          <div className="container flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
            <PartyPopper className="w-4 h-4" />
            Você é membro do Clube Valtor! Acesse a{" "}
            <Link href="/extensao" className="underline font-bold">Extensão Chrome</Link>
            {" "}e todas as ferramentas premium.
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section
        className="py-20 text-white text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 60%, #0d1b3e 100%)" }}
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#f5a623]/10 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="container relative">
          <Badge className="mb-5 bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/40 hover:bg-[#f5a623]/20 text-sm px-4 py-1">
            <Star className="w-3.5 h-3.5 mr-1.5" /> Clube Valtor
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Jogue com{" "}
            <span style={{ color: "#f5a623" }}>inteligência</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg leading-relaxed">
            Acesse ferramentas profissionais de análise estatística para as 9 loterias da Caixa.
            Dados reais, decisões melhores.
          </p>

          {/* Payment methods badges */}
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/80">
              <QrCode className="w-3.5 h-3.5" /> Pix instantâneo
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/80">
              <CreditCard className="w-3.5 h-3.5" /> Cartão até 12x
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/80">
              <ShieldCheck className="w-3.5 h-3.5" /> Boleto
            </div>
          </div>
        </div>
      </section>

      {/* ── CARDS DE PLANOS ── */}
      <section className="py-16 bg-[#f0f4f8]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* ═══ Card 1: EXPLORADOR (Gratuito) ═══ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Gratuito</p>
                <h2 className="text-3xl font-black text-[#0d1b3e] mb-1">Explorador</h2>
                <p className="text-muted-foreground text-sm">Para começar a explorar o Valtor</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-5xl font-black text-[#0d1b3e]">R$ 0</span>
                  <span className="text-muted-foreground mb-1">/para sempre</span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  "Resultados das últimas 5 edições",
                  "Gerador básico (3 jogos/dia)",
                  "Conferidor básico",
                  "Estatísticas gerais",
                  "Histórico dos últimos 30 concursos",
                ].map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              {isAuthenticated ? (
                <Button variant="outline" className="w-full border-gray-300 text-gray-500" disabled>
                  {isAssinante ? "Plano gratuito" : "Plano atual"}
                </Button>
              ) : (
                <a href={getLoginUrl()} className="block">
                  <Button variant="outline" className="w-full border-[#0d1b3e] text-[#0d1b3e] hover:bg-[#0d1b3e] hover:text-white font-semibold">
                    Criar conta grátis
                  </Button>
                </a>
              )}
            </div>

            {/* ═══ Card 2: CLUBE VALTOR (Premium) ═══ */}
            <div
              className="rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
              style={{ background: "linear-gradient(145deg, #0d1b3e 0%, #1a3a8f 100%)" }}
            >
              {/* badges */}
              <div className="absolute top-5 right-5 flex flex-col gap-1.5 items-end z-10">
                <Badge className="bg-[#f5a623] text-[#0d1b3e] font-bold hover:bg-[#f5a623] text-xs px-3 py-1">
                  <Star className="w-3 h-3 mr-1" /> Recomendado
                </Badge>
              </div>

              {/* decorative */}
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#f5a623]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

              <div className="p-8 pb-0 relative">
                <p className="text-sm font-semibold text-[#f5a623]/80 uppercase tracking-widest mb-1">Premium</p>
                <h2 className="text-3xl font-black text-white mb-1">Clube Valtor</h2>
                <p className="text-white/60 text-sm mb-6">12 meses de acesso completo</p>

                {/* ── TOGGLE PARCELADO / À VISTA ── */}
                <div className="bg-white/10 rounded-xl p-1 flex gap-1 mb-6">
                  <button
                    onClick={() => setPaymentMode("parcelado")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
                      paymentMode === "parcelado"
                        ? "bg-white text-[#0d1b3e] shadow-md"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    12x no cartão
                  </button>
                  <button
                    onClick={() => setPaymentMode("avista")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 relative ${
                      paymentMode === "avista"
                        ? "bg-white text-[#0d1b3e] shadow-md"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    À vista
                    <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      paymentMode === "avista"
                        ? "bg-green-500 text-white"
                        : "bg-green-500/30 text-green-300"
                    }`}>
                      25% OFF
                    </span>
                  </button>
                </div>

                {/* ── PREÇO DINÂMICO ── */}
                <div className="min-h-[120px]">
                  {paymentMode === "parcelado" ? (
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-lg text-white/50">12x de</span>
                      </div>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-5xl font-black text-white">R$ 47,80</span>
                      </div>
                      <p className="text-white/40 text-sm mt-2">
                        Total: R$ 573,60 · Cartão de crédito
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/40 line-through text-lg">R$ 573,60</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/20 text-xs">
                          Economia de R$ 144
                        </Badge>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-5xl font-black text-white">R$ 429,60</span>
                      </div>
                      <p className="text-[#f5a623] text-sm font-semibold mt-2">
                        Pagamento único · Pix, cartão ou boleto
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="px-8 py-6 space-y-3 flex-1 relative">
                {PREMIUM_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#f5a623] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-8 pb-8 relative">
                {isAssinante ? (
                  <div>
                    <Button
                      className="w-full font-bold gap-2 text-white bg-green-600 hover:bg-green-700 transition-colors"
                      size="lg"
                      disabled
                    >
                      <CheckCircle2 className="w-4 h-4" /> Assinatura ativa
                    </Button>
                    <p className="text-white/40 text-xs text-center mt-3">
                      Gerencie sua assinatura em{" "}
                      <Link href="/perfil" className="text-white/60 underline">Perfil</Link>
                    </p>
                  </div>
                ) : (
                  <div>
                    <Button
                      className="w-full font-bold gap-2 text-[#0d1b3e] hover:opacity-90 transition-opacity disabled:opacity-50 text-base"
                      style={{ background: aceiteTermos ? "#f5a623" : "#f5a623aa" }}
                      size="lg"
                      onClick={handleAssinar}
                      disabled={isLoading || criarCheckout.isPending || !aceiteTermos}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#0d1b3e]/30 border-t-[#0d1b3e] rounded-full animate-spin" />
                          Aguarde...
                        </>
                      ) : paymentMode === "parcelado" ? (
                        <>
                          <CreditCard className="w-4 h-4" /> Assinar 12x de R$ 47,80 <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" /> Assinar à vista com 25% OFF <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-white/40 text-xs text-center mt-3">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Pagamento seguro via Mercado Pago
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checkbox de aceite — abaixo dos cards */}
          {!isAssinante && (
            <div className="max-w-5xl mx-auto mt-6">
              <label className="flex items-start gap-2.5 cursor-pointer group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-[#2563eb]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={aceiteTermos}
                  onChange={(e) => setAceiteTermos(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb] focus:ring-offset-0 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                  Li e concordo com os{" "}
                  <Link href="/termos" className="text-[#2563eb] hover:underline font-medium" target="_blank">Termos de Uso</Link>
                  {" "}e a{" "}
                  <Link href="/privacidade" className="text-[#2563eb] hover:underline font-medium" target="_blank">Política de Privacidade</Link>
                  {" "}do Valtor, autorizando o tratamento dos meus dados pessoais conforme descrito. Declaro ser maior de 18 anos.
                </span>
              </label>
              {!aceiteTermos && (
                <p className="text-amber-600 text-xs mt-2 flex items-center gap-1.5 ml-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Aceite os termos acima para habilitar o botão de assinatura
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── ECONOMIA DESTAQUE ── */}
      {!isAssinante && (
        <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="container">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-2">Economize R$ 144,00 pagando à vista</h3>
                <p className="text-white/80 leading-relaxed">
                  No pagamento à vista, o Clube Valtor sai por <strong>R$ 429,60</strong> em vez de R$ 573,60 (12x de R$ 47,80).
                  São 12 meses de acesso completo com <strong>25% de desconto</strong>.
                  Aceita Pix, cartão ou boleto.
                </p>
              </div>
              <div className="text-center flex-shrink-0 bg-white/10 rounded-2xl p-6">
                <div className="text-6xl font-black">25%</div>
                <div className="text-white/80 text-sm font-semibold mt-1">de desconto</div>
                <div className="text-white/50 text-xs mt-1">no pagamento à vista</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFÍCIOS ── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-2">O que você ganha</p>
            <h2 className="text-3xl font-black text-[#0d1b3e]">
              Ferramentas para jogar com critério
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              O Clube Valtor reúne tudo que você precisa para sair do achismo e apostar com mais consciência.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {BENEFITS.map(b => (
              <div
                key={b.title}
                className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: b.bg, color: b.color }}
                >
                  {b.icon}
                </div>
                <h3 className="font-black text-[#0d1b3e] text-lg mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARAÇÃO ── */}
      <section className="py-20 bg-[#f0f4f8]">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-2">Comparativo</p>
            <h2 className="text-3xl font-black text-[#0d1b3e]">Explorador vs. Clube Valtor</h2>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-[#0d1b3e] text-white text-sm font-bold">
              <div className="col-span-1 p-4">Recurso</div>
              <div className="p-4 text-center">Explorador</div>
              <div className="p-4 text-center" style={{ color: "#f5a623" }}>Clube Valtor</div>
            </div>

            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
              >
                <div className="col-span-1 p-4 text-sm text-gray-700">{row.feature}</div>
                <div className="p-4 flex items-center justify-center">
                  {row.free ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="p-4 flex items-center justify-center">
                  {row.premium ? (
                    <CheckCircle2 className="w-5 h-5 text-[#f5a623]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-2">Dúvidas</p>
            <h2 className="text-3xl font-black text-[#0d1b3e]">Perguntas Frequentes</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {FAQ.map(item => (
              <div key={item.q} className="bg-[#f0f4f8] rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-[#0d1b3e] mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        className="py-20 text-center"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 100%)" }}
      >
        <div className="container">
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-[#f5a623]/20 text-[#f5a623] text-sm font-bold px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" /> Sem fidelidade
            </div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-sm font-bold px-4 py-2 rounded-full">
              <QrCode className="w-4 h-4" /> Aceita Pix
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 text-sm font-bold px-4 py-2 rounded-full">
              <CreditCard className="w-4 h-4" /> Até 12x
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Comece a jogar com{" "}
            <span style={{ color: "#f5a623" }}>inteligência hoje</span>
          </h2>
          <p className="text-white/70 text-lg mb-2 max-w-xl mx-auto">
            <strong className="text-white">R$ 429,60 à vista</strong> (25% OFF) ou <strong className="text-white">12x de R$ 47,80</strong> no cartão
          </p>
          <p className="text-white/50 text-sm mb-8">
            12 meses de acesso completo a todas as ferramentas premium
          </p>
          {!isAssinante && (
            <div className="max-w-md mx-auto space-y-3">
              {!aceiteTermos && (
                <p className="text-[#f5a623]/80 text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Aceite os termos acima para assinar
                </p>
              )}
              <Button
                size="lg"
                className="font-bold gap-2 text-[#0d1b3e] hover:opacity-90 px-8 w-full"
                style={{ background: aceiteTermos ? "#f5a623" : "#f5a623aa" }}
                onClick={() => {
                  setPaymentMode("avista");
                  handleAssinar();
                }}
                disabled={isLoading || criarCheckout.isPending || !aceiteTermos}
              >
                {isLoading && paymentMode === "avista" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0d1b3e]/30 border-t-[#0d1b3e] rounded-full animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" /> Assinar à vista — R$ 429,60 <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold gap-2 px-8 w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  setPaymentMode("parcelado");
                  handleAssinar();
                }}
                disabled={isLoading || criarCheckout.isPending || !aceiteTermos}
              >
                {isLoading && paymentMode === "parcelado" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>Ou 12x de R$ 47,80 no cartão</>
                )}
              </Button>
            </div>
          )}
          <p className="text-white/40 text-sm mt-6">
            <Lock className="w-3.5 h-3.5 inline mr-1" />
            Pagamento 100% seguro via Mercado Pago · Dados protegidos pela LGPD
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-white/30 text-xs">
            <Link href="/termos" className="hover:text-white/50 transition-colors">Termos de Uso</Link>
            <span>·</span>
            <Link href="/privacidade" className="hover:text-white/50 transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
