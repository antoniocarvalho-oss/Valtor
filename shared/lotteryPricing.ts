/**
 * Tabela de preços das loterias da Caixa (Março 2026)
 * Fonte: loterias.caixa.gov.br
 * 
 * Cada loteria tem um preço base (aposta mínima) e o custo escala
 * com a quantidade de números escolhidos via combinação C(n,k).
 */

// Preço por loteria e quantidade de números
// Chave: slug normalizado (sem hifens)
export const LOTTERY_PRICING: Record<string, {
  name: string;
  basePrice: number;      // preço da aposta mínima
  minNumbers: number;     // mínimo de números
  maxNumbers: number;     // máximo de números
  totalNumbers: number;   // universo de números
  // Tabela de preços por quantidade de números
  prices: Record<number, number>;
}> = {
  megasena: {
    name: "Mega-Sena",
    basePrice: 6.00,
    minNumbers: 6,
    maxNumbers: 20,
    totalNumbers: 60,
    prices: {
      6: 6.00,
      7: 42.00,
      8: 168.00,
      9: 504.00,
      10: 1260.00,
      11: 2772.00,
      12: 5544.00,
      13: 10296.00,
      14: 18018.00,
      15: 30030.00,
      16: 48048.00,
      17: 74256.00,
      18: 111384.00,
      19: 162792.00,
      20: 232560.00,
    },
  },
  lotofacil: {
    name: "Lotofácil",
    basePrice: 3.50,
    minNumbers: 15,
    maxNumbers: 20,
    totalNumbers: 25,
    prices: {
      15: 3.50,
      16: 56.00,
      17: 476.00,
      18: 2856.00,
      19: 13566.00,
      20: 54264.00,
    },
  },
  quina: {
    name: "Quina",
    basePrice: 3.00,
    minNumbers: 5,
    maxNumbers: 15,
    totalNumbers: 80,
    prices: {
      5: 3.00,
      6: 18.00,
      7: 63.00,
      8: 168.00,
      9: 378.00,
      10: 756.00,
      11: 1386.00,
      12: 2376.00,
      13: 3861.00,
      14: 6006.00,
      15: 9009.00,
    },
  },
  lotomania: {
    name: "Lotomania",
    basePrice: 3.00,
    minNumbers: 50,
    maxNumbers: 50,
    totalNumbers: 100,
    prices: {
      50: 3.00,
    },
  },
  timemania: {
    name: "Timemania",
    basePrice: 3.50,
    minNumbers: 10,
    maxNumbers: 10,
    totalNumbers: 80,
    prices: {
      10: 3.50,
    },
  },
  duplasena: {
    name: "Dupla Sena",
    basePrice: 3.00,
    minNumbers: 6,
    maxNumbers: 15,
    totalNumbers: 50,
    prices: {
      6: 3.00,
      7: 21.00,
      8: 84.00,
      9: 252.00,
      10: 630.00,
      11: 1386.00,
      12: 2772.00,
      13: 5148.00,
      14: 9009.00,
      15: 15015.00,
    },
  },
  diadesorte: {
    name: "Dia de Sorte",
    basePrice: 3.00,
    minNumbers: 7,
    maxNumbers: 15,
    totalNumbers: 31,
    prices: {
      7: 3.00,
      8: 24.00,
      9: 108.00,
      10: 360.00,
      11: 990.00,
      12: 2376.00,
      13: 5148.00,
      14: 10296.00,
      15: 19305.00,
    },
  },
  supersete: {
    name: "Super Sete",
    basePrice: 3.00,
    minNumbers: 7,
    maxNumbers: 21, // 7 colunas x 3 números
    totalNumbers: 10, // 0-9 por coluna
    prices: {
      7: 3.00, // 1 número por coluna (simples)
    },
  },
  maismilionaria: {
    name: "+Milionária",
    basePrice: 6.00,
    minNumbers: 6,
    maxNumbers: 12,
    totalNumbers: 50,
    prices: {
      6: 6.00,
      7: 42.00,
      8: 168.00,
      9: 504.00,
      10: 1260.00,
      11: 2772.00,
      12: 5544.00,
    },
  },
};

/**
 * Calcula o preço de uma aposta com base na loteria e quantidade de números.
 * Retorna o preço em R$ ou null se a combinação não é válida.
 */
export function getBetPrice(loteriaSlug: string, qtdNumeros: number): number | null {
  // Normaliza o slug removendo hifens
  const normalized = loteriaSlug.replace(/-/g, "");
  const lottery = LOTTERY_PRICING[normalized];
  if (!lottery) return null;
  
  // Busca preço direto na tabela
  const price = lottery.prices[qtdNumeros];
  if (price !== undefined) return price;
  
  // Se não está na tabela, tenta calcular via combinação
  if (qtdNumeros >= lottery.minNumbers && qtdNumeros <= lottery.maxNumbers) {
    // C(n, k) * preço base, onde k = minNumbers (aposta mínima)
    const combinations = factorial(qtdNumeros) / (factorial(lottery.minNumbers) * factorial(qtdNumeros - lottery.minNumbers));
    return Math.round(combinations * lottery.basePrice * 100) / 100;
  }
  
  return null;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Retorna o preço base (aposta mínima) de uma loteria.
 */
export function getBasePrice(loteriaSlug: string): number | null {
  const normalized = loteriaSlug.replace(/-/g, "");
  const lottery = LOTTERY_PRICING[normalized];
  return lottery?.basePrice ?? null;
}
