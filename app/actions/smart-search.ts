'use server'

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function searchProducts(userQuery: string) {
  console.log(`🔍 Iniciando búsqueda: "${userQuery}"`);

  try {
    const supabase = await createClient();
    
    // PASO 1: Expandir búsqueda con Gemini
    console.log("🤖 Consultando a Gemini...");
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    
    console.log("📝 Respuesta cruda de Gemini:", text);
    
    // Limpieza agresiva del JSON
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\n\r]/g, "")
      .trim();
    
    console.log("🧹 Texto limpio:", cleanText);
    
    let direct: string[] = [];
    let related: string[] = [];
    
    try {
      const parsed = JSON.parse(cleanText);
      direct = parsed.direct || [];
      related = parsed.related || [];
    } catch (parseError) {
      console.error("❌ Error parseando JSON de Gemini:", parseError);
      console.log("Intentando extracción manual...");
      
      // Fallback: extraer arrays manualmente
      const directMatch = cleanText.match(/"direct"\s*:\s*\[(.*?)\]/);
      const relatedMatch = cleanText.match(/"related"\s*:\s*\[(.*?)\]/);
      
      if (directMatch) {
        direct = directMatch[1].split(',').map(s => s.replace(/["\s]/g, ''));
      }
      if (relatedMatch) {
        related = relatedMatch[1].split(',').map(s => s.replace(/["\s]/g, ''));
      }
    }
    
    console.log("🎯 Tags directos:", direct);
    console.log("🔗 Tags relacionados:", related);
    
    if (direct.length === 0 && related.length === 0) {
      console.warn("⚠️ Gemini no generó tags, usando query original");
      direct = [userQuery.toLowerCase()];
    }
    
    const allTags = [...direct, ...related];

    // PASO 2: Expandir con sinónimos y normalizar
    const synonyms: Record<string, string[]> = {
      // Lentes
      'lentes de sol': ['gafas de sol', 'gafas', 'lentes', 'anteojos', 'lentes Prizm'],
      'gafas de sol': ['lentes de sol', 'gafas', 'lentes', 'anteojos'],
      'gafas': ['lentes', 'lentes de sol', 'gafas de sol'],
      'lentes': ['gafas', 'lentes de sol', 'gafas de sol'],
      
      // Calzado
      'sandalias': ['chanclas', 'slides', 'ojotas', 'Nike'],
      'chanclas': ['sandalias', 'slides'],
      'slides': ['sandalias', 'chanclas'],
      'tenis': ['sneakers', 'zapatillas', 'deportivas', 'Jordan 4'],
      'sneakers': ['tenis', 'zapatillas', 'deportivas'],
      'zapatillas': ['tenis', 'sneakers'],
      
      // Ropa
      'playera': ['camiseta', 'remera', 't-shirt', 'polo'],
      'camiseta': ['playera', 'remera', 't-shirt'],
      'sudadera': ['hoodie', 'buzo', 'sueter'],
      'vestido': ['dress'],
      
      // Deportivo
      'deportivo': ['deportiva', 'fitness', 'gym', 'Gymshark'],
      'deportiva': ['deportivo', 'fitness', 'gym'],
      
      // Streetwear
      'streetwear': ['urbano', 'casual', 'Stussy', '8ball'],
      'urbano': ['streetwear', 'casual'],
    };

    const expandedTags = [...allTags];
    allTags.forEach(tag => {
      if (synonyms[tag]) {
        expandedTags.push(...synonyms[tag]);
      }
    });

    console.log("📊 Tags expandidos con sinónimos:", expandedTags);
    
    // PASO 3: Buscar en Supabase
    // Primero intentamos búsqueda por tags
    const { data: tagResults, error: tagError } = await supabase
      .from('products')
      .select(`
        *,
        profiles ( instagram_handle, full_name )
      `)
      .overlaps('tags', expandedTags);
    
    if (tagError) {
      console.error("❌ Error en búsqueda por tags:", tagError);
    } else {
      console.log(`✅ Encontrados ${tagResults?.length || 0} productos por tags`);
    }

    // También buscar por texto en título/descripción
    const { data: textResults, error: textError } = await supabase
      .from('products')
      .select(`
        *,
        profiles ( instagram_handle, full_name )
      `)
      .or(`title.ilike.%${userQuery}%,description.ilike.%${userQuery}%`);
    
    if (textError) {
      console.error("❌ Error en búsqueda por texto:", textError);
    } else {
      console.log(`✅ Encontrados ${textResults?.length || 0} productos por texto`);
    }

    // Combinar resultados únicos
    const combinedResults = new Map();
    
    [...(tagResults || []), ...(textResults || [])].forEach(product => {
      if (!combinedResults.has(product.id)) {
        combinedResults.set(product.id, product);
      }
    });

    const products = Array.from(combinedResults.values());
    console.log(`🎉 Total de productos únicos: ${products.length}`);

    // PASO 4: Scoring por relevancia (mejorado con matching parcial)
    const scoredProducts = products.map(product => {
      let score = 0;
      const productTags = (product.tags || []).map((t: string) => t.toLowerCase());
      
      console.log(`📦 Evaluando "${product.title}":`, productTags);
      
      // +10 por cada tag directo (matching exacto o parcial)
      direct.forEach(tag => {
        const tagLower = tag.toLowerCase();
        // Matching exacto
        if (productTags.includes(tagLower)) {
          score += 10;
          console.log(`  ✅ Match directo exacto: ${tag} (+10)`);
        } 
        // Matching parcial (ej: "lentes" matchea con "lentes de sol")
        else if (productTags.some((pt: string) => 
          pt.includes(tagLower) || tagLower.includes(pt)
        )) {
          score += 8;
          console.log(`  ✅ Match directo parcial: ${tag} (+8)`);
        }
      });
      
      // +3 por cada tag relacionado
      related.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (productTags.includes(tagLower)) {
          score += 3;
          console.log(`  ✅ Match relacionado exacto: ${tag} (+3)`);
        } else if (productTags.some((pt: string) => 
          pt.includes(tagLower) || tagLower.includes(pt)
        )) {
          score += 2;
          console.log(`  ✅ Match relacionado parcial: ${tag} (+2)`);
        }
      });
      
      // +5 si query está en título
      if (product.title?.toLowerCase().includes(userQuery.toLowerCase())) {
        score += 5;
        console.log(`  ✅ Query en título (+5)`);
      }
      
      console.log(`  📊 Score final: ${score}`);
      
      return { ...product, _score: score };
    });

    // Ordenar por score
    scoredProducts.sort((a, b) => b._score - a._score);
    
    // Filtrar productos con score 0 si hay productos con score > 0
    const hasScored = scoredProducts.some(p => p._score > 0);
    const finalProducts = hasScored 
      ? scoredProducts.filter(p => p._score > 0)
      : scoredProducts;

    console.log(`✨ Resultados finales: ${finalProducts.length} productos`);

    return { 
      success: true, 
      products: finalProducts,
      aiTags: { direct, related }
    };

  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack');
    
    // FALLBACK: Búsqueda simple
    try {
      const supabase = await createClient();
      const { data, error: fallbackError } = await supabase
        .from('products')
        .select(`*, profiles ( instagram_handle, full_name )`)
        .ilike('title', `%${userQuery}%`)
        .limit(20);
      
      if (fallbackError) throw fallbackError;
        
      console.log(`🔄 Fallback: ${data?.length || 0} productos encontrados`);
      return { 
        success: true, 
        products: data || [], 
        aiTags: { direct: [userQuery], related: [] } 
      };
    } catch (fallbackErr) {
      console.error("❌ Error en fallback:", fallbackErr);
      return { 
        success: false, 
        error: "Error en búsqueda", 
        products: [], 
        aiTags: { direct: [], related: [] } 
      };
    }
  }
}