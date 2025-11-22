import Link from 'next/link';
import SellerForm from '@/app/components/SellerForm'; // Asegúrate que la ruta sea correcta según tu estructura
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Navbar simple para regresar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-black transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al Inicio
          </Link>
          
          <div className="flex items-center gap-2 text-purple-600 font-bold">
            <Sparkles size={20} />
            <span>Vender con IA</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Publicar Prenda</h1>
          <p className="text-gray-500">
            Sube una foto y deja que nuestra IA haga el resto del trabajo.
          </p>
        </div>

        {/* Aquí renderizamos el componente que hizo tu compañero */}
        <SellerForm />
        
      </main>
    </div>
  );
}