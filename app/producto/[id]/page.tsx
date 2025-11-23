import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Instagram, Tag, Calendar, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        instagram_handle,
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Header con botón de regreso */}
      <div className="border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur-sm z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-mono text-sm uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Imagen del producto */}
          <div className="space-y-4">
            <div className="relative aspect-3/4 bg-neutral-950 border border-neutral-800 overflow-hidden">
              <img
                src={product.image_url}
                alt={product.title}
                className="object-cover w-full h-full"
              />
              
              {/* Badge de estado */}
              <div className="absolute top-4 right-4">
                <span className="font-mono text-xs bg-orange-600 text-white px-3 py-1.5 uppercase tracking-wider">
                  Disponible
                </span>
              </div>
            </div>

            {/* Info técnica compacta */}
            <div className="border border-neutral-800 bg-neutral-900/50 p-4 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <Calendar className="w-3 h-3" />
                <span>Publicado: {new Date(product.created_at).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Tag className="w-3 h-3" />
                <span>ID: {product.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-8">
            
            {/* Título y precio */}
            <div className="space-y-4 border-b border-neutral-800 pb-8">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-orange-600 font-mono">
                  ${product.price}
                </span>
                <span className="text-neutral-500 font-mono text-sm uppercase">
                  MXN
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-500 border-l-2 border-orange-600 pl-3">
                Descripción
              </h2>
              <p className="text-neutral-300 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-500 border-l-2 border-orange-600 pl-3">
                  Etiquetas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="font-mono text-xs bg-neutral-800 text-neutral-400 px-3 py-1.5 uppercase tracking-wider border border-neutral-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vendedor */}
            {product.profiles && (
              <div className="space-y-4 border-t border-neutral-800 pt-8">
                <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-500 border-l-2 border-orange-600 pl-3">
                  Vendedor
                </h2>
                <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-4">
                  {product.profiles.avatar_url && (
                    <img
                      src={product.profiles.avatar_url}
                      alt={product.profiles.full_name}
                      className="w-12 h-12 rounded-full border-2 border-orange-600"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-white">
                      {product.profiles.full_name}
                    </p>
                    {product.profiles.instagram_handle && (
                      <a
                        href={`https://instagram.com/${product.profiles.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-neutral-400 hover:text-orange-600 transition-colors font-mono"
                      >
                        <Instagram className="w-3 h-3" />
                        @{product.profiles.instagram_handle}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botón de contacto */}
            <div className="pt-4">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 uppercase tracking-wider transition-colors border-2 border-orange-600 hover:border-orange-700 font-mono text-sm">
                Contactar Vendedor
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Footer técnico */}
      <div className="border-t border-neutral-800 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <p className="font-mono text-xs text-neutral-600 uppercase tracking-wider text-center">
            By Codex
          </p>
        </div>
      </div>

    </div>
  );
}