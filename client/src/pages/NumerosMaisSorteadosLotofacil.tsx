import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosLotofacil() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "lotofacil" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="lotofacil"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Lotofácil — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Lotofácil em mais de 3.600 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-lotofacil"
      heading="Números mais sorteados da Lotofácil"
      description="Ranking dos números que mais apareceram no histórico completo da Lotofácil, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Lotofácil", href: "/numeros-atrasados-lotofacil" },
        { label: "Frequência da Lotofácil", href: "/frequencia-lotofacil" },
        { label: "Resultado da Lotofácil hoje", href: "/resultado-lotofacil-hoje" },
        { label: "Gerador da Lotofácil", href: "/gerador?loteria=lotofacil" },
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Lotofácil?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os 25 números têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Lotofácil desde o primeiro sorteio, totalizando mais de 3.600 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
