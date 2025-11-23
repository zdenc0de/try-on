import { createClient } from '@/lib/supabase/server';
import SearchBar from '@/app/components/SearchBar';

// COMPONENTES EXISTENTES
import ImageCarousel from '@/app/components/ImageCarousel';
import ProductGrid from '@/app/components/ProductGrid';

// NUEVO COMPONENTE (Asegúrate de haber creado el archivo BazaarShowcase.tsx que te pasé antes)
import BazaarShowcase from '@/app/components/BazaarShowcase'; 

export const dynamic = 'force-dynamic';

export default async function Home() {
  
  const supabase = await createClient();

  // 1. Traemos productos con sus perfiles
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        id,
        instagram_handle,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  // 2. Lógica para agrupar vendedores (Server-side)
  const sellersMap = new Map();

  if (products) {
    products.forEach((product) => {
      if (product.profiles) {
        const sellerId = product.profiles.id;
        
        if (!sellersMap.has(sellerId)) {
          sellersMap.set(sellerId, {
            ...product.profiles, 
            products: []         
          });
        }
        // Agregamos el producto al inventario de ese vendedor
        sellersMap.get(sellerId).products.push(product);
      }
    });
  }

  const sellers = Array.from(sellersMap.values());

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">

      {/* --- HERO SECTION (RESTAURO EL ORIGINAL EXACTO) --- */}
      <div className="relative border-b border-neutral-800">
        
        {/* Carrusel de fondo */}
        <div className="absolute inset-0">
           <ImageCarousel />
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">

          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
              Tu Estilo
              <br />
              <span className="text-neutral-500">Decodificado</span>
              <span className="text-orange-600">.</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 max-w-xl font-mono border-l-2 border-orange-600 pl-4">
              Describe tu vibra. La IA rastrea el inventario de segunda mano por ti.
            </p>

            {/* BARRA DE BÚSQUEDA */}
            <SearchBar />
            
          </div>
        </div>
      </div>

      {/* --- NUEVA SECCIÓN: BAZARES & VENDEDORES --- */}
      {/* Reemplazamos "Recién Llegados" por el Showcase de Bazares */}
      <div className="max-w-[1400px] mx-auto px-4 py-16 space-y-20">
        
        {/* Componente de Bazares Destacados */}
        <BazaarShowcase sellers={sellers} />

        {/* Opcional: Mantenemos el grid completo abajo por si el usuario 
           quiere seguir viendo "todo" mezclado, pero con un título diferente.
           Si prefieres quitarlo del todo, borra este bloque div.
        */}
        <div>
           <div className="flex items-end justify-between mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-neutral-400">
                Explorar <span className="text-white">Todo el Inventario</span>
            </h2>
          </div>
          <ProductGrid products={products} error={error} />
        </div>

      </div>

    </div>
  );
}