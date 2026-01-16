import Link from 'next/link'
import { CheckCircle, ShoppingBag, User } from 'lucide-react'

export default function EmailConfirmadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-neutral-950 p-8 w-full max-w-md border border-neutral-800 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 mx-auto flex items-center justify-center">
            <CheckCircle size={40} className="text-black" />
          </div>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-4">
          Email Confirmado
        </h1>

        <p className="text-neutral-400 font-mono text-sm mb-8">
          Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funciones de Try On.
        </p>

        <div className="space-y-3">
          <Link
            href="/perfil"
            className="w-full bg-white text-black p-4 font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-colors"
          >
            <User size={18} />
            Ir a mi perfil
          </Link>

          <Link
            href="/"
            className="w-full bg-neutral-900 text-white p-4 font-bold uppercase text-sm flex items-center justify-center gap-2 border border-neutral-800 hover:border-orange-600 hover:text-orange-500 transition-colors"
          >
            <ShoppingBag size={18} />
            Explorar productos
          </Link>
        </div>
      </div>
    </div>
  )
}
