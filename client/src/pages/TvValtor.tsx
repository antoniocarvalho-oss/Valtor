import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Radio, ExternalLink, Clock, Calendar, Tv, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/hooks/useSEO";

/* ═══════════════════════════════════════════════════════════
   CRONOGRAMA LOTERIAS BRASILEIRAS (horário de Brasília)
   Sorteios diários (seg-sáb) às 21:00 BRT
   ═══════════════════════════════════════════════════════════ */
const BR_SCHEDULE = [
  { slug: "megasena",       nome: "Mega-Sena",    cor: "#16a34a", diasSemana: [2, 4, 6],          horario: "21:00" },
  { slug: "lotofacil",      nome: "Lotofácil",     cor: "#7c3aed", diasSemana: [1, 2, 3, 4, 5, 6], horario: "21:00" },
  { slug: "quina",          nome: "Quina",         cor: "#ea580c", diasSemana: [1, 2, 3, 4, 5, 6], horario: "21:00" },
  { slug: "lotomania",      nome: "Lotomania",     cor: "#0ea5e9", diasSemana: [1, 3, 5],          horario: "21:00" },
  { slug: "timemania",      nome: "Timemania",     cor: "#dc2626", diasSemana: [2, 4, 6],          horario: "21:00" },
  { slug: "duplasena",      nome: "Dupla Sena",    cor: "#d97706", diasSemana: [2, 4, 6],          horario: "21:00" },
  { slug: "diadesorte",     nome: "Dia de Sorte",  cor: "#db2777", diasSemana: [1, 2, 3, 4, 5, 6], horario: "21:00" },
  { slug: "supersete",      nome: "Super Sete",    cor: "#059669", diasSemana: [1, 3, 5],          horario: "21:00" },
  { slug: "maismilionaria", nome: "+Milionária",   cor: "#6366f1", diasSemana: [3, 6],             horario: "21:00" },
];

/* ═══════════════════════════════════════════════════════════
   CRONOGRAMA LOTERIAS AMERICANAS (horário ET → BRT)
   Powerball: Mon, Wed, Sat 10:59 PM ET → 00:59 BRT (+1 dia)
   Mega Millions: Tue, Fri 11:00 PM ET → 01:00 BRT (+1 dia)
   ═══════════════════════════════════════════════════════════ */
