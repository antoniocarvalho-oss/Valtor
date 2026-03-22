import { useState } from "react";
import { useSearch } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDate, getLotteryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, XCircle, Trophy, RefreshCw, Wallet, ChevronRight, Clock } from "lucide-react";
import SEO from "@/hooks/useSEO";

// Canonical slug (used by DB/API) → config
const LOTTERY_CONFIG: Record<string, { min: number; max: number; qtd: number; name: string; color: string }> = {
  megasena:       { min: 1, max: 60, qtd: 6,  name: "Mega-Sena",    color: "#16a34a" },
  lotofacil:      { min: 1, max: 25, qtd: 15, name: "Lotofácil",    color: "#7c3aed" },
  quina:          { min: 1, max: 80, qtd: 5,  name: "Quina",        color: "#ea580c" },
  lotomania:      { min: 0, max: 99, qtd: 50, name: "Lotomania",    color: "#0ea5e9" },
  timemania:      { min: 1, max: 80, qtd: 10, name: "Timemania",    color: "#dc2626" },
  duplasena:      { min: 1, max: 50, qtd: 6,  name: "Dupla Sena",   color: "#d97706" },
  diadesorte:     { min: 1, max: 31, qtd: 7,  name: "Dia de Sorte", color: "#db2777" },
  supersete:      { min: 0, max: 9,  qtd: 7,  name: "Super Sete",   color: "#059669" },
  maismilionaria: { min: 1, max: 50, qtd: 6,  name: "+Milionária",  color: "#6366f1" },
};

// Map legacy slugs (with hyphens) to canonical slugs (no hyphens)
const SLUG_ALIASES: Record<string, string> = {
  "mega-sena":       "megasena",
  "dupla-sena":      "duplasena",
  "dia-de-sorte":    "diadesorte",
  "super-sete":      "supersete",
  "mais-milionaria": "maismilionaria",
};

function normalizeSlug(raw: string | null): string {
  if (!raw) return "megasena";
  const lower = raw.toLowerCase().trim();
  return SLUG_ALIASES[lower] ?? (LOTTERY_CONFIG[lower] ? lower : "megasena");
}

const ALL_SLUGS = ["megasena", "lotofacil", "quina", "lotomania", "timemania", "duplasena", "diadesorte", "supersete", "maismilionaria"];

type Mode = "manual" | "carteira";

