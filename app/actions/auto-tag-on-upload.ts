// Integrar en tu flujo de creación de productos
// app/actions/create-product.ts

'use server'

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Genera tags inteligentes para un producto usando IA
 * Se ejecuta automáticamente cuando se sube un producto nuevo
 */
export async function generateProductTags(
  title: string, 
  description?: string,
  imageUrl?: string
): Promise<string[]> {
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Eres un experto en categorización de productos de moda.

PRODUCTO:
Título: ${title}
${description ? `Descripción: ${description}` : ''}

Genera 15-20 tags en español que describan este producto para un motor de búsqueda de moda.

INCLUYE:
1. TIPO DE PRENDA: (vestido, pantalón, playera, tenis, etc.)
2. MATERIALES: (algodón, cuero, denim, lino, etc.)
3. COLORES: (negro, blanco, azul, beige, etc.)
4. ESTILO: (casual, formal, deportivo, streetwear, vintage, elegante, etc.)
5. OCASIONES: (playa, gym, oficina, fiesta, diario, etc.)
6. TEMPORADA: (verano, invierno, entretiempo, etc.)
7. CARACTERÍSTICAS: (cómodo, versátil, oversize, ajustado, etc.)
8. MARCAS: Si aparece una marca en el título, inclúyela
9. SINÓNIMOS: Agrega variaciones (ej: "lentes de sol" y "gafas de sol")

REGLAS:
- Todo en minúsculas
- Sin tildes (ej: "camara" no "cámara")
- Incluye términos generales Y específicos
- Si es ropa deportiva: agrega "gym", "fitness", "entrenamiento"
- Si es calzado: agrega tipo específico (sandalias, tenis, botas)
- Si menciona una actividad: agrégala (running, yoga, surf, etc.)

RESPONDE SOLO con un array JSON de strings (sin markdown):
["tag1", "tag2", "tag3", ...]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    
    const tags = JSON.parse(text);
    
    // Validación básica
    if (!Array.isArray(tags) || tags.length === 0) {
      console.warn("⚠️ Tags vacíos, usando fallback");
      return extractBasicTags(title, description);
    }
    
    console.log(`✅ Generados ${tags.length} tags para: ${title}`);
    return tags;
    
  } catch (error) {
    console.error("❌ Error generando tags con IA:", error);
    // Fallback: extracción manual
    return extractBasicTags(title, description);
  }
}

/**
 * Fallback: Extracción simple de palabras clave del título
 */
function extractBasicTags(title: string, description?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  const tags: string[] = [];
  
  // Tipos de prenda
  const garmentTypes = ['vestido', 'pantalon', 'playera', 'camisa', 'sudadera', 
    'tenis', 'sandalias', 'gorra', 'lentes', 'gafas', 'shorts', 'falda', 
    'chamarra', 'sueter', 'hoodie', 'top'];
  
  // Estilos
  const styles = ['casual', 'formal', 'deportivo', 'streetwear', 'elegante', 
    'urbano', 'vintage'];
  
  // Colores
  const colors = ['negro', 'blanco', 'azul', 'rojo', 'verde', 'amarillo', 
    'naranja', 'gris', 'beige', 'rosa'];
  
  // Buscar coincidencias
  [...garmentTypes, ...styles, ...colors].forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags.length > 0 ? tags : ['moda', 'ropa', 'estilo'];
}

/**
 * Ejemplo de uso en tu formulario de creación de productos
 */
export async function createProduct(formData: {
  title: string;
  description?: string;
  price: number;
  images: string[];
  // ... otros campos
}) {
  
  // 1. Generar tags automáticamente
  const tags = await generateProductTags(
    formData.title, 
    formData.description,
    formData.images[0] // opcional: imagen para análisis visual
  );
  
  // 2. Crear producto en Supabase
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .insert({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      images: formData.images,
      tags: tags, // 🎯 Tags generados automáticamente
      // ... otros campos
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creando producto:", error);
    return { success: false, error: error.message };
  }
  
  console.log(`✅ Producto creado con ${tags.length} tags:`, tags);
  
  return { success: true, product: data };
}