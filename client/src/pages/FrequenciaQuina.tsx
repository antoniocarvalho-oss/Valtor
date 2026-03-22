import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaQuina() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "quina" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="quina"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Quina — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Quina. Frequência atualizada com mais de 6.900 concursos."
      path="/frequencia-quina"
      heading="Frequência dos números da Quina"
      description="Quantas vezes cada número de 01 a 80 foi sorteado em todo o histórico da Quina."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Quina", href: "/numeros-mais-sorteados-quina" }, { label: "Números atrasados da Quina", href: "/numeros-atrasados-quina" }, { label: "Resultado da Quina hoje", href: "/resultado-quina-hoje" }, { label: "Gerador da Quina", href: "/gerador?loteria=quina" }
      ]}
      faq={[
        {
          question: "O que é frequência na Quina?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Quina. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 6.900 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
