import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Instagram, Tag, Shirt } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener producto con perfil del vendedor
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        id,
        full_name,
        instagram_handle,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

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

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Imagen del Producto */}
          <div className="relative aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Detalles del Producto */}
          <div className="space-y-6">

            {/* Categoría */}
            {product.category && (
              <span className="inline-block font-mono text-xs text-neutral-500 uppercase tracking-widest border border-neutral-800 px-3 py-1">
                {product.category}
              </span>
            )}

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              {product.title}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold text-orange-600">
                ${product.price}
              </span>
              <span className="text-neutral-500 font-mono text-sm">MXN</span>
            </div>

            {/* Descripción */}
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-3">
                Descripción
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="border-t border-neutral-800 pt-6">
                <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag size={12} /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="font-mono text-xs bg-neutral-900 border border-neutral-800 text-neutral-400 px-3 py-1 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vendedor */}
            {product.profiles && (
              <div className="border-t border-neutral-800 pt-6">
                <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-4">
                  Vendedor
                </h3>
                <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-black border border-neutral-700 flex items-center justify-center overflow-hidden">
                    {product.profiles.avatar_url ? (
                      <img
                        src={product.profiles.avatar_url}
                        alt={product.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-black text-neutral-600 uppercase">
                        {product.profiles.full_name?.[0] || '?'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-bold uppercase text-sm">
                      {product.profiles.full_name || 'Vendedor'}
                    </p>
                    {product.profiles.instagram_handle && (
                      <a
                        href={`https://instagram.com/${product.profiles.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-orange-600 hover:text-orange-500 flex items-center gap-1 mt-1"
                      >
                        <Instagram size={12} /> @{product.profiles.instagram_handle}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Contacto */}
            {product.profiles?.instagram_handle && (
              <a
                href={`https://instagram.com/${product.profiles.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white hover:bg-orange-600 text-black hover:text-white text-center font-bold uppercase text-sm py-4 transition-colors duration-200"
              >
                Contactar por Instagram
              </a>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
