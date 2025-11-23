import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Instagram, Shirt } from 'lucide-react';
import ProductGrid from '@/app/components/ProductGrid';

interface VendedorPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendedorPage({ params }: VendedorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener perfil del vendedor
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, instagram_handle, avatar_url')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Obtener productos del vendedor
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        instagram_handle,
        full_name
      )
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="text-neutral-400 hover:text-orange-600 flex items-center gap-2 transition-colors font-mono text-sm uppercase tracking-wide"
        >
          <ArrowLeft size={20} /> Volver
        </Link>
      </div>

      {/* Perfil del Vendedor */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 bg-black border-2 border-orange-600 flex items-center justify-center overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-neutral-600 uppercase">
                  {profile.full_name?.[0] || '?'}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                {profile.full_name || 'Vendedor'}
              </h1>

              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-orange-600 hover:text-orange-500 font-mono text-sm transition-colors"
                >
                  <Instagram size={16} /> @{profile.instagram_handle}
                </a>
              )}

              <p className="text-neutral-500 font-mono text-xs mt-3 uppercase tracking-wider">
                {products?.length || 0} {products?.length === 1 ? 'prenda' : 'prendas'} publicadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Productos del Vendedor */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Shirt className="text-orange-600" size={20} /> Catálogo
          </h2>
        </div>

        {products && products.length > 0 ? (
          <ProductGrid products={products} error={productsError} />
        ) : (
          <div className="text-center py-20 border border-dashed border-neutral-800">
            <p className="text-neutral-500 font-mono text-sm uppercase">
              Este vendedor aún no tiene productos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
