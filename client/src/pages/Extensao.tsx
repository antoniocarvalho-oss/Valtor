import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import {
  Download, Chrome, CheckCircle2, Lock, Star,
  ArrowRight, Zap, Shield, MousePointerClick,
  Monitor, Smartphone, Globe, ChevronRight,
  Play, Layers, ShoppingCart, Key, Copy, RefreshCw,
  FileText, Eye, EyeOff
} from "lucide-react";
import SEO from "@/hooks/useSEO";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CDN_ZIP = "https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/aposta-rapida-valtor_17b6300e.zip";

const STEPS = [
  { num: "1", title: "Gere seus jogos no Valtor", desc: "Use o gerador inteligente e salve os jogos na sua carteira. Marque como \"Apostar no próximo concurso\"." },
  { num: "2", title: "Baixe e configure a extensão", desc: "Baixe o .zip, descompacte, abra chrome://extensions/, ative modo desenvolvedor, carregue a pasta e cole seu Token de API." },
  { num: "3", title: "Abra o site da Caixa", desc: "Acesse loteriasonline.caixa.gov.br e faça login na sua conta das Loterias Online." },
  { num: "4", title: "Clique na extensão e preencha", desc: "Clique no ícone V na barra do Chrome. Escolha os jogos e clique em \"Preencher volantes\". Pronto!" },
];

const FEATURES = [
  { icon: <Zap className="w-5 h-5" />, title: "Preenchimento automático", desc: "A extensão clica nos números do volante automaticamente. Sem digitar nada." },
  { icon: <Layers className="w-5 h-5" />, title: "Vários jogos de uma vez", desc: "Tem 20 jogos? A extensão preenche todos, um por um, e adiciona ao carrinho da Caixa." },
  { icon: <ShoppingCart className="w-5 h-5" />, title: "Carrinho inteligente", desc: "Escolha preencher todos os jogos pendentes ou selecione apenas os que quiser." },
  { icon: <Shield className="w-5 h-5" />, title: "Seguro e transparente", desc: "A extensão só interage com o site da Caixa. Nenhuma senha é armazenada." },
  { icon: <FileText className="w-5 h-5" />, title: "Importar TXT", desc: "Cole ou importe números de um arquivo .txt diretamente na extensão, sem precisar salvar no Valtor." },
];

const LOTERIAS_SUPORTADAS = [
  "Mega-Sena", "Lotofácil", "Quina", "Lotomania", "Timemania",
  "Dupla Sena", "Dia de Sorte", "Super Sete", "+Milionária"
];

