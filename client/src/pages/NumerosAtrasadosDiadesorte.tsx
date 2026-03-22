import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosDiadesorte() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "diadesorte" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="diadesorte"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Dia de Sorte — Atualizado Hoje"
      metaDescription="Veja quais números da Dia de Sorte estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-diadesorte"
      heading="Números atrasados da Dia de Sorte"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Dia de Sorte", href: "/numeros-mais-sorteados-diadesorte" }, { label: "Frequência da Dia de Sorte", href: "/frequencia-diadesorte" }, { label: "Resultado da Dia de Sorte hoje", href: "/resultado-diadesorte-hoje" }, { label: "Gerador da Dia de Sorte", href: "/gerador?loteria=diadesorte" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na Dia de Sorte?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na Dia de Sorte, os números vão de 01 a 31.",
        },
        {
          question: "Número atrasado tem mais chance de sair na Dia de Sorte?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Dia de Sorte, que acontece terças, quintas e sábados, às 20h.",
        },
      ]}
    />
  );
}
