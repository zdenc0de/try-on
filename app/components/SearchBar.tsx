'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, ArrowRight } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (query.trim()) {
      // Redirige a la página /buscar (o donde decidan manejar la búsqueda)
      // encodeURIComponent es vital para búsquedas con espacios o tildes
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
          className="bg-white hover:bg-orange-600 text-black hover:text-white font-bold uppercase text-sm px-6 py-4 transition-colors duration-200 flex items-center gap-2"
        >
          Run
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}