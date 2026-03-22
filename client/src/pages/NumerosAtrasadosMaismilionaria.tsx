import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosMaismilionaria() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "maismilionaria" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="maismilionaria"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da +Milionária — Atualizado Hoje"
      metaDescription="Veja quais números da +Milionária estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-maismilionaria"
      heading="Números atrasados da +Milionária"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da +Milionária", href: "/numeros-mais-sorteados-maismilionaria" }, { label: "Frequência da +Milionária", href: "/frequencia-maismilionaria" }, { label: "Resultado da +Milionária hoje", href: "/resultado-maismilionaria-hoje" }, { label: "Gerador da +Milionária", href: "/gerador?loteria=maismilionaria" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na +Milionária?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na +Milionária, os números vão de 01 a 50 + 1 a 6 (trevos).",
        },
        {
          question: "Número atrasado tem mais chance de sair na +Milionária?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da +Milionária, que acontece sábados, às 20h.",
        },
      ]}
    />
  );
}
