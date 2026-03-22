import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaLotofacil() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "lotofacil" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="lotofacil"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Lotofácil — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Lotofácil. Frequência atualizada com mais de 3.600 concursos."
      path="/frequencia-lotofacil"
      heading="Frequência dos números da Lotofácil"
      description="Quantas vezes cada número de 01 a 25 foi sorteado em todo o histórico da Lotofácil."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Lotofácil", href: "/numeros-mais-sorteados-lotofacil" },
        { label: "Números atrasados da Lotofácil", href: "/numeros-atrasados-lotofacil" },
        { label: "Resultado da Lotofácil hoje", href: "/resultado-lotofacil-hoje" },
        { label: "Gerador da Lotofácil", href: "/gerador?loteria=lotofacil" },
      ]}
      faq={[
        {
          question: "O que é frequência na Lotofácil?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Lotofácil. É uma estatística descritiva que mostra o comportamento histórico dos números.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
