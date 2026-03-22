import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosQuina() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "quina" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="quina"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Quina — Atualizado Hoje"
      metaDescription="Veja quais números da Quina estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-quina"
      heading="Números atrasados da Quina"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Quina", href: "/numeros-mais-sorteados-quina" }, { label: "Frequência da Quina", href: "/frequencia-quina" }, { label: "Resultado da Quina hoje", href: "/resultado-quina-hoje" }, { label: "Gerador da Quina", href: "/gerador?loteria=quina" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na Quina?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na Quina, os números vão de 01 a 80.",
        },
        {
          question: "Número atrasado tem mais chance de sair na Quina?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Quina, que acontece de segunda a sábado, às 20h.",
        },
      ]}
    />
  );
}
