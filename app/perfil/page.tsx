'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Instagram, Save, LogOut, User, Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  
  const [instagram, setInstagram] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      setSession(session)

      const { data, error } = await supabase
        .from('profiles')
        .select('instagram_handle, full_name')
        .eq('id', session.user.id)
        .single()
      
      if (data) {
        setInstagram(data.instagram_handle || '')
        setFullName(data.full_name || session.user.user_metadata.full_name || '')
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  const updateProfile = async () => {
    setIsSaving(true)
    try {
      const cleanInsta = instagram
        .replace('https://www.instagram.com/', '')
        .replace('https://instagram.com/', '')
        .replace('@', '')
        .replace(/\/$/, '')

      const { error } = await supabase
        .from('profiles')
        .update({ 
          instagram_handle: cleanInsta,
          full_name: fullName,
          updated_at: new Date()
        })
        .eq('id', session.user.id)

      if (error) throw error
      
      setInstagram(cleanInsta)
      alert('¡Perfil actualizado con éxito!')
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Error al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans">
      <Loader2 className="animate-spin mr-2" /> Cargando perfil...
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white p-4 md:p-8">
      
      {/* Botón volver */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/" className="text-neutral-400 hover:text-orange-600 flex items-center gap-2 transition-colors font-mono text-sm uppercase tracking-wide">
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-neutral-950 border border-neutral-800 rounded-none overflow-hidden">
        
        {/* Banner Decorativo */}
        <div className="h-32 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-black rounded-none border-2 border-orange-600 flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden uppercase">
               {fullName ? fullName[0].toUpperCase() : session?.user?.email[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-8 space-y-8">
          
          <div className="border-b border-neutral-800 pb-4">
            <h1 className="text-3xl font-black tracking-tight uppercase">{fullName || 'Usuario Sin Nombre'}</h1>
            <p className="text-neutral-500 text-sm font-mono">{session?.user?.email}</p>
          </div>

          {/* Formulario */}
          <div className="space-y-6">
            
            {/* Input Nombre */}
            <div className="group">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Nombre del Vendedor</label>
              <div className="flex items-center bg-black border border-neutral-800 rounded-none p-3 focus-within:border-orange-600 transition-all">
                <User className="text-neutral-500 mr-3" size={20} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-transparent w-full outline-none text-white placeholder-neutral-600 font-sans"
                  placeholder="Tu nombre o marca"
                />
              </div>
            </div>

            {/* Input Instagram */}
            <div className="group">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Conexión con Instagram</label>
              <p className="text-xs text-neutral-400 mb-3 font-mono border-l-2 border-orange-600 pl-3">
                Pega tu link de perfil o escribe tu usuario.
              </p>
              
              <div className="flex items-center bg-black border border-neutral-800 rounded-none overflow-hidden focus-within:border-orange-600 transition-all">
                <div className="bg-neutral-900 p-3 flex items-center justify-center border-r border-neutral-800">
                  <Instagram className="text-orange-600" size={20} />
                </div>
                <div className="flex items-center w-full px-3">
                  <span className="text-neutral-500 select-none hidden sm:block font-mono text-sm">instagram.com/</span>
                  <input 
                    type="text" 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="bg-transparent w-full outline-none text-white p-2 placeholder-neutral-600 font-sans"
                    placeholder="usuario"
                  />
                </div>
              </div>
              {/* Preview del link */}
              {instagram && (
                <div className="mt-2 text-xs text-orange-600 flex items-center animate-in fade-in font-mono">
                  <Sparkles size={12} className="mr-1" />
                  Link visible: instagram.com/{instagram.replace('https://www.instagram.com/', '').replace('@', '').replace(/\/$/, '')}
                </div>
              )}
            </div>

          </div>

          <hr className="border-neutral-800" />

          {/* Botones de Acción */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={updateProfile}
              disabled={isSaving}
              className="w-full bg-orange-600 text-black hover:bg-orange-500 p-4 rounded-none font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 text-sm"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <button 
              onClick={handleLogout}
              className="w-full text-red-500 hover:bg-red-950/20 border border-neutral-800 p-4 rounded-none font-bold uppercase tracking-wide text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}