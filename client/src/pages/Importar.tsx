import { useState, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, ClipboardPaste, CheckCircle2,
  AlertCircle, ArrowRight, Download, Wallet, Star,
  ChevronRight, Info
} from "lucide-react";

// ─── CONFIGURAÇÕES DAS LOTERIAS ──────────────────────────────────────────────
const LOTERIAS_CONFIG: Record<string, { nome: string; cor: string; min: number; max: number; qtd: number }> = {
  megasena:       { nome: "Mega-Sena",     cor: "#209869", min: 1,  max: 60,  qtd: 6  },
  lotofacil:      { nome: "Lotofácil",     cor: "#930089", min: 1,  max: 25,  qtd: 15 },
  quina:          { nome: "Quina",         cor: "#260085", min: 1,  max: 80,  qtd: 5  },
  lotomania:      { nome: "Lotomania",     cor: "#F78100", min: 0,  max: 99,  qtd: 20 },
  timemania:      { nome: "Timemania",     cor: "#00A650", min: 1,  max: 80,  qtd: 10 },
  duplasena:      { nome: "Dupla Sena",    cor: "#A8005A", min: 1,  max: 50,  qtd: 6  },
  diadesorte:     { nome: "Dia de Sorte",  cor: "#A8CF45", min: 1,  max: 31,  qtd: 7  },
  supersete:      { nome: "Super Sete",    cor: "#A8CF45", min: 0,  max: 9,   qtd: 7  },
  maismilionaria: { nome: "+Milionária",   cor: "#10B981", min: 1,  max: 50,  qtd: 6  },
};

// ─── PARSER DE TEXTO ─────────────────────────────────────────────────────────
interface JogoParseado {
  loteriaSlug: string;
  dezenas: number[];
  nome: string;
  valido: boolean;
  erro?: string;
}

function detectarLoteria(texto: string): string | null {
  const t = texto.toLowerCase();
  if (t.includes("mega") || t.includes("megasena")) return "megasena";
  if (t.includes("lotofácil") || t.includes("lotofacil")) return "lotofacil";
  if (t.includes("quina")) return "quina";
  if (t.includes("lotomania")) return "lotomania";
  if (t.includes("timemania")) return "timemania";
  if (t.includes("dupla")) return "duplasena";
  if (t.includes("dia de sorte") || t.includes("diadesorte")) return "diadesorte";
  if (t.includes("super sete") || t.includes("supersete")) return "supersete";
  if (t.includes("milionária") || t.includes("milionaria") || t.includes("+milionaria")) return "maismilionaria";
  return null;
}

