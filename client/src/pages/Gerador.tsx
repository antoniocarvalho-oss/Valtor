import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Zap, Lock, Save, RefreshCw, Star, TrendingUp, ChevronDown, ChevronUp,
  Target, Info, BarChart3, Hash, Scale, Percent, FolderPlus, Folder,
  DollarSign, Calendar, Plus, X, Download, Share2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import SEO from "@/hooks/useSEO";
import { getBetPrice, LOTTERY_PRICING } from "@shared/lotteryPricing";

type LotterySlug = "megasena" | "lotofacil" | "quina" | "lotomania" | "timemania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria";

const LOTTERY_CONFIG: Record<LotterySlug, { min: number; max: number; qtd: number; name: string; color: string; apiSlug: string }> = {
  megasena:       { min: 1, max: 60, qtd: 6,  name: "Mega-Sena",        color: "#16a34a", apiSlug: "mega-sena" },
  lotofacil:      { min: 1, max: 25, qtd: 15, name: "Lotofácil",        color: "#7c3aed", apiSlug: "lotofacil" },
  quina:          { min: 1, max: 80, qtd: 5,  name: "Quina",            color: "#ea580c", apiSlug: "quina" },
  lotomania:      { min: 0, max: 99, qtd: 50, name: "Lotomania",        color: "#0891b2", apiSlug: "lotomania" },
  timemania:      { min: 1, max: 80, qtd: 10, name: "Timemania",        color: "#059669", apiSlug: "timemania" },
  duplasena:      { min: 1, max: 50, qtd: 6,  name: "Dupla Sena",       color: "#dc2626", apiSlug: "dupla-sena" },
  diadesorte:     { min: 1, max: 31, qtd: 7,  name: "Dia de Sorte",     color: "#ca8a04", apiSlug: "dia-de-sorte" },
  supersete:      { min: 0, max: 9,  qtd: 7,  name: "Super Sete",       color: "#65a30d", apiSlug: "super-sete" },
  maismilionaria: { min: 1, max: 50, qtd: 6,  name: "+Milionária",      color: "#1d4ed8", apiSlug: "mais-milionaria" },
};

const FOLDER_COLORS = [
  "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#dc2626",
  "#ca8a04", "#1d4ed8", "#059669", "#65a30d", "#ec4899",
];

interface GameResult {
  dezenas: number[];
  soma: number;
  pares: number;
  impares: number;
  primos: number;
  score: number;
}

