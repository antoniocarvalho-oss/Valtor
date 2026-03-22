import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosSupersete() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "supersete" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="supersete"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Super Sete — Atualizado Hoje"
      metaDescription="Veja quais números da Super Sete estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-supersete"
      heading="Números atrasados da Super Sete"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Super Sete", href: "/numeros-mais-sorteados-supersete" }, { label: "Frequência da Super Sete", href: "/frequencia-supersete" }, { label: "Resultado da Super Sete hoje", href: "/resultado-supersete-hoje" }, { label: "Gerador da Super Sete", href: "/gerador?loteria=supersete" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na Super Sete?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na Super Sete, os números vão de 0 a 9 em 7 colunas.",
        },
        {
          question: "Número atrasado tem mais chance de sair na Super Sete?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Super Sete, que acontece segundas, quartas e sextas, às 15h.",
        },
      ]}
    />
  );
}
