'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RestablecerContrasenaPage() {
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [hasSession, setHasSession] = useState(false)

  // Verificar sesión y escuchar cambios de auth
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setHasSession(true)
      }
      setChecking(false)
    }

    // Escuchar eventos de autenticación (cuando se procesa el código)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasSession(true)
        setChecking(false)
      }
    })

    checkSession()

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de carga mientras verifica sesión
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mx-auto mb-4" size={40} />
          <p className="text-neutral-500 font-mono text-sm">Verificando enlace...</p>
        </div>
      </div>
    )
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="bg-neutral-950 p-8 w-full max-w-md border border-neutral-800 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 mx-auto flex items-center justify-center">
              <CheckCircle size={40} className="text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
            Contraseña Actualizada
          </h1>
          <p className="text-neutral-400 font-mono text-sm mb-8">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link
            href="/login"
            className="w-full bg-white text-black p-4 font-bold uppercase text-sm flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  // Pantalla de error (enlace inválido o sin sesión)
  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="bg-neutral-950 p-8 w-full max-w-md border border-neutral-800 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500 mx-auto flex items-center justify-center">
              <KeyRound size={32} className="text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
            Enlace Inválido
          </h1>
          <p className="text-neutral-400 font-mono text-sm mb-8">
            El enlace ha expirado o es inválido. Solicita uno nuevo.
          </p>
          <Link
            href="/login"
            className="w-full bg-white text-black p-4 font-bold uppercase text-sm flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-neutral-950 p-8 w-full max-w-md border border-neutral-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 mx-auto flex items-center justify-center mb-4">
            <KeyRound size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-orange-600 mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-neutral-500 font-mono text-sm">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-neutral-800 bg-black outline-none focus:border-orange-600 text-white transition-colors pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">
              Confirmar Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-neutral-800 bg-black outline-none focus:border-orange-600 text-white transition-colors"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-mono">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-white text-black p-4 font-bold uppercase text-sm flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-mono"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
