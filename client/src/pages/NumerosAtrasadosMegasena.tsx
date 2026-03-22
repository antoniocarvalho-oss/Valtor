import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosAtrasadosMegasena() {
  const { data: atraso, isLoading } = trpc.estatisticas.atraso.useQuery({ loteriaSlug: "megasena" });

  const items = (atraso?.items ?? []).map((a: { numero: number; atraso: number }) => ({
    numero: a.numero,
    valor: a.atraso,
  }));

  return (
    <SEOLandingPage
      slug="megasena"
      mode="atraso"
      title="Números Atrasados"
      metaTitle="Números Atrasados da Mega-Sena — Atualizado Hoje"
      metaDescription="Veja quais números da Mega-Sena estão há mais concursos sem sair. Top 5 atrasados atualizado em tempo real com dados de todos os concursos."
      path="/numeros-atrasados-megasena"
      heading="Números atrasados da Mega-Sena"
      description="Atraso = quantos concursos consecutivos o número ficou sem ser sorteado. Quanto maior o atraso, mais tempo sem aparecer."
      items={items}
      totalConcursos={atraso?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Atrasados"
      bottomLabel="Menos Atrasados"
      valueLabel="Concursos sem sair"
      links={[
        { label: "Números mais sorteados da Mega-Sena", href: "/numeros-mais-sorteados-megasena" }, { label: "Frequência da Mega-Sena", href: "/frequencia-megasena" }, { label: "Resultado da Mega-Sena hoje", href: "/resultado-megasena-hoje" }, { label: "Gerador da Mega-Sena", href: "/gerador?loteria=megasena" }
      ]}
      faq={[
        {
          question: "O que são números atrasados na Mega-Sena?",
          answer: "Números atrasados são aqueles que não foram sorteados nos últimos concursos consecutivos. O valor de atraso indica há quantos sorteios seguidos o número ficou sem aparecer. Na Mega-Sena, os números vão de 01 a 60.",
        },
        {
          question: "Número atrasado tem mais chance de sair na Mega-Sena?",
          answer: "Não. Cada sorteio é independente e todos os números têm a mesma probabilidade. O atraso é uma estatística descritiva que mostra o comportamento passado, mas não prevê resultados futuros. Loterias são jogos de azar.",
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Os dados são atualizados automaticamente após cada sorteio da Mega-Sena, que acontece terças e sábados, às 20h.",
        },
      ]}
    />
  );
}