function DownloadButton({ isAssinante, isLogado }: { isAssinante: boolean; isLogado: boolean }) {
  if (!isLogado) {
    return (
      <a href={getLoginUrl()}>
        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-[#0d1b3e] font-black text-lg px-10 h-14 shadow-xl">
          <Lock className="w-5 h-5 mr-2" />
          Entrar para baixar
        </Button>
      </a>
    );
  }

  if (!isAssinante) {
    return (
      <Link href="/planos">
        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-[#0d1b3e] font-black text-lg px-10 h-14 shadow-xl">
          <Star className="w-5 h-5 mr-2 fill-[#0d1b3e]" />
          Assinar o Clube para baixar
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    );
  }

  return (
    <a href={CDN_ZIP} download="valtor-aposta-rapida.zip">
      <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-[#0d1b3e] font-black text-lg px-10 h-14 shadow-xl">
        <Download className="w-5 h-5 mr-2" />
        Baixar Aposta Rápida
      </Button>
    </a>
  );
}

function TokenSection() {
  const { data: tokenData, isLoading, refetch } = trpc.apostaRapida.meuToken.useQuery();
  const gerarToken = trpc.apostaRapida.gerarToken.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Token gerado com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });
  const [showToken, setShowToken] = useState(false);

  const copyToken = useCallback(() => {
    if (tokenData?.token) {
      navigator.clipboard.writeText(tokenData.token);
      toast.success("Token copiado!");
    }
  }, [tokenData?.token]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-12 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Key className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Seu Token de API</h3>
          <p className="text-xs text-gray-500">Cole este token na extensão para conectar sua conta</p>
        </div>
      </div>

      {tokenData?.token ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 overflow-hidden">
              {showToken ? tokenData.token : "••••••••••••••••••••••••••••••••"}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowToken(!showToken)}
              title={showToken ? "Ocultar" : "Mostrar"}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToken}
              title="Copiar token"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Token ativo — cole na extensão
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={() => gerarToken.mutate()}
              disabled={gerarToken.isPending}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${gerarToken.isPending ? "animate-spin" : ""}`} />
              Regenerar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Gere um token para conectar a extensão Chrome à sua conta Valtor.
            O token permite que a extensão acesse seus jogos salvos.
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12"
            onClick={() => gerarToken.mutate()}
            disabled={gerarToken.isPending}
          >
            {gerarToken.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Gerar Token de API
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Extensao() {
  const { user, isAuthenticated } = useAuth();
  const { data: subscription } = trpc.assinatura.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isAssinante = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SEO
        title="Aposta Rápida Valtor — Extensão Chrome"
        description="Preencha automaticamente seus volantes no site das Loterias Caixa com os jogos gerados no Valtor. Extensão Chrome gratuita para assinantes."
        path="/extensao"
      />

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#0d1b3e] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 rounded-full px-5 py-2 text-sm font-bold mb-8">
            <Zap className="w-4 h-4" />
            Exclusivo Clube Valtor
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Chrome className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Aposta Rápida Valtor<br />
            <span className="text-yellow-400">Extensão para Chrome</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-4">
            Preencha automaticamente seus volantes no site das Loterias Online da Caixa.
            Gerou 20 jogos? A extensão preenche todos em segundos.
          </p>
          <p className="text-white/50 text-sm mb-10">
            Suporta todas as 9 loterias da Caixa + importação de TXT
          </p>

          <div className="flex flex-col items-center gap-4">
            <DownloadButton isAssinante={!!isAssinante} isLogado={!!isAuthenticated} />

            {!isAssinante && (
              <p className="text-white/50 text-sm">
                {isAuthenticated
                  ? "Assine o Clube Valtor por R$ 47,80/mês para liberar o download"
                  : "Faça login e assine o Clube Valtor para baixar a extensão"}
              </p>
            )}

            {isAssinante && (
              <p className="text-green-400 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Você é assinante — download liberado!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── TOKEN DE API (apenas para assinantes) ── */}
      {isAssinante && (
        <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-20 mb-8">
          <TokenSection />
        </div>
      )}

      {/* ── COMO FUNCIONA (visual) ── */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center text-[#0d1b3e] mb-3">
          Como funciona
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Do Valtor ao volante preenchido em 4 passos simples
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
                <div className="w-10 h-10 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center font-black text-lg mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FUNCIONALIDADES ── */}
      <div className="bg-white border-y border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center text-[#0d1b3e] mb-10">
            O que a Aposta Rápida faz por você
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOTERIAS SUPORTADAS ── */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-black text-center text-[#0d1b3e] mb-6">
          Loterias suportadas
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {LOTERIAS_SUPORTADAS.map((nome) => (
            <span key={nome} className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              {nome}
            </span>
          ))}
        </div>
      </div>

      {/* ── COMPATIBILIDADE ── */}
      <div className="bg-gray-50 border-y border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-center text-[#0d1b3e] mb-8">
            Compatibilidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Desktop</h3>
              <p className="text-sm text-green-600 font-semibold mb-1">100% automático</p>
              <p className="text-xs text-gray-500">Google Chrome, Microsoft Edge, Brave e outros navegadores Chromium</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Android</h3>
              <p className="text-sm text-green-600 font-semibold mb-1">Funciona via Kiwi Browser</p>
              <p className="text-xs text-gray-500">Instale o Kiwi Browser (Play Store) e carregue a extensão normalmente</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <Globe className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">iPhone / App Caixa</h3>
              <p className="text-sm text-amber-600 font-semibold mb-1">Manual</p>
              <p className="text-xs text-gray-500">Use a carteira do Valtor para copiar os números e digitar no app da Caixa</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTA MODO DESENVOLVEDOR ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <div className="text-amber-600 flex-shrink-0 mt-0.5 text-lg">ℹ️</div>
          <div className="text-sm text-amber-800">
            <strong>Por que modo desenvolvedor?</strong> A extensão ainda não está publicada na Chrome Web Store.
            O modo desenvolvedor permite instalar extensões locais com total segurança.
            Em breve estará disponível diretamente na Chrome Web Store para instalação com 1 clique.
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      {!isAssinante && (
        <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] py-16 px-4 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">
              Chega de preencher volante<br />
              <span className="text-yellow-400">número por número</span>
            </h2>
            <p className="text-white/70 mb-8">
              Assine o Clube Valtor e use a Aposta Rápida para preencher todos os seus jogos
              automaticamente no site da Caixa. Por apenas R$ 47,80/mês.
            </p>
            <Link href="/planos">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-[#0d1b3e] font-black text-lg px-10 h-14">
                <Star className="w-5 h-5 mr-2 fill-[#0d1b3e]" />
                Ver planos — R$ 47,80/mês
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
