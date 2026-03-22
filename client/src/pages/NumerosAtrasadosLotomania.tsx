import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosLotomania() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "lotomania" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="lotomania"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Lotomania — Atualizado Hoje"
      metaDescription="Veja quais números da Lotomania estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-lotomania"
      heading="Números atrasados da Lotomania"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Lotomania", href: "/numeros-mais-sorteados-lotomania" }, { label: "Frequência da Lotomania", href: "/frequencia-lotomania" }, { label: "Resultado da Lotomania hoje", href: "/resultado-lotomania-hoje" }, { label: "Gerador da Lotomania", href: "/gerador?loteria=lotomania" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na Lotomania?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na Lotomania, os números vão de 00 a 99.",
        },
        {
          question: "Número atrasado tem mais chance de sair na Lotomania?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Lotomania, que acontece terças, quintas e sábados, às 20h.",
        },
      ]}
    />
  );
}
