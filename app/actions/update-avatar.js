'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAvatar(formData) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "No autenticado" }
  }

  const file = formData.get('avatar')

  if (!file || file.size === 0) {
    return { success: false, error: "No se seleccionó imagen" }
  }

  try {
    // Nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Subir a Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true
      })

    if (uploadError) throw uploadError

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Actualizar perfil con la URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date()
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    revalidatePath('/perfil')

    return { success: true, url: publicUrl }

  } catch (error) {
    console.error("Error avatar:", error)
    return { success: false, error: error.message }
  }
}
