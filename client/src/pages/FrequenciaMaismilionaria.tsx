import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaMaismilionaria() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "maismilionaria" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="maismilionaria"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da +Milionária — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na +Milionária. Frequência atualizada com mais de 200 concursos."
      path="/frequencia-maismilionaria"
      heading="Frequência dos números da +Milionária"
      description="Quantas vezes cada número de 01 a 50 + 1 a 6 (trevos) foi sorteado em todo o histórico da +Milionária."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da +Milionária", href: "/numeros-mais-sorteados-maismilionaria" }, { label: "Números atrasados da +Milionária", href: "/numeros-atrasados-maismilionaria" }, { label: "Resultado da +Milionária hoje", href: "/resultado-maismilionaria-hoje" }, { label: "Gerador da +Milionária", href: "/gerador?loteria=maismilionaria" }
      ]}
      faq={[
        {
          question: "O que é frequência na +Milionária?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da +Milionária. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 200 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
