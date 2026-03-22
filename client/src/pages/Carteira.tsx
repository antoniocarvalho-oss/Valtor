import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BallRow } from "@/components/LotteryBall";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLotteryColor, getLotteryName, getLotteryIcon, getLotteryColorLight } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Wallet,
  Zap,
  Lock,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CircleDollarSign,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Filter,
  Download,
  Share2,
  X,
} from "lucide-react";

const ALL_SLUGS = [
  "megasena", "lotofacil", "quina", "lotomania", "timemania",
  "duplasena", "diadesorte", "supersete", "maismilionaria",
] as const;

type TabSlug = "todos" | typeof ALL_SLUGS[number];

export default function Carteira() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabSlug>("todos");
  const [folderFilter, setFolderFilter] = useState<number | "all" | "none">("all"); // "all" = all games, "none" = games without folder, number = specific folder id

  const utils = trpc.useUtils();

  const { data: carteira, isLoading: carteiraLoading } = trpc.carteira.listar.useQuery(
    {},
    { enabled: isAuthenticated }
  );

  const { data: roiData } = trpc.carteira.roi.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch user's folders
  const { data: folders } = trpc.pastas.listar.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // ── Folder delete ──
  const [folderToDelete, setFolderToDelete] = useState<{ id: number; nome: string; gameCount: number } | null>(null);

  const excluirPastaMutation = trpc.pastas.excluir.useMutation({
    onSuccess: () => {
      toast.success("Pasta excluída com sucesso!");
      utils.pastas.listar.invalidate();
      utils.carteira.listar.invalidate();
      utils.carteira.roi.invalidate();
      setFolderFilter("all");
      setFolderToDelete(null);
    },
    onError: (err) => toast.error(err.message || "Erro ao excluir pasta"),
  });

  const handleDeleteFolder = useCallback((folder: any) => {
    const count = carteira ? carteira.filter((g: any) => g.folderId === folder.id).length : 0;
    setFolderToDelete({ id: folder.id, nome: folder.nome, gameCount: count });
  }, [carteira]);

  const deletarMutation = trpc.carteira.excluir.useMutation({
    onSuccess: () => {
      toast.success("Jogo excluído");
      utils.carteira.listar.invalidate();
      utils.carteira.roi.invalidate();
    },
  });

  const marcarApostaMutation = trpc.carteira.marcarAposta.useMutation({
    onSuccess: () => {
      toast.success("Aposta atualizada!");
      utils.carteira.listar.invalidate();
      utils.carteira.roi.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar aposta"),
  });

  // PDF export
  const [exportingPdf, setExportingPdf] = useState(false);
  const handleExportPDF = async () => {
    const games = filteredGames;
    if (!games || games.length === 0) {
      toast.error("Nenhum jogo para exportar");
      return;
    }
    setExportingPdf(true);
    try {
      const gamesForPdf = games.map((g: any) => ({
        loteria: g.loteriaSlug,
        numeros: g.dezenas as number[],
        concurso: g.concursoAlvo ?? null,
        dataConcurso: null,
        custo: g.custoAposta ?? null,
      }));
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: gamesForPdf,
          title: activeTab === "todos" ? "Meus Jogos" : `Jogos ${activeTab}`,
          userName: user?.name || undefined,
        }),
      });
      if (!response.ok) throw new Error("Erro ao gerar PDF");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "valtor-meus-jogos.pdf";
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
    const games = filteredGames;
    if (!games || games.length === 0) {
      toast.error("Nenhum jogo para compartilhar");
      return;
    }
    // Group games by lottery
    const grouped: Record<string, typeof games> = {};
    games.forEach((g: any) => {
      const slug = g.loteriaSlug;
      if (!grouped[slug]) grouped[slug] = [];
      grouped[slug].push(g);
    });
    let text = `\ud83c\udf40 *Meus Jogos - Valtor*\n\n`;
    Object.entries(grouped).forEach(([slug, gms]) => {
      text += `*${getLotteryName(slug)}*\n`;
      (gms as any[]).forEach((g: any, i: number) => {
        const nums = (g.dezenas as number[]).map((n: number) => String(n).padStart(2, "0")).join(" - ");
        text += `Jogo ${i + 1}: ${nums}\n`;
        if (g.custoAposta) text += `\ud83d\udcb0 R$ ${Number(g.custoAposta).toFixed(2).replace(".", ",")}\n`;
      });
      text += `\n`;
    });
    text += `_Gerado por valtor.com.br_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Abrindo WhatsApp...");
  };

  const reutilizarMutation = trpc.carteira.reutilizar.useMutation({
    onSuccess: () => {
      toast.success("Jogo reutilizado! Nova aposta criada para o próximo sorteio.");
      utils.carteira.listar.invalidate();
      utils.carteira.roi.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao reutilizar jogo"),
  });

  // Group games by lottery
  const gamesByLoteria = useMemo(() => {
    if (!carteira) return {};
    const map: Record<string, typeof carteira> = {};
    for (const game of carteira) {
      const slug = game.loteriaSlug;
      if (!map[slug]) map[slug] = [];
      map[slug].push(game);
    }
    return map;
  }, [carteira]);

  // Lotteries that have games
  const activeLoterias = useMemo(() => {
    return ALL_SLUGS.filter(s => (gamesByLoteria[s]?.length ?? 0) > 0);
  }, [gamesByLoteria]);

  // Filtered games for current tab and folder
  const filteredGames = useMemo(() => {
    if (!carteira) return [];
    let games = carteira;
    // Filter by lottery tab
    if (activeTab !== "todos") {
      games = games.filter((g: any) => g.loteriaSlug === activeTab);
    }
    // Filter by folder
    if (folderFilter === "none") {
      games = games.filter((g: any) => !g.folderId);
    } else if (typeof folderFilter === "number") {
      games = games.filter((g: any) => g.folderId === folderFilter);
    }
    return games;
  }, [carteira, activeTab, folderFilter]);

  // Count games per folder
  const folderCounts = useMemo(() => {
    if (!carteira) return {};
    const counts: Record<string, number> = { all: carteira.length, none: 0 };
    for (const g of carteira) {
      if (!g.folderId) {
        counts.none++;
      } else {
        counts[g.folderId] = (counts[g.folderId] || 0) + 1;
      }
    }
    return counts;
  }, [carteira]);

  // ROI totals
  const roiTotals = useMemo(() => {
    if (!roiData || roiData.length === 0) return { totalApostado: 0, totalGanho: 0, roi: 0 };
    const totalApostado = roiData.reduce((s: number, r: any) => s + r.totalApostado, 0);
    const totalGanho = roiData.reduce((s: number, r: any) => s + r.totalGanho, 0);
    const roi = totalApostado > 0 ? ((totalGanho - totalApostado) / totalApostado) * 100 : 0;
    return { totalApostado, totalGanho, roi };
  }, [roiData]);

  function handleRemoveBet(gameId: number) {
    marcarApostaMutation.mutate({
      id: gameId,
      apostado: false,
    });
  }

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
          <p className="text-muted-foreground mb-6">Faça login para acessar sua carteira.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Fazer login</Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/clube/carteira">
              <ChevronLeft className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
            </Link>
            <h1 className="text-3xl font-black">Minha Carteira</h1>
          </div>
          <p className="text-white/70">Gerencie seus jogos, apostas e acompanhe seu retorno</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* ROI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0d1b3e]">{carteira?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Jogos salvos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <CircleDollarSign className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0d1b3e]">
              R$ {roiTotals.totalApostado.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground">Total investido</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0d1b3e]">
              R$ {roiTotals.totalGanho.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground">Total ganho</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                backgroundColor: roiTotals.roi >= 0 ? "#dcfce7" : "#fee2e2"
              }}>
                {roiTotals.roi >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
            <p className={`text-2xl font-black ${roiTotals.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
              {roiTotals.roi >= 0 ? "+" : ""}{roiTotals.roi.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">ROI geral</p>
          </div>
        </div>

        {/* ROI by Lottery Chart */}
        {roiData && roiData.length > 0 && (() => {
          const globalMax = Math.max(...roiData.map((r: any) => Math.max(r.totalApostado, r.totalGanho)), 1);
          return (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#0d1b3e]" />
                <h2 className="font-bold text-[#0d1b3e]">ROI por Loteria</h2>
              </div>

              {/* Vertical Bar Chart */}
              <div className="flex items-end gap-3 h-48 px-2 mb-2">
                {roiData.map((item: any) => {
                  const color = getLotteryColor(item.slug);
                  const investH = Math.max((item.totalApostado / globalMax) * 100, 3);
                  const ganhoH = Math.max((item.totalGanho / globalMax) * 100, 0);
                  const roi = item.totalApostado > 0
                    ? ((item.totalGanho - item.totalApostado) / item.totalApostado) * 100
                    : 0;
                  return (
                    <div key={item.slug} className="flex-1 flex flex-col items-center gap-1">
                      <span className={`text-[9px] font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {roi >= 0 ? "+" : ""}{roi.toFixed(0)}%
                      </span>
                      <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: "140px" }}>
                        {/* Investido bar */}
                        <div
                          className="rounded-t-sm transition-all duration-500 relative group"
                          style={{
                            width: "40%",
                            height: `${investH}%`,
                            backgroundColor: color,
                            opacity: 0.35,
                          }}
                          title={`Investido: R$ ${item.totalApostado.toFixed(2)}`}
                        />
                        {/* Ganho bar */}
                        <div
                          className="rounded-t-sm transition-all duration-500 relative group"
                          style={{
                            width: "40%",
                            height: `${ganhoH}%`,
                            backgroundColor: color,
                          }}
                          title={`Ganho: R$ ${item.totalGanho.toFixed(2)}`}
                        />
                      </div>
                      <span className="text-[9px] text-center text-muted-foreground leading-tight mt-1 truncate w-full">
                        {getLotteryIcon(item.slug)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detail rows */}
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                {roiData.map((item: any) => {
                  const color = getLotteryColor(item.slug);
                  const roi = item.totalApostado > 0
                    ? ((item.totalGanho - item.totalApostado) / item.totalApostado) * 100
                    : 0;
                  return (
                    <div key={item.slug} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium text-[#0d1b3e]">{getLotteryName(item.slug)}</span>
                        <span className="text-muted-foreground">({item.qtdApostas})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          R$ {item.totalApostado.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="font-medium" style={{ color }}>
                          R$ {item.totalGanho.toFixed(2).replace(".", ",")}
                        </span>
                        <span className={`font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2 rounded bg-gray-400 inline-block opacity-35" /> Investido
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2 rounded bg-gray-500 inline-block" /> Ganho
                </span>
              </div>
            </div>
          );
        })()}

        {/* Tabs by Lottery */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-gray-100 px-4 pt-4">
            <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              <button
                onClick={() => setActiveTab("todos")}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-all border-b-2 shrink-0 ${
                  activeTab === "todos"
                    ? "border-[#2563eb] text-[#2563eb] bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Todos ({carteira?.length ?? 0})
              </button>
              {activeLoterias.map(slug => {
                const count = gamesByLoteria[slug]?.length ?? 0;
                const color = getLotteryColor(slug);
                return (
                  <button
                    key={slug}
                    onClick={() => setActiveTab(slug)}
                    className={`px-3 py-2.5 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-all border-b-2 shrink-0 flex items-center gap-1.5 ${
                      activeTab === slug
                        ? "bg-opacity-10"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                    style={activeTab === slug ? {
                      borderColor: color,
                      color: color,
                      backgroundColor: getLotteryColorLight(slug),
                    } : {}}
                  >
                    <span className="text-xs">{getLotteryIcon(slug)}</span>
                    {getLotteryName(slug)}
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Folder filter */}
            {folders && folders.length > 0 && (
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <button
                  onClick={() => setFolderFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    folderFilter === "all"
                      ? "bg-[#2563eb] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todas ({folderCounts.all || 0})
                </button>
                <button
                  onClick={() => setFolderFilter("none")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    folderFilter === "none"
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sem pasta ({folderCounts.none || 0})
                </button>
                {folders.map((folder: any) => (
                  <div key={folder.id} className="relative flex items-center shrink-0">
                    <button
                      onClick={() => setFolderFilter(folder.id)}
                      className={`px-3 py-1.5 pr-7 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        folderFilter === folder.id
                          ? "text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={folderFilter === folder.id ? {
                        backgroundColor: folder.cor || "#6b7280",
                      } : {}}
                    >
                      <FolderOpen className="w-3 h-3" />
                      {folder.nome} ({folderCounts[folder.id] || 0})
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        folderFilter === folder.id
                          ? "hover:bg-white/30 text-white/80 hover:text-white"
                          : "hover:bg-red-100 text-gray-400 hover:text-red-500"
                      }`}
                      title="Excluir pasta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#0d1b3e] text-sm">
                {activeTab === "todos" ? "Todos os jogos" : getLotteryName(activeTab)}
                {folderFilter !== "all" && (
                  <span className="text-xs font-normal text-blue-600 ml-1">
                    {folderFilter === "none" ? "(sem pasta)" : `(${folders?.find((f: any) => f.id === folderFilter)?.nome || "pasta"})`}
                  </span>
                )}
                <span className="text-muted-foreground font-normal ml-2">
                  {filteredGames.length} jogo{filteredGames.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {filteredGames.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={exportingPdf}
                    className="text-[#0d1b3e] border-[#0d1b3e]/20 hover:bg-[#0d1b3e]/5 gap-1 text-xs"
                  >
                    <Download className={`w-3.5 h-3.5 ${exportingPdf ? "animate-bounce" : ""}`} /> PDF
                  </Button>
                )}
                {filteredGames && filteredGames.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareWhatsApp}
                    className="text-green-600 border-green-200 hover:bg-green-50 gap-1 text-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                )}
                <Link href="/gerador">
                  <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-1 text-xs">
                    <Zap className="w-3.5 h-3.5" /> Gerar jogo
                  </Button>
                </Link>
              </div>
            </div>

            {carteiraLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-3 border-[#2563eb] border-t-transparent rounded-full" />
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {activeTab === "todos"
                    ? "Nenhum jogo salvo ainda."
                    : `Nenhum jogo de ${getLotteryName(activeTab)} salvo.`}
                </p>
                <Link href="/gerador">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Zap className="w-3.5 h-3.5" /> Gerar meu primeiro jogo
                  </Button>
                </Link>
              </div>
            ) : (() => {
              // Split games into sections
              const aguardando = filteredGames.filter((g: any) => g.apostado && !g.conferido);
              const conferidos = filteredGames.filter((g: any) => g.apostado && g.conferido);
              const salvos = filteredGames.filter((g: any) => !g.apostado);
              const sections = [
                { key: "aguardando", label: "Aguardando Resultado", icon: <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />, games: aguardando, color: "amber" },
                { key: "conferidos", label: "Conferidos", icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, games: conferidos, color: "green" },
                { key: "salvos", label: "Jogos Salvos", icon: <Wallet className="w-4 h-4 text-gray-400" />, games: salvos, color: "gray" },
              ].filter(s => s.games.length > 0);

              return (
              <div className="space-y-5">
                {sections.map(section => (
                  <div key={section.key}>
                    <div className="flex items-center gap-2 mb-3">
                      {section.icon}
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {section.label}
                      </h3>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        {section.games.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                {section.games.map((jogo: any) => {
                  const color = getLotteryColor(jogo.loteriaSlug);
                  const dezenas = (jogo.dezenas as number[]) ?? [];
                  const isApostado = jogo.apostado;
                  const isConferido = jogo.conferido;
                  const acertos = jogo.acertos ?? 0;
                  const valorGanho = jogo.valorGanho ? Number(jogo.valorGanho) : 0;

                  return (
                    <div
                      key={jogo.id}
                      className={`rounded-xl border transition-all ${
                        isApostado
                          ? "border-l-4 bg-white shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                      style={isApostado ? { borderLeftColor: color } : {}}
                    >
                      <div className="p-4">
                        {/* Top row: lottery name + badges */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase" style={{ color }}>
                              {getLotteryName(jogo.loteriaSlug)}
                            </span>
                            {isApostado && !isConferido && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">
                                <Target className="w-2.5 h-2.5 mr-0.5" />
                                Apostado {jogo.concursoApostado ? `#${jogo.concursoApostado}` : ""}
                              </Badge>
                            )}
                            {isApostado && isConferido && acertos >= 4 && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200 animate-pulse">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                Premiado! {acertos} acertos
                              </Badge>
                            )}
                            {isApostado && isConferido && acertos < 4 && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600 border-gray-200">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                Conferido — {acertos} acerto{acertos !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {jogo.score && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${Number(jogo.score) >= 75 ? "#16a34a" : Number(jogo.score) >= 50 ? "#f5a623" : "#ea580c"}15`,
                                  color: Number(jogo.score) >= 75 ? "#16a34a" : Number(jogo.score) >= 50 ? "#f5a623" : "#ea580c",
                                }}>
                                Score {Number(jogo.score).toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ball row */}
                        <BallRow numbers={dezenas} loteria={jogo.loteriaSlug} size="sm" />

                        {/* Bet info row */}
                        {isApostado && (
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground flex-wrap">
                            {jogo.valorAposta && (
                              <span className="flex items-center gap-1">
                                <CircleDollarSign className="w-3 h-3 text-red-500" />
                                Aposta: R$ {Number(jogo.valorAposta).toFixed(2).replace(".", ",")}
                              </span>
                            )}
                            {isConferido && valorGanho > 0 && (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <DollarSign className="w-3 h-3" />
                                Ganho: R$ {valorGanho.toFixed(2).replace(".", ",")}
                              </span>
                            )}
                            {isConferido && acertos > 0 && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {acertos} acerto{acertos !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status / Actions */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            {!isApostado ? (
                              <span className="text-[11px] text-gray-400 italic flex items-center gap-1">
                                Jogo salvo — não apostado
                              </span>
                            ) : isConferido ? (
                              /* Already checked — show result summary */
                              acertos >= 4 ? (
                                <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Premiado! Confira na lotérica
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                                  Conferido — {acertos === 0 ? "nenhum acerto" : `${acertos} acerto${acertos !== 1 ? "s" : ""}`}
                                </span>
                              )
                            ) : (
                              /* Pending — waiting for result */
                              <span className="text-[11px] text-amber-600 flex items-center gap-1.5 font-medium">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Aguardando resultado
                                {jogo.concursoApostado && (
                                  <span className="text-amber-500 font-normal">
                                    (Concurso #{jogo.concursoApostado})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isApostado && !isConferido && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] gap-1 text-gray-400 hover:text-amber-600"
                                onClick={() => handleRemoveBet(jogo.id)}
                              >
                                <Clock className="w-3 h-3" /> Desmarcar
                              </Button>
                            )}
                            {(isConferido || !isApostado) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] gap-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => reutilizarMutation.mutate({ id: jogo.id })}
                                disabled={reutilizarMutation.isPending}
                              >
                                <RefreshCw className={`w-3 h-3 ${reutilizarMutation.isPending ? "animate-spin" : ""}`} />
                                Jogar novamente
                              </Button>
                            )}
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
                      </div>
                    </div>
                  );
                 })}
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        </div>

        {/* Info card about auto-checking */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Conferência Automática</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Seus jogos marcados como apostados são conferidos automaticamente quando o resultado do sorteio é publicado.
                Você receberá um e-mail com os resultados. A conferência acontece diariamente às 22:30 (horário de Brasília).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Folder Delete Confirmation Dialog ── */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setFolderToDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Excluir pasta "{folderToDelete.nome}"</h3>
                <p className="text-xs text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            {folderToDelete.gameCount > 0 ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Atenção:</strong> Esta pasta contém <strong>{folderToDelete.gameCount} jogo{folderToDelete.gameCount !== 1 ? "s" : ""}</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
                    onClick={() => excluirPastaMutation.mutate({ id: folderToDelete.id, excluirJogos: true })}
                    disabled={excluirPastaMutation.isPending}
                  >
                    {excluirPastaMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Excluir pasta e os {folderToDelete.gameCount} jogo{folderToDelete.gameCount !== 1 ? "s" : ""}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => excluirPastaMutation.mutate({ id: folderToDelete.id, excluirJogos: false })}
                    disabled={excluirPastaMutation.isPending}
                  >
                    {excluirPastaMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderOpen className="w-4 h-4 mr-2" />}
                    Excluir só a pasta (manter jogos)
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-10 text-gray-500"
                    onClick={() => setFolderToDelete(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Esta pasta está vazia. Deseja excluí-la?</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 h-10"
                    onClick={() => setFolderToDelete(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10"
                    onClick={() => excluirPastaMutation.mutate({ id: folderToDelete.id, excluirJogos: false })}
                    disabled={excluirPastaMutation.isPending}
                  >
                    {excluirPastaMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Excluir pasta
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
