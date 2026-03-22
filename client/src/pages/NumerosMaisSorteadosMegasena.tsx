import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function NumerosMaisSorteadosMegasena() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "megasena" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="megasena"
      mode="frequencia"
      title="Mais Sorteados"
      metaTitle="Números Mais Sorteados da Mega-Sena — Ranking Completo"
      metaDescription="Descubra os números mais sorteados da Mega-Sena em mais de 2.900 concursos. Top 5 atualizado diariamente."
      path="/numeros-mais-sorteados-megasena"
      heading="Números mais sorteados da Mega-Sena"
      description="Ranking dos números que mais apareceram no histórico completo da Mega-Sena, desde o primeiro concurso."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Sorteados"
      bottomLabel="Menos Sorteados"
      valueLabel="Sorteios"
      links={[
        { label: "Números atrasados da Mega-Sena", href: "/numeros-atrasados-megasena" }, { label: "Frequência da Mega-Sena", href: "/frequencia-megasena" }, { label: "Resultado da Mega-Sena hoje", href: "/resultado-megasena-hoje" }, { label: "Gerador da Mega-Sena", href: "/gerador?loteria=megasena" }
      ]}
      faq={[
        {
          question: "Qual o número mais sorteado da Mega-Sena?",
          answer: "Os números mais sorteados variam conforme novos concursos acontecem. Consulte o ranking atualizado nesta página para ver o top 5 em tempo real, baseado em todo o histórico de mais de 2.900 concursos.",
        },
        {
          question: "Jogar os números mais sorteados aumenta as chances?",
          answer: "Não. Cada sorteio é independente e todos os números (01 a 60) têm a mesma probabilidade de serem sorteados. A frequência histórica mostra o que já aconteceu, mas não prevê o futuro. Loterias são jogos de azar.",
        },
        {
          question: "Quantos concursos são analisados?",
          answer: "A análise considera todos os concursos da Mega-Sena desde o primeiro sorteio, totalizando mais de 2.900 concursos. Os dados são atualizados automaticamente após cada novo sorteio.",
        },
      ]}
    />
  );
}
