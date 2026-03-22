import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaDiadesorte() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "diadesorte" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="diadesorte"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Dia de Sorte — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Dia de Sorte. Frequência atualizada com mais de 1.000 concursos."
      path="/frequencia-diadesorte"
      heading="Frequência dos números da Dia de Sorte"
      description="Quantas vezes cada número de 01 a 31 foi sorteado em todo o histórico da Dia de Sorte."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Dia de Sorte", href: "/numeros-mais-sorteados-diadesorte" }, { label: "Números atrasados da Dia de Sorte", href: "/numeros-atrasados-diadesorte" }, { label: "Resultado da Dia de Sorte hoje", href: "/resultado-diadesorte-hoje" }, { label: "Gerador da Dia de Sorte", href: "/gerador?loteria=diadesorte" }
      ]}
      faq={[
        {
          question: "O que é frequência na Dia de Sorte?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Dia de Sorte. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 1.000 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
