import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaSupersete() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "supersete" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="supersete"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Super Sete — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Super Sete. Frequência atualizada com mais de 600 concursos."
      path="/frequencia-supersete"
      heading="Frequência dos números da Super Sete"
      description="Quantas vezes cada número de 0 a 9 em 7 colunas foi sorteado em todo o histórico da Super Sete."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Super Sete", href: "/numeros-mais-sorteados-supersete" }, { label: "Números atrasados da Super Sete", href: "/numeros-atrasados-supersete" }, { label: "Resultado da Super Sete hoje", href: "/resultado-supersete-hoje" }, { label: "Gerador da Super Sete", href: "/gerador?loteria=supersete" }
      ]}
      faq={[
        {
          question: "O que é frequência na Super Sete?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Super Sete. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 600 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