export default function Conferidor() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialSlug = normalizeSlug(params.get("loteria"));

  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("manual");
  const [slug, setSlug] = useState(initialSlug);
  const [dezenas, setDezenas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Carteira mode state
  const [carteiraResultados, setCarteiraResultados] = useState<any[]>([]);
  const [conferindoCarteira, setConferindoCarteira] = useState(false);

  const config = LOTTERY_CONFIG[slug] ?? LOTTERY_CONFIG.megasena;
  const color = config.color;

  const conferirQuery = trpc.conferidor.conferir.useQuery(
    { loteriaSlug: slug, dezenas },
    { enabled: false }
  );

  const { data: carteira } = trpc.carteira.listar.useQuery({}, { enabled: isAuthenticated });

  function handleAddNumber(num: number) {
    if (num < config.min || num > config.max) {
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
  }

  function handleRemove(num: number) {
    setDezenas(prev => prev.filter(n => n !== num));
    setResultado(null);
  }

  async function handleConferir() {
    if (dezenas.length !== config.qtd) {
      toast.error(`Adicione ${config.qtd} números para conferir`);
      return;
    }
    setLoading(true);
    try {
      const result = await conferirQuery.refetch();
      if (result.data) setResultado(result.data);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setDezenas([]);
    setResultado(null);
  }

  function handleChangeSlug(newSlug: string) {
    setSlug(newSlug);
    handleReset();
    setCarteiraResultados([]);
  }

  // Conferir todos os jogos da carteira para a loteria selecionada
  async function handleConferirCarteira() {
    if (!carteira || carteira.length === 0) {
      toast.error("Nenhum jogo salvo na carteira");
      return;
    }

    const jogosLoteria = carteira.filter((j: any) => normalizeSlug(j.loteriaSlug) === slug);
    if (jogosLoteria.length === 0) {
      toast.error(`Nenhum jogo de ${config.name} na carteira`);
      return;
    }

    setConferindoCarteira(true);
    setCarteiraResultados([]);

    try {
      const results: any[] = [];
      for (const jogo of jogosLoteria) {
        const jogoDezenasRaw = (jogo.dezenas as number[]) ?? [];
        // Create a temporary query for each game
        const res = await conferirQuery.refetch();
        // We need to use the tRPC client directly for each game
        results.push({
          jogo,
          dezenas: jogoDezenasRaw,
          pending: true,
        });
      }
      // We'll conferir one by one using the query
      const finalResults: any[] = [];
      for (const jogo of jogosLoteria) {
        const jogoDezenasRaw = (jogo.dezenas as number[]) ?? [];
        // Temporarily set dezenas and refetch
        setDezenas(jogoDezenasRaw);
        // Small delay to let React update
        await new Promise(r => setTimeout(r, 100));
      }
      // Actually, let's use a simpler approach - conferir each game sequentially
      setCarteiraResultados(jogosLoteria.map((j: any) => ({ jogo: j, resultado: null, loading: true })));
      
      for (let i = 0; i < jogosLoteria.length; i++) {
        const jogo = jogosLoteria[i];
        const jogoDezenasRaw = (jogo.dezenas as number[]) ?? [];
        try {
          // We need to make a direct fetch since useQuery doesn't support dynamic params easily
          const response = await fetch(`/api/trpc/conferidor.conferir?input=${encodeURIComponent(JSON.stringify({ loteriaSlug: slug, dezenas: jogoDezenasRaw }))}`);
          const json = await response.json();
          const data = json?.result?.data;
          setCarteiraResultados(prev => {
            const copy = [...prev];
            copy[i] = { jogo, resultado: data, loading: false };
            return copy;
          });
        } catch {
          setCarteiraResultados(prev => {
            const copy = [...prev];
            copy[i] = { jogo, resultado: null, loading: false, error: true };
            return copy;
          });
        }
      }
    } finally {
      setConferindoCarteira(false);
      setDezenas([]);
    }
  }

  // Mínimo de acertos para ganhar algum prêmio
  const acertosMinGanho =
    slug === "megasena" ? 4 :
    slug === "lotofacil" ? 11 :
    slug === "quina" ? 2 :
    slug === "lotomania" ? 0 :
    slug === "timemania" ? 3 :
    slug === "duplasena" ? 3 :
    slug === "diadesorte" ? 2 :
    slug === "supersete" ? 3 :
    slug === "maismilionaria" ? 2 : 4;

  // Count carteira games per lottery
  const jogosNaCarteira = carteira?.filter((j: any) => normalizeSlug(j.loteriaSlug) === slug).length ?? 0;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Conferidor de Apostas"
        description="Confira suas apostas automaticamente. Compare seus jogos com os resultados oficiais da Mega-Sena, Lotofácil, Quina e mais loterias da Caixa."
        path="/conferidor"
      />
      <Navbar />

      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white py-8">
        <div className="container">
          <h1 className="text-3xl font-black mb-1">Conferidor de Apostas</h1>
          <p className="text-white/70">Verifique se sua aposta ganhou no último concurso</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode("manual"); setCarteiraResultados([]); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === "manual"
                ? "bg-[#0d1b3e] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Search className="w-4 h-4" /> Conferir Manual
          </button>
          <button
            onClick={() => { setMode("carteira"); setResultado(null); setDezenas([]); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === "carteira"
                ? "bg-[#0d1b3e] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Wallet className="w-4 h-4" /> Conferir Carteira
            {isAuthenticated && carteira && carteira.length > 0 && (
              <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">{carteira.length}</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-5">
            {/* Lottery Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-4">Selecionar Loteria</h3>
              <div className="flex gap-2 flex-wrap">
                {ALL_SLUGS.map(s => {
                  const c = LOTTERY_CONFIG[s];
                  if (!c) return null;
                  const count = carteira?.filter((j: any) => normalizeSlug(j.loteriaSlug) === s).length ?? 0;
                  return (
                    <button
                      key={s}
                      onClick={() => handleChangeSlug(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                        slug === s ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                      style={slug === s ? { backgroundColor: c.color } : {}}
                    >
                      {c.name}
                      {mode === "carteira" && count > 0 && (
                        <span className="ml-1 opacity-70">({count})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === "manual" ? (
              /* Manual Number Input */
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] mb-1">Sua Aposta — {config.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Adicione {config.qtd} números entre {config.min} e {config.max}
                  {" "}({dezenas.length}/{config.qtd} adicionados)
                </p>

                {/* Number grid */}
                <div className={`grid gap-1.5 mb-4 ${config.max - config.min + 1 <= 31 ? "grid-cols-8" : "grid-cols-10"}`}>
                  {Array.from({ length: config.max - config.min + 1 }, (_, i) => i + config.min).map(n => (
                    <button
                      key={n}
                      onClick={() => dezenas.includes(n) ? handleRemove(n) : handleAddNumber(n)}
                      disabled={!dezenas.includes(n) && dezenas.length >= config.qtd}
                      className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                        dezenas.includes(n)
                          ? "text-white scale-105 shadow-sm"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      }`}
                      style={dezenas.includes(n) ? { backgroundColor: color } : {}}
                    >
                      {String(n).padStart(2, "0")}
                    </button>
                  ))}
                </div>

                {/* Selected */}
                {dezenas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Selecionados:</p>
                    <BallRow numbers={dezenas} loteria={slug} size="sm" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white gap-2"
                    style={{ backgroundColor: color }}
                    onClick={handleConferir}
                    disabled={loading || dezenas.length !== config.qtd}
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Conferir
                  </Button>
                  <Button variant="outline" onClick={handleReset}>Limpar</Button>
                </div>
              </div>
            ) : (
              /* Carteira Mode */
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] mb-1">Jogos da Carteira — {config.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {jogosNaCarteira > 0
                    ? `${jogosNaCarteira} jogo${jogosNaCarteira > 1 ? "s" : ""} salvo${jogosNaCarteira > 1 ? "s" : ""} para conferir`
                    : `Nenhum jogo de ${config.name} na carteira`
                  }
                </p>

                {!isAuthenticated ? (
                  <div className="text-center py-6">
                    <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Faça login para conferir seus jogos salvos.</p>
                  </div>
                ) : jogosNaCarteira === 0 ? (
                  <div className="text-center py-6">
                    <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum jogo de {config.name} salvo. Use o Gerador para criar jogos e salvar na carteira.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* List saved games */}
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                      {carteira?.filter((j: any) => normalizeSlug(j.loteriaSlug) === slug).map((jogo: any, idx: number) => {
                        const jogoDezenasRaw = (jogo.dezenas as number[]) ?? [];
                        return (
                          <div key={jogo.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                              {idx + 1}
                            </div>
                            <BallRow numbers={jogoDezenasRaw} loteria={slug} size="sm" />
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      className="w-full text-white gap-2"
                      style={{ backgroundColor: color }}
                      onClick={handleConferirCarteira}
                      disabled={conferindoCarteira}
                    >
                      {conferindoCarteira ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Conferindo...</>
                      ) : (
                        <><Search className="w-4 h-4" /> Conferir {jogosNaCarteira} jogo{jogosNaCarteira > 1 ? "s" : ""}</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Panel — Results */}
          <div>
            {mode === "manual" && !resultado && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
                  <Search className="w-8 h-8" style={{ color }} />
                </div>
                <h3 className="font-bold text-[#0d1b3e] mb-2">Confira sua aposta</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Selecione {config.qtd} números e clique em "Conferir" para verificar se você ganhou.
                </p>
              </div>
            )}

            {mode === "manual" && resultado && resultado.pendente && (
              <div className="space-y-4">
                <div className="rounded-2xl p-6 text-white text-center bg-gradient-to-br from-amber-500 to-amber-600">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-white/80" />
                  <h2 className="text-2xl font-black mb-1">Aguardando Resultado</h2>
                  <p className="text-white/80 text-sm max-w-xs mx-auto">{resultado.mensagem}</p>
                </div>
                <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                  <h3 className="font-bold text-[#0d1b3e] mb-3">Seus números</h3>
                  <BallRow numbers={dezenas} loteria={slug} size="sm" />
                  <p className="text-xs text-muted-foreground mt-3">
                    O resultado será publicado após o sorteio. Tente novamente mais tarde.
                  </p>
                </div>
              </div>
            )}

            {mode === "manual" && resultado && !resultado.pendente && (
              <div className="space-y-4">
                {/* Result Header */}
                <div className={`rounded-2xl p-6 text-white text-center ${
                  resultado.acertos >= acertosMinGanho
                    ? "bg-gradient-to-br from-green-600 to-green-700"
                    : "bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f]"
                }`}>
                  {resultado.acertos >= acertosMinGanho ? (
                    <>
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                      <h2 className="text-2xl font-black mb-1">Parabéns!</h2>
                      <p className="text-white/80">Você acertou {resultado.acertos} números!</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-12 h-12 mx-auto mb-3 text-white/50" />
                      <h2 className="text-2xl font-black mb-1">{resultado.acertos} acerto{resultado.acertos !== 1 ? "s" : ""}</h2>
                      <p className="text-white/70">Não foi dessa vez. Tente novamente!</p>
                    </>
                  )}
                </div>

                {/* Concurso Info */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#0d1b3e]">Concurso {resultado.concurso.numero}</h3>
                    <span className="text-xs text-muted-foreground">{formatDate(resultado.concurso.dataSorteio)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Números sorteados:</p>
                  <BallRow
                    numbers={resultado.concurso.dezenas}
                    loteria={slug}
                    size="sm"
                    highlightedNumbers={resultado.numerosAcertados}
                    className="mb-3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Números em destaque = seus acertos
                  </p>
                </div>

                {/* Premiação */}
                {resultado.ganhadores && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-[#0d1b3e] mb-3">Premiação do Concurso</h3>
                    <div className="space-y-2">
                      {(resultado.ganhadores as any[]).slice(0, 5).map((g: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-600">{g.faixa}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#0d1b3e]">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(g.premio)}
                            </span>
                            {g.quantidade > 0 && (
                              <span className="text-xs text-gray-400 ml-1">({g.quantidade})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === "carteira" && carteiraResultados.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
                  <Wallet className="w-8 h-8" style={{ color }} />
                </div>
                <h3 className="font-bold text-[#0d1b3e] mb-2">Confira seus jogos</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Selecione a loteria e clique em "Conferir" para verificar todos os jogos salvos na carteira de uma vez.
                </p>
              </div>
            )}

            {mode === "carteira" && carteiraResultados.length > 0 && (
              <div className="space-y-3">
                {/* Summary */}
                {!conferindoCarteira && (() => {
                  const hasWinner = carteiraResultados.some(r => r.resultado && !r.resultado.pendente && r.resultado.acertos >= acertosMinGanho);
                  const allPending = carteiraResultados.every(r => r.resultado?.pendente || r.error || !r.resultado);
                  const pendingCount = carteiraResultados.filter(r => r.resultado?.pendente).length;

                  if (allPending) {
                    return (
                      <div className="rounded-2xl p-5 text-white text-center bg-gradient-to-br from-amber-500 to-amber-600">
                        <Clock className="w-10 h-10 mx-auto mb-2 text-white/80" />
                        <h2 className="text-xl font-black mb-1">Aguardando Resultado</h2>
                        <p className="text-white/80 text-sm">O resultado ainda não foi publicado pela Caixa. Tente novamente mais tarde.</p>
                      </div>
                    );
                  }

                  return (
                    <div className={`rounded-2xl p-5 text-white text-center ${
                      hasWinner
                        ? "bg-gradient-to-br from-green-600 to-green-700"
                        : "bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f]"
                    }`}>
                      {hasWinner ? (
                        <>
                          <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
                          <h2 className="text-xl font-black mb-1">Você tem jogos premiados!</h2>
                          <p className="text-white/80 text-sm">
                            {carteiraResultados.filter(r => r.resultado && !r.resultado.pendente && r.resultado.acertos >= acertosMinGanho).length} de {carteiraResultados.length} jogos com acertos premiados
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-10 h-10 mx-auto mb-2 text-white/50" />
                          <h2 className="text-xl font-black mb-1">Nenhum jogo premiado</h2>
                          <p className="text-white/70 text-sm">
                            {pendingCount > 0
                              ? `${pendingCount} jogo(s) aguardando resultado`
                              : `Nenhum dos ${carteiraResultados.length} jogos atingiu a faixa de premiação`
                            }
                          </p>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Individual Results */}
                {carteiraResultados.map((item, idx) => {
                  const jogoDezenasRaw = (item.jogo.dezenas as number[]) ?? [];
                  const res = item.resultado;
                  const isWinner = res && res.acertos >= acertosMinGanho;

                  return (
                    <div key={item.jogo.id} className={`bg-white rounded-xl border p-4 shadow-sm ${
                      isWinner ? "border-green-300 bg-green-50/50" : "border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                            {idx + 1}
                          </div>
                          <span className="text-xs font-semibold text-[#0d1b3e]">Jogo {idx + 1}</span>
                        </div>
                        {item.loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                        ) : res?.pendente ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Aguardando
                          </span>
                        ) : res && !res.pendente ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isWinner ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {res.acertos} acerto{res.acertos !== 1 ? "s" : ""}
                          </span>
                        ) : item.error ? (
                          <span className="text-xs text-red-400">Erro de conexão</span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Aguardando
                          </span>
                        )}
                      </div>
                      <BallRow
                        numbers={jogoDezenasRaw}
                        loteria={slug}
                        size="sm"
                        highlightedNumbers={res?.numerosAcertados}
                      />
                      {isWinner && (
                        <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Jogo premiado!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
