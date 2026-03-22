import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDateShort, getLotteryColor, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  Wallet,
  Zap,
  Search,
  BarChart3,
  Bell,
  Settings,
  Star,
  Trash2,
  ArrowRight,
  TrendingUp,
  Calendar,
  Lock,
  Menu,
  X,
  History,
} from "lucide-react";

const ALL_SLUGS = [
  "megasena", "lotofacil", "quina", "lotomania", "timemania",
  "duplasena", "diadesorte", "supersete", "maismilionaria",
] as const;

const NAV_ITEMS = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, href: "/clube", key: "dashboard" },
  { label: "Minha Carteira", icon: <Wallet className="w-4 h-4" />, href: "/clube/carteira", key: "carteira" },
  { label: "Gerador Premium", icon: <Zap className="w-4 h-4" />, href: "/gerador", key: "gerador" },
  { label: "Conferidor", icon: <Search className="w-4 h-4" />, href: "/conferidor", key: "conferidor" },
  { label: "Backtest Valtor", icon: <History className="w-4 h-4" />, href: "/backtest", key: "backtest" },
  { label: "Estatísticas", icon: <BarChart3 className="w-4 h-4" />, href: "/megasena/estatisticas", key: "stats" },
  { label: "Alertas", icon: <Bell className="w-4 h-4" />, href: "/clube/alertas", key: "alertas" },
  { label: "Configurações", icon: <Settings className="w-4 h-4" />, href: "/perfil", key: "config" },
];

function Sidebar({ active }: { active: string }) {
  return (
    <div className="w-56 flex-shrink-0 hidden lg:block">
      <div className="bg-[#0d1b3e] rounded-2xl p-4 text-white sticky top-6">
        <div className="mb-5 px-2">
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Menu</p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.key} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                active === item.key
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}>
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t border-white/10 px-2">
          <Badge className="bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/30 hover:bg-[#f5a623]/20 gap-1">
            <Star className="w-3 h-3" /> Premium Ativo
          </Badge>
        </div>
      </div>
    </div>
  );
}

