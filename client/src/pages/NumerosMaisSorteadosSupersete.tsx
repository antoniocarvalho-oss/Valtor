import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosSupersete() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "supersete" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="supersete"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Super Sete — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Super Sete em mais de 600 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-supersete"
      heading="Números mais sorteados da Super Sete"
      description="Ranking dos números que mais apareceram no histórico completo da Super Sete, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Super Sete", href: "/numeros-atrasados-supersete" }, { label: "Frequência da Super Sete", href: "/frequencia-supersete" }, { label: "Resultado da Super Sete hoje", href: "/resultado-supersete-hoje" }, { label: "Gerador da Super Sete", href: "/gerador?loteria=supersete" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Super Sete?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 600 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (0 a 9 em 7 colunas) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Super Sete desde o primeiro sorteio, totalizando mais de 600 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