const US_SCHEDULE = [
  {
    slug: "powerball",
    nome: "Powerball",
    cor: "#e63946",
    diasSemanaET: [1, 3, 6],   // Mon, Wed, Sat (ET)
    diasSemanaBRT: [2, 4, 0],  // Tue, Thu, Sun (BRT — next day)
    horarioET: "22:59",
    horarioBRT: "00:59",
    horarioLabel: "22:59 ET / 00:59 BRT",
  },
  {
    slug: "mega-millions",
    nome: "Mega Millions",
    cor: "#1a6bc4",
    diasSemanaET: [2, 5],      // Tue, Fri (ET)
    diasSemanaBRT: [3, 6],     // Wed, Sat (BRT — next day)
    horarioET: "23:00",
    horarioBRT: "01:00",
    horarioLabel: "23:00 ET / 01:00 BRT",
  },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
function isBrAoVivo(now: Date): boolean {
  const diaSemana = now.getDay();
  const minutos = now.getHours() * 60 + now.getMinutes();
  const temSorteioHoje = BR_SCHEDULE.some((s) => s.diasSemana.includes(diaSemana));
  return temSorteioHoje && minutos >= 20 * 60 + 50 && minutos < 22 * 60;
}

function isUsAoVivo(now: Date): boolean {
  // Convert current BRT time to check if US drawings are live
  // Powerball: Mon/Wed/Sat 22:59 ET (00:59 BRT next day)
  // Mega Millions: Tue/Fri 23:00 ET (01:00 BRT next day)
  const diaSemana = now.getDay();
  const minutos = now.getHours() * 60 + now.getMinutes();
  
  // Check if any US lottery is drawing now (BRT window: 00:30 - 01:30)
  const pbDays = [2, 4, 0]; // BRT days for Powerball
  const mmDays = [3, 6];    // BRT days for Mega Millions
  const isInWindow = minutos >= 0 * 60 + 30 && minutos < 1 * 60 + 30;
  return isInWindow && (pbDays.includes(diaSemana) || mmDays.includes(diaSemana));
}

function getBrSorteiosHoje(now: Date) {
  return BR_SCHEDULE.filter((s) => s.diasSemana.includes(now.getDay()));
}

function getUsSorteiosHoje(now: Date) {
  return US_SCHEDULE.filter((s) => s.diasSemanaBRT.includes(now.getDay()));
}

/* ═══════════════════════════════════════════════════════════
   PLAYER COMPONENT
   ═══════════════════════════════════════════════════════════ */
function LivePlayer({
  title,
  subtitle,
  embedUrl,
  youtubeUrl,
  isLive,
  accentColor,
  flag,
}: {
  title: string;
  subtitle: string;
  embedUrl: string;
  youtubeUrl: string;
  isLive: boolean;
  accentColor: string;
  flag: string;
}) {
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <h2 className="font-bold text-lg text-white">{title}</h2>
          {isLive && (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              AO VIVO
            </span>
          )}
        </div>
      </div>

      {/* Player */}
      <div className="bg-black rounded-xl overflow-hidden shadow-lg">
        {showEmbed ? (
          <div className="relative" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={title}
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
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}44 100%)`,
                backgroundColor: "#0d1b3e",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {isLive ? (
                <span className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  ASSISTIR AO VIVO
                </span>
              ) : (
                <div className="text-center px-4">
                  <p className="text-white font-semibold">{subtitle}</p>
                  <p className="text-white/50 text-xs mt-2">Clique para abrir o player</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botão YouTube */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2"
      >
        <Button variant="outline" size="sm" className="w-full gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/10 bg-transparent text-xs">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Abrir no YouTube
          <ExternalLink className="w-3 h-3" />
        </Button>
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function TvValtor() {
  const [now, setNow] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<"all" | "br" | "us">("all");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const brLive = isBrAoVivo(now);
  const usLive = isUsAoVivo(now);
  const anyLive = brLive || usLive;
  const brHoje = getBrSorteiosHoje(now);
  const usHoje = getUsSorteiosHoje(now);

  // Build weekly schedule for both
  const weekSchedule = useMemo(() => {
    return DIAS_SEMANA.map((dia, idx) => {
      const brLots = BR_SCHEDULE.filter((s) => s.diasSemana.includes(idx));
      const usLots = US_SCHEDULE.filter((s) => s.diasSemanaBRT.includes(idx));
      return { dia, idx, brLots, usLots, total: brLots.length + usLots.length };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      <SEO
        title="TV Valtor — Sorteios Ao Vivo"
        description="Assista aos sorteios das loterias brasileiras e americanas ao vivo. Cronograma completo de Mega-Sena, Lotofácil, Powerball, Mega Millions e todas as loterias."
        path="/tv-valtor"
      />
      <Navbar dark />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0d1b3e] to-[#0a0f1a] py-8 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
              <Tv className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 text-sm font-medium">TV Valtor</span>
            </div>
            {anyLive && (
              <span className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" />
                AO VIVO AGORA
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Sorteios ao Vivo — Brasil e EUA
          </h1>
          <p className="text-white/50 text-base max-w-2xl">
            Acompanhe os sorteios das loterias da Caixa e das maiores loterias americanas em um só lugar.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">
        {/* Dois players lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Player BR */}
          <LivePlayer
            title="Loterias CAIXA"
            subtitle="Canal oficial da CAIXA no YouTube"
            embedUrl="https://www.youtube.com/embed/live_stream?channel=UCpIBwBITQMBSkWF0VeE_mfg&autoplay=1"
            youtubeUrl="https://www.youtube.com/@canalcaixa/streams"
            isLive={brLive}
            accentColor="#16a34a"
            flag="🇧🇷"
          />

          {/* Player US */}
          <LivePlayer
            title="Powerball & Mega Millions"
            subtitle="Canal oficial da Powerball no YouTube"
            embedUrl="https://www.youtube.com/embed/live_stream?channel=UCVfwlh9a73DZ6v0KNYGRRuQ&autoplay=1"
            youtubeUrl="https://www.youtube.com/@Powerballofficial/videos"
            isLive={usLive}
            accentColor="#e63946"
            flag="🇺🇸"
          />
        </div>

        {/* Sorteios de hoje */}
        {(brHoje.length > 0 || usHoje.length > 0) && (
          <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Sorteios de hoje — {DIAS_SEMANA_FULL[now.getDay()]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BR hoje */}
              {brHoje.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">🇧🇷 Brasil — 21:00 BRT</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brHoje.map((s) => (
                      <Link key={s.slug} href={`/${s.slug}`}>
                        <span
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full text-white cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: s.cor }}
                        >
                          {s.nome}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* US hoje */}
              {usHoje.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">🇺🇸 EUA — Horário ET</p>
                  <div className="flex flex-wrap gap-1.5">
                    {usHoje.map((s) => (
                      <Link key={s.slug} href={`/${s.slug}`}>
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: s.cor }}
                        >
                          {s.nome}
                          <span className="text-white/60">• {s.horarioLabel}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs de filtro */}
        <div className="flex items-center gap-2 mb-4">
          {(["all", "br", "us"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab === "all" ? "Todas" : tab === "br" ? "🇧🇷 Brasil" : "🇺🇸 EUA"}
            </button>
          ))}
        </div>

        {/* Cronograma semanal completo */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Cronograma Semanal Completo
            </h2>
            <p className="text-white/40 text-sm mt-1">
              Horários das loterias brasileiras (BRT) e americanas (ET / BRT)
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {weekSchedule.map(({ dia, idx, brLots, usLots, total }) => {
              if (total === 0 && activeTab === "all") return null;
              if (activeTab === "br" && brLots.length === 0) return null;
              if (activeTab === "us" && usLots.length === 0) return null;

              const isHoje = idx === now.getDay();
              return (
                <div
                  key={dia}
                  className={`p-4 ${isHoje ? "bg-blue-500/10" : "hover:bg-white/[0.02]"} transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-sm font-bold uppercase tracking-wide ${isHoje ? "text-blue-400" : "text-white/50"}`}>
                      {DIAS_SEMANA_FULL[idx]}
                    </span>
                    {isHoje && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* BR lotteries */}
                    {(activeTab === "all" || activeTab === "br") && brLots.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-white/30 font-mono w-24 pt-1 shrink-0">🇧🇷 21:00 BRT</span>
                        <div className="flex flex-wrap gap-1.5">
                          {brLots.map((l) => (
                            <Link key={l.slug} href={`/${l.slug}`}>
                              <span
                                className="text-xs text-white px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: l.cor }}
                              >
                                {l.nome}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* US lotteries */}
                    {(activeTab === "all" || activeTab === "us") && usLots.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-white/30 font-mono w-24 pt-1 shrink-0">🇺🇸 {usLots[0].horarioET} ET</span>
                        <div className="flex flex-wrap gap-1.5">
                          {usLots.map((l) => (
                            <Link key={l.slug} href={`/${l.slug}`}>
                              <span
                                className="inline-flex items-center gap-1 text-xs text-white px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: l.cor }}
                              >
                                {l.nome}
                                <span className="text-white/50 text-[10px]">({l.horarioBRT} BRT)</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* BR info */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🇧🇷</span>
              <h3 className="font-bold text-white text-sm">Loterias da CAIXA</h3>
            </div>
            <div className="space-y-2 text-sm text-white/60">
              <p><strong className="text-white/80">Horário:</strong> Todos os dias às 21:00 (BRT)</p>
              <p><strong className="text-white/80">Dias:</strong> Segunda a sábado (varia por loteria)</p>
              <p><strong className="text-white/80">Transmissão:</strong> Canal oficial CAIXA no YouTube</p>
              <p><strong className="text-white/80">Loterias:</strong> Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária</p>
            </div>
            <Link href="/resultados">
              <Button variant="outline" size="sm" className="mt-4 gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/10 bg-transparent text-xs">
                Ver resultados
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {/* US info */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🇺🇸</span>
              <h3 className="font-bold text-white text-sm">Loterias Americanas</h3>
            </div>
            <div className="space-y-2 text-sm text-white/60">
              <p><strong className="text-white/80">Powerball:</strong> Seg, Qua e Sáb às 22:59 ET (00:59 BRT)</p>
              <p><strong className="text-white/80">Mega Millions:</strong> Ter e Sex às 23:00 ET (01:00 BRT)</p>
              <p><strong className="text-white/80">Transmissão:</strong> Canal oficial Powerball no YouTube</p>
              <p><strong className="text-white/80">Jackpots:</strong> Prêmios podem ultrapassar US$ 1 bilhão</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href="/powerball">
                <Button variant="outline" size="sm" className="gap-1 border-white/20 text-white/70 hover:text-white hover:bg-white/10 bg-transparent text-xs">
                  Powerball
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
              <Link href="/mega-millions">
                <Button variant="outline" size="sm" className="gap-1 border-white/20 text-white/70 hover:text-white hover:bg-white/10 bg-transparent text-xs">
                  Mega Millions
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-6 text-xs text-amber-200/70">
          <strong className="text-amber-200">Aviso:</strong> Os vídeos ao vivo são transmitidos pelos canais oficiais no YouTube. O Valtor não tem vínculo com a CAIXA Econômica Federal, a Multi-State Lottery Association (MUSL) ou qualquer operadora de loteria. As transmissões podem sofrer atrasos ou indisponibilidade fora do controle do Valtor.
        </div>
      </div>

      <Footer />
    </div>
  );
}
