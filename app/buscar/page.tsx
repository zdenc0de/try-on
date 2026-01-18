import { Suspense } from 'react';
import Link from 'next/link';
import { searchProducts, SearchFilters } from '@/app/actions/smart-search';
import { getUserFavoriteIds } from '@/app/actions/favorites';
import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/app/components/ProductGrid';
import SearchBar from '@/app/components/SearchBar';
import SearchFiltersComponent from '@/app/components/SearchFilters';
import { Frown, ArrowLeft, Target, Link2, SlidersHorizontal } from 'lucide-react';

interface SearchParams {
  q?: string;
  subcategory?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  // Obtener usuario autenticado y favoritos
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const favoriteIds = await getUserFavoriteIds();

  // Construir objeto de filtros desde URL
  const filters: SearchFilters = {
    subcategory: params.subcategory || undefined,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    sortBy: (params.sortBy as SearchFilters['sortBy']) || 'relevance',
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = !!(filters.subcategory || filters.minPrice || filters.maxPrice || (filters.sortBy && filters.sortBy !== 'relevance'));

  let products = [];
  let aiTags: { direct: string[], related: string[] } = { direct: [], related: [] };
  let success = false;

  if (query) {
    const result = await searchProducts(query, filters);
    products = result.products || [];
    aiTags = result.aiTags || { direct: [], related: [] };
    success = result.success || false;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">
      
      <main className="max-w-[1400px] mx-auto px-4 ">
        
        {/* Header de Búsqueda */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/"
              className="text-neutral-500 hover:text-white flex items-center gap-2 transition-colors text-sm group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Link>

            {/* SearchBar para nueva búsqueda */}
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              Resultados para <span className="text-orange-600">&ldquo;{query}&rdquo;</span>
            </h1>

            {/* Componente de filtros */}
            <Suspense fallback={<div className="h-10 w-28 bg-neutral-800 animate-pulse" />}>
              <SearchFiltersComponent />
            </Suspense>
          </div>

          {/* Indicador de filtros activos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
              <SlidersHorizontal size={14} />
              <span>Filtros aplicados</span>
              {filters.subcategory && (
                <span className="text-orange-500">• {filters.subcategory}</span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="text-orange-500">
                  • ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                </span>
              )}
            </div>
          )}

          {/* Mostramos el razonamiento de la IA (Factor WOW) */}
          {success && (aiTags.direct.length > 0 || aiTags.related.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Tags directos */}
              {aiTags.direct.length > 0 && (
                <details className="bg-neutral-900/50 border border-neutral-800 group">
                  <summary className="flex items-center gap-2 p-4 cursor-pointer list-none">
                    <Target className="text-orange-500" size={18} />
                    <span className="text-neutral-400 font-medium text-sm flex-1">Buscando directamente:</span>
                    <span className="text-neutral-600 text-xs">{aiTags.direct.length} tags</span>
                  </summary>
                  <ul className="space-y-1 px-4 pb-4">
                    {aiTags.direct.map((tag: string, i: number) => (
                      <li
                        key={i}
                        className="text-orange-400 text-xs uppercase font-mono"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Tags relacionados */}
              {aiTags.related.length > 0 && (
                <details className="bg-neutral-900/30 border border-neutral-800 group">
                  <summary className="flex items-center gap-2 p-4 cursor-pointer list-none">
                    <Link2 className="text-purple-500" size={18} />
                    <span className="text-neutral-400 font-medium text-sm flex-1">También considerando:</span>
                    <span className="text-neutral-600 text-xs">{aiTags.related.length} tags</span>
                  </summary>
                  <ul className="space-y-1 px-4 pb-4">
                    {aiTags.related.map((tag: string, i: number) => (
                      <li
                        key={i}
                        className="text-purple-400 text-xs uppercase font-mono"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

            </div>
          )}
        </div>

        {/* Resultados */}
        {products && products.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
            <p className="text-neutral-500 text-sm mb-6">
              {products.length} {products.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
            <ProductGrid
              products={products}
              favoriteIds={favoriteIds}
              isAuthenticated={!!user}
            />
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
            <div className="flex justify-center mb-4">
              <div className="bg-neutral-800 p-4 rounded-full">
                <Frown size={40} className="text-neutral-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {query ? "No encontramos nada con esa vibra" : "Escribe algo para buscar"}
            </h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              {query 
                ? "Intenta describir tu estilo de otra forma o usa palabras más generales."
                : "Usa la barra de búsqueda para encontrar tu próximo outfit con IA."}
            </p>
          </div>
        )}

      </main>
    </div>
  );
}