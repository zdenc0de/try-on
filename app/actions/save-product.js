'use server'

import { supabase } from '@/lib/supabase'; // Asegúrate que este archivo exista donde acordamos
import { revalidatePath } from 'next/cache';

export async function saveProduct(formData) {
  console.log("💾 Iniciando guardado de producto...");

  // 1. Extraer datos del FormData
  const imageFile = formData.get('image'); // El archivo físico
  const title = formData.get('title');
  const description = formData.get('description');
  const price = formData.get('price');
  const category = formData.get('category');
  const tagsString = formData.get('tags'); // Viene como texto "rock, azul, vintage"

  // Validación básica
  if (!imageFile || !title) {
    return { success: false, error: "Faltan datos obligatorios (imagen o título)" };
  }

  try {
    // ---------------------------------------------------------
    // PASO A: Subir la imagen al Storage de Supabase
    // ---------------------------------------------------------
    
    // Generamos un nombre único para no sobrescribir archivos
    // ej: 1715000000-mifoto.jpg
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('products') // El nombre del bucket que creamos en SQL
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error subiendo imagen:", uploadError);
      throw new Error("Fallo al subir la imagen");
    }

    // Obtenemos la URL Pública para guardarla en la BD
    const { data: { publicUrl } } = supabase
      .storage
      .from('products')
      .getPublicUrl(fileName);

    // ---------------------------------------------------------
    // PASO B: Guardar los datos en la Tabla 'products'
    // ---------------------------------------------------------
    
    // Convertimos los tags de string a array para PostgreSQL
    // "rock, azul" -> ["rock", "azul"]
    const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

    const { error: dbError } = await supabase
      .from('products')
      .insert({
        title,
        description,
        price: parseFloat(price) || 0,
        category,
        tags: tagsArray,
        image_url: publicUrl,
        // Opcional: Si quieres guardar el JSON crudo de gemini puedes pasarlo también
      });

    if (dbError) {
      console.error("Error guardando en base de datos:", dbError);
      throw new Error("Fallo al guardar datos del producto");
    }

    // 3. Limpiar caché para que aparezca en el inicio
    revalidatePath('/'); 
    revalidatePath('/vender');

    console.log("✅ Producto guardado exitosamente");
    return { success: true };

  } catch (error) {
    console.error("❌ Error General:", error);
    return { success: false, error: error.message };
  }
}