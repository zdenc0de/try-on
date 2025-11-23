import Link from 'next/link';
import { Instagram, Shirt } from 'lucide-react';

interface BazaarShowcaseProps {
  sellers: any[]; // Recibimos la lista de vendedores procesada
}

export default function BazaarShowcase({ sellers }: BazaarShowcaseProps) {
  return (
    <div className="space-y-8">
      {/* Título de la Sección */}
      <div className="flex items-end justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            Bazares <span className="text-orange-600">Destacados</span>
          </h2>
          <p className="text-neutral-500 font-mono text-xs mt-1">
            Curaduría local & moda circular
          </p>
        </div>
        {/* Link a directorio (próximamente) */}
      </div>

      {/* Grid horizontal de Bazares */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {sellers.map((seller) => (
          <div key={seller.id} className="group bg-neutral-900/50 border border-neutral-800 hover:border-orange-600/50 transition-all duration-300 flex flex-col w-[280px] md:w-[320px] lg:w-[380px] flex-shrink-0">
            
            {/* Header del Vendedor */}
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-black border-2 border-neutral-800 rounded-full overflow-hidden flex items-center justify-center relative group-hover:border-orange-600 transition-colors">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-neutral-700 uppercase">
                      {seller.full_name?.[0] || '?'}
                    </span>
                  )}
                </div>
                
                {/* Info */}
                <div>
                  <h3 className="font-bold text-lg leading-tight uppercase text-white">
                    {seller.full_name || 'Bazar Anónimo'}
                  </h3>
                  {seller.instagram_handle && (
                    <a 
                      href={`https://instagram.com/${seller.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-neutral-500 flex items-center gap-1 hover:text-orange-500 transition-colors mt-1"
                    >
                      <Instagram size={12} /> @{seller.instagram_handle}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Mini Vitrina (Últimos 3 productos) */}
            <div className="px-6 pb-6 flex-1">
              <div className="bg-black border border-neutral-800 p-2 grid grid-cols-3 gap-2">
                {seller.products && seller.products.length > 0 ? (
                  seller.products.slice(0, 3).map((prod: any) => (
                    <Link key={prod.id} href={`/producto/${prod.id}`} className="block relative aspect-square bg-neutral-900 overflow-hidden group/item">
                       <img 
                        src={prod.image_url} 
                        alt="item" 
                        className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" 
                       />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 h-20 flex items-center justify-center text-neutral-600 text-xs font-mono">
                    <span className="flex items-center gap-2"><Shirt size={14}/> Sin stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Card */}
            <div className="border-t border-neutral-800 p-3 bg-black">
                <Link
                  href={`/vendedor/${seller.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 font-bold uppercase text-xs tracking-wide transition-colors duration-200 bg-neutral-900 text-white border border-neutral-700 hover:border-orange-600 hover:text-orange-500"
                >
                    Ver Perfil
                </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}