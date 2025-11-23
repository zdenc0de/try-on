// Página de administración mejorada
// app/admin/debug/page.tsx

'use client'

import { useState } from 'react';
import { debugProducts } from '@/app/actions/debug-products';
import { enrichExistingProducts } from '@/app/actions/enrich-existing-products';

interface DebugResult {
  uniqueTags?: string[];
  products?: Array<{
    title: string;
    tags?: string[];
  }>;
  error?: string;
}

interface EnrichResult {
  success: boolean;
  total?: number;
  processed?: number;
  errors?: number;
  message?: string;
  error?: string;
}

export default function AdminDebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null);

  const handleDebug = async () => {
    setLoading(true);
    setResult(null);
    const data = await debugProducts();
    setResult(data);
    setLoading(false);
  };

  const handleEnrich = async () => {
    const confirmed = confirm(
      '⚠️ Esto procesará TODOS los productos existentes.\n\n' +
      '- Tardará ~1 segundo por producto\n' +
      '- Los tags actuales NO se perderán, solo se agregarán nuevos\n' +
      '- Consumirá tokens de Gemini API\n\n' +
      '¿Continuar?'
    );
    
    if (!confirmed) return;

    setLoading(true);
    setEnrichResult(null);
    
    const data = await enrichExistingProducts();
    setEnrichResult(data);
    setLoading(false);
    
    // Recargar productos después
    if (data.success) {
      setTimeout(() => handleDebug(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
            🔧 Panel de Administración
          </h1>
          <p className="text-neutral-400">
            Diagnóstico y optimización del sistema de búsqueda
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          
          {/* Ver productos */}
          <button
            onClick={handleDebug}
            disabled={loading}
            className="group relative overflow-hidden px-6 py-4 bg-linear-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-neutral-800 disabled:to-neutral-800 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:shadow-none"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <div className="text-sm opacity-80">Ver</div>
                <div>Productos y Tags</div>
              </div>
            </div>
            {!loading && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>

          {/* Enriquecer tags */}
          <button
            onClick={handleEnrich}
            disabled={loading}
            className="group relative overflow-hidden px-6 py-4 bg-linear-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-neutral-800 disabled:to-neutral-800 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">✨</span>
              <div className="text-left">
                <div className="text-sm opacity-80">Enriquecer</div>
                <div>Tags con IA</div>
              </div>
            </div>
            {!loading && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>
          
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-orange-500 mb-4" />
            <p className="text-neutral-400">Procesando...</p>
          </div>
        )}

        {/* Enrich Result */}
        {enrichResult && (
          <div className={`mb-8 border rounded-xl p-6 ${
            enrichResult.success 
              ? 'bg-green-950/30 border-green-800' 
              : 'bg-red-950/30 border-red-800'
          }`}>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              {enrichResult.success ? '✅' : '❌'} 
              Resultado del Enriquecimiento
            </h2>
            <div className="space-y-2 text-sm font-mono">
              <p>Total: {enrichResult.total} productos</p>
              <p>✅ Procesados: {enrichResult.processed}</p>
              {(enrichResult.errors ?? 0) > 0 && (
                <p className="text-red-400">❌ Errores: {enrichResult.errors}</p>
              )}
            </div>
            {enrichResult.message && (
              <pre className="mt-4 text-xs text-neutral-400 whitespace-pre-wrap">
                {enrichResult.message}
              </pre>
            )}
          </div>
        )}

        {/* Debug Results */}
        {result && (
          <div className="space-y-6">
            
            {/* Tags Únicos */}
            {result.uniqueTags && result.uniqueTags.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  🏷️ Tags Únicos en el Sistema
                  <span className="text-sm font-normal text-neutral-500">
                    ({result.uniqueTags.length})
                  </span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.uniqueTags.map((tag: string, i: number) => (
                    <span 
                      key={i}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-full text-sm transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Productos */}
            {result.products && result.products.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📦 Productos
                  <span className="text-sm font-normal text-neutral-500">
                    ({result.products.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {result.products.map((product, i: number) => (
                    <div 
                      key={i}
                      className="bg-neutral-800/50 hover:bg-neutral-800 p-4 rounded-lg border border-neutral-700 transition-colors"
                    >
                      <h3 className="font-semibold text-white mb-2 flex items-start justify-between gap-2">
                        <span>{product.title}</span>
                        <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-1 rounded shrink-0">
                          {product.tags?.length || 0} tags
                        </span>
                      </h3>
                      
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag: string, j: number) => (
                            <span 
                              key={j}
                              className="bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-400 text-sm">⚠️ Sin tags</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-8 bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            📖 Guía de Uso
          </h3>
          <div className="space-y-4 text-sm text-neutral-400">
            
            <div>
              <h4 className="text-white font-semibold mb-1">🔍 Búsqueda Inteligente</h4>
              <p>El sistema ya está funcionando. Cuando buscas &quot;playa&quot;, Gemini genera tags relacionados como &quot;sandalias&quot;, &quot;lentes de sol&quot;, &quot;verano&quot; y busca productos que tengan esos términos.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-1">✨ Enriquecimiento Automático</h4>
              <p>Cuando subes un producto nuevo, los tags se generan automáticamente. Para productos viejos, usa el botón &quot;Enriquecer Tags con IA&quot;.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-1">📊 Monitoreo</h4>
              <p>Revisa la consola del servidor (terminal) para ver logs detallados de cada búsqueda: qué tags genera Gemini, qué productos encuentra, y por qué.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-1">🎯 Mejores Prácticas</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Agrega más productos y prueba diferentes búsquedas</li>
                <li>Los títulos descriptivos generan mejores tags</li>
                <li>15-20 tags por producto es el punto óptimo</li>
                <li>El sistema aprende: más productos = mejores resultados</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}