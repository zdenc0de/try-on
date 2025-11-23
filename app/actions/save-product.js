'use server'

import { createClient } from '@/lib/supabase/server'; // Usamos el cliente seguro de servidor
import { revalidatePath } from 'next/cache';

export async function saveProduct(formData) {
  console.log("💾 Guardando producto...");

  // 1. AUTENTICACIÓN SEGURA (Cookies)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Debes iniciar sesión para vender." };
  }

  // 2. Extraer datos
  const imageFile = formData.get('image');
  const title = formData.get('title');
  const description = formData.get('description');
  const price = formData.get('price');
  const category = formData.get('category');
  const tagsString = formData.get('tags');

  if (!imageFile || !title) {
    return { success: false, error: "Faltan datos obligatorios" };
  }

  try {
    // 3. Subir imagen a Supabase Storage
    // Usamos timestamp + random para evitar colisiones de nombre
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile);

    if (uploadError) throw new Error("Error subiendo la imagen: " + uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    // 4. Guardar en Base de Datos vinculando al USUARIO
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
        user_id: user.id // <--- AQUÍ OCURRE LA MAGIA (Vinculamos con el perfil)
      });

    if (dbError) throw dbError;

    // 5. Limpiar caché para que se vea inmediato
    revalidatePath('/'); 
    revalidatePath('/perfil'); // Para que aparezca en su catálogo

    return { success: true };

  } catch (error) {
    console.error("❌ Error Save:", error);
    return { success: false, error: error.message };
  }
}