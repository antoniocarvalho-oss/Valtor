import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosQuina() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "quina" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="quina"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Quina — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Quina em mais de 6.900 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-quina"
      heading="Números mais sorteados da Quina"
      description="Ranking dos números que mais apareceram no histórico completo da Quina, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Quina", href: "/numeros-atrasados-quina" }, { label: "Frequência da Quina", href: "/frequencia-quina" }, { label: "Resultado da Quina hoje", href: "/resultado-quina-hoje" }, { label: "Gerador da Quina", href: "/gerador?loteria=quina" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Quina?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 6.900 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (01 a 80) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Quina desde o primeiro sorteio, totalizando mais de 6.900 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
