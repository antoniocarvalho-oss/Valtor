import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosDuplasena() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "duplasena" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="duplasena"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Dupla Sena — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Dupla Sena em mais de 2.700 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-duplasena"
      heading="Números mais sorteados da Dupla Sena"
      description="Ranking dos números que mais apareceram no histórico completo da Dupla Sena, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Dupla Sena", href: "/numeros-atrasados-duplasena" }, { label: "Frequência da Dupla Sena", href: "/frequencia-duplasena" }, { label: "Resultado da Dupla Sena hoje", href: "/resultado-duplasena-hoje" }, { label: "Gerador da Dupla Sena", href: "/gerador?loteria=duplasena" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Dupla Sena?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 2.700 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (01 a 50) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Dupla Sena desde o primeiro sorteio, totalizando mais de 2.700 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
