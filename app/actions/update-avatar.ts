'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface UpdateAvatarResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export async function updateAvatar(formData: FormData): Promise<UpdateAvatarResponse> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "No autenticado" }
  }

  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return { success: false, error: "No se seleccionó imagen" }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    revalidatePath('/perfil')

    return { success: true, url: publicUrl }

  } catch (error) {
    console.error("Error avatar:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
