interface ProductMatch {
  product: {
    id: string;
    name: string;
    manufacturer: string | null;
    category: string;
  };
  confidence: number;
  matchedField: 'name' | 'manufacturer';
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Fuzzy match extracted text against product names and manufacturers
 * Returns ranked suggestions with confidence scores
 */
export function fuzzyMatchProducts(
  extractedText: string,
  products: Array<{
    id: string;
    name: string;
    manufacturer: string | null;
    category: string;
  }>
): ProductMatch[] {
  const matches: ProductMatch[] = [];
  const words = extractedText.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  for (const product of products) {
    // Match against product name
    const nameSimilarity = similarity(extractedText, product.name);
    if (nameSimilarity > 0.3) {
      matches.push({
        product,
        confidence: nameSimilarity,
        matchedField: 'name',
      });
    }

    // Match individual words against name
    for (const word of words) {
      const wordSimilarity = similarity(word, product.name);
      if (wordSimilarity > 0.5 && wordSimilarity > nameSimilarity) {
        matches.push({
          product,
          confidence: wordSimilarity,
          matchedField: 'name',
        });
      }
    }

    // Match against manufacturer if available
    if (product.manufacturer) {
      const manufacturerSimilarity = similarity(extractedText, product.manufacturer);
      if (manufacturerSimilarity > 0.4) {
        matches.push({
          product,
          confidence: manufacturerSimilarity * 0.8, // Weight manufacturer matches slightly lower
          matchedField: 'manufacturer',
        });
      }
    }
  }

  // Sort by confidence and remove duplicates
  const uniqueMatches = matches.filter(
    (match, index, self) =>
      index === self.findIndex(m => m.product.id === match.product.id)
  );

  return uniqueMatches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Return top 5 matches
}
