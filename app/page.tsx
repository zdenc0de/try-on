import { supabase } from '@/lib/supabase';
import { Terminal, ArrowRight } from 'lucide-react';
import ProductGrid from './components/ProductGrid';
import ImageCarousel from './components/ImageCarousel';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen">

      {/* HERO SECTION CON CARRUSEL */}
      <div className="relative border-b border-neutral-800">
        {/* Carrusel de fondo */}
        <ImageCarousel />

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">

          <div className="space-y-8">
            {/* Título Gigante */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
              Tu Estilo
              <br />
              <span className="text-neutral-500">Decodificado</span>
              <span className="text-orange-600">.</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 max-w-xl font-mono border-l-2 border-orange-600 pl-4">
              Describe tu vibra. La IA rastrea el inventario de segunda mano por ti.
            </p>

            {/* BARRA DE BÚSQUEDA TERMINAL */}
            <div className="mt-12 max-w-3xl relative group">
              <div className="absolute -inset-0.5 bg-orange-600 opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur transition duration-300"></div>

              <div className="relative flex items-center bg-black border border-neutral-800">
                <div className="pl-4 pr-2 text-neutral-600">
                  <Terminal size={20} />
                </div>

                <input
                  type="text"
                  placeholder="Busco outfit para concierto underground..."
                  className="flex-1 bg-transparent text-white text-base md:text-lg font-mono py-4 px-2 focus:outline-none placeholder:text-neutral-700"
                />

                <button className="bg-white hover:bg-orange-600 text-black hover:text-white font-bold uppercase text-sm px-6 py-4 transition-colors duration-200 flex items-center gap-2">
                  Run
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS */}
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
