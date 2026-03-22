import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Target,
  Eye,
  Gem,
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
  Shield,
  RefreshCw,
  Layers,
  CheckCircle,
  Lock,
} from "lucide-react";
import SEO from "@/hooks/useSEO";

const values = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Clareza acima de complexidade",
    desc: "Se o usuário não entende, não serve.",
    color: "#2563eb",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Decisão acima de informação",
    desc: "Dados só têm valor quando geram ação.",
    color: "#7c3aed",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Inteligência sem ilusão",
    desc: "Não prometemos sorte. Entregamos análise.",
    color: "#0d1b3e",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Simplicidade funcional",
    desc: "Ferramentas devem facilitar, não confundir.",
    color: "#16a34a",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Consistência",
    desc: "Confiança é construída no uso contínuo.",
    color: "#ea580c",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Evolução contínua",
    desc: "O sistema melhora com dados e comportamento do usuário.",
    color: "#0891b2",
  },
];

const propostas = [
  "Entenda padrões dos concursos",
  "Evite erros comuns de apostadores",
  "Tome decisões mais estruturadas",
  "Jogue com mais confiança e critério",
];

export default function Sobre() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <SEO
        title="Sobre o Valtor"
        description="Conheça o Valtor: plataforma de análise de loterias criada pela Valtor Tecnologia. Missão, visão, valores e a equipe por trás da ferramenta."
        path="/sobre"
      />
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden py-24"
        style={{
          background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a7c 50%, #0d1b3e 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "#f5a623", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "#2563eb", transform: "translate(-30%, 30%)" }}
        />
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
            <Gem className="w-4 h-4 text-[#f5a623]" />
            Quem somos
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Valtor —{" "}
            <span style={{ color: "#f5a623" }}>Onde a matemática</span>
            <br />encontra a sorte.
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
            Uma plataforma construída para transformar apostadores em tomadores de decisão conscientes.
          </p>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-8 text-center">Nossa história</p>
            <div className="space-y-5 text-[#0d1b3e]">
              <p className="text-xl md:text-2xl font-bold leading-relaxed">
                O Valtor nasceu de uma constatação simples:
                <br />
                <span className="text-gray-500 font-normal text-lg">
                  milhões de pessoas apostam todos os dias, mas quase ninguém decide de verdade.
                </span>
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                A maioria escolhe números no impulso. Repete sequências, usa datas, segue “dicas” ou simplesmente aposta no escuro.
                Não falta interesse, <strong className="text-[#0d1b3e]">falta estrutura</strong>.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                O Valtor foi criado para mudar isso.
              </p>
              <div className="border-l-4 pl-6 py-2" style={{ borderColor: "#f5a623" }}>
                <p className="text-[#0d1b3e] text-lg leading-relaxed">
                  Existe informação. Existem padrões. Existe lógica.
                  <br />
                  E quando esses elementos são organizados, o jogo deixa de ser apenas intuição e passa a ter critério.
                </p>
              </div>
              <div className="bg-[#f0f4f8] rounded-2xl p-6 space-y-2">
                <p className="text-gray-500 text-base">O Valtor <strong className="text-[#0d1b3e]">não promete ganhos</strong>.</p>
                <p className="text-gray-500 text-base">Não vende ilusões.</p>
                <p className="text-gray-500 text-base">Não oferece atalhos mágicos.</p>
                <p className="text-[#0d1b3e] font-semibold text-base pt-2">Ele faz algo mais sólido: organiza dados, analisa comportamentos e transforma informação em leitura clara para apoiar decisões.</p>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Somos uma plataforma que existe para <strong className="text-[#0d1b3e]">reduzir o achismo</strong> e trazer mais consciência para quem aposta.
              </p>
              <ul className="space-y-2 text-gray-600 text-lg">
                <li className="flex items-center gap-2"><span style={{ color: "#f5a623" }}>&#8594;</span> Para quem quer sair do automático.</li>
                <li className="flex items-center gap-2"><span style={{ color: "#f5a623" }}>&#8594;</span> Para quem quer entender antes de escolher.</li>
              </ul>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-base italic">Porque no fim, a sorte pode continuar sendo aleatória.</p>
                <p className="text-[#0d1b3e] text-xl font-black mt-1">
                  Mas a decisão não precisa ser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSÃO & VISÃO ── */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Missão */}
            <div className="rounded-2xl p-8 border border-blue-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-2xl font-black text-[#0d1b3e] tracking-wide uppercase">Missão</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Transformar o ato de apostar em um processo de{" "}
                <strong className="text-[#0d1b3e]">decisão mais consciente</strong>, usando dados,
                estatísticas e leitura de padrões para reduzir o jogo no escuro.
              </p>
            </div>

            {/* Visão */}
            <div className="rounded-2xl p-8 border border-purple-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#7c3aed]" />
                </div>
                <h2 className="text-2xl font-black text-[#0d1b3e] tracking-wide uppercase">Visão</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Ser a{" "}
                <strong className="text-[#0d1b3e]">
                  principal plataforma de inteligência aplicada às loterias no Brasil
                </strong>
                , tornando análise e decisão parte do comportamento de quem aposta.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* ── VALORES ── */}
      <section className="py-20 bg-[#f0f4f8]">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-2">O que nos guia</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0d1b3e]">Valores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white"
                  style={{ background: v.color }}
                >
                  {v.icon}
                </div>
                <h3 className="text-[#0d1b3e] font-black text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROPOSTA DE VALOR ── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-2">O que entregamos</p>
              <h2 className="text-3xl md:text-4xl font-black text-[#0d1b3e] mb-4">Proposta de Valor</h2>
              <p className="text-gray-500 text-lg">
                <strong className="text-[#0d1b3e]">O Valtor não promete sorte.</strong> Ele organiza
                dados e entrega leitura para que o usuário:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {propostas.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-3 p-4 rounded-xl border border-green-100 bg-white shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-[#0d1b3e] font-semibold">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSFORMAÇÃO DO USUÁRIO ── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-[#2563eb] text-sm font-bold uppercase tracking-widest mb-2">A jornada</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0d1b3e]">Transformação do Usuário</h2>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Antes */}
            <div className="rounded-2xl p-8 border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 text-red-500 text-xl font-black">✕</span>
                <span className="text-red-600 font-black text-lg uppercase tracking-wide">Antes</span>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Aposta <strong>sem critério</strong>, baseado em intuição ou hábito. Escolhas no escuro,
                sem dados, sem padrão.
              </p>
            </div>

            {/* Seta */}
            <div className="flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#0d1b3e" }}
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Depois */}
            <div className="rounded-2xl p-8 border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-green-700 font-black text-lg uppercase tracking-wide">Depois</span>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Toma <strong>decisões com base em dados</strong>, padrões e análise. Joga com mais
                confiança e critério.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AVISO LEGAL ── */}
      <section className="py-10 bg-white">
        <div className="container max-w-3xl">
          <div className="flex gap-3 p-5 rounded-xl bg-amber-50 border border-amber-200">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Aviso Legal:</strong> O Valtor é uma plataforma de análise estatística e não tem
              qualquer vínculo com a Caixa Econômica Federal. As ferramentas disponibilizadas são de
              caráter informativo e educacional. Jogos de azar envolvem risco financeiro. Jogue com
              responsabilidade.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a7c 100%)",
        }}
      >
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Pronto para jogar com{" "}
            <span style={{ color: "#f5a623" }}>inteligência</span>?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Acesse as ferramentas do Valtor e transforme sua forma de apostar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/gerador">
              <Button
                size="lg"
                className="gap-2 font-bold"
                style={{ background: "#f5a623", color: "#0d1b3e" }}
              >
                <Zap className="w-4 h-4" /> Gerar jogo com inteligência
              </Button>
            </Link>
            <Link href="/planos">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 font-bold border-white/30 text-white hover:bg-white/10"
              >
                Ver planos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
