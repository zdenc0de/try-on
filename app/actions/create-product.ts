'use server'

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

export async function generateProductTags(
  title: string,
  description?: string,
  _imageUrl?: string
): Promise<string[]> {

  const prompt = `Producto: "${title}"${description ? ` - ${description}` : ''}

Genera 10-15 tags de busqueda para moda. Incluye: tipo prenda, color, estilo, ocasion, temporada.
Minusculas, sin tildes. JSON solo: ["tag1","tag2",...]`;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const tags = JSON.parse(text);

      if (Array.isArray(tags) && tags.length > 0) {
        console.log(`[Tags] ${tags.length} tags con ${modelName}`);
        return tags;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("429") || msg.includes("404")) continue;
      console.error(`[Error] Tags (${modelName}):`, error);
    }
  }

  return extractBasicTags(title, description);
}

function extractBasicTags(title: string, description?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  const tags: string[] = [];

  const keywords = [
    'vestido', 'pantalon', 'playera', 'camisa', 'sudadera', 'tenis', 'sandalias',
    'gorra', 'lentes', 'gafas', 'shorts', 'falda', 'chamarra', 'sueter', 'hoodie',
    'top', 'casual', 'formal', 'deportivo', 'streetwear', 'elegante', 'urbano',
    'vintage', 'negro', 'blanco', 'azul', 'rojo', 'verde', 'amarillo', 'gris', 'beige'
  ];

  keywords.forEach(kw => {
    if (text.includes(kw)) tags.push(kw);
  });

  return tags.length > 0 ? tags : ['moda', 'ropa'];
}

export async function createProduct(formData: {
  title: string;
  description?: string;
  price: number;
  images: string[];
}) {
  const tags = await generateProductTags(formData.title, formData.description, formData.images[0]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .insert({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      images: formData.images,
      tags: tags,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando producto:", error);
    return { success: false, error: error.message };
  }

  console.log(`[OK] Producto creado con ${tags.length} tags`);
  return { success: true, product: data };
}
