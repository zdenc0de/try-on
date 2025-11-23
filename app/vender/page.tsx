import SellerForm from '@/app/components/SellerForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VenderPage() {
  return (
    <div className="min-h-screen">

      {/* Botón volver */}
      <div className="max-w-2xl mx-auto mb-6 px-4 pt-12">
        <Link href="/" className="text-neutral-400 hover:text-orange-600 flex items-center gap-2 transition-colors font-mono text-sm uppercase tracking-wide">
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-12">
        
        <div className="text-center mb-8 space-y-2">

          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            Publicar <span className="text-neutral-500">Prenda</span>
          </h1>
          <p className="text-neutral-500 font-mono text-sm">
            Sube una foto. La IA hace el resto.
          </p>
        </div>

        <SellerForm />
      </main>
    </div>
  );
}