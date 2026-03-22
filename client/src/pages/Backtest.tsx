import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, Trophy, BarChart3, ChevronDown, RotateCcw, Clock, Database, Award } from "lucide-react";

type LotterySlug = "megasena" | "lotofacil" | "quina" | "lotomania" | "timemania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria";

const LOTTERY_CONFIG: Record<LotterySlug, { min: number; max: number; qtd: number; name: string; color: string; apiSlug: string }> = {
  megasena:       { min: 1, max: 60, qtd: 6,  name: "Mega-Sena",        color: "#16a34a", apiSlug: "mega-sena" },
  lotofacil:      { min: 1, max: 25, qtd: 15, name: "Lotofácil",        color: "#7c3aed", apiSlug: "lotofacil" },
  quina:          { min: 1, max: 80, qtd: 5,  name: "Quina",            color: "#2563eb", apiSlug: "quina" },
  lotomania:      { min: 0, max: 99, qtd: 50, name: "Lotomania",        color: "#ea580c", apiSlug: "lotomania" },
  timemania:      { min: 1, max: 80, qtd: 10, name: "Timemania",        color: "#059669", apiSlug: "timemania" },
  duplasena:      { min: 1, max: 50, qtd: 6,  name: "Dupla Sena",       color: "#dc2626", apiSlug: "dupla-sena" },
  diadesorte:     { min: 1, max: 31, qtd: 7,  name: "Dia de Sorte",     color: "#ca8a04", apiSlug: "dia-de-sorte" },
  supersete:      { min: 0, max: 9,  qtd: 7,  name: "Super Sete",       color: "#0d9488", apiSlug: "super-sete" },
  maismilionaria: { min: 1, max: 50, qtd: 6,  name: "+Milionária",      color: "#4f46e5", apiSlug: "mais-milionaria" },
};

