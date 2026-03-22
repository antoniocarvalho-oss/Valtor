import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosMaismilionaria() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "maismilionaria" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="maismilionaria"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da +Milionária — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da +Milionária em mais de 200 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-maismilionaria"
      heading="Números mais sorteados da +Milionária"
      description="Ranking dos números que mais apareceram no histórico completo da +Milionária, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da +Milionária", href: "/numeros-atrasados-maismilionaria" }, { label: "Frequência da +Milionária", href: "/frequencia-maismilionaria" }, { label: "Resultado da +Milionária hoje", href: "/resultado-maismilionaria-hoje" }, { label: "Gerador da +Milionária", href: "/gerador?loteria=maismilionaria" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da +Milionária?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 200 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (01 a 50 + 1 a 6 (trevos)) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da +Milionária desde o primeiro sorteio, totalizando mais de 200 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
