'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase"; // Asegúrate de que esta ruta sea correcta en tu proyecto

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function searchProductsWithGemini(userQuery) {
  console.log(`🤖 Gemini: Interpretando búsqueda: "${userQuery}"`);

  try {
    // 1. Configurar el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. EL PROMPT DE TRADUCCIÓN (User Query -> DB Filters)
    // Le damos contexto de qué campos existen en tu base de datos gracias a analyze-image.js
    const prompt = `
      Eres un traductor de intención de búsqueda para un eCommerce de ropa de segunda mano.
      Tu objetivo es convertir la frase del usuario en filtros estructurados para consultar una base de datos.
      
      Campos disponibles en la base de datos (basado en el análisis previo de prendas):
      - category (Strings comunes: "Chamarras", "Pantalones", "Vestidos", "Camisas", "Calzado", "Accesorios")
      - color (String)
      - price (Number)
      - tags (Array de strings)
      - description (String)

      Usuario busca: "${userQuery}"

      Instrucciones:
      1. Analiza la intención. Si pide "barato", define un maxPrice razonable (ej: 300).
      2. Si menciona un evento (ej: "boda", "fiesta"), añade keywords en 'searchTerms'.
      3. Devuelve SOLO JSON válido.

      Estructura JSON requerida (puedes omitir campos si no aplican):
      {
        "category": "String exacto o null",
        "color": "String o null",
        "minPrice": Number o null,
        "maxPrice": Number o null,
        "searchTerms": "String con palabras clave para buscar en titulo/descripcion (ej: 'boda elegante')"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza del JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const filters = JSON.parse(text);

    console.log("🔍 Filtros generados por IA:", filters);

    // 3. CONSTRUIR LA QUERY A SUPABASE
    // Empezamos seleccionando todo
    let query = supabase.from('products').select('*');

    // Aplicamos filtros dinámicamente según lo que Gemini entendió
    
    // A) Filtro por Categoría (si Gemini detectó una clara)
    if (filters.category) {
      // Usamos ilike para que no importen mayúsculas/minúsculas
      query = query.ilike('category', `%${filters.category}%`);
    }

    // B) Filtro por Color
    if (filters.color) {
      query = query.ilike('color', `%${filters.color}%`);
    }

    // C) Filtro de Precios
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice); // Menor o igual a
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice); // Mayor o igual a
    }

    // D) Búsqueda de Texto (Keywords en título, descripción o tags)
    // Esto busca si los términos están en el título O en la descripción
    if (filters.searchTerms) {
      // Nota: Para búsquedas complejas de texto, Supabase recomienda "Text Search",
      // pero para empezar, un 'ilike' combinando columnas funciona bien.
      // Aquí buscamos que el término esté en el título O en la descripción.
      const term = filters.searchTerms;
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // Ejecutamos la consulta
    const { data, error } = await query;

    if (error) throw error;

    return { 
      success: true, 
      data: data, 
      aiFilters: filters // Devolvemos los filtros para mostrarle al usuario qué entendió la IA
    };

  } catch (error) {
    console.error("❌ Error en búsqueda inteligente:", error);
    // Fallback: Si falla la IA, hacemos una búsqueda simple de texto en Supabase
    return searchFallback(userQuery);
  }
}

// Función de respaldo por si Gemini falla o tarda mucho
async function searchFallback(term) {
  console.log("⚠️ Usando búsqueda tradicional (Fallback)");
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  
  if (error) return { success: false, error: error.message };
  return { success: true, data: data, isFallback: true };
}