// Fallback labels (backend also returns these via prizeTiers)
const FAIXA_LABELS: Record<string, Record<number, string>> = {
  megasena: { 6: "Sena", 5: "Quina", 4: "Quadra" },
  lotofacil: { 15: "15 acertos", 14: "14 acertos", 13: "13 acertos", 12: "12 acertos", 11: "11 acertos" },
  quina: { 5: "Quina", 4: "Quadra", 3: "Terno", 2: "Duque" },
  lotomania: { 20: "20 acertos", 19: "19 acertos", 18: "18 acertos", 17: "17 acertos", 16: "16 acertos", 15: "15 acertos", 0: "0 acertos" },
  timemania: { 7: "7 acertos", 6: "Sena", 5: "Quina", 4: "Quadra", 3: "Terno" },
  duplasena: { 6: "Sena", 5: "Quina", 4: "Quadra", 3: "Terno" },
  diadesorte: { 7: "7 acertos", 6: "Sena", 5: "Quina", 4: "Quadra" },
  supersete: { 7: "7 acertos", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos" },
  maismilionaria: { 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos", 2: "2 acertos" },
};

// Min acertos that count as a prize for each lottery
const MIN_PRIZE_ACERTOS: Record<string, number> = {
  megasena: 4, lotofacil: 11, quina: 2, lotomania: 0, timemania: 3,
  duplasena: 3, diadesorte: 4, supersete: 3, maismilionaria: 2,
};

// Color gradient for prize tiers (higher = more golden)
function getFaixaColor(slug: string, acertos: number, config: { qtd: number; color: string }) {
  const tiers = FAIXA_LABELS[slug] ?? {};
  const tierKeys = Object.keys(tiers).map(Number).sort((a, b) => a - b);
  if (tierKeys.length === 0) return { bg: `${config.color}15`, text: config.color };
  
  const idx = tierKeys.indexOf(acertos);
  const maxIdx = tierKeys.length - 1;
  
  if (acertos >= config.qtd) return { bg: "#fef3c7", text: "#b45309" }; // Gold for max prize
  if (idx >= maxIdx - 1) return { bg: "#dcfce7", text: "#15803d" }; // Green for high tiers
  return { bg: `${config.color}15`, text: config.color }; // Default color
}

export default function Backtest() {
  const [slug, setSlug] = useState<LotterySlug>("megasena");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [minAcertos, setMinAcertos] = useState(3);
  const [queryInput, setQueryInput] = useState<{
    loteriaSlug: string;
    dezenas: number[];
    minAcertos: number;
    limit: number;
    offset: number;
  } | null>(null);

  const config = LOTTERY_CONFIG[slug];
  const color = config.color;
  const minPrize = MIN_PRIZE_ACERTOS[slug] ?? 3;

  const { data, isLoading } = trpc.backtest.analisar.useQuery(queryInput!, {
    enabled: !!queryInput,
  });

  const handleToggleNumber = (n: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= config.qtd) return prev;
      return [...prev, n];
    });
    setQueryInput(null);
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setQueryInput(null);
  };

  const handleChangeLottery = (s: LotterySlug) => {
    setSlug(s);
    setSelectedNumbers([]);
    setQueryInput(null);
    const mp = MIN_PRIZE_ACERTOS[s] ?? 3;
    setMinAcertos(Math.max(mp, 1));
  };

  const handleAnalyze = () => {
    if (selectedNumbers.length < config.qtd) return;
    setQueryInput({
      loteriaSlug: config.apiSlug,
      dezenas: [...selectedNumbers].sort((a, b) => a - b),
      minAcertos,
      limit: 50,
      offset: 0,
    });
  };

  const handleShowAll = () => {
    if (!queryInput) return;
    setQueryInput({ ...queryInput, limit: 500, offset: 0 });
  };

  const numbers: number[] = [];
  for (let i = config.min; i <= config.max; i++) numbers.push(i);
  const cols = config.max <= 31 ? 8 : 10;

  // Get faixa label from backend data or fallback
  const getFaixaLabel = (acertos: number): string => {
    const backendTiers = data?.prizeTiers as Record<string, string> | undefined;
    if (backendTiers && backendTiers[String(acertos)]) return backendTiers[String(acertos)];
    return FAIXA_LABELS[slug]?.[acertos] || `${acertos} acertos`;
  };

  // Check if acertos is a prize-winning tier
  const isPrizeTier = (acertos: number): boolean => {
    const tiers = FAIXA_LABELS[slug] ?? {};
    return acertos in tiers;
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e]">
      {/* Header */}
      <div className="bg-[#0d1b3e] text-white py-8 px-4">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl md:text-3xl font-bold">Backtest Valtor</h1>
          </div>
          <p className="text-gray-300 text-sm md:text-base">
            Insira um jogo e descubra em quantos sorteios do passado ele teria sido premiado — incluindo quadras, quinas, ternos e todas as faixas
          </p>
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Input panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Lottery selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-600 mb-3">Selecionar Loteria</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LOTTERY_CONFIG) as LotterySlug[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleChangeLottery(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={
                      slug === s
                        ? { backgroundColor: LOTTERY_CONFIG[s].color, color: "white", borderColor: LOTTERY_CONFIG[s].color }
                        : { borderColor: "#e5e7eb", color: "#374151" }
                    }
                  >
                    {LOTTERY_CONFIG[s].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Number grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Seu Jogo — {config.name}</h3>
              <p className="text-xs text-gray-400 mb-3">
                Selecione {config.qtd} números de {String(config.min).padStart(2, "0")} a {String(config.max).padStart(2, "0")}
              </p>

              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {numbers.map((n) => {
                  const isSelected = selectedNumbers.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => handleToggleNumber(n)}
                      className="aspect-square rounded-lg text-xs font-bold transition-all border"
                      style={
                        isSelected
                          ? { backgroundColor: color, color: "white", borderColor: color }
                          : { borderColor: "#e5e7eb", color: "#374151" }
                      }
                    >
                      {String(n).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>

              {selectedNumbers.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Selecionados: {selectedNumbers.length}/{config.qtd}</p>
                  <div className="flex flex-wrap gap-1">
                    {[...selectedNumbers].sort((a, b) => a - b).map((n) => (
                      <span
                        key={n}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Min acertos slider */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Mínimo de acertos</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                    {minAcertos}+ acertos
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={config.qtd}
                  value={minAcertos}
                  onChange={(e) => setMinAcertos(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: color }}
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>1</span>
                  <span>{config.qtd}</span>
                </div>
              </div>

              {/* Prize tiers info */}
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Faixas de premiação — {config.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(FAIXA_LABELS[slug] ?? {})
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([acertos, label]) => {
                      const fc = getFaixaColor(slug, Number(acertos), config);
                      return (
                        <span
                          key={acertos}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: fc.bg, color: fc.text }}
                        >
                          {label}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={selectedNumbers.length < config.qtd || isLoading}
                  className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ backgroundColor: color }}
                >
                  <Search className="w-4 h-4" />
                  {isLoading ? "Analisando..." : "Analisar Histórico"}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results panel */}
          <div className="lg:col-span-3 space-y-4">
            {!queryInput ? (
              <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                <RotateCcw className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-600 mb-2">Insira seu jogo</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  Selecione os números e clique em "Analisar Histórico" para ver como seu jogo teria performado nos sorteios passados — incluindo todas as faixas de premiação.
                </p>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                <div className="animate-spin w-10 h-10 border-4 border-gray-200 rounded-full" style={{ borderTopColor: color }} />
                <p className="text-sm text-gray-500 mt-4">Consultando histórico completo da {config.name}...</p>
                <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos na primeira consulta</p>
              </div>
            ) : data ? (
              <>
                {/* Summary card */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5" style={{ color }} />
                    <h3 className="font-bold text-gray-800">Resumo do Backtest</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold" style={{ color }}>{data.total}</p>
                      <p className="text-xs text-gray-500">Concursos com {minAcertos}+ acertos</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold" style={{ color }}>{data.maxAcertos}</p>
                      <p className="text-xs text-gray-500">Máximo de acertos</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Database className="w-4 h-4 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-600">{(data as any).totalConcursos?.toLocaleString("pt-BR") ?? "—"}</p>
                      </div>
                      <p className="text-xs text-gray-500">Concursos analisados</p>
                    </div>
                  </div>

                  {/* Prize tier distribution */}
                  {data.distribuicao && data.distribuicao.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Distribuição por Faixa de Premiação
                      </h4>
                      <div className="space-y-2">
                        {data.distribuicao
                          .sort((a, b) => b.acertos - a.acertos)
                          .map((d) => {
                            const label = (d as any).faixa || getFaixaLabel(d.acertos);
                            const pct = data.total > 0 ? (d.quantidade / data.total) * 100 : 0;
                            const fc = getFaixaColor(slug, d.acertos, config);
                            const isWinningTier = isPrizeTier(d.acertos);
                            return (
                              <div key={d.acertos} className="flex items-center gap-2">
                                <span className="text-xs font-medium w-28 text-right flex items-center justify-end gap-1">
                                  {d.acertos >= config.qtd && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                  {isWinningTier && d.acertos < config.qtd && <Award className="w-3 h-3" style={{ color: fc.text }} />}
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                    style={{ backgroundColor: fc.bg, color: fc.text }}
                                  >
                                    {label}
                                  </span>
                                </span>
                                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                  <div
                                    className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                                    style={{
                                      width: `${Math.max(pct, 5)}%`,
                                      backgroundColor: d.acertos >= config.qtd ? "#f59e0b" : fc.text,
                                      opacity: d.acertos >= config.qtd ? 1 : 0.8,
                                    }}
                                  >
                                    {pct > 15 && (
                                      <span className="text-[10px] text-white font-bold">{pct.toFixed(1)}%</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs font-bold w-12 text-right" style={{ color: fc.text }}>
                                  {d.quantidade}x
                                </span>
                              </div>
                            );
                          })}
                      </div>

                      {/* Summary of prize-winning concursos */}
                      {(() => {
                        const prizeResults = data.distribuicao.filter((d) => isPrizeTier(d.acertos));
                        const totalPrize = prizeResults.reduce((sum, d) => sum + d.quantidade, 0);
                        if (totalPrize > 0 && (data as any).totalConcursos) {
                          const pctWin = (totalPrize / (data as any).totalConcursos * 100);
                          return (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-xs text-green-700">
                                <span className="font-bold">Resultado:</span> Este jogo teria sido premiado em{" "}
                                <span className="font-bold">{totalPrize}</span> de{" "}
                                <span className="font-bold">{(data as any).totalConcursos?.toLocaleString("pt-BR")}</span> concursos ({pctWin.toFixed(2)}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Results list */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-gray-800">Concursos com Acertos</h3>
                    </div>
                    <span className="text-xs text-gray-400">{data.total} encontrados</span>
                  </div>

                  {data.results.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                      Nenhum concurso encontrado com {minAcertos}+ acertos para este jogo.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.results.map((r, idx) => {
                        const faixaLabel = (r as any).faixa || getFaixaLabel(r.acertos);
                        const isMaxPrize = r.acertos >= config.qtd;
                        const fc = getFaixaColor(slug, r.acertos, config);
                        const isWinning = isPrizeTier(r.acertos);

                        return (
                          <div
                            key={`${r.numero}-${idx}`}
                            className="border rounded-lg p-3 hover:shadow-sm transition-all"
                            style={{ borderLeftWidth: 4, borderLeftColor: isMaxPrize ? "#f59e0b" : isWinning ? fc.text : "#e5e7eb" }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-800">#{r.numero}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {isWinning && (
                                  <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                                    <Award className="w-3 h-3" />
                                    Premiado
                                  </span>
                                )}
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: fc.bg, color: fc.text }}
                                >
                                  {faixaLabel}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {(r.dezenasSorteadas as number[]).map((d: number) => {
                                const isMatch = (r.numerosAcertados as number[]).includes(d);
                                return (
                                  <span
                                    key={d}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={
                                      isMatch
                                        ? { backgroundColor: color, color: "white" }
                                        : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
                                    }
                                  >
                                    {String(d).padStart(2, "0")}
                                  </span>
                                );
                              })}
                            </div>

                            <p className="text-xs text-gray-500">
                              <span className="font-medium" style={{ color: fc.text }}>
                                {r.acertos} acertos
                              </span>
                              {isWinning && !isMaxPrize && (
                                <span className="text-green-600"> — faixa premiada</span>
                              )}
                              {isMaxPrize && (
                                <span className="text-amber-600 font-bold"> — PRÊMIO PRINCIPAL</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {data.results.length > 0 && data.total > data.results.length && (
                    <button
                      onClick={handleShowAll}
                      className="w-full mt-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Ver todos os {data.total} resultados
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
