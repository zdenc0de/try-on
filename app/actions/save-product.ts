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

  const imageFile = formData.get('image') as File | null;
  const title = formData.get('title') as string | null;
  const description = formData.get('description') as string | null;
  const price = formData.get('price') as string | null;
  const category = formData.get('category') as string | null;
  const tagsString = formData.get('tags') as string | null;

  console.log("[Save] Datos recibidos:", { title, description, price, category, tags: tagsString });

  if (!imageFile || !title) {
    return { success: false, error: "Faltan datos obligatorios" };
  }

  try {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    console.log("[Save] Subiendo imagen:", fileName);

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("[Error] Upload:", uploadError);
      return { success: false, error: "Error subiendo la imagen: " + uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    console.log("[Save] Imagen subida:", publicUrl);

    const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    const productData = {
      title,
      description,
      price: parseFloat(price || '0') || 0,
      category,
      tags: tagsArray,
      image_url: publicUrl,
      user_id: user.id
    };

    console.log("[Save] Insertando en DB:", productData);

    const { error: dbError } = await supabase
      .from('products')
      .insert(productData);

    if (dbError) {
      console.error("[Error] DB:", dbError);
      return { success: false, error: dbError.message || "Error guardando en base de datos" };
    }

    console.log("[Save] Producto guardado exitosamente");

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
