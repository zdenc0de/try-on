'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Instagram, Save, LogOut, User, Sparkles, ArrowLeft, Loader2, Shirt, Camera } from 'lucide-react'
import Link from 'next/link'
import ProductGrid from '@/app/components/ProductGrid'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [userProducts, setUserProducts] = useState<any[]>([]) 
  
  const [instagram, setInstagram] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('') // Nuevo estado
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false) // Nuevo estado de carga de imagen

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      setSession(session)

      const { data: profile } = await supabase
        .from('profiles')
        .select('instagram_handle, full_name, avatar_url') // Pedimos avatar_url
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        setInstagram(profile.instagram_handle || '')
        setFullName(profile.full_name || session.user.user_metadata.full_name || '')
        setAvatarUrl(profile.avatar_url || '')
      }

      const { data: products } = await supabase
        .from('products')
        .select(`*, profiles ( instagram_handle, full_name )`)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (products) setUserProducts(products)

      setLoading(false)
    }

    getData()
  }, [])

  // --- LÓGICA DE SUBIDA DE IMAGEN ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // 1. Subir al Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${session.user.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Actualizar estado local inmediatamente para feedback visual
      setAvatarUrl(publicUrl)

      // 4. (Opcional) Guardar URL en base de datos inmediatamente
      // O puedes esperar a que el usuario de clic en "Guardar Cambios"
      // Aquí lo haremos inmediatamente para que no se pierda si recarga
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', session.user.id)

    } catch (error) {
      console.error('Error subiendo imagen:', error)
      alert('Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

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
          // avatar_url: avatarUrl // Ya se actualizó al subir, pero no está de más
          updated_at: new Date()
        })
        .eq('id', session.user.id)

      if (error) throw error
      
      setInstagram(cleanInsta)
      alert('¡Perfil actualizado con éxito!')
      router.refresh()
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
      <Loader2 className="animate-spin mr-2 text-orange-600" /> Cargando perfil...
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white p-4 md:p-8">
      
      <div className="max-w-7xl mx-auto mb-6">
        <Link href="/" className="text-neutral-400 hover:text-orange-600 flex items-center gap-2 transition-colors font-mono text-sm uppercase tracking-wide">
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: EDITOR --- */}
        <div className="lg:col-span-1 h-fit">
            <div className="bg-neutral-950 border border-neutral-800 rounded-none overflow-hidden">
                
                {/* Banner */}
                <div className="h-32 bg-linear-to-r from-orange-600 via-orange-500 to-orange-700 relative">
                    <div className="absolute -bottom-10 left-8 group cursor-pointer">
                        {/* INPUT OCULTO */}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        
                        {/* AVATAR CLICKABLE */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 bg-black rounded-none border-2 border-orange-600 flex items-center justify-center overflow-hidden shadow-lg relative"
                        >
                            {isUploading ? (
                                <Loader2 className="animate-spin text-orange-600" />
                            ) : avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-3xl font-black text-white uppercase">
                                    {fullName ? fullName[0] : session?.user?.email[0]}
                                </div>
                            )}

                            {/* Overlay de cámara al hacer hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-14 px-8 pb-8 space-y-8">
                    {/* ... (El resto del código es igual, inputs de nombre e instagram) ... */}
                    <div className="border-b border-neutral-800 pb-4">
                        <h1 className="text-3xl font-black tracking-tight uppercase">{fullName || 'Usuario'}</h1>
                        <p className="text-neutral-500 text-sm font-mono">{session?.user?.email}</p>
                    </div>

                    <div className="space-y-6">
                         {/* Input Nombre */}
                         <div className="group">
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Nombre del Bazar</label>
                            <div className="flex items-center bg-black border border-neutral-800 rounded-none p-3 focus-within:border-orange-600 transition-all">
                                <User className="text-neutral-500 mr-3" size={20} />
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-transparent w-full outline-none text-white placeholder-neutral-600 font-sans"
                                    placeholder="Nombre de tu marca"
                                />
                            </div>
                        </div>
                        
                        {/* Input Instagram (Igual que antes) */}
                        <div className="group">
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Instagram</label>
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
                        </div>
                    </div>

                    <hr className="border-neutral-800" />

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

        {/* --- COLUMNA DERECHA: CATÁLOGO --- */}
        <div className="lg:col-span-2">
            {/* ... (Igual que antes) ... */}
            <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Shirt className="text-orange-600"/> Mi Catálogo
                </h2>
                <Link href="/vender" className="bg-white hover:bg-gray-200 text-black px-4 py-2 font-bold uppercase text-xs tracking-wide transition-colors">
                    + Vender Prenda
                </Link>
            </div>
            {userProducts.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProductGrid products={userProducts} />
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-neutral-800 bg-neutral-900/30">
                     <div className="flex justify-center mb-4">
                        <div className="bg-neutral-800 p-4 rounded-full">
                            <Shirt size={32} className="text-neutral-600" />
                        </div>
                    </div>
                    <p className="text-neutral-500 mb-4 font-mono text-sm">Aún no has subido ninguna prenda.</p>
                    <Link href="/vender" className="text-orange-600 hover:text-orange-500 font-bold uppercase text-sm border-b border-orange-600 pb-0.5 hover:pb-1 transition-all">
                        ¡Empieza a vender ahora!
                    </Link>
                </div>
            )}
        </div>

      </div>
    </div>
  )
}