import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, ShoppingBag, PlusCircle, Sparkles } from 'lucide-react';

// Esta línea fuerza a que la página no se guarde en caché estático,
// así siempre verás los productos nuevos al recargar.
export const dynamic = 'force-dynamic';

export default async function Home() {
  
  // 1. OBTENER PRODUCTOS DE SUPABASE
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }); // Los más nuevos primero

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">ReVibe AI</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/vender" 
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              <PlusCircle size={16} />
              Vender Ropa
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* --- HERO SECTION (BUSCADOR IA) --- */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Tu estilo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">decodificado.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No busques por palabras clave. Describe tu plan, tu vibra o sube una foto, y nuestra IA encontrará el outfit perfecto de segunda mano.
          </p>

          {/* Barra de búsqueda (Visual por ahora) */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="text-purple-500 animate-pulse" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Ej: 'Tengo una cita en una galería de arte y quiero verme intelectual...'"
              className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all shadow-sm group-hover:shadow-md"
            />
            <button className="absolute inset-y-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-xl font-medium transition-colors">
              Buscar
            </button>
          </div>
        </div>

        {/* --- RESULTADOS / FEED --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShoppingBag size={24} />
            Recién llegados
          </h2>

          {/* Estado de Error o Carga vacía */}
          {error && <p className="text-red-500">Error cargando productos: {error.message}</p>}
          
          {products && products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">Aún no hay ropa publicada.</p>
              <Link href="/vender" className="text-purple-600 font-bold hover:underline mt-2 inline-block">
                ¡Sé el primero en vender algo!
              </Link>
            </div>
          )}

          {/* GRID DE PRODUCTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <div key={product.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                {/* Imagen */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
                    ${product.price}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {product.tags?.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}