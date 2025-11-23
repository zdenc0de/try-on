'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'; // Importamos el cliente de navegador
import { User, PlusCircle, LogIn, Loader2 } from 'lucide-react';

export default function NavbarUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      // 1. Verificar sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getUser();

    // 2. Escuchar cambios en tiempo real (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras carga, mostramos un pequeño spinner o nada
  if (loading) return <Loader2 className="animate-spin text-gray-400" size={20} />;

  // CASO 1: NO LOGUEADO -> Botón de Iniciar Sesión
  if (!user) {
    return (
      <Link 
        href="/login" 
        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95 text-sm shadow-lg shadow-gray-200"
      >
        <LogIn size={18} />
        Iniciar Sesión
      </Link>
    );
  }

  // CASO 2: LOGUEADO -> Botones de Vender y Perfil
  return (
    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
      <Link 
        href="/vender" 
        className="hidden md:flex items-center gap-2 text-gray-600 hover:text-purple-600 font-bold text-sm transition-colors"
      >
        <PlusCircle size={18} />
        Vender
      </Link>

      <Link 
        href="/perfil" 
        className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full font-bold hover:bg-purple-100 hover:text-purple-700 transition-all text-sm border border-transparent hover:border-purple-200"
      >
        <User size={18} />
        Mi Perfil
      </Link>
    </div>
  );
}