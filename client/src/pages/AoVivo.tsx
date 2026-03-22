import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Radio, ExternalLink, Clock, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/hooks/useSEO";

// Cronograma oficial dos sorteios (horário de Brasília)
const SORTEIOS_SCHEDULE = [
  {
    slug: "megasena",
    nome: "Mega-Sena",
    cor: "#16a34a",
    diasSemana: [2, 4, 6], // Terça, Quinta, Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "lotofacil",
    nome: "Lotofácil",
    cor: "#7c3aed",
    diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "quina",
    nome: "Quina",
    cor: "#ea580c",
    diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "lotomania",
    nome: "Lotomania",
    cor: "#0ea5e9",
    diasSemana: [1, 3, 5], // Segunda, Quarta, Sexta
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "timemania",
    nome: "Timemania",
    cor: "#dc2626",
    diasSemana: [2, 4, 6], // Terça, Quinta, Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "duplasena",
    nome: "Dupla Sena",
    cor: "#d97706",
    diasSemana: [2, 4, 6], // Terça, Quinta, Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "diadesorte",
    nome: "Dia de Sorte",
    cor: "#db2777",
    diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "supersete",
    nome: "Super Sete",
    cor: "#059669",
    diasSemana: [1, 3, 5], // Segunda, Quarta, Sexta
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
  {
    slug: "maismilionaria",
    nome: "+Milionária",
    cor: "#6366f1",
    diasSemana: [3, 6], // Quarta e Sábado
    horario: "21:00",
    horarioMinutos: 21 * 60,
  },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function isAoVivo(now: Date): boolean {
  const diaSemana = now.getDay();
  const minutos = now.getHours() * 60 + now.getMinutes();
  // Sorteios acontecem de segunda a sábado às 21h (desde 03/11/2025), duração ~1h
  const temSorteioHoje = SORTEIOS_SCHEDULE.some((s) => s.diasSemana.includes(diaSemana));
  return temSorteioHoje && minutos >= 21 * 60 && minutos < 22 * 60;
}

function getSorteiosHoje(now: Date) {
  const diaSemana = now.getDay();
  return SORTEIOS_SCHEDULE.filter((s) => s.diasSemana.includes(diaSemana));
}

function getProximosSorteios(now: Date) {
  const diaSemana = now.getDay();
  const result: { dia: string; loterias: typeof SORTEIOS_SCHEDULE }[] = [];
  for (let i = 1; i <= 7; i++) {
    const dia = (diaSemana + i) % 7;
    const loterias = SORTEIOS_SCHEDULE.filter((s) => s.diasSemana.includes(dia));
    if (loterias.length > 0) {
      result.push({ dia: DIAS_SEMANA_FULL[dia], loterias });
      if (result.length >= 3) break;
    }
  }
  return result;
}

export default function AoVivo() {
  const [now, setNow] = useState(() => new Date());
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const aoVivo = isAoVivo(now);
  const sorteiosHoje = getSorteiosHoje(now);
  const proximosSorteios = getProximosSorteios(now);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO
        title="Sorteios Ao Vivo"
        description="Assista aos sorteios das loterias da Caixa ao vivo. Cronograma completo, horários e transmissão em tempo real."
        path="/ao-vivo"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0d1b3e] text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {aoVivo ? (
              <span className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" />
                AO VIVO AGORA
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-white/10 text-white/70 text-sm px-3 py-1 rounded-full">
                <Radio className="w-3.5 h-3.5" />
                Transmissão Oficial
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Sorteios das Loterias CAIXA
          </h1>
          <p className="text-white/70 text-lg">
            Acompanhe ao vivo pelo canal oficial da CAIXA no YouTube — todos os dias às 21h.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Player principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Embed YouTube */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
              {showEmbed ? (
                <div className="relative" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/live_stream?channel=UCpIBwBITQMBSkWF0VeE_mfg&autoplay=1"
                    title="Loterias CAIXA ao vivo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div
                  className="relative cursor-pointer group"
                  style={{ paddingBottom: "56.25%" }}
                  onClick={() => setShowEmbed(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] to-[#1e3a6e] flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {aoVivo && (
                      <span className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full" />
                        CLIQUE PARA ASSISTIR AO VIVO
                      </span>
                    )}
                    {!aoVivo && (
                      <div className="text-center">
                        <p className="text-white font-semibold text-lg">Canal Oficial Loterias CAIXA</p>
                        <p className="text-white/60 text-sm mt-1">Sorteios todos os dias às 21h</p>
                        <p className="text-white/40 text-xs mt-3">Clique para abrir o player</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botão YouTube externo */}
            <div className="flex gap-3">
              <a
                href="https://www.youtube.com/@canalcaixa/streams"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Abrir no YouTube
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
              <Link href="/resultados/megasena">
                <Button variant="outline" className="gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Ver resultados
                </Button>
              </Link>
            </div>

            {/* Sorteios de hoje */}
            {sorteiosHoje.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Sorteios de hoje — {DIAS_SEMANA_FULL[now.getDay()]}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sorteiosHoje.map((s) => (
                    <span
                      key={s.slug}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full text-white"
                      style={{ backgroundColor: s.cor }}
                    >
                      {s.nome}
                      <span className="text-white/70 text-xs">• {s.horario}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: cronograma */}
          <div className="space-y-4">
            {/* Status atual */}
            <div className={`rounded-2xl p-5 ${aoVivo ? "bg-red-50 border border-red-200" : "bg-white border border-gray-100"} shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className={`w-4 h-4 ${aoVivo ? "text-red-600" : "text-gray-400"}`} />
                <span className={`font-semibold text-sm ${aoVivo ? "text-red-700" : "text-gray-600"}`}>
                  {aoVivo ? "Sorteio em andamento!" : "Próximo sorteio"}
                </span>
              </div>
              {aoVivo ? (
                <p className="text-red-600 text-sm">
                  O sorteio está acontecendo agora. Clique no player para assistir ao vivo!
                </p>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-900">21:00</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {sorteiosHoje.length > 0
                      ? `Hoje — ${sorteiosHoje.length} loterias`
                      : `${proximosSorteios[0]?.dia ?? "Em breve"}`}
                  </p>
                </div>
              )}
            </div>

            {/* Cronograma semanal */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Calendário semanal
              </h3>
              <div className="space-y-3">
                {DIAS_SEMANA.map((dia, idx) => {
                  const loterias = SORTEIOS_SCHEDULE.filter((s) => s.diasSemana.includes(idx));
                  const isHoje = idx === now.getDay();
                  if (loterias.length === 0) return null;
                  return (
                    <div
                      key={dia}
                      className={`rounded-xl p-3 ${isHoje ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wide ${isHoje ? "text-blue-700" : "text-gray-500"}`}>
                          {dia} {isHoje && <span className="ml-1 text-blue-500">(hoje)</span>}
                        </span>
                        <span className="text-xs text-gray-400">21:00</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {loterias.map((l) => (
                          <span
                            key={l.slug}
                            className="text-xs text-white px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: l.cor }}
                          >
                            {l.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
              <strong>Transmissão oficial:</strong> O vídeo ao vivo é transmitido pelo canal oficial da CAIXA no YouTube. O Valtor não tem vínculo com a CAIXA Econômica Federal.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
