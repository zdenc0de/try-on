'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'; 
import { User, PlusCircle, LogIn, Loader2 } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Estilos reutilizables
  const buttonBaseStyle = "flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs tracking-wide transition-colors duration-200";
  const primaryButtonStyle = `${buttonBaseStyle} bg-white text-black hover:bg-orange-600 hover:text-white`;
  const secondaryButtonStyle = `${buttonBaseStyle} bg-neutral-900 text-white border border-neutral-700 hover:border-orange-600 hover:text-orange-500`;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-black tracking-tighter uppercase bg-orange-600 text-black px-2 py-1 group-hover:bg-white transition-colors">
            Try On
          </span>
        </Link>

        {/* DERECHA: USUARIO */}
        <div className="flex items-center gap-4">
          
          {loading && (
            <Loader2 className="animate-spin text-orange-600" size={20} />
          )}

          {!loading && !user && (
            <Link href="/login" className={primaryButtonStyle}>
              <LogIn size={14} />
              Iniciar Sesión
            </Link>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <Link href="/vender" className={primaryButtonStyle}>
                <PlusCircle size={14} />
                Vender
              </Link>

              <Link href="/perfil" className={secondaryButtonStyle}>
                <User size={14} />
                Mi Perfil
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}