function parsearTexto(texto: string, loteriaForcada?: string): JogoParseado[] {
  const jogos: JogoParseado[] = [];
  const linhas = texto.split(/\n/).map(l => l.trim()).filter(Boolean);

  let loteriaAtual = loteriaForcada || null;

  for (const linha of linhas) {
    // Detectar mudança de loteria
    const loteriaDetectada = detectarLoteria(linha);
    if (loteriaDetectada) {
      loteriaAtual = loteriaDetectada;
      // Linha pode conter também os números
    }

    // Extrair números da linha
    const numeros = linha.match(/\b\d{1,2}\b/g)?.map(Number) ?? [];
    const numerosUnicos = numeros.filter((n, i, arr) => arr.indexOf(n) === i);
    const numerosValidos = numerosUnicos.filter(n => n >= 0 && n <= 99);

    if (numerosValidos.length >= 5 && loteriaAtual) {
      const cfg = LOTERIAS_CONFIG[loteriaAtual];
      const dezenasOrdenadas = numerosValidos.sort((a, b) => a - b);

      // Validação básica
      let erro: string | undefined;
      if (cfg) {
        const foraRange = dezenasOrdenadas.filter(n => n < cfg.min || n > cfg.max);
        if (foraRange.length > 0) {
          erro = `Números fora do range (${cfg.min}–${cfg.max}): ${foraRange.join(", ")}`;
        }
      }

      jogos.push({
        loteriaSlug: loteriaAtual,
        dezenas: dezenasOrdenadas,
        nome: `${cfg?.nome ?? loteriaAtual} — Jogo importado`,
        valido: !erro,
        erro,
      });
    }
  }

  return jogos;
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function Importar() {
  const { user } = useAuth();
  const [texto, setTexto] = useState("");
  const [loteriaForcada, setLoteriaForcada] = useState("");
  const [jogosParseados, setJogosParseados] = useState<JogoParseado[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [resultado, setResultado] = useState<{ salvos: number; total: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const salvarLote = trpc.importar.salvarLote.useMutation();

  function analisarTexto(t: string) {
    const jogos = parsearTexto(t, loteriaForcada || undefined);
    setJogosParseados(jogos);
    setSelecionados(jogos.map((_, i) => i));
    setResultado(null);
    setErro(null);
  }

  function handleTextoChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTexto(e.target.value);
    if (e.target.value.length > 5) analisarTexto(e.target.value);
    else { setJogosParseados([]); setSelecionados([]); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const t = ev.target?.result as string;
      setTexto(t);
      analisarTexto(t);
    };
    reader.readAsText(file, "UTF-8");
  }

  function toggleJogo(idx: number) {
    setSelecionados(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }

  async function importar() {
    if (selecionados.length === 0) return;
    setErro(null);
    const jogosParaImportar = selecionados.map(i => jogosParseados[i]).filter(j => j.valido);
    try {
      const res = await salvarLote.mutateAsync({ jogos: jogosParaImportar });
      setResultado({ salvos: res.salvos, total: res.total });
      setSelecionados([]);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao importar jogos.");
    }
  }

  const qtdSelecionados = selecionados.filter(i => jogosParseados[i]?.valido).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Upload className="w-4 h-4" />
            Importador de Jogos
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">
            Importe seus jogos da Caixa<br />
            <span className="text-yellow-400">em segundos</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Cole o texto do comprovante, faça upload de um arquivo .txt ou use nossa
            extensão Chrome para importar diretamente do site da Caixa.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── EXTENSÃO CHROME CTA ── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-white shadow-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-bold text-yellow-300">RECOMENDADO</span>
            </div>
            <h3 className="text-lg font-black mb-1">Use a Extensão Chrome do Valtor</h3>
            <p className="text-blue-100 text-sm">
              Instale a extensão, acesse o site da Caixa e importe todos os seus jogos com 1 clique — sem copiar e colar nada.
            </p>
          </div>
          <a
            href="https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/valtor-extension_34f3cc9e.zip"
            download
            className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Baixar Extensão
          </a>
        </div>

        {/* ── ÁREA DE IMPORTAÇÃO ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-blue-600" />
              Importar por texto
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cole abaixo o texto do comprovante da Caixa ou uma lista de jogos no formato: <code className="bg-gray-100 px-1 rounded">01 05 12 23 34 45</code>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Seletor de loteria */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loteria (opcional — detectada automaticamente)
              </label>
              <select
                value={loteriaForcada}
                onChange={e => { setLoteriaForcada(e.target.value); if (texto) analisarTexto(texto); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Detectar automaticamente</option>
                {Object.entries(LOTERIAS_CONFIG).map(([slug, cfg]) => (
                  <option key={slug} value={slug}>{cfg.nome}</option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cole seus jogos aqui
              </label>
              <textarea
                value={texto}
                onChange={handleTextoChange}
                placeholder={`Exemplos de formatos aceitos:\n\nMega-Sena\n01 05 12 23 34 45\n07 14 21 28 35 42\n\nLotofácil\n01 02 03 04 05 06 07 08 09 10 11 12 13 14 15`}
                rows={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Upload de arquivo */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFile}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full border-dashed border-2 h-12 text-gray-500 hover:text-blue-600 hover:border-blue-400"
                onClick={() => fileRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Fazer upload de arquivo .txt ou .csv
              </Button>
            </div>
          </div>
        </div>

        {/* ── JOGOS DETECTADOS ── */}
        {jogosParseados.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {jogosParseados.length} jogo{jogosParseados.length !== 1 ? "s" : ""} detectado{jogosParseados.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => setSelecionados(jogosParseados.map((_, i) => i))}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Selecionar todos
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {jogosParseados.map((jogo, idx) => {
                const cfg = LOTERIAS_CONFIG[jogo.loteriaSlug];
                    const sel = selecionados.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${sel ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    onClick={() => jogo.valido && toggleJogo(idx)}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel && jogo.valido ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {sel && jogo.valido && <span className="text-white text-xs">✓</span>}
                    </div>

                    {/* Badge loteria */}
                    <span
                      className="text-xs font-bold text-white px-2.5 py-1 rounded-lg flex-shrink-0"
                      style={{ background: cfg?.cor ?? "#2563eb" }}
                    >
                      {cfg?.nome ?? jogo.loteriaSlug}
                    </span>

                    {/* Dezenas */}
                    <div className="flex flex-wrap gap-1 flex-1">
                      {jogo.dezenas.map(n => (
                        <span
                          key={n}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: cfg?.cor ?? "#2563eb" }}
                        >
                          {String(n).padStart(2, "0")}
                        </span>
                      ))}
                    </div>

                    {/* Status */}
                    {jogo.valido ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 text-xs flex-shrink-0">
                        <AlertCircle className="w-4 h-4" />
                        <span className="hidden sm:block">{jogo.erro}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resultado */}
            {resultado && (
              <div className="mx-5 mb-4 mt-2 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">
                    {resultado.salvos} jogo{resultado.salvos !== 1 ? "s" : ""} importado{resultado.salvos !== 1 ? "s" : ""} com sucesso!
                  </p>
                  <p className="text-sm text-green-600">
                    Acesse sua carteira para visualizar e conferir os jogos.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button size="sm" className="ml-auto flex-shrink-0 bg-green-600 hover:bg-green-700">
                    <Wallet className="w-3.5 h-3.5 mr-1.5" />
                    Ver carteira
                  </Button>
                </Link>
              </div>
            )}

            {erro && (
              <div className="mx-5 mb-4 mt-2 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{erro}</p>
              </div>
            )}

            {/* Botão importar */}
            <div className="p-5 pt-0">
              {!user ? (
                <a href={getLoginUrl()}>
                  <Button className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700">
                    Entrar para importar os jogos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              ) : (
                <Button
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700"
                  disabled={qtdSelecionados === 0 || salvarLote.isPending}
                  onClick={importar}
                >
                  {salvarLote.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar {qtdSelecionados > 0 ? qtdSelecionados : ""} jogo{qtdSelecionados !== 1 ? "s" : ""} para a carteira
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── CTA PREMIUM ── */}
        <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] rounded-2xl p-8 text-white text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 rounded-full px-4 py-1.5 text-sm font-bold mb-4">
            <Star className="w-4 h-4 fill-yellow-300" />
            Clube Valtor Premium
          </div>
          <h3 className="text-2xl font-black mb-3">
            Importe, confira e analise<br />seus jogos com IA
          </h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Membros do Clube Valtor têm acesso à conferência automática de acertos,
            análise de padrões e alertas por e-mail quando seus jogos acertam.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/planos">
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-[#0d1b3e] font-bold px-8">
                Ver planos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/analise">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold">
                Ver análises gratuitas
              </Button>
            </Link>
          </div>
        </div>

        {/* ── FORMATOS ACEITOS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-blue-500" />
            Formatos de texto aceitos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              { titulo: "Lista simples", exemplo: "Mega-Sena\n01 05 12 23 34 45\n07 14 21 28 35 42" },
              { titulo: "Comprovante da Caixa", exemplo: "Lotofácil Concurso 3638\nJogo 1: 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15" },
              { titulo: "Múltiplas loterias", exemplo: "Mega-Sena\n01 05 12 23 34 45\nQuina\n03 15 27 39 51" },
              { titulo: "Arquivo .txt", exemplo: "Qualquer arquivo de texto com os formatos acima — um jogo por linha" },
            ].map(f => (
              <div key={f.titulo} className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-2">{f.titulo}</p>
                <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap">{f.exemplo}</pre>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
