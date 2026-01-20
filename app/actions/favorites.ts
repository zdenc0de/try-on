'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface FavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

interface Profile {
  instagram_handle: string;
  full_name: string;
}

export interface ProductWithProfile {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags: string[];
  created_at: string;
  profiles: Profile | Profile[] | null;
}

export interface GetUserFavoritesResult {
  success: boolean;
  products: ProductWithProfile[];
  error?: string;
}

/**
 * Toggle favorito: si existe lo elimina, si no existe lo agrega
 */
export async function toggleFavorite(productId: string): Promise<FavoriteResult> {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Debes iniciar sesión para guardar favoritos' };
  }

  try {
    // Verificar si ya existe el favorito
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (es esperado si no existe)
      console.error('Error checking favorite:', checkError);
      return { success: false, error: 'Error al verificar favorito' };
    }

    if (existing) {
      // Ya existe: eliminar
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Error removing favorite:', deleteError);
        return { success: false, error: 'Error al eliminar favorito' };
      }

      revalidatePath('/favoritos');
      return { success: true, isFavorite: false };
    } else {
      // No existe: agregar
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (insertError) {
        console.error('Error adding favorite:', insertError);
        return { success: false, error: 'Error al agregar favorito' };
      }

      revalidatePath('/favoritos');
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error('Unexpected error in toggleFavorite:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

/**
 * Obtener IDs de productos favoritos del usuario actual
 */
export async function getUserFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching favorite ids:', error);
    return [];
  }

  return data.map(f => f.product_id);
}

/**
 * Obtener productos favoritos del usuario con detalles completos
 */
export async function getUserFavorites(): Promise<GetUserFavoritesResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, products: [], error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      product:products (
        id,
        title,
        description,
        price,
        image_url,
        tags,
        created_at,
        profiles (
          instagram_handle,
          full_name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return { success: false, products: [], error: 'Error al cargar favoritos' };
  }

  // Extraer productos del resultado (product puede ser objeto o array según Supabase)
  const products: ProductWithProfile[] = data
    .map(f => {
      const product = f.product;
      // Si es array, tomar el primer elemento; si es objeto, usarlo directamente
      if (Array.isArray(product)) {
        return product[0] as unknown as ProductWithProfile | undefined;
      }
      return product as unknown as ProductWithProfile | null;
    })
    .filter((p): p is ProductWithProfile => p !== null && p !== undefined);

  return { success: true, products };
}

/**
 * Verificar si un producto específico está en favoritos
 */
export async function checkIsFavorite(productId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}
