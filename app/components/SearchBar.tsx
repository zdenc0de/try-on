'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Evita el recargo de página
    if (query.trim()) {
      // Redirige a la página /buscar enviando lo escrito como parámetro ?q=
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Sparkles className="text-purple-500 animate-pulse" size={20} />
      </div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej: 'Tengo una cita en una galería de arte y quiero verme intelectual...'"
        className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all shadow-sm group-hover:shadow-md"
      />
      <button 
        type="submit"
        className="absolute inset-y-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-xl font-medium transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}