import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, ChevronRight, User, LogOut, LayoutDashboard, Wallet, Settings, MessageCircle, LogIn, Bell } from "lucide-react";
import ValtorLogo from "@/components/ValtorLogo";
import NotificationBell from "@/components/NotificationBell";



const navItems = [
  { label: "Home", href: "/" },
  { label: "Resultados", href: "/resultados", children: [
    { label: "Mega-Sena",    href: "/megasena",       color: "#16a34a" },
    { label: "Lotofácil",    href: "/lotofacil",      color: "#7c3aed" },
    { label: "Quina",        href: "/quina",          color: "#ea580c" },
    { label: "Lotomania",    href: "/lotomania",      color: "#0ea5e9" },
    { label: "Timemania",    href: "/timemania",      color: "#dc2626" },
    { label: "Dupla Sena",   href: "/duplasena",      color: "#d97706" },
    { label: "Dia de Sorte", href: "/diadesorte",     color: "#db2777" },
    { label: "Super Sete",   href: "/supersete",      color: "#059669" },
    { label: "+Milionária",  href: "/maismilionaria", color: "#6366f1" },
  ]},
  { label: "Estatísticas", href: "/estatisticas", children: [
    { label: "Mega-Sena",    href: "/megasena/estatisticas",       color: "#16a34a" },
    { label: "Lotofácil",    href: "/lotofacil/estatisticas",      color: "#7c3aed" },
    { label: "Quina",        href: "/quina/estatisticas",          color: "#ea580c" },
    { label: "Lotomania",    href: "/lotomania/estatisticas",      color: "#0ea5e9" },
    { label: "Timemania",    href: "/timemania/estatisticas",      color: "#dc2626" },
    { label: "Dupla Sena",   href: "/duplasena/estatisticas",      color: "#d97706" },
    { label: "Dia de Sorte", href: "/diadesorte/estatisticas",     color: "#db2777" },
    { label: "Super Sete",   href: "/supersete/estatisticas",      color: "#059669" },
    { label: "+Milionária",  href: "/maismilionaria/estatisticas", color: "#6366f1" },
  ]},
  { label: "Ferramentas", href: "/ferramentas", children: [
    { label: "Gerador de Jogos",    href: "/gerador",    color: "#2563eb" },
    { label: "Conferidor",          href: "/conferidor", color: "#2563eb" },
    { label: "Simulador",           href: "/simulador",  color: "#2563eb" },
    { label: "Backtest Valtor",      href: "/backtest",   color: "#f59e0b" },
    { label: "Importar Jogos",      href: "/importar",   color: "#7c3aed" },
    { label: "Aposta Rápida",       href: "/aposta-rapida", color: "#f59e0b" },
  ]},
  { label: "Loterias USA", href: "/us-lotteries", children: [
    { label: "Mega Millions",  href: "/mega-millions", color: "#1a6bc4" },
    { label: "Powerball",      href: "/powerball",      color: "#e63946" },
  ]},
  { label: "Análise", href: "/analise" },
  { label: "TV Valtor", href: "/tv-valtor", live: true },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "Planos", href: "/planos", highlight: true },
];

interface NavbarProps {
  dark?: boolean;
}

export default function Navbar({ dark = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => { logout(); } });

  const textColor = dark ? "text-white" : "text-[#0d1b3e]";
  const borderColor = dark ? "border-white/10" : "border-gray-200";
  const bgClass = dark
    ? "bg-transparent"
    : "bg-white shadow-sm";

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className={`sticky top-0 z-50 ${bgClass} border-b ${borderColor}`}>
      <div className="container">
        <div className="flex items-center justify-between" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
          {/* Logo + tagline */}
          <Link href="/" style={{ display: "block", flexShrink: 0 }}>
            <ValtorLogo dark={dark} size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${textColor} hover:bg-gray-100/80`}>
                      {item.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link href={child.href} className="flex items-center gap-2 cursor-pointer">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={item.label} href={item.href}>
                  <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    item.highlight
                      ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-full px-4"
                      : `${textColor} hover:bg-gray-100/80`
                  }`}>
                    {(item as { live?: boolean }).live && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    )}
                    {item.label}
                  </span>
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3 ml-3">
            {isAuthenticated ? (
              <>
                <NotificationBell dark={dark} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`flex items-center gap-2 ${textColor}`}>
                      <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </div>
                      <span className="max-w-24 truncate text-sm">{user?.name?.split(" ")[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/clube" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" /> Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/clube/carteira" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="w-4 h-4" /> Minha Carteira
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" /> Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full px-5">Entrar</Button>
              </a>
            )}
          </div>

          {/* Mobile: Bell + Toggle */}
          <div className="flex items-center gap-1 md:hidden">
            {isAuthenticated && <NotificationBell dark={dark} />}
            <button
              className={`p-2 rounded-md ${textColor}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="container flex flex-col py-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    {/* Accordion header — tap to expand/collapse */}
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-[#0d1b3e] hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          expandedSections[item.label] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* Accordion content — collapsible */}
                    {expandedSections[item.label] && (
                      <div className="ml-2 border-l-2 border-gray-100 mb-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}>
                            <span className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0d1b3e] hover:bg-gray-50 rounded-md cursor-pointer">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href} onClick={() => setMobileOpen(false)}>
                    <span className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer ${
                      item.highlight
                        ? "bg-[#2563eb] text-white my-1"
                        : "text-[#0d1b3e] hover:bg-gray-50"
                    }`}>
                      {(item as { live?: boolean }).live && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                      )}
                      {item.label}
                    </span>
                  </Link>
                )}
              </div>
            ))}

            {/* Separator */}
            <div className="border-t border-gray-200 my-2" />

            {/* User section for mobile */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0d1b3e] truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                {/* User links */}
                <Link href="/perfil" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0d1b3e] hover:bg-gray-50 rounded-md cursor-pointer">
                    <User className="w-4 h-4 text-gray-500" /> Meu Perfil
                  </span>
                </Link>
                <Link href="/clube" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0d1b3e] hover:bg-gray-50 rounded-md cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 text-gray-500" /> Painel
                  </span>
                </Link>
                <Link href="/clube/carteira" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0d1b3e] hover:bg-gray-50 rounded-md cursor-pointer">
                    <Wallet className="w-4 h-4 text-gray-500" /> Minha Carteira
                  </span>
                </Link>
                <Link href="/perfil" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0d1b3e] hover:bg-gray-50 rounded-md cursor-pointer">
                    <Settings className="w-4 h-4 text-gray-500" /> Configurações
                  </span>
                </Link>
                <button
                  onClick={() => { logoutMutation.mutate(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <a href={getLoginUrl()} className="w-full">
                  <Button size="sm" className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </a>
              </div>
            )}

            {/* WhatsApp button — always visible */}
            <div className="px-3 mt-2 pb-2">
              <a href="https://wa.me/5514991096186?text=Ol%C3%A1!%20Vim%20pelo%20site%20Valtor." target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" size="sm" className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
