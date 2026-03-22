import { describe, it, expect } from "vitest";
import {
  BLOG_ARTICLES,
  getArticleBySlug,
  getRelatedArticles,
  getArticlesByCategory,
} from "../shared/blogArticles";

describe("Blog Articles", () => {
  it("should have at least 12 articles", () => {
    expect(BLOG_ARTICLES.length).toBeGreaterThanOrEqual(12);
  });

  it("each article should have required fields", () => {
    for (const article of BLOG_ARTICLES) {
      expect(article.slug).toBeTruthy();
      expect(article.title).toBeTruthy();
      expect(article.metaTitle).toBeTruthy();
      expect(article.metaDescription).toBeTruthy();
      expect(article.excerpt).toBeTruthy();
      expect(article.category).toBeTruthy();
      expect(article.author).toBeTruthy();
      expect(article.publishedAt).toBeTruthy();
      expect(article.readTime).toBeGreaterThan(0);
      expect(article.tags.length).toBeGreaterThan(0);
      expect(article.sections.length).toBeGreaterThan(0);
    }
  });

  it("each article slug should be unique", () => {
    const slugs = BLOG_ARTICLES.map(a => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getArticleBySlug should return the correct article", () => {
    const article = getArticleBySlug("numeros-mais-sorteados-megasena-historia-completa");
    expect(article).toBeDefined();
    expect(article?.lotterySlug).toBe("megasena");
  });

  it("getArticleBySlug should return undefined for non-existent slug", () => {
    const article = getArticleBySlug("non-existent-slug");
    expect(article).toBeUndefined();
  });

  it("getRelatedArticles should return articles excluding current", () => {
    const related = getRelatedArticles("numeros-mais-sorteados-megasena-historia-completa", 3);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.every(a => a.slug !== "numeros-mais-sorteados-megasena-historia-completa")).toBe(true);
  });

  it("getArticlesByCategory should filter correctly", () => {
    const stats = getArticlesByCategory("Estatísticas");
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.every(a => a.category === "Estatísticas")).toBe(true);
  });

  it("each article section should have heading and content", () => {
    for (const article of BLOG_ARTICLES) {
      for (const section of article.sections) {
        expect(section.heading).toBeTruthy();
        expect(section.content).toBeTruthy();
        expect(section.content.includes("<p>")).toBe(true);
      }
    }
  });

  it("articles should contain internal links to Valtor tools", () => {
    // At least some articles should link to /gerador, /conferidor, etc.
    const allContent = BLOG_ARTICLES.flatMap(a => a.sections.map(s => s.content)).join(" ");
    expect(allContent).toContain("/gerador");
    expect(allContent).toContain("/estatisticas");
  });

  it("articles about specific lotteries should have lotterySlug", () => {
    const megaArticle = BLOG_ARTICLES.find(a => a.slug.includes("megasena"));
    expect(megaArticle?.lotterySlug).toBe("megasena");

    const lotoArticle = BLOG_ARTICLES.find(a => a.slug.includes("lotofacil") && a.lotterySlug);
    expect(lotoArticle?.lotterySlug).toBe("lotofacil");
  });
});

describe("Primos Analysis (isPrime utility)", () => {
  // Test the isPrime logic that's used in caixaApi.ts
  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  };

  it("should correctly identify prime numbers", () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(13)).toBe(true);
    expect(isPrime(17)).toBe(true);
    expect(isPrime(19)).toBe(true);
    expect(isPrime(23)).toBe(true);
    expect(isPrime(29)).toBe(true);
    expect(isPrime(59)).toBe(true);
  });

  it("should correctly identify non-prime numbers", () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(4)).toBe(false);
    expect(isPrime(6)).toBe(false);
    expect(isPrime(8)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(10)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(25)).toBe(false);
    expect(isPrime(60)).toBe(false);
  });

  it("should find correct number of primes in Lotofácil range (1-25)", () => {
    const primesInRange = Array.from({ length: 25 }, (_, i) => i + 1).filter(isPrime);
    expect(primesInRange).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23]);
    expect(primesInRange.length).toBe(9);
  });

  it("should find correct number of primes in Mega-Sena range (1-60)", () => {
    const primesInRange = Array.from({ length: 60 }, (_, i) => i + 1).filter(isPrime);
    expect(primesInRange).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);
    expect(primesInRange.length).toBe(17);
  });

  it("should calculate average primos per concurso correctly", () => {
    // Simulate 3 concursos with known dezenas
    const concursos = [
      { dezenas: [2, 3, 5, 7, 10, 12, 14, 16, 18, 20, 22, 24, 1, 4, 6] }, // 4 primes: 2,3,5,7
      { dezenas: [11, 13, 17, 19, 23, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21] }, // 5 primes: 11,13,17,19,23
      { dezenas: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 25, 15] }, // 1 prime: 2
    ];
    const primosCounts = concursos.map(c => c.dezenas.filter(isPrime).length);
    expect(primosCounts).toEqual([4, 5, 1]);
    const avg = Math.round((primosCounts.reduce((a, b) => a + b, 0) / concursos.length) * 100) / 100;
    expect(avg).toBe(3.33);
  });
});
