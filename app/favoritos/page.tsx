import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserFavorites } from '@/app/actions/favorites';
import ProductGrid from '@/app/components/ProductGrid';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FavoritosPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/favoritos');
  }

  // Obtener favoritos
  const { products, success, error } = await getUserFavorites();

  // Obtener IDs para marcar como favoritos (todos lo son en esta página)
  const favoriteIds = products?.map((p: { id: string }) => p.id) || [];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">
      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-neutral-500 hover:text-white flex items-center gap-2 transition-colors text-sm group mb-6"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4">
            <div className="bg-red-500/20 p-3 border border-red-500/30">
              <Heart size={28} className="text-red-500" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                Mis Favoritos
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                {products?.length || 0} {products?.length === 1 ? 'prenda guardada' : 'prendas guardadas'}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {!success && error && (
          <div className="py-20 text-center border border-dashed border-red-800 bg-red-900/10">
            <p className="text-red-500 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {success && products?.length === 0 && (
          <div className="py-20 text-center border border-dashed border-neutral-800 bg-neutral-900/20">
            <div className="flex justify-center mb-4">
              <div className="bg-neutral-800 p-4 rounded-full">
                <Heart size={40} className="text-neutral-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Tu wishlist está vacía
            </h2>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
              Explora el inventario y guarda las prendas que te gusten tocando el corazón.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase text-sm tracking-wider transition-colors"
            >
              <ShoppingBag size={16} />
              Explorar prendas
            </Link>
          </div>
        )}

        {/* Grid de favoritos */}
        {success && products && products.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProductGrid
              products={products}
              favoriteIds={favoriteIds}
              isAuthenticated={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
