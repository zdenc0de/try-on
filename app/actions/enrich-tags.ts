// Script para ejecutar UNA VEZ y enriquecer los tags de productos existentes
// Agregar a: app/actions/enrich-tags.ts

'use server'

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function enrichProductTags() {
  const supabase = await createClient();
  
  // 1. Obtener todos los productos
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Error obteniendo productos:", error);
    return { success: false, error };
  }

  console.log(`📦 Procesando ${products.length} productos...`);

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 2. Procesar cada producto
  for (const product of products) {
    try {
      const prompt = `
        Analiza este producto de moda y genera tags enriquecidos.
        
        TÍTULO: ${product.title || 'Sin título'}
        TAGS ACTUALES: ${JSON.stringify(product.tags)}
        
        Genera 15-20 tags que incluyan:
        1. Los tags actuales (no los pierdas)
        2. Tipo de prenda específico
        3. Materiales visibles
        4. Colores dominantes
        5. Estilos (vintage, streetwear, formal, casual, deportivo, etc.)
        6. Ocasiones de uso (fiesta, playa, oficina, gym, etc.)
        7. Temporada (verano, invierno, etc.)
        8. Adjetivos descriptivos (cómodo, elegante, versátil, etc.)
        
        RESPONDE SOLO CON UN ARRAY JSON DE STRINGS (sin markdown):
        ["tag1", "tag2", ...]
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const enrichedTags = JSON.parse(text);

      // 3. Actualizar en Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          tags: enrichedTags,
          // Guardar tags originales por si acaso
          original_tags: product.tags 
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${product.id}:`, updateError);
      } else {
        console.log(`✅ ${product.title}: ${product.tags?.length || 0} → ${enrichedTags.length} tags`);
      }

      // Rate limiting: esperar 1 segundo entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      console.error(`❌ Error procesando ${product.id}:`, err);
    }
  }

  return { 
    success: true, 
    message: `✅ Procesados ${products.length} productos` 
  };
}

// Para ejecutar manualmente desde una página admin:
// import { enrichProductTags } from '@/app/actions/enrich-tags';
// await enrichProductTags();