import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import LotteryResults from "./pages/LotteryResults";
import LotteryStats from "./pages/LotteryStats";
import ConcursoPage from "./pages/ConcursoPage";
import Gerador from "./pages/Gerador";
import Conferidor from "./pages/Conferidor";
import Planos from "./pages/Planos";
import Dashboard from "./pages/Dashboard";
import Sobre from "./pages/Sobre";
import Simulador from "./pages/Simulador";
import Backtest from "./pages/Backtest";
import Analise from "./pages/Analise";
import Perfil from "./pages/Perfil";
import AoVivo from "./pages/AoVivo";
import TvValtor from "./pages/TvValtor";
import Importar from "./pages/Importar";
import Extensao from "./pages/Extensao";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import Resultados from "./pages/Resultados";
import Carteira from "./pages/Carteira";
import AdminDashboard from "./pages/AdminDashboard";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

// US Lotteries
import UsLotteryPage from "./pages/UsLotteryPage";
import UsLotteryStatsPage from "./pages/UsLotteryStatsPage";

// SEO Landing Pages — Lotofácil
import NumerosAtrasadosLotofacil from "./pages/NumerosAtrasadosLotofacil";
import NumerosMaisSorteadosLotofacil from "./pages/NumerosMaisSorteadosLotofacil";
import FrequenciaLotofacil from "./pages/FrequenciaLotofacil";
import ResultadoLotofacilHoje from "./pages/ResultadoLotofacilHoje";

// SEO Landing Pages — Mega-Sena
import NumerosAtrasadosMegasena from "./pages/NumerosAtrasadosMegasena";
import NumerosMaisSorteadosMegasena from "./pages/NumerosMaisSorteadosMegasena";
import FrequenciaMegasena from "./pages/FrequenciaMegasena";
import ResultadoMegasenaHoje from "./pages/ResultadoMegasenaHoje";

// SEO Landing Pages — Quina
import NumerosAtrasadosQuina from "./pages/NumerosAtrasadosQuina";
import NumerosMaisSorteadosQuina from "./pages/NumerosMaisSorteadosQuina";
import FrequenciaQuina from "./pages/FrequenciaQuina";
import ResultadoQuinaHoje from "./pages/ResultadoQuinaHoje";

// SEO Landing Pages — Lotomania
import NumerosAtrasadosLotomania from "./pages/NumerosAtrasadosLotomania";
import NumerosMaisSorteadosLotomania from "./pages/NumerosMaisSorteadosLotomania";
import FrequenciaLotomania from "./pages/FrequenciaLotomania";
import ResultadoLotomaniaHoje from "./pages/ResultadoLotomaniaHoje";

// SEO Landing Pages — Timemania
import NumerosAtrasadosTimemania from "./pages/NumerosAtrasadosTimemania";
import NumerosMaisSorteadosTimemania from "./pages/NumerosMaisSorteadosTimemania";
import FrequenciaTimemania from "./pages/FrequenciaTimemania";
import ResultadoTimemaniaHoje from "./pages/ResultadoTimemaniaHoje";

// SEO Landing Pages — Dupla Sena
import NumerosAtrasadosDuplasena from "./pages/NumerosAtrasadosDuplasena";
import NumerosMaisSorteadosDuplasena from "./pages/NumerosMaisSorteadosDuplasena";
import FrequenciaDuplasena from "./pages/FrequenciaDuplasena";
import ResultadoDuplasenaHoje from "./pages/ResultadoDuplasenaHoje";

// SEO Landing Pages — Dia de Sorte
import NumerosAtrasadosDiadesorte from "./pages/NumerosAtrasadosDiadesorte";
import NumerosMaisSorteadosDiadesorte from "./pages/NumerosMaisSorteadosDiadesorte";
import FrequenciaDiadesorte from "./pages/FrequenciaDiadesorte";
import ResultadoDiadesorteHoje from "./pages/ResultadoDiadesorteHoje";

// SEO Landing Pages — Super Sete
import NumerosAtrasadosSupersete from "./pages/NumerosAtrasadosSupersete";
import NumerosMaisSorteadosSupersete from "./pages/NumerosMaisSorteadosSupersete";
import FrequenciaSupersete from "./pages/FrequenciaSupersete";
import ResultadoSuperseteHoje from "./pages/ResultadoSuperseteHoje";

