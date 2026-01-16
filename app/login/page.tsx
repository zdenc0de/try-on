'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // --- REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error

        // Mostrar mensaje de verificación
        setEmailSent(true)

      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error

        router.push('/')
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de email enviado
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="bg-neutral-950 p-8 w-full max-w-md border border-neutral-800 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-600 mx-auto flex items-center justify-center">
              <Mail size={32} className="text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
            Verifica tu correo
          </h1>
          <p className="text-neutral-400 font-mono text-sm mb-6">
            Enviamos un enlace de confirmación a:
          </p>
          <p className="text-orange-500 font-bold mb-6 break-all">
            {email}
          </p>
          <p className="text-neutral-500 font-mono text-xs mb-8">
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <button
            onClick={() => {
              setEmailSent(false)
              setIsSignUp(false)
            }}
            className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-mono"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
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