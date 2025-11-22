import { supabase } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';
import ProductGrid from './components/ProductGrid';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Tu estilo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">decodificado.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No busques por palabras clave. Describe tu plan, tu vibra o sube una foto, y nuestra IA encontrará el outfit perfecto de segunda mano.
          </p>

          {/* Barra de búsqueda */}
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

        {/* Grid de Productos */}
        <ProductGrid products={products} error={error} />

      </div>
    </div>
  );
}