// SEO Landing Pages — +Milionária
import NumerosAtrasadosMaismilionaria from "./pages/NumerosAtrasadosMaismilionaria";
import NumerosMaisSorteadosMaismilionaria from "./pages/NumerosMaisSorteadosMaismilionaria";
import FrequenciaMaismilionaria from "./pages/FrequenciaMaismilionaria";
import ResultadoMaismilionariaHoje from "./pages/ResultadoMaismilionariaHoje";

// All supported lottery slugs
const LOTTERY_SLUGS = [
  "megasena",
  "lotofacil",
  "quina",
  "lotomania",
  "timemania",
  "duplasena",
  "diadesorte",
  "supersete",
  "maismilionaria",
];

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
    <ScrollToTop />
    <Switch>
      {/* Home */}
      <Route path="/" component={Home} />

      {/* Institutional */}
      <Route path="/sobre" component={Sobre} />
      <Route path="/planos" component={Planos} />
      <Route path="/clube" component={Dashboard} />
      <Route path="/clube/carteira" component={Carteira} />
      <Route path="/clube/:section" component={Dashboard} />
      <Route path="/analise" component={Analise} />
      <Route path="/perfil" component={Perfil} />
      <Route path="/tv-valtor" component={TvValtor} />
      <Route path="/ao-vivo" component={TvValtor} />
      <Route path="/importar" component={Importar} />
      <Route path="/extensao" component={Extensao} />
      <Route path="/aposta-rapida" component={Extensao} />
      <Route path="/termos" component={Termos} />
      <Route path="/privacidade" component={Privacidade} />
      <Route path="/resultados" component={Resultados} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />

      {/* Blog */}
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogArticle} />

      {/* Tools */}
      <Route path="/gerador" component={Gerador} />
      <Route path="/conferidor" component={Conferidor} />
      <Route path="/simulador" component={Simulador} />
      <Route path="/backtest" component={Backtest} />

      {/* SEO Landing Pages — Lotofácil */}
      <Route path="/numeros-atrasados-lotofacil" component={NumerosAtrasadosLotofacil} />
      <Route path="/numeros-mais-sorteados-lotofacil" component={NumerosMaisSorteadosLotofacil} />
      <Route path="/frequencia-lotofacil" component={FrequenciaLotofacil} />
      <Route path="/resultado-lotofacil-hoje" component={ResultadoLotofacilHoje} />

      {/* SEO Landing Pages — Mega-Sena */}
      <Route path="/numeros-atrasados-megasena" component={NumerosAtrasadosMegasena} />
      <Route path="/numeros-mais-sorteados-megasena" component={NumerosMaisSorteadosMegasena} />
      <Route path="/frequencia-megasena" component={FrequenciaMegasena} />
      <Route path="/resultado-megasena-hoje" component={ResultadoMegasenaHoje} />

      {/* SEO Landing Pages — Quina */}
      <Route path="/numeros-atrasados-quina" component={NumerosAtrasadosQuina} />
      <Route path="/numeros-mais-sorteados-quina" component={NumerosMaisSorteadosQuina} />
      <Route path="/frequencia-quina" component={FrequenciaQuina} />
      <Route path="/resultado-quina-hoje" component={ResultadoQuinaHoje} />

      {/* SEO Landing Pages — Lotomania */}
      <Route path="/numeros-atrasados-lotomania" component={NumerosAtrasadosLotomania} />
      <Route path="/numeros-mais-sorteados-lotomania" component={NumerosMaisSorteadosLotomania} />
      <Route path="/frequencia-lotomania" component={FrequenciaLotomania} />
      <Route path="/resultado-lotomania-hoje" component={ResultadoLotomaniaHoje} />

      {/* SEO Landing Pages — Timemania */}
      <Route path="/numeros-atrasados-timemania" component={NumerosAtrasadosTimemania} />
      <Route path="/numeros-mais-sorteados-timemania" component={NumerosMaisSorteadosTimemania} />
      <Route path="/frequencia-timemania" component={FrequenciaTimemania} />
      <Route path="/resultado-timemania-hoje" component={ResultadoTimemaniaHoje} />

      {/* SEO Landing Pages — Dupla Sena */}
      <Route path="/numeros-atrasados-duplasena" component={NumerosAtrasadosDuplasena} />
      <Route path="/numeros-mais-sorteados-duplasena" component={NumerosMaisSorteadosDuplasena} />
      <Route path="/frequencia-duplasena" component={FrequenciaDuplasena} />
      <Route path="/resultado-duplasena-hoje" component={ResultadoDuplasenaHoje} />

      {/* SEO Landing Pages — Dia de Sorte */}
      <Route path="/numeros-atrasados-diadesorte" component={NumerosAtrasadosDiadesorte} />
      <Route path="/numeros-mais-sorteados-diadesorte" component={NumerosMaisSorteadosDiadesorte} />
      <Route path="/frequencia-diadesorte" component={FrequenciaDiadesorte} />
      <Route path="/resultado-diadesorte-hoje" component={ResultadoDiadesorteHoje} />

      {/* SEO Landing Pages — Super Sete */}
      <Route path="/numeros-atrasados-supersete" component={NumerosAtrasadosSupersete} />
      <Route path="/numeros-mais-sorteados-supersete" component={NumerosMaisSorteadosSupersete} />
      <Route path="/frequencia-supersete" component={FrequenciaSupersete} />
      <Route path="/resultado-supersete-hoje" component={ResultadoSuperseteHoje} />

      {/* SEO Landing Pages — +Milionária */}
      <Route path="/numeros-atrasados-maismilionaria" component={NumerosAtrasadosMaismilionaria} />
      <Route path="/numeros-mais-sorteados-maismilionaria" component={NumerosMaisSorteadosMaismilionaria} />
      <Route path="/frequencia-maismilionaria" component={FrequenciaMaismilionaria} />
      <Route path="/resultado-maismilionaria-hoje" component={ResultadoMaismilionariaHoje} />

      {/* US Lotteries — Mega Millions + Powerball */}
      <Route path="/mega-millions" component={() => <UsLotteryPage lottery="mega-millions" />} />
      <Route path="/powerball" component={() => <UsLotteryPage lottery="powerball" />} />

      {/* US Lottery Stats Pages */}
      <Route path="/numeros-mais-sorteados-mega-millions" component={() => <UsLotteryStatsPage lottery="mega-millions" statsType="mais-sorteados" />} />
      <Route path="/numeros-atrasados-mega-millions" component={() => <UsLotteryStatsPage lottery="mega-millions" statsType="atrasados" />} />
      <Route path="/frequencia-mega-millions" component={() => <UsLotteryStatsPage lottery="mega-millions" statsType="frequencia" />} />
      <Route path="/mega-millions/estatisticas" component={() => <UsLotteryStatsPage lottery="mega-millions" statsType="mais-sorteados" />} />
      <Route path="/numeros-mais-sorteados-powerball" component={() => <UsLotteryStatsPage lottery="powerball" statsType="mais-sorteados" />} />
      <Route path="/numeros-atrasados-powerball" component={() => <UsLotteryStatsPage lottery="powerball" statsType="atrasados" />} />
      <Route path="/frequencia-powerball" component={() => <UsLotteryStatsPage lottery="powerball" statsType="frequencia" />} />
      <Route path="/powerball/estatisticas" component={() => <UsLotteryStatsPage lottery="powerball" statsType="mais-sorteados" />} />

      {/* Lottery pages — dynamic routes for all 9 lotteries */}
      {LOTTERY_SLUGS.map((slug) => (
        <Route key={slug} path={`/${slug}`} component={() => <LotteryResults />} />
      ))}

      {/* Statistics pages */}
      {LOTTERY_SLUGS.map((slug) => (
        <Route key={`${slug}-stats`} path={`/${slug}/estatisticas`} component={() => <LotteryStats />} />
      ))}

      {/* Individual concurso pages */}
      {LOTTERY_SLUGS.map((slug) => (
        <Route key={`${slug}-concurso`} path={`/${slug}/concurso/:numero`} component={() => <ConcursoPage />} />
      ))}

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
