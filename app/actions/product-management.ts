'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  tags?: string[];
}

export interface ProductActionResult {
  success: boolean;
  error?: string;
}

/**
 * Actualizar un producto existente
 */
export async function updateProduct(
  productId: string,
  data: UpdateProductData
): Promise<ProductActionResult> {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  try {
    // Verificar que el producto pertenece al usuario
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return { success: false, error: 'Producto no encontrado' };
    }

    if (product.user_id !== user.id) {
      return { success: false, error: 'No tienes permiso para editar este producto' };
    }

    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.tags !== undefined) updateData.tags = data.tags;

    // Actualizar producto
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .eq('user_id', user.id); // Doble verificación de ownership

    if (updateError) {
      console.error('Error updating product:', updateError);
      // Mostrar error más específico
      if (updateError.code === '42501') {
        return { success: false, error: 'Sin permisos. Verifica las políticas RLS en Supabase.' };
      }
      return { success: false, error: `Error: ${updateError.message}` };
    }

    revalidatePath('/perfil');
    revalidatePath('/');
    revalidatePath(`/producto/${productId}`);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateProduct:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

/**
 * Eliminar un producto
 */
export async function deleteProduct(productId: string): Promise<ProductActionResult> {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  try {
    // Verificar que el producto pertenece al usuario y obtener la imagen
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('user_id, image_url')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return { success: false, error: 'Producto no encontrado' };
    }

    if (product.user_id !== user.id) {
      return { success: false, error: 'No tienes permiso para eliminar este producto' };
    }

    // Eliminar imagen del storage si existe
    if (product.image_url) {
      try {
        // Extraer el path del archivo desde la URL
        const urlParts = product.image_url.split('/storage/v1/object/public/products/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('products').remove([filePath]);
        }
      } catch (storageError) {
        console.warn('Error deleting image from storage:', storageError);
        // Continuamos aunque falle el borrado de imagen
      }
    }

    // Eliminar de favoritos primero (por la foreign key)
    await supabase
      .from('favorites')
      .delete()
      .eq('product_id', productId);

    // Eliminar producto
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return { success: false, error: 'Error al eliminar el producto' };
    }

    revalidatePath('/perfil');
    revalidatePath('/');
    revalidatePath('/favoritos');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteProduct:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

/**
 * Obtener un producto por ID para edición
 */
export async function getProductForEdit(productId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado', product: null };
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return { success: false, error: 'Producto no encontrado', product: null };
  }

  if (product.user_id !== user.id) {
    return { success: false, error: 'No tienes permiso', product: null };
  }

  return { success: true, product };
}
