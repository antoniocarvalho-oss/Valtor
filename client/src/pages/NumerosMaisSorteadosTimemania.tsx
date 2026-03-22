import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosTimemania() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "timemania" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="timemania"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Timemania — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Timemania em mais de 2.200 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-timemania"
      heading="Números mais sorteados da Timemania"
      description="Ranking dos números que mais apareceram no histórico completo da Timemania, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Timemania", href: "/numeros-atrasados-timemania" }, { label: "Frequência da Timemania", href: "/frequencia-timemania" }, { label: "Resultado da Timemania hoje", href: "/resultado-timemania-hoje" }, { label: "Gerador da Timemania", href: "/gerador?loteria=timemania" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Timemania?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 2.200 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (01 a 80) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Timemania desde o primeiro sorteio, totalizando mais de 2.200 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
