import { trpc } from "@/lib/trpc";
import SEOLandingPage from "@/components/SEOLandingPage";

export default function FrequenciaMegasena() {
  const { data: frequencia, isLoading } = trpc.estatisticas.frequencia.useQuery({ loteriaSlug: "megasena" });

  const items = (frequencia?.items ?? []).map((f: { numero: number; frequencia: number }) => ({
    numero: f.numero,
    valor: f.frequencia,
  }));

  return (
    <SEOLandingPage
      slug="megasena"
      mode="frequencia"
      title="Frequência"
      metaTitle="Frequência dos Números da Mega-Sena — Histórico Completo"
      metaDescription="Veja quantas vezes cada número foi sorteado na Mega-Sena. Frequência atualizada com mais de 2.900 concursos."
      path="/frequencia-megasena"
      heading="Frequência dos números da Mega-Sena"
      description="Quantas vezes cada número de 01 a 60 foi sorteado em todo o histórico da Mega-Sena."
      items={items}
      totalConcursos={frequencia?.totalConcursos ?? 0}
      isLoading={isLoading}
      topLabel="Mais Frequentes"
      bottomLabel="Menos Frequentes"
      valueLabel="Sorteios"
      links={[
        { label: "Números mais sorteados da Mega-Sena", href: "/numeros-mais-sorteados-megasena" }, { label: "Números atrasados da Mega-Sena", href: "/numeros-atrasados-megasena" }, { label: "Resultado da Mega-Sena hoje", href: "/resultado-megasena-hoje" }, { label: "Gerador da Mega-Sena", href: "/gerador?loteria=megasena" }
      ]}
      faq={[
        {
          question: "O que é frequência na Mega-Sena?",
          answer: "Frequência é o número total de vezes que cada dezena foi sorteada desde o primeiro concurso da Mega-Sena. É uma estatística descritiva que mostra o comportamento histórico dos números ao longo de mais de 2.900 concursos.",
        },
        {
          question: "Todos os números têm a mesma frequência?",
          answer: "Não exatamente. Embora a probabilidade seja igual para todos, variações naturais fazem com que alguns números apareçam mais que outros ao longo do tempo. Isso é normal em qualquer processo aleatório.",
        },
      ]}
    />
  );
}
