import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaTimemania() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "timemania" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="timemania"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Timemania — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Timemania. Frequência atualizada com mais de 2.200 concursos."
      path="/frequencia-timemania"
      heading="Frequência dos números da Timemania"
      description="Quantas vezes cada número de 01 a 80 foi sorteado em todo o histórico da Timemania."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Timemania", href: "/numeros-mais-sorteados-timemania" }, { label: "Números atrasados da Timemania", href: "/numeros-atrasados-timemania" }, { label: "Resultado da Timemania hoje", href: "/resultado-timemania-hoje" }, { label: "Gerador da Timemania", href: "/gerador?loteria=timemania" }
      ]}
      faq={[
        {
          question: "O que é frequência na Timemania?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Timemania. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 2.200 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
