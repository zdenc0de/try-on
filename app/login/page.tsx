'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // <--- OJO AL IMPORT
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient() // Instancia del cliente
  
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // --- REGISTRO ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Esto activa tu Trigger SQL para crear el perfil
            data: { full_name: fullName } 
          }
        })
        if (error) throw error
        
        // Si entra directo (Confirm Email desactivado)
        if (data.session) {
          router.push('/perfil') 
        } else {
           alert('Cuenta creada. Si no entraste automático, revisa la config de Supabase.')
        }

      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        router.push('/') // Al home
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-neutral-950 p-8 w-full max-w-md border border-neutral-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-orange-600 mb-2">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-neutral-500 font-mono text-sm">Bienvenido a Try On</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Nombre</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-neutral-800 bg-black outline-none focus:border-orange-600 text-white transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-neutral-800 bg-black outline-none focus:border-orange-600 text-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-neutral-800 bg-black outline-none focus:border-orange-600 text-white transition-colors"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-white text-black p-4 font-bold uppercase text-sm flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-mono"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Nuevo aquí? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  )
}