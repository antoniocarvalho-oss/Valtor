import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosDiadesorte() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "diadesorte" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="diadesorte"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Dia de Sorte — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Dia de Sorte em mais de 1.000 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-diadesorte"
      heading="Números mais sorteados da Dia de Sorte"
      description="Ranking dos números que mais apareceram no histórico completo da Dia de Sorte, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Dia de Sorte", href: "/numeros-atrasados-diadesorte" }, { label: "Frequência da Dia de Sorte", href: "/frequencia-diadesorte" }, { label: "Resultado da Dia de Sorte hoje", href: "/resultado-diadesorte-hoje" }, { label: "Gerador da Dia de Sorte", href: "/gerador?loteria=diadesorte" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Dia de Sorte?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 1.000 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (01 a 31) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Dia de Sorte desde o primeiro sorteio, totalizando mais de 1.000 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
