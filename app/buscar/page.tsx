// app/buscar/page.tsx
import Link from 'next/link';
import { ArrowLeft, Search, Tag, Sparkles } from 'lucide-react';
import { searchProductsWithGemini } from '@/app/actions/search-for-prodcut'; // Ajusta la ruta según tu proyecto

// Tipo para los productos (ajústalo según tu esquema real)
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  color: string;
  image_url?: string;
  tags?: string[];
}

interface SearchResult {
  success: boolean;
  data?: Product[];
  aiFilters?: {
    category?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    searchTerms?: string;
  };
  isFallback?: boolean;
  error?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  // Llamar a la búsqueda inteligente si hay query
  let searchResult: SearchResult | null = null;
  
  if (query) {
    searchResult = await searchProductsWithGemini(query);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2" size={20} /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-4">Resultados de búsqueda</h1>

        {query ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Buscando outfits para: <span className="font-bold text-purple-600">"{query}"</span>
            </p>

            {/* Mostrar filtros interpretados por la IA */}
            {searchResult?.aiFilters && !searchResult.isFallback && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                  <Sparkles size={18} />
                  <span>La IA interpretó tu búsqueda como:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchResult.aiFilters.category && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      Categoría: {searchResult.aiFilters.category}
                    </span>
                  )}
                  {searchResult.aiFilters.color && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      Color: {searchResult.aiFilters.color}
                    </span>
                  )}
                  {searchResult.aiFilters.maxPrice && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      Precio máx: ${searchResult.aiFilters.maxPrice}
                    </span>
                  )}
                  {searchResult.aiFilters.searchTerms && (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      Keywords: {searchResult.aiFilters.searchTerms}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Indicador de fallback */}
            {searchResult?.isFallback && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-sm">
                ⚠️ Usando búsqueda tradicional (la IA no está disponible temporalmente)
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No se especificó ninguna búsqueda.</p>
        )}

        {/* Grid de resultados */}
        <div className="mt-8">
          {searchResult?.success && searchResult.data && searchResult.data.length > 0 ? (
            <>
              <p className="text-gray-600 mb-4">
                {searchResult.data.length} producto{searchResult.data.length !== 1 ? 's' : ''} encontrado{searchResult.data.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResult.data.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/producto/${product.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    {/* Imagen del producto */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search size={40} />
                        </div>
                      )}
                    </div>

                    {/* Info del producto */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-purple-600">
                          ${product.price}
                        </span>
                        {product.category && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags.slice(0, 3).map((tag, idx) => (
                            <span 
                              key={idx}
                              className="text-xs text-gray-500 flex items-center gap-1"
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : searchResult?.success && searchResult.data?.length === 0 ? (
            <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No encontramos productos para "{query}"</p>
              <p className="text-gray-400 text-sm mt-2">
                Intenta con otros términos o categorías
              </p>
            </div>
          ) : searchResult?.error ? (
            <div className="p-10 border border-red-200 bg-red-50 rounded-xl text-center">
              <p className="text-red-600">Error en la búsqueda: {searchResult.error}</p>
            </div>
          ) : !query ? (
            <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-400">
              <Search size={48} className="mx-auto mb-4" />
              <p>Escribe algo en el buscador para encontrar productos</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}