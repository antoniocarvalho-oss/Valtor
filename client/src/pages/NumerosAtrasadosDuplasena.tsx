import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosDuplasena() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "duplasena" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="duplasena"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Dupla Sena — Atualizado Hoje"
      metaDescription="Veja quais números da Dupla Sena estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-duplasena"
      heading="Números atrasados da Dupla Sena"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Dupla Sena", href: "/numeros-mais-sorteados-duplasena" }, { label: "Frequência da Dupla Sena", href: "/frequencia-duplasena" }, { label: "Resultado da Dupla Sena hoje", href: "/resultado-duplasena-hoje" }, { label: "Gerador da Dupla Sena", href: "/gerador?loteria=duplasena" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na Dupla Sena?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na Dupla Sena, os números vão de 01 a 50.",
        },
        {
          question: "Número atrasado tem mais chance de sair na Dupla Sena?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Dupla Sena, que acontece terças, quintas e sábados, às 20h.",
        },
      ]}
    />
  );
}
