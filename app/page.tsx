import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
// IMPORTAMOS EL NAVBAR
import Navbar from '@/app/components/Navbar'; 
// IMPORTAMOS EL SEARCHBAR (Ahora con diseño Terminal + Lógica)
import SearchBar from '@/app/components/SearchBar';

// COMPONENTES DE TU COMPAÑERO
import ProductGrid from '@/app/components/ProductGrid';
import ImageCarousel from '@/app/components/ImageCarousel';

export const dynamic = 'force-dynamic';

export default async function Home() {
  
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        instagram_handle,
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">

      {/* --- HERO SECTION --- */}
      <div className="relative border-b border-neutral-800">
        
        {/* Carrusel de fondo */}
        <div className="absolute inset-0 opacity-200">
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

            {/* BARRA DE BÚSQUEDA (Ahora es un componente limpio y funcional) */}
            <SearchBar />
            
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE PRODUCTOS --- */}
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10 border-b border-neutral-800 pb-4">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Recién <span className="text-neutral-600">Llegados</span>
          </h2>
          <span className="font-mono text-orange-600 text-xs uppercase">[Live]</span>
        </div>

        <ProductGrid products={products} error={error} />
      </div>

    </div>
  );
}