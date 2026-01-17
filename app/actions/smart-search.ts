'use server'

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface SearchFilters {
  subcategory?: string;  // Género, estilo, tipo según la prenda buscada
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

// Helper para intentar llamar a Gemini con manejo de errores
async function tryGeminiExpand(userQuery: string): Promise<{ direct: string[], related: string[] } | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `Eres un experto en moda. El usuario busca: "${userQuery}"

Genera términos relacionados para buscar productos de moda.

EJEMPLOS:
- "playa" → {"direct": ["sandalias", "chancletas", "lentes de sol", "gafas de sol", "traje de baño", "bikini", "shorts", "pareo"], "related": ["verano", "casual", "resort", "tropical", "playera", "cómodo"]}
- "gym" → {"direct": ["leggings", "deportiva", "sneakers", "sudadera", "shorts deportivos"], "related": ["fitness", "atlético", "cómodo", "transpirable"]}
- "fiesta" → {"direct": ["vestido", "tacones", "clutch", "elegante"], "related": ["noche", "formal", "brillo", "sexy"]}

IMPORTANTE:
- En "direct" pon 8-12 PRENDAS ESPECÍFICAS que alguien usaría en ese contexto
- En "related" pon 5-8 ADJETIVOS o CONTEXTOS
- Todo en español y minúsculas
- Sin tildes ni caracteres especiales

Responde ÚNICAMENTE con JSON válido (sin markdown, sin explicaciones):
{"direct": ["palabra1", "palabra2"], "related": ["contexto1", "contexto2"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\n\r]/g, "")
      .trim();

    const parsed = JSON.parse(cleanText);
    return {
      direct: parsed.direct || [],
      related: parsed.related || []
    };
  } catch (error) {
    console.warn("⚠️ Gemini no disponible, usando búsqueda simple:", error instanceof Error ? error.message : 'Error desconocido');
    return null;
  }
}

export async function searchProducts(userQuery: string, filters?: SearchFilters) {
  console.log(`🔍 Iniciando búsqueda: "${userQuery}"`);
  if (filters) console.log(`🎛️ Filtros:`, filters);

  const supabase = await createClient();

  // Helper para aplicar filtros de precio a una query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyPriceFilters = (query: any) => {
    let q = query;
    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      q = q.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
      q = q.lte('price', filters.maxPrice);
    }
    return q;
  };

  // Helper para aplicar ordenamiento
  const applySorting = <T extends { price?: number; created_at?: string; _score?: number }>(products: T[]): T[] => {
    if (!filters?.sortBy || filters.sortBy === 'relevance') {
      return products;
    }

    const sorted = [...products];
    switch (filters.sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        sorted.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
    }
    return sorted;
  };

  // PASO 1: Intentar expandir con Gemini (puede fallar, es opcional)
  const geminiTags = await tryGeminiExpand(userQuery);

  let direct: string[] = [];
  let related: string[] = [];
  let useAISearch = false;

  if (geminiTags && (geminiTags.direct.length > 0 || geminiTags.related.length > 0)) {
    direct = geminiTags.direct;
    related = geminiTags.related;
    useAISearch = true;
    console.log("🎯 Tags directos:", direct);
    console.log("🔗 Tags relacionados:", related);
  } else {
    // Sin IA, usar query original como tag
    direct = [userQuery.toLowerCase()];
    console.log("📝 Usando búsqueda simple sin IA");
  }

  // PASO 2: Expandir con sinónimos
  const synonyms: Record<string, string[]> = {
    // Prendas
    'lentes de sol': ['gafas de sol', 'gafas', 'lentes', 'anteojos'],
    'gafas de sol': ['lentes de sol', 'gafas', 'lentes', 'anteojos'],
    'gafas': ['lentes', 'lentes de sol', 'gafas de sol'],
    'lentes': ['gafas', 'lentes de sol', 'gafas de sol'],
    'sandalias': ['chanclas', 'slides', 'ojotas'],
    'chanclas': ['sandalias', 'slides'],
    'tenis': ['sneakers', 'zapatillas', 'deportivas'],
    'sneakers': ['tenis', 'zapatillas', 'deportivas'],
    'playera': ['camiseta', 'remera', 't-shirt', 'polo', 'playeras'],
    'playeras': ['playera', 'camiseta', 'remera', 't-shirt'],
    'camiseta': ['playera', 'remera', 't-shirt', 'playeras'],
    'sudadera': ['hoodie', 'buzo', 'sueter'],
    'vestido': ['dress', 'vestidos'],
    'vestidos': ['vestido', 'dress'],
    'deportivo': ['deportiva', 'fitness', 'gym', 'sport', 'athletic'],
    'deportiva': ['deportivo', 'fitness', 'gym'],
    'streetwear': ['urbano', 'casual'],
    'urbano': ['streetwear', 'casual'],

    // Géneros (para subcategorías)
    'hombre': ['masculino', 'caballero', 'men', 'hombres', 'male'],
    'mujer': ['femenino', 'dama', 'women', 'mujeres', 'female'],
    'unisex': ['neutral', 'mixto'],

    // Estilos (para subcategorías)
    'casual': ['diario', 'informal', 'relajado'],
    'formal': ['elegante', 'vestir', 'oficina'],
    'running': ['correr', 'jogging'],
    'skate': ['skateboard', 'sk8'],
  };

  const allTags = [...direct, ...related];

  // Agregar subcategoría como tag si existe (ej: "Hombre", "Mujer", "Casual", etc.)
  if (filters?.subcategory) {
    allTags.push(filters.subcategory.toLowerCase());
    console.log(`🏷️ Subcategoría agregada como tag: ${filters.subcategory}`);
  }

  const expandedTags = [...allTags];
  allTags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    if (synonyms[tagLower]) {
      expandedTags.push(...synonyms[tagLower]);
    }
  });

  // PASO 3: Buscar en Supabase
  try {
    // Búsqueda por tags
    let tagQuery = supabase
      .from('products')
      .select(`*, profiles ( instagram_handle, full_name )`)
      .overlaps('tags', expandedTags);
    tagQuery = applyPriceFilters(tagQuery);
    const { data: tagResults, error: tagError } = await tagQuery;

    if (tagError) {
      console.error("❌ Error en búsqueda por tags:", tagError);
    }

    // Búsqueda por texto
    let textQuery = supabase
      .from('products')
      .select(`*, profiles ( instagram_handle, full_name )`)
      .or(`title.ilike.%${userQuery}%,description.ilike.%${userQuery}%`);
    textQuery = applyPriceFilters(textQuery);
    const { data: textResults, error: textError } = await textQuery;

    if (textError) {
      console.error("❌ Error en búsqueda por texto:", textError);
    }

    // Combinar resultados únicos
    const combinedResults = new Map();
    [...(tagResults || []), ...(textResults || [])].forEach(product => {
      if (!combinedResults.has(product.id)) {
        combinedResults.set(product.id, product);
      }
    });

    const products = Array.from(combinedResults.values());
    console.log(`🎉 Total de productos encontrados: ${products.length}`);

    // PASO 4: Scoring por relevancia
    const scoredProducts = products.map(product => {
      let score = 0;
      const productTags = (product.tags || []).map((t: string) => t.toLowerCase());

      direct.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (productTags.includes(tagLower)) {
          score += 10;
        } else if (productTags.some((pt: string) => pt.includes(tagLower) || tagLower.includes(pt))) {
          score += 8;
        }
      });

      related.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (productTags.includes(tagLower)) {
          score += 3;
        } else if (productTags.some((pt: string) => pt.includes(tagLower) || tagLower.includes(pt))) {
          score += 2;
        }
      });

      if (product.title?.toLowerCase().includes(userQuery.toLowerCase())) {
        score += 5;
      }

      return { ...product, _score: score };
    });

    scoredProducts.sort((a, b) => b._score - a._score);

    // Filtrar productos sin relevancia solo si hay otros con score
    const hasScored = scoredProducts.some(p => p._score > 0);
    let finalProducts = hasScored
      ? scoredProducts.filter(p => p._score > 0)
      : scoredProducts;

    // Aplicar ordenamiento
    finalProducts = applySorting(finalProducts);

    console.log(`✨ Resultados finales: ${finalProducts.length} productos`);

    return {
      success: true,
      products: finalProducts,
      aiTags: { direct, related },
      appliedFilters: filters,
      usedAI: useAISearch
    };

  } catch (dbError) {
    console.error("❌ Error en base de datos:", dbError);

    // Fallback final: búsqueda muy simple
    try {
      let fallbackQuery = supabase
        .from('products')
        .select(`*, profiles ( instagram_handle, full_name )`)
        .ilike('title', `%${userQuery}%`);

      fallbackQuery = applyPriceFilters(fallbackQuery);
      const { data, error } = await fallbackQuery.limit(20);

      if (error) throw error;

      const sorted = applySorting(data || []);

      return {
        success: true,
        products: sorted,
        aiTags: { direct: [userQuery], related: [] },
        appliedFilters: filters,
        usedAI: false
      };
    } catch (finalError) {
      console.error("❌ Error final:", finalError);
      return {
        success: false,
        error: "Error en búsqueda",
        products: [],
        aiTags: { direct: [], related: [] },
        appliedFilters: filters,
        usedAI: false
      };
    }
  }
}
