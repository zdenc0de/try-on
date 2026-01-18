'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface SaveProductResponse {
  success: boolean;
  error?: string;
}

export async function saveProduct(formData: FormData): Promise<SaveProductResponse> {
  console.log("[Save] Guardando producto...");

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Debes iniciar sesión para vender." };
  }

  // Obtener todas las imágenes del FormData
  const imageFiles = formData.getAll('images') as File[];
  const title = formData.get('title') as string | null;
  const description = formData.get('description') as string | null;
  const price = formData.get('price') as string | null;
  const category = formData.get('category') as string | null;
  const tagsString = formData.get('tags') as string | null;

  console.log("[Save] Datos recibidos:", { title, description, price, category, tags: tagsString, numImages: imageFiles.length });

  if (!imageFiles || imageFiles.length === 0 || !title) {
    return { success: false, error: "Faltan datos obligatorios (imagen y título)" };
  }

  try {
    // Subir todas las imágenes EN PARALELO para mayor velocidad
    console.log(`[Save] Subiendo ${imageFiles.length} imágenes en paralelo...`);

    const uploadPromises = imageFiles.map(async (imageFile, i) => {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, imageFile);

      if (uploadError) {
        throw new Error(`Error subiendo imagen ${i + 1}: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      console.log(`[Save] Imagen ${i + 1} subida:`, publicUrl);
      return { index: i, url: publicUrl };
    });

    const results = await Promise.all(uploadPromises);

    // Ordenar por índice original para mantener el orden
    results.sort((a, b) => a.index - b.index);
    const uploadedUrls = results.map(r => r.url);

    console.log(`[Save] Todas las imágenes subidas:`, uploadedUrls.length);

    const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    const productData = {
      title,
      description,
      price: parseFloat(price || '0') || 0,
      category,
      tags: tagsArray,
      image_url: uploadedUrls[0], // Primera imagen como principal (compatibilidad)
      images: uploadedUrls,        // Todas las imágenes
      user_id: user.id
    };

    console.log("[Save] Insertando en DB:", { ...productData, images: `[${uploadedUrls.length} imágenes]` });

    const { error: dbError } = await supabase
      .from('products')
      .insert(productData);

    if (dbError) {
      console.error("[Error] DB:", dbError);
      return { success: false, error: dbError.message || "Error guardando en base de datos" };
    }

    console.log("[Save] Producto guardado exitosamente con", uploadedUrls.length, "imágenes");

    revalidatePath('/');
    revalidatePath('/perfil');

    return { success: true };

  } catch (error) {
    console.error("[Error] Save:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return { success: false, error: String((error as { message: unknown }).message) };
    }
    return { success: false, error: 'Error desconocido al guardar el producto' };
  }
}
