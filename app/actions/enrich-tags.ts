'use server'

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

export async function enrichProductTags() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Error obteniendo productos:", error);
    return { success: false, error: error.message };
  }

  console.log(`[Enrich] ${products.length} productos`);

  let currentModelIndex = 0;
  let processed = 0;

  for (const product of products) {
    if (currentModelIndex >= MODELS.length) break;

    const modelName = MODELS[currentModelIndex];

    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Producto: "${product.title}"
Tags actuales: ${JSON.stringify(product.tags || [])}

Genera 15 tags de moda. Incluye los actuales + tipo, color, estilo, ocasion.
Minusculas, sin tildes. JSON solo: ["tag1","tag2",...]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const enrichedTags = JSON.parse(text);

      await supabase
        .from('products')
        .update({ tags: enrichedTags })
        .eq('id', product.id);

      console.log(`[OK] ${product.title}: ${enrichedTags.length} tags`);
      processed++;

      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("429") || msg.includes("404")) {
        currentModelIndex++;
        console.warn(`[Enrich] Cambiando a ${MODELS[currentModelIndex] || 'ninguno'}`);
      }
    }
  }

  return {
    success: true,
    message: `Procesados ${processed}/${products.length} productos`
  };
}
