import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaDuplasena() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "duplasena" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="duplasena"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Dupla Sena — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Dupla Sena. Frequência atualizada com mais de 2.700 concursos."
      path="/frequencia-duplasena"
      heading="Frequência dos números da Dupla Sena"
      description="Quantas vezes cada número de 01 a 50 foi sorteado em todo o histórico da Dupla Sena."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Dupla Sena", href: "/numeros-mais-sorteados-duplasena" }, { label: "Números atrasados da Dupla Sena", href: "/numeros-atrasados-duplasena" }, { label: "Resultado da Dupla Sena hoje", href: "/resultado-duplasena-hoje" }, { label: "Gerador da Dupla Sena", href: "/gerador?loteria=duplasena" }
      ]}
      faq={[
        {
          question: "O que é frequência na Dupla Sena?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Dupla Sena. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 2.700 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