function MobileNav({ active, isOpen, onToggle }: { active: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="lg:hidden relative">
      {/* Mobile menu button - compact bar */}
      <div className="flex items-center justify-between bg-[#0d1b3e] rounded-xl p-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/30 hover:bg-[#f5a623]/20 gap-1 text-[10px] px-2 py-0.5">
            <Star className="w-2.5 h-2.5" /> Premium
          </Badge>
          <span className="text-white/50 text-xs">|
          </span>
          <span className="text-white text-xs font-medium">
            {NAV_ITEMS.find(i => i.key === active)?.label ?? "Dashboard"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 h-8 w-8 p-0"
          onClick={onToggle}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu dropdown - overlay style so it doesn't push content */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onToggle}
          />
          {/* Menu */}
          <div className="absolute left-0 right-0 z-50 bg-[#0d1b3e] rounded-xl p-3 mb-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <nav className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map(item => (
                <Link key={item.key} href={item.href}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                      active === item.key
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    onClick={onToggle}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: carteira } = trpc.carteira.listar.useQuery({}, { enabled: isAuthenticated });

  // Fetch ultimo concurso for all 9 lotteries
  const megasena = trpc.concursos.ultimo.useQuery({ loteriaSlug: "megasena" });
  const lotofacil = trpc.concursos.ultimo.useQuery({ loteriaSlug: "lotofacil" });
  const quina = trpc.concursos.ultimo.useQuery({ loteriaSlug: "quina" });
  const lotomania = trpc.concursos.ultimo.useQuery({ loteriaSlug: "lotomania" });
  const timemania = trpc.concursos.ultimo.useQuery({ loteriaSlug: "timemania" });
  const duplasena = trpc.concursos.ultimo.useQuery({ loteriaSlug: "duplasena" });
  const diadesorte = trpc.concursos.ultimo.useQuery({ loteriaSlug: "diadesorte" });
  const supersete = trpc.concursos.ultimo.useQuery({ loteriaSlug: "supersete" });
  const maismilionaria = trpc.concursos.ultimo.useQuery({ loteriaSlug: "maismilionaria" });

  const ultimosMap: Record<string, any> = {
    megasena: megasena.data,
    lotofacil: lotofacil.data,
    quina: quina.data,
    lotomania: lotomania.data,
    timemania: timemania.data,
    duplasena: duplasena.data,
    diadesorte: diadesorte.data,
    supersete: supersete.data,
    maismilionaria: maismilionaria.data,
  };

  const deletarMutation = trpc.carteira.excluir.useMutation({
    onSuccess: () => {},
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        <Navbar />
        <div className="container py-20 text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0d1b3e] mb-2">Área exclusiva para membros</h2>
          <p className="text-muted-foreground mb-6">Faça login para acessar seu painel de controle.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Fazer login</Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  // Count unique lotteries from saved games
  const uniqueLoterias = new Set(carteira?.map((j: any) => j.loteriaSlug) ?? []);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      <div className="container py-4 lg:py-8">
        {/* Mobile Navigation */}
        <MobileNav active={activeSection} isOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <Sidebar active={activeSection} />

          <div className="flex-1 min-w-0 space-y-5">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Bem-vindo de volta,</p>
                  <h1 className="text-xl sm:text-2xl font-black">{user?.name?.split(" ")[0] ?? "Jogador"} 👋</h1>
                  <p className="text-white/60 text-sm mt-1">Seu painel de análise inteligente</p>
                </div>
                <Badge className="bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/30 hover:bg-[#f5a623]/20 gap-1 hidden sm:flex">
                  <Star className="w-3 h-3" /> Premium
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Jogos salvos", value: carteira?.length ?? 0, icon: <Wallet className="w-4 h-4" />, color: "#2563eb" },
                { label: "Loterias ativas", value: 9, icon: <BarChart3 className="w-4 h-4" />, color: "#16a34a" },
                { label: "Na carteira", value: uniqueLoterias.size, icon: <Calendar className="w-4 h-4" />, color: "#7c3aed" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
                      {s.icon}
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#0d1b3e]">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Últimos Sorteios — all 9 lotteries */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#0d1b3e]">Últimos Sorteios</h2>
                <Link href="/resultados">
                  <span className="text-xs text-[#2563eb] hover:underline cursor-pointer flex items-center gap-1">
                    Ver todos <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_SLUGS.map((slug) => {
                  const data = ultimosMap[slug];
                  const color = getLotteryColor(slug);
                  const dezenas = (data?.dezenas as number[]) ?? [];
                  return (
                    <Link key={slug} href={`/${slug}`}>
                      <div className="p-3 rounded-xl border border-gray-100 hover:border-gray-300 cursor-pointer transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase" style={{ color }}>{getLotteryName(slug)}</span>
                          {data && <span className="text-[10px] text-muted-foreground">#{data.numero}</span>}
                        </div>
                        {data ? (
                          <BallRow numbers={dezenas.slice(0, 6)} loteria={slug} size="sm" />
                        ) : (
                          <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-5 h-5 rounded-full bg-gray-100 animate-pulse" />)}</div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Carteira */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#0d1b3e]">Minha Carteira</h2>
                <Link href="/gerador">
                  <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-1 text-xs">
                    <Zap className="w-3.5 h-3.5" /> Gerar jogo
                  </Button>
                </Link>
              </div>

              {!carteira || carteira.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">Nenhum jogo salvo ainda.</p>
                  <Link href="/gerador">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Zap className="w-3.5 h-3.5" /> Gerar meu primeiro jogo
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {carteira.slice(0, 5).map((jogo: any) => {
                    const color = getLotteryColor(jogo.loteriaSlug);
                    const dezenas = (jogo.dezenas as number[]) ?? [];
                    return (
                      <div key={jogo.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold" style={{ color }}>{getLotteryName(jogo.loteriaSlug)}</p>
                            <div className="overflow-x-auto">
                              <BallRow numbers={dezenas} loteria={jogo.loteriaSlug} size="sm" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:inline">{formatDateShort(jogo.criadoEm)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => deletarMutation.mutate({ id: jogo.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {carteira.length > 5 && (
                    <Link href="/clube/carteira">
                      <Button variant="ghost" size="sm" className="w-full text-[#2563eb] gap-1">
                        Ver todos ({carteira.length}) <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Gerar Jogo", href: "/gerador", icon: <Zap className="w-5 h-5" />, color: "#2563eb" },
                { label: "Conferidor", href: "/conferidor", icon: <Search className="w-5 h-5" />, color: "#16a34a" },
                { label: "Estatísticas", href: "/megasena/estatisticas", icon: <BarChart3 className="w-5 h-5" />, color: "#7c3aed" },
                { label: "Resultados", href: "/resultados", icon: <TrendingUp className="w-5 h-5" />, color: "#ea580c" },
              ].map(action => (
                <Link key={action.label} href={action.href}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: action.color }}>
                      {action.icon}
                    </div>
                    <span className="text-xs font-semibold text-[#0d1b3e] text-center">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
