'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Terminal, ArrowRight, Loader2 } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reset loading cuando cambian los searchParams (navegación completada)
  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mt-12 max-w-3xl relative group mx-auto">
      
      {/* Efecto de brillo naranja detrás */}
      <div className="absolute -inset-0.5 bg-orange-600 opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur transition duration-300"></div>

      {/* Contenedor principal estilo Terminal */}
      <div className="relative flex items-center bg-black border border-neutral-800">
        
        {/* Icono Terminal */}
        <div className="pl-4 pr-2 text-neutral-600">
          <Terminal size={20} />
        </div>

        {/* Input funcional */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busco outfit para concierto underground..."
          className="flex-1 bg-transparent text-white text-base md:text-lg font-mono py-4 px-2 focus:outline-none placeholder:text-neutral-700"
        />

        {/* Botón RUN */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-white hover:bg-orange-600 text-black hover:text-white font-bold uppercase text-sm px-6 py-4 transition-colors duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              Run
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}