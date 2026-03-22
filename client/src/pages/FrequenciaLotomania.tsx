import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaLotomania() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "lotomania" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="lotomania"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Lotomania — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Lotomania. Frequência atualizada com mais de 2.700 concursos."
      path="/frequencia-lotomania"
      heading="Frequência dos números da Lotomania"
      description="Quantas vezes cada número de 00 a 99 foi sorteado em todo o histórico da Lotomania."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Lotomania", href: "/numeros-mais-sorteados-lotomania" }, { label: "Números atrasados da Lotomania", href: "/numeros-atrasados-lotomania" }, { label: "Resultado da Lotomania hoje", href: "/resultado-lotomania-hoje" }, { label: "Gerador da Lotomania", href: "/gerador?loteria=lotomania" }
      ]}
      faq={[
        {
          question: "O que é frequência na Lotomania?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Lotomania. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 2.700 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