export default function Gerador() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const rawSlug = params.get("loteria") ?? "megasena";
  const normalizedSlug = rawSlug.replace(/-/g, "") as LotterySlug;
  const initialSlug = LOTTERY_CONFIG[normalizedSlug] ? normalizedSlug : "megasena";

  const [slug, setSlug] = useState<LotterySlug>(initialSlug);
  const [quantidade, setQuantidade] = useState(3);
  const [jogos, setJogos] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllLotteries, setShowAllLotteries] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Premium check
  const { data: subscription } = trpc.assinatura.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isPremium = subscription?.status === "active";

  // Advanced filters state
  const [somaMin, setSomaMin] = useState<string>("");
  const [somaMax, setSomaMax] = useState<string>("");
  const [paresMin, setParesMin] = useState<string>("");
  const [paresMax, setParesMax] = useState<string>("");
  const [imparesMin, setImparesMin] = useState<string>("");
  const [imparesMax, setImparesMax] = useState<string>("");
  const [primosQtd, setPrimosQtd] = useState<string>("");
  const [excluirNums, setExcluirNums] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Bet toggle state per game
  const [apostarProximo, setApostarProximo] = useState<Record<number, boolean>>({});

  // Track which games have been saved (by index)
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  // Folder state
  const [selectedFolderId, setSelectedFolderId] = useState<string>("none");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);

  // Number count selector state
  const [qtdNumeros, setQtdNumeros] = useState<number>(0); // 0 means use default

  const config = LOTTERY_CONFIG[slug];
  const color = config.color;

  // Get min/max numbers from LOTTERY_PRICING
  const pricingConfig = useMemo(() => {
    const normalized = slug.replace(/-/g, "");
    return LOTTERY_PRICING[normalized];
  }, [slug]);

  // Effective number count (user selection or default)
  const effectiveQtdNumeros = useMemo(() => {
    if (!pricingConfig) return config.qtd;
    if (qtdNumeros === 0 || qtdNumeros < pricingConfig.minNumbers) return pricingConfig.minNumbers;
    return Math.min(qtdNumeros, pricingConfig.maxNumbers);
  }, [qtdNumeros, pricingConfig, config.qtd]);

  // Can this lottery have variable numbers?
  const hasVariableNumbers = pricingConfig ? pricingConfig.maxNumbers > pricingConfig.minNumbers : false;

  // Main lotteries shown by default
  const mainLotteries: LotterySlug[] = ["megasena", "lotofacil", "quina"];
  const allLotteries = Object.keys(LOTTERY_CONFIG) as LotterySlug[];
  const displayedLotteries = showAllLotteries ? allLotteries : mainLotteries;

  // Fetch folders for authenticated premium users
  const { data: folders, refetch: refetchFolders } = trpc.pastas.listar.useQuery(undefined, {
    enabled: isAuthenticated && !!isPremium,
  });

  // Fetch next draw info — uses slug as key so it refetches when lottery changes
  const { data: nextDrawData } = trpc.carteira.proximoConcurso.useQuery(
    { loteriaSlug: config.apiSlug },
    { staleTime: 5 * 60 * 1000 }
  );

  // Calculate bet price for current lottery based on selected number count
  const betPrice = useMemo(() => {
    return getBetPrice(slug, effectiveQtdNumeros);
  }, [slug, effectiveQtdNumeros]);

  // Free generator (useQuery with enabled: false for manual refetch)
  const gerarFreeQuery = trpc.gerador.gerar.useQuery(
    { loteriaSlug: config.apiSlug, quantidade: Math.min(quantidade, 5), qtdNumeros: effectiveQtdNumeros },
    { enabled: false }
  );

  // Premium generator (mutation — server applies all filters)
  const gerarPremiumMutation = trpc.gerador.gerarPremium.useMutation();

  // Track which index is currently being saved
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const salvarMutation = trpc.carteira.salvar.useMutation({
    onSuccess: (_data, variables) => {
      // Mark the game as saved
      if (savingIndex !== null) {
        setSavedIndexes(prev => new Set(prev).add(savingIndex));
        setSavingIndex(null);
      }
      if (variables.apostar) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Jogo salvo e aposta registrada!</span>
            <span className="text-xs opacity-80">Use a extensão Aposta Rápida para preencher automaticamente no site da Caixa.</span>
            <a href="/aposta-rapida" className="text-xs text-blue-300 underline mt-0.5">Saiba mais →</a>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.success("Jogo salvo na carteira!");
      }
    },
    onError: (err) => {
      setSavingIndex(null);
      if (err.message?.includes("mesmos números")) {
        toast.error("Jogo duplicado! Você já tem esse jogo salvo na carteira.", { duration: 5000 });
      } else {
        toast.error(err.message || "Erro ao salvar jogo");
      }
    },
  });

  // PDF export function
  const [exportingPdf, setExportingPdf] = useState(false);
  const handleExportPDF = async () => {
    if (jogos.length === 0) return;
    setExportingPdf(true);
    try {
      const gamesForPdf = jogos.map((jogo) => ({
        loteria: config.apiSlug,
        numeros: jogo.dezenas,
        concurso: nextDrawData?.proximoConcurso ?? null,
        dataConcurso: nextDrawData?.dataProximoConcurso ?? null,
        custo: getBetPrice(slug, jogo.dezenas.length),
      }));
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: gamesForPdf,
          title: `Jogos ${config.name}`,
          userName: user?.name || undefined,
        }),
      });
      if (!response.ok) throw new Error("Erro ao gerar PDF");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valtor-${config.apiSlug}-jogos.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF baixado com sucesso!");
    } catch {
      toast.error("Erro ao exportar PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (jogos.length === 0) return;
    const config = LOTTERY_CONFIG[slug];
    let text = `🍀 *Jogos ${config.name}* - Valtor\n`;
    if (nextDrawData?.proximoConcurso) {
      text += `📅 Concurso #${nextDrawData.proximoConcurso}`;
      if (nextDrawData.dataProximoConcurso) text += ` (${nextDrawData.dataProximoConcurso})`;
      text += `\n`;
    }
    text += `\n`;
    jogos.forEach((jogo, i) => {
      const nums = jogo.dezenas.map(n => String(n).padStart(2, "0")).join(" - ");
      const custo = getBetPrice(slug, jogo.dezenas.length) ?? 0;
      text += `*Jogo ${i + 1}:* ${nums}\n`;
      text += `💰 R$ ${custo.toFixed(2).replace(".", ",")}\n\n`;
    });
    const custoTotal = jogos.reduce((s, j) => s + (getBetPrice(slug, j.dezenas.length) ?? 0), 0);
    text += `*Total: R$ ${custoTotal.toFixed(2).replace(".", ",")}*\n`;
    text += `\n_Gerado por valtor.com.br_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Abrindo WhatsApp...");
  };

  const criarPastaMutation = trpc.pastas.criar.useMutation({
    onSuccess: (data) => {
      toast.success("Pasta criada!");
      refetchFolders();
      if (data?.id) {
        setSelectedFolderId(String(data.id));
      }
      setShowNewFolderDialog(false);
      setNewFolderName("");
      setNewFolderColor(FOLDER_COLORS[0]);
    },
    onError: () => toast.error("Erro ao criar pasta"),
  });

  // Parse excluded numbers
  const excludedNumbers = useMemo(() => {
    if (!excluirNums.trim()) return [] as number[];
    return excluirNums.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  }, [excluirNums]);

  // Check if any filter is active
  const hasFilters = somaMin || somaMax || paresMin || paresMax || imparesMin || imparesMax || primosQtd || excluirNums.trim();

  async function handleGerar() {
    setLoading(true);
    setApostarProximo({}); // Reset bet toggles on new generation
    try {
      if (isPremium) {
        const filtros: Record<string, unknown> = {};
        if (somaMin) filtros.somaMin = parseInt(somaMin);
        if (somaMax) filtros.somaMax = parseInt(somaMax);
        if (paresMin) filtros.paresMin = parseInt(paresMin);
        if (paresMax) filtros.paresMax = parseInt(paresMax);
        if (imparesMin) filtros.imparesMin = parseInt(imparesMin);
        if (imparesMax) filtros.imparesMax = parseInt(imparesMax);
        if (primosQtd) filtros.primosExato = parseInt(primosQtd);
        if (excludedNumbers.length > 0) filtros.excluir = excludedNumbers;

        const result = await gerarPremiumMutation.mutateAsync({
          loteriaSlug: config.apiSlug,
          quantidade,
          qtdNumeros: effectiveQtdNumeros,
          filtros: Object.keys(filtros).length > 0 ? filtros as any : undefined,
        });

        if (result.length === 0 && hasFilters) {
          toast.error("Nenhum jogo atendeu todos os filtros. Tente ajustar os critérios.");
        } else if (result.length < quantidade && hasFilters) {
          toast.info(`Gerados ${result.length} de ${quantidade} jogos — filtros muito restritivos.`);
        } else {
          toast.success(`${result.length} jogo${result.length !== 1 ? "s" : ""} gerado${result.length !== 1 ? "s" : ""}!`);
        }
        setJogos(result as GameResult[]);
        setSavedIndexes(new Set());
      } else {
        const result = await gerarFreeQuery.refetch();
        if (result.data) {
          toast.success(`${result.data.length} jogo${result.data.length !== 1 ? "s" : ""} gerado${result.data.length !== 1 ? "s" : ""}!`);
          setJogos(result.data as GameResult[]);
          setSavedIndexes(new Set());
        }
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao gerar jogos");
    } finally {
      setLoading(false);
    }
  }

  function handleSalvar(jogo: GameResult, index: number) {
    if (!isAuthenticated) {
      toast.error("Faça login para salvar jogos");
      return;
    }
    if (!isPremium) {
      toast("Carteira de jogos é exclusiva para assinantes Premium", {
        action: { label: "Assinar", onClick: () => window.location.href = "/planos" },
      });
      return;
    }
    if (savedIndexes.has(index)) return; // Already saved

    const isApostar = apostarProximo[index] ?? false;
    const folderId = selectedFolderId !== "none" ? parseInt(selectedFolderId) : undefined;

    setSavingIndex(index);
    salvarMutation.mutate({
      loteriaSlug: config.apiSlug,
      dezenas: jogo.dezenas,
      score: jogo.score,
      somaDezenas: jogo.soma,
      qtdPares: jogo.pares,
      qtdImpares: jogo.impares,
      qtdPrimos: jogo.primos,
      folderId: folderId,
      apostar: isApostar,
    });
  }

  function handleCriarPasta() {
    if (!newFolderName.trim()) {
      toast.error("Digite um nome para a pasta");
      return;
    }
    criarPastaMutation.mutate({
      nome: newFolderName.trim(),
      cor: newFolderColor,
    });
  }

  function getScoreColor(score: number) {
    if (score >= 75) return "#16a34a";
    if (score >= 50) return "#f5a623";
    return "#ea580c";
  }

  function clearFilters() {
    setSomaMin(""); setSomaMax("");
    setParesMin(""); setParesMax("");
    setImparesMin(""); setImparesMax("");
    setPrimosQtd("");
    setExcluirNums("");
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Gerador Inteligente de Jogos"
        description="Gere jogos inteligentes para Mega-Sena, Lotofácil, Quina e mais com análise estatística. Score de qualidade, filtros avançados e otimização por frequência."
        path="/gerador"
      />
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white py-8">
        <div className="container">
          <h1 className="text-3xl font-black mb-1">Gerador de Jogos</h1>
          <p className="text-white/70">Crie combinações inteligentes baseadas em análise estatística</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="space-y-5">
            {/* Lottery Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-4">Selecionar Loteria</h3>
              <div className="space-y-2">
                {displayedLotteries.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSlug(s); setJogos([]); setApostarProximo({}); setQtdNumeros(0); setSavedIndexes(new Set()); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      slug === s ? "border-current" : "border-gray-100 hover:border-gray-200"
                    }`}
                    style={slug === s ? { borderColor: LOTTERY_CONFIG[s].color, backgroundColor: `${LOTTERY_CONFIG[s].color}10` } : {}}
                  >
                    <span className="font-semibold text-sm text-[#0d1b3e]">{LOTTERY_CONFIG[s].name}</span>
                    <span className="text-xs text-gray-400">
                      {LOTTERY_CONFIG[s].qtd} números
                      {(() => {
                        const p = LOTTERY_PRICING[s.replace(/-/g, "")];
                        return p && p.maxNumbers > p.minNumbers ? ` (até ${p.maxNumbers})` : "";
                      })()}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAllLotteries(!showAllLotteries)}
                className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showAllLotteries ? (
                  <>Mostrar menos <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Ver todas as 9 loterias <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {/* Number Count Selector */}
            {hasVariableNumbers && pricingConfig && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] mb-1 flex items-center gap-2">
                  <Hash className="w-4 h-4" style={{ color }} /> Números por Jogo
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {effectiveQtdNumeros} número{effectiveQtdNumeros !== 1 ? "s" : ""} selecionado{effectiveQtdNumeros !== 1 ? "s" : ""}
                </p>
                <Slider
                  min={pricingConfig.minNumbers}
                  max={pricingConfig.maxNumbers}
                  step={1}
                  value={[effectiveQtdNumeros]}
                  onValueChange={([v]) => setQtdNumeros(v)}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{pricingConfig.minNumbers} (mín)</span>
                  <span>{pricingConfig.maxNumbers} (máx)</span>
                </div>
                {effectiveQtdNumeros > pricingConfig.minNumbers && betPrice !== null && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-700 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Custo com {effectiveQtdNumeros} números
                      </span>
                      <span className="font-bold text-amber-800">
                        {formatCurrency(betPrice)}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-600 mt-1">
                      Quanto mais números, maior a chance de acerto e maior o custo da aposta.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-1">Quantidade de Jogos</h3>
              <p className="text-xs text-muted-foreground mb-4">Gerar {quantidade} jogo{quantidade !== 1 ? "s" : ""}</p>
              <Slider
                min={1}
                max={isPremium ? 100 : 5}
                step={1}
                value={[quantidade]}
                onValueChange={([v]) => setQuantidade(v)}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span><span>{isPremium ? "100" : "5"}</span>
              </div>
              {!isPremium && (
                <p className="text-xs text-amber-600 mt-2">Premium: até 100 jogos por vez</p>
              )}
            </div>

            {/* Next Draw Info + Bet Price */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-[#0d1b3e] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color }} /> Próximo Sorteio
              </h3>
              <div className="space-y-2">
                {nextDrawData ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Concurso</span>
                      <span className="font-bold text-[#0d1b3e]">
                        {nextDrawData.proximoConcurso ?? "—"}
                      </span>
                    </div>
                    {nextDrawData.dataProximoConcurso && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Data</span>
                        <span className="font-semibold text-[#0d1b3e]">
                          {nextDrawData.dataProximoConcurso}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Carregando informações...</p>
                )}
                {betPrice !== null && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 mt-2">
                    <span className="text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Aposta ({effectiveQtdNumeros} nº)
                    </span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(betPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Folder Selector (Premium only) */}
            {isAuthenticated && isPremium && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-[#0d1b3e] mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-600" /> Salvar na Pasta
                </h3>
                <div className="space-y-3">
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sem pasta (raiz)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem pasta (raiz)</SelectItem>
                      {folders?.map((f: any) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                              style={{ backgroundColor: f.cor || "#16a34a" }}
                            />
                            {f.nome}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 text-xs"
                    onClick={() => setShowNewFolderDialog(true)}
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> Criar Nova Pasta
                  </Button>
                </div>
              </div>
            )}

            {/* Premium Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <button
                onClick={() => {
                  if (isPremium) {
                    setFiltersOpen(!filtersOpen);
                  } else {
                    toast("Assine o Premium para usar filtros avançados");
                  }
                }}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-bold text-[#0d1b3e]">Filtros Avançados</h3>
                {isPremium ? (
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs gap-1">
                    <Star className="w-3 h-3" /> Ativo
                  </Badge>
                ) : (
                  <Badge className="badge-premium gap-1">
                    <Lock className="w-3 h-3" /> Premium
                  </Badge>
                )}
              </button>

              {isPremium ? (
                filtersOpen && (
                  <div className="space-y-4 mt-4 animate-in slide-in-from-top-2">
                    {/* Soma */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Soma das dezenas</label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="Mín" value={somaMin} onChange={e => setSomaMin(e.target.value)} className="h-9" />
                        <Input type="number" placeholder="Máx" value={somaMax} onChange={e => setSomaMax(e.target.value)} className="h-9" />
                      </div>
                    </div>
                    {/* Pares */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Qtd. pares</label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="Mín" value={paresMin} onChange={e => setParesMin(e.target.value)} className="h-9" />
                        <Input type="number" placeholder="Máx" value={paresMax} onChange={e => setParesMax(e.target.value)} className="h-9" />
                      </div>
                    </div>
                    {/* Ímpares */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Qtd. ímpares</label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="Mín" value={imparesMin} onChange={e => setImparesMin(e.target.value)} className="h-9" />
                        <Input type="number" placeholder="Máx" value={imparesMax} onChange={e => setImparesMax(e.target.value)} className="h-9" />
                      </div>
                    </div>
                    {/* Primos */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Qtd. números primos</label>
                      <Input type="number" placeholder="Ex: 3" value={primosQtd} onChange={e => setPrimosQtd(e.target.value)} className="h-9" min={0} />
                      <p className="text-[10px] text-gray-400 mt-1">Quantidade exata de primos no jogo</p>
                    </div>
                    {/* Excluir */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Excluir números</label>
                      <Input
                        placeholder="Ex: 27, 28, 33"
                        value={excluirNums}
                        onChange={e => setExcluirNums(e.target.value)}
                        className="h-9"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Separe por vírgula</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  </div>
                )
              ) : (
                <div className="mt-4 space-y-3">
                  {["Soma mínima/máxima", "Qtd. pares/ímpares", "Qtd. números primos", "Excluir números"].map(label => (
                    <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
                      <Lock className="w-3.5 h-3.5" /> {label}
                    </div>
                  ))}
                  <Button className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md hover:shadow-lg transition-all" asChild>
                    <a href="/planos"><Star className="w-4 h-4 mr-1" /> Desbloquear Premium</a>
                  </Button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGerar}
              disabled={loading}
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg"
              style={{ backgroundColor: color }}
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> Gerar Jogos</>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {jogos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[#0d1b3e] mb-2">Pronto para gerar</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Configure as opções ao lado e clique em "Gerar Jogos" para criar combinações inteligentes baseadas em estatísticas reais.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0d1b3e]">
                    {jogos.length} jogo{jogos.length !== 1 ? "s" : ""} gerado{jogos.length !== 1 ? "s" : ""}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      disabled={exportingPdf}
                      className="text-[#0d1b3e] border-[#0d1b3e]/20 hover:bg-[#0d1b3e]/5"
                    >
                      <Download className={`w-4 h-4 mr-1 ${exportingPdf ? "animate-bounce" : ""}`} /> PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareWhatsApp}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Share2 className="w-4 h-4 mr-1" /> WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGerar} disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Gerar novos
                    </Button>
                  </div>
                </div>

                {jogos.map((jogo, i) => {
                  const isApostar = apostarProximo[i] ?? false;
                  const gameBetPrice = getBetPrice(slug, jogo.dezenas.length);

                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-[#0d1b3e]">Jogo #{i + 1}</span>
                        <div className="flex items-center gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full cursor-help transition-all hover:scale-105"
                                style={{ backgroundColor: `${getScoreColor(jogo.score)}15`, color: getScoreColor(jogo.score) }}
                              >
                                <TrendingUp className="w-3 h-3" /> Score {jogo.score}
                                <Info className="w-3 h-3 opacity-60" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" side="top" align="end">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getScoreColor(jogo.score)}15` }}>
                                    <TrendingUp className="w-4 h-4" style={{ color: getScoreColor(jogo.score) }} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-[#0d1b3e]">Score de Qualidade: {jogo.score}/100</p>
                                    <p className="text-[10px] text-gray-500">
                                      {jogo.score >= 75 ? "Excelente equilíbrio estatístico" : jogo.score >= 50 ? "Bom equilíbrio estatístico" : "Equilíbrio abaixo da média"}
                                    </p>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div className="h-2 rounded-full transition-all" style={{ width: `${jogo.score}%`, backgroundColor: getScoreColor(jogo.score) }} />
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  O Score mede a <strong>qualidade estatística</strong> do jogo (0–100) com base em critérios dos concursos reais:
                                </p>
                                <div className="space-y-1.5">
                                  <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Scale className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                                    <span><strong>Pares/Ímpares</strong> — distribuição equilibrada</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <BarChart3 className="w-3.5 h-3.5 mt-0.5 text-green-500 flex-shrink-0" />
                                    <span><strong>Frequência</strong> — números com histórico moderado</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Percent className="w-3.5 h-3.5 mt-0.5 text-purple-500 flex-shrink-0" />
                                    <span><strong>Soma</strong> — próxima da média histórica</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Hash className="w-3.5 h-3.5 mt-0.5 text-orange-500 flex-shrink-0" />
                                    <span><strong>Primos</strong> — quantidade adequada</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-400 italic border-t pt-2">
                                  Quanto maior o score, mais o jogo se aproxima dos padrões estatísticos dos sorteios reais. Não é previsão de acerto.
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                          {isAuthenticated && isPremium && (
                            savedIndexes.has(i) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 bg-green-100 border-green-400 text-green-700 hover:bg-green-100 cursor-default"
                                disabled
                              >
                                <Save className="w-3 h-3" /> Salvo ✓
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleSalvar(jogo, i)}
                                disabled={salvarMutation.isPending && savingIndex === i}
                              >
                                <Save className="w-3 h-3" /> {salvarMutation.isPending && savingIndex === i ? "Salvando..." : "Salvar"}
                              </Button>
                            )
                          )}
                          {isAuthenticated && !isPremium && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 border-amber-300 text-amber-600 hover:bg-amber-50"
                              asChild
                            >
                              <a href="/planos"><Lock className="w-3 h-3" /> Premium</a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <BallRow numbers={jogo.dezenas} loteria={slug} size="md" />

                      {/* Bet toggle with cost info */}
                      {isAuthenticated && isPremium && (
                        <div className={`mt-3 p-3 rounded-lg border transition-all ${
                          isApostar
                            ? "bg-green-50 border-green-200"
                            : "bg-amber-50 border-amber-100"
                        }`}>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`apostar-${i}`}
                              checked={isApostar}
                              onCheckedChange={(checked) => setApostarProximo(prev => ({ ...prev, [i]: !!checked }))}
                            />
                            <label htmlFor={`apostar-${i}`} className="text-xs cursor-pointer flex items-center gap-1" style={{ color: isApostar ? "#166534" : "#92400e" }}>
                              <Target className="w-3 h-3" /> Vou apostar este jogo no próximo sorteio
                            </label>
                          </div>

                          {/* Show cost and draw info when bet is checked */}
                          {isApostar && (
                            <div className="mt-2 pt-2 border-t border-green-200 space-y-1.5 animate-in slide-in-from-top-1">
                              {gameBetPrice !== null && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-green-700 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Custo da aposta
                                  </span>
                                  <span className="font-bold text-green-800">
                                    {formatCurrency(gameBetPrice)}
                                  </span>
                                </div>
                              )}
                              {nextDrawData?.proximoConcurso && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-green-700 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Concurso
                                  </span>
                                  <span className="font-semibold text-green-800">
                                    {nextDrawData.proximoConcurso}
                                    {nextDrawData.dataProximoConcurso && (
                                      <span className="text-green-600 font-normal ml-1">
                                        ({nextDrawData.dataProximoConcurso})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              <p className="text-[10px] text-green-600 italic mt-1">
                                Ao salvar, o custo será registrado automaticamente na sua carteira.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-3 mt-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-sm font-bold text-[#0d1b3e]">{jogo.soma}</div>
                          <div className="text-[10px] text-gray-500">Soma</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-sm font-bold text-[#0d1b3e]">{jogo.pares}</div>
                          <div className="text-[10px] text-gray-500">Pares</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-sm font-bold text-[#0d1b3e]">{jogo.impares}</div>
                          <div className="text-[10px] text-gray-500">Ímpares</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-sm font-bold text-[#0d1b3e]">{jogo.primos}</div>
                          <div className="text-[10px] text-gray-500">Primos</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção explicativa do Score */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <TrendingUp className="w-4 h-4" /> Como funciona o Score?
            </div>
            <h2 className="text-2xl font-black text-[#0d1b3e] mb-2">Entenda o Score de Qualidade</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Cada jogo gerado recebe uma nota de 0 a 100 que mede o quão equilibrado ele é em relação aos padrões estatísticos dos concursos reais da Caixa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-[#0d1b3e]">Pares e Ímpares</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Jogos com distribuição equilibrada entre números pares e ímpares pontuam mais. Na Mega-Sena, por exemplo, a maioria dos sorteios tem 3 pares e 3 ímpares.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-[#0d1b3e]">Frequência Histórica</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Números com frequência moderada (nem muito quentes, nem muito frios) contribuem positivamente. O algoritmo usa dados de todos os concursos desde o início.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-[#0d1b3e]">Soma das Dezenas</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Jogos cuja soma total das dezenas fica próxima da média histórica recebem pontuação maior. Somas muito altas ou muito baixas indicam desequilíbrio.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-[#0d1b3e]">Números Primos</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A quantidade de números primos no jogo é avaliada. Uma distribuição adequada de primos, compatível com o histórico, aumenta a pontuação.
              </p>
            </div>
          </div>

          {/* Score range legend */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-[#0d1b3e] text-center mb-4">Faixas de Score</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white border border-gray-100">
                <div className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full mb-2" style={{ backgroundColor: "#16a34a15", color: "#16a34a" }}>
                  <TrendingUp className="w-3.5 h-3.5" /> 75–100
                </div>
                <p className="text-xs text-gray-600 font-medium">Excelente</p>
                <p className="text-[11px] text-gray-400 mt-1">Jogo muito equilibrado, próximo dos padrões reais</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white border border-gray-100">
                <div className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full mb-2" style={{ backgroundColor: "#f5a62315", color: "#f5a623" }}>
                  <TrendingUp className="w-3.5 h-3.5" /> 50–74
                </div>
                <p className="text-xs text-gray-600 font-medium">Bom</p>
                <p className="text-[11px] text-gray-400 mt-1">Equilíbrio razoável, pode ser melhorado com filtros</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white border border-gray-100">
                <div className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full mb-2" style={{ backgroundColor: "#ea580c15", color: "#ea580c" }}>
                  <TrendingUp className="w-3.5 h-3.5" /> 0–49
                </div>
                <p className="text-xs text-gray-600 font-medium">Regular</p>
                <p className="text-[11px] text-gray-400 mt-1">Desequilíbrio detectado, considere gerar novos jogos</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-4 italic">
              O Score mede qualidade estatística, não probabilidade de acerto. Loterias são jogos de azar — jogue com responsabilidade.
            </p>
          </div>
        </div>
      </section>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-600" /> Criar Nova Pasta
            </DialogTitle>
            <DialogDescription>
              Organize seus jogos em pastas com nomes personalizados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nome da pasta</label>
              <Input
                placeholder="Ex: Jogos 6 números, Acima de 50 milhões..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="h-10"
                maxLength={100}
                onKeyDown={e => { if (e.key === "Enter") handleCriarPasta(); }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewFolderColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newFolderColor === c ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarPasta}
              disabled={criarPastaMutation.isPending || !newFolderName.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {criarPastaMutation.isPending ? (
                <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Criando...</>
              ) : (
                <><Plus className="w-4 h-4 mr-1" /> Criar Pasta</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
