'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

// Subcategorías dinámicas según el tipo de prenda
const SUBCATEGORIES: Record<string, { label: string; options: string[] }> = {
  // Ropa con género
  playera: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  playeras: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  camiseta: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  camisa: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  camisas: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  sudadera: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  sudaderas: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  hoodie: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  chamarra: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  chamarras: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  pantalon: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  pantalones: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  jeans: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  shorts: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },

  // Calzado con tipo
  tenis: { label: 'Estilo', options: ['Casual', 'Deportivo', 'Running', 'Skate'] },
  sneakers: { label: 'Estilo', options: ['Casual', 'Deportivo', 'Running', 'Skate'] },
  zapatos: { label: 'Estilo', options: ['Formal', 'Casual', 'Deportivo'] },
  botas: { label: 'Estilo', options: ['Casual', 'Vaqueras', 'Militares', 'Chelsea'] },
  sandalias: { label: 'Estilo', options: ['Casual', 'Playa', 'Elegante'] },

  // Accesorios con tipo
  lentes: { label: 'Tipo', options: ['De sol', 'Oftálmicos', 'Deportivos'] },
  gafas: { label: 'Tipo', options: ['De sol', 'Oftálmicos', 'Deportivos'] },
  gorra: { label: 'Estilo', options: ['Snapback', 'Dad hat', 'Fitted', 'Trucker'] },
  gorras: { label: 'Estilo', options: ['Snapback', 'Dad hat', 'Fitted', 'Trucker'] },
  bolsa: { label: 'Tipo', options: ['Tote', 'Crossbody', 'Mochila', 'Clutch'] },
  bolsas: { label: 'Tipo', options: ['Tote', 'Crossbody', 'Mochila', 'Clutch'] },
  reloj: { label: 'Estilo', options: ['Casual', 'Deportivo', 'Elegante', 'Smart'] },
  relojes: { label: 'Estilo', options: ['Casual', 'Deportivo', 'Elegante', 'Smart'] },

  // Contextos/ocasiones
  gym: { label: 'Tipo', options: ['Tops', 'Leggings', 'Shorts', 'Conjuntos'] },
  fitness: { label: 'Tipo', options: ['Tops', 'Leggings', 'Shorts', 'Conjuntos'] },
  playa: { label: 'Tipo', options: ['Trajes de baño', 'Cover ups', 'Sandalias', 'Accesorios'] },
  fiesta: { label: 'Ocasión', options: ['Formal', 'Cocktail', 'Casual chic', 'Club'] },
  oficina: { label: 'Estilo', options: ['Formal', 'Business casual', 'Smart casual'] },
  casual: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
  streetwear: { label: 'Género', options: ['Hombre', 'Mujer', 'Unisex'] },
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Más recientes' },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');

  // Track tracking params to sync during render (avoiding useEffect)
  const [prevParams, setPrevParams] = useState(searchParams.toString());

  const query = searchParams.get('q') || '';
  const queryLower = query.toLowerCase().trim();

  // Determinar qué subcategorías mostrar según la búsqueda
  const getSubcategoryConfig = () => {
    // Buscar coincidencia exacta o parcial
    for (const [key, config] of Object.entries(SUBCATEGORIES)) {
      if (queryLower.includes(key) || key.includes(queryLower)) {
        return config;
      }
    }
    return null;
  };

  const subcategoryConfig = getSubcategoryConfig();

  // Contar filtros activos
  const activeFilters = [
    subcategory,
    minPrice,
    maxPrice,
    sortBy !== 'relevance' ? sortBy : '',
  ].filter(Boolean).length;

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (subcategory) params.set('subcategory', subcategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy && sortBy !== 'relevance') params.set('sortBy', sortBy);

    router.push(`/buscar?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/buscar?${params.toString()}`);
  };

  // Sincronizar estado con URL cuando cambian los searchParams
  const currentParams = searchParams.toString();
  if (currentParams !== prevParams) {
    setSubcategory(searchParams.get('subcategory') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sortBy') || 'relevance');
    setPrevParams(currentParams);
  }

  // Helper para aplicar filtros con updates parciales
  const applyFiltersWithUpdate = (updates: Record<string, string>) => {
    const params = new URLSearchParams();

    const newSubcategory = updates.subcategory !== undefined ? updates.subcategory : subcategory;
    const newMinPrice = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const newMaxPrice = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
    const newSortBy = updates.sortBy !== undefined ? updates.sortBy : sortBy;

    if (query) params.set('q', query);
    if (newSubcategory) params.set('subcategory', newSubcategory);
    if (newMinPrice) params.set('minPrice', newMinPrice);
    if (newMaxPrice) params.set('maxPrice', newMaxPrice);
    if (newSortBy && newSortBy !== 'relevance') params.set('sortBy', newSortBy);

    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Botón de filtros */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-neutral-800 hover:border-orange-600 transition-colors text-sm uppercase font-bold tracking-wider"
      >
        <SlidersHorizontal size={16} />
        Filtros
        {activeFilters > 0 && (
          <span className="bg-orange-600 text-white text-xs px-2 py-0.5 font-mono">
            {activeFilters}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel de filtros - posición fija para evitar movimiento */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full right-0 mt-2 w-80 bg-black border border-neutral-800 z-50 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <span className="text-sm font-bold uppercase tracking-wider">Filtrar resultados</span>
              <button
                type="button"
                title="Cerrar filtros"
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-6">

              {/* Subcategoría dinámica - solo si hay opciones para la búsqueda */}
              {subcategoryConfig && (
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                    {subcategoryConfig.label}
                  </label>
                  <select
                    title={subcategoryConfig.label}
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Todos</option>
                    {subcategoryConfig.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rango de precio */}
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  Precio (MXN)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Mín"
                    min="0"
                    className="flex-1 bg-neutral-900 border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors placeholder:text-neutral-600 font-mono w-full"
                  />
                  <span className="text-neutral-600 shrink-0">—</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Máx"
                    min="0"
                    className="flex-1 bg-neutral-900 border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors placeholder:text-neutral-600 font-mono w-full"
                  />
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  Ordenar por
                </label>
                <select
                  title="Ordenar por"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Footer con botones */}
            <div className="p-4 border-t border-neutral-800 flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm uppercase font-bold"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white transition-colors text-sm uppercase font-bold"
              >
                Aplicar
              </button>
            </div>

          </div>
        </>
      )}

      {/* Filtros activos (chips) - posición fija debajo del botón */}
      {activeFilters > 0 && !isOpen && (
        <div className="absolute top-full left-0 mt-2 flex flex-wrap gap-2">
          {subcategory && (
            <FilterChip
              label={subcategory}
              onRemove={() => {
                setSubcategory('');
                applyFiltersWithUpdate({ subcategory: '' });
              }}
            />
          )}
          {(minPrice || maxPrice) && (
            <FilterChip
              label={`$${minPrice || '0'} - $${maxPrice || '∞'}`}
              onRemove={() => {
                setMinPrice('');
                setMaxPrice('');
                applyFiltersWithUpdate({ minPrice: '', maxPrice: '' });
              }}
            />
          )}
          {sortBy !== 'relevance' && (
            <FilterChip
              label={SORT_OPTIONS.find(o => o.value === sortBy)?.label || sortBy}
              onRemove={() => {
                setSortBy('relevance');
                applyFiltersWithUpdate({ sortBy: 'relevance' });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs uppercase tracking-wider whitespace-nowrap">
      {label}
      <button
        onClick={onRemove}
        className="text-neutral-500 hover:text-orange-500 transition-colors ml-1"
      >
        <X size={12} />
      </button>
    </span>
  );
}
