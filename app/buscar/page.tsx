// app/buscar/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// 1. Definimos el tipo como una Promesa
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; 
}) {
  // 2. Usamos 'await' para obtener los parámetros reales
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2" size={20} /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-4">Resultados de búsqueda</h1>
        
        {query ? (
          <p className="text-lg text-gray-700">
            Buscando outfits para: <span className="font-bold text-purple-600">"{query}"</span>
          </p>
        ) : (
          <p className="text-gray-500">No se especificó ninguna búsqueda.</p>
        )}

        <div className="mt-10 p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-400">
          Espacio para mostrar los resultados...
        </div>
      </div>
    </div>
  );
}