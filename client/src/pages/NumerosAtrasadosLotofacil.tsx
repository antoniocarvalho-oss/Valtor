import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosLotofacil() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "lotofacil" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="lotofacil"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Lotofácil — Atualizado Hoje"
      metaDescription="Veja quais números da Lotofácil estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real."
      path="/numeros-atrasados-lotofacil"
      heading="Números atrasados da Lotofácil"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Lotofácil", href: "/numeros-mais-sorteados-lotofacil" },
        { label: "Frequência da Lotofácil", href: "/frequencia-lotofacil" },
        { label: "Resultado da Lotofácil hoje", href: "/resultado-lotofacil-hoje" },
        { label: "Gerador da Lotofácil", href: "/gerador?loteria=lotofacil" },
      ]}
      faq={[
        {
          question: "O que são números atrasados na Lotofácil?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Por exemplo, se o número 14 não saiu nos últimos 5 concursos, seu atraso é 5.",
        },
        {
          question: "Número atrasado tem mais chance de sair?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Lotofácil, que acontece de segunda a sábado às 21h.",
        },
      ]}
    />
  );
}
