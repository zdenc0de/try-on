'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function searchProductsWithGemini(userQuery) {
  // console.log(`🤖 Gemini: Interpretando búsqueda: "${userQuery}"`);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. PROMPT DE TRADUCCIÓN (Optimizado y seguro)
    const prompt = `
      Eres un motor de búsqueda para ropa de segunda mano.
      Tu trabajo es limpiar la consulta del usuario para filtrar una base de datos.

      INSTRUCCIONES:
      1. Category: Clasifica en una de estas: "Chamarras", "Pantalones", "Vestidos", "Camisas", "Calzado", "Accesorios".
         - Si busca "tenis", "botas" -> category: "Calzado".
         - Si busca "jeans", "shorts" -> category: "Pantalones".
         - Si es ambiguo -> null.
      2. Price: "barato"=maxPrice:300. "menos de X"=maxPrice:X.
      3. Color: Extrae el color principal (ej: "rojo").
      4. SearchTerms: Extrae las palabras clave CLAVE separadas por espacios.
         - Elimina palabras basura ("de", "para", "con", "quiero", "busco").
         - Deja solo sustantivos y adjetivos.
         - Ejemplo: "quiero un vestido rojo para la boda" -> "vestido rojo boda"

      Usuario busca: "${userQuery}"

      Devuelve SOLO JSON puro:
      {
        "category": "String o null",
        "color": "String o null",
        "minPrice": Number o null,
        "maxPrice": Number o null,
        "searchTerms": "String"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Limpieza segura del JSON
    let text = response.text().replace(/```json|```/g, "").trim();
    const filters = JSON.parse(text);

    console.log("🔍 Filtros IA:", filters);

    // 2. CONSTRUCCIÓN DE LA QUERY (Lógica JS optimizada)
    let query = supabase.from('products').select('*');

    // A) FILTROS RÁPIDOS (Reducen la búsqueda drásticamente)
    // Al filtrar primero por precio o categoría, la búsqueda de texto se hace sobre menos datos = Más velocidad.
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.color) query = query.ilike('color', `%${filters.color}%`);

    // B) BÚSQUEDA DE TEXTO "AMPLIA" (El truco para todas las coincidencias)
    if (filters.searchTerms) {
      // 1. Rompemos la frase en palabras individuales
      const terms = filters.searchTerms.split(" ").filter(w => w.length > 2); // Ignoramos palabras de 1 o 2 letras

      if (terms.length > 0) {
        // 2. Construimos una cadena OR gigante.
        // Supabase .or() funciona así: "columna.operador.valor, columna.operador.valor"
        // Si separamos por comas, significa O.
        
        // Queremos: (title tiene Palabra1) O (desc tiene Palabra1) O (title tiene Palabra2)...
        const orString = terms.map(term => {
            return `title.ilike.%${term}%,description.ilike.%${term}%`;
        }).join(',');

        // Esto le dice a Supabase: "Dame el producto si CUALQUIERA de estas condiciones se cumple"
        query = query.or(orString);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data, aiFilters: filters };

  } catch (error) {
    console.error("❌ Error Gemini/Supabase:", error);
    // Fallback tradicional por si falla la IA
    return searchFallback(userQuery);
  }
}

async function searchFallback(term) {
  // Fallback mejorado: Rompe la frase y busca cualquier coincidencia
  const words = term.split(" ").filter(w => w.length > 3);
  let query = supabase.from('products').select('*');
  
  if (words.length > 0) {
      const searchString = words.map(w => `title.ilike.%${w}%,description.ilike.%${w}%`).join(',');
      query = query.or(searchString);
  } else {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  
  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data, isFallback: true };
}