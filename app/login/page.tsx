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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-gray-500">Bienvenido a ReVibe AI</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl font-bold flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-600 hover:text-black underline"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Nuevo aquí? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  )
}