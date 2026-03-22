import { Helmet } from "react-helmet-async";

const SITE_NAME = "Valtor";
const DEFAULT_DESCRIPTION =
  "Análise estatística das loterias da Caixa. Gerador inteligente, conferidor e resultados de Mega-Sena, Lotofácil e Quina.";
const DEFAULT_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/valtor_logo_cropped_d9720bff.png";
const BASE_URL = "https://www.valtor.com.br";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  schema?: Record<string, unknown>;
  keywords?: string;
}

/**
 * WebSite + Organization schema — injected on every page via defaultSchema.
 * Individual pages can override by passing their own `schema` prop.
 */
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Valtor Loterias",
  url: BASE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: "pt-BR",
  publisher: {
    "@type": "Organization",
    name: "Valtor Tecnologia Ltda.",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: DEFAULT_IMAGE,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/resultados?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path = "/",
  type = "website",
  noIndex = false,
  schema,
  keywords,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Onde a matemática encontra a sorte`;

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${BASE_URL}${normalizedPath}`;

  const jsonLd = schema || WEBSITE_SCHEMA;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="author" content="Valtor Tecnologia Ltda." />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index, follow"} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}

// Pre-built SEO configs for lottery pages
const LOTTERY_NAMES: Record<string, string> = {
  megasena: "Mega-Sena",
  lotofacil: "Lotofácil",
  quina: "Quina",
  lotomania: "Lotomania",
  timemania: "Timemania",
  duplasena: "Dupla Sena",
  diadesorte: "Dia de Sorte",
  supersete: "Super Sete",
  maismilionaria: "+Milionária",
};

export function getLotteryName(slug: string): string {
  return LOTTERY_NAMES[slug] || slug;
}

export function LotteryResultsSEO({ slug }: { slug: string }) {
  const name = getLotteryName(slug);
  return (
    <SEO
      title={`${name} — Último Resultado`}
      description={`Confira o último resultado da ${name}. Números sorteados, prêmios, acumulação e histórico completo de concursos.`}
      path={`/${slug}`}
      schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `Resultado ${name} — Valtor`,
        description: `Último resultado da ${name} com números sorteados, prêmios e ganhadores.`,
        url: `${BASE_URL}/${slug}`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      }}
    />
  );
}

export function LotteryStatsSEO({ slug }: { slug: string }) {
  const name = getLotteryName(slug);
  return (
    <SEO
      title={`Estatísticas ${name}`}
      description={`Estatísticas completas da ${name}: números mais sorteados, frequência, atraso, pares/ímpares e análise de padrões históricos.`}
      path={`/${slug}/estatisticas`}
      schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `Estatísticas ${name} — Valtor`,
        description: `Análise estatística completa da ${name} com frequência de números, atraso e padrões.`,
        url: `${BASE_URL}/${slug}/estatisticas`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      }}
    />
  );
}

export function ConcursoSEO({ slug, numero }: { slug: string; numero?: string }) {
  const name = getLotteryName(slug);
  const hasNumero = numero && numero !== "NaN" && numero !== "undefined" && numero !== "0";
  const displayNumero = hasNumero ? numero : "Último";
  return (
    <SEO
      title={`${name} Concurso ${displayNumero}`}
      description={hasNumero
        ? `Resultado do concurso ${numero} da ${name}. Dezenas sorteadas, premiação, ganhadores e detalhes completos.`
        : `Último resultado da ${name}. Dezenas sorteadas, premiação, ganhadores e detalhes completos.`
      }
      path={hasNumero ? `/${slug}/concurso/${numero}` : `/${slug}`}
    />
  );
}
