'use client'

import { useState } from 'react'
import { enrichProductTags } from '@/app/actions/enrich-tags'
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EnrichPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleEnrich = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await enrichProductTags()
      setResult(res)
    } catch (err: any) {
      setResult({ success: false, error: err.message })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-neutral-400 hover:text-orange-600 flex items-center gap-2 mb-8 text-sm">
          <ArrowLeft size={16} /> Volver
        </Link>

        <h1 className="text-2xl font-black uppercase mb-4">Enriquecer Tags</h1>
        <p className="text-neutral-400 text-sm mb-8">
          Esto procesará todos los productos con Gemini para generar tags mejorados (15-20 por producto).
          Toma ~1 segundo por producto.
        </p>

        <button
          onClick={handleEnrich}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-black font-bold uppercase text-sm hover:bg-orange-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Procesando...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Ejecutar Enriquecimiento
            </>
          )}
        </button>

        {result && (
          <div className={`mt-8 p-4 border ${result.success ? 'border-green-600 bg-green-900/20' : 'border-red-600 bg-red-900/20'}`}>
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
