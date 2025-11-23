'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags?: string[];
}

interface PaginatedProductGridProps {
  products: Product[] | null;
}

export default function PaginatedProductGrid({ products }: PaginatedProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3 filas x 4 columnas

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-neutral-800">
        <p className="text-neutral-500 font-mono text-sm uppercase">
          // No hay productos
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll suave al inicio del grid
      window.scrollTo({ top: document.getElementById('inventory-grid')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="inventory-grid">
      {/* Grid 4 columnas (3 filas visibles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {/* Botón Anterior */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-neutral-800 hover:border-orange-600 disabled:opacity-30 disabled:hover:border-neutral-800 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 font-mono text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-orange-600 text-black font-bold'
                    : 'border border-neutral-800 hover:border-orange-600 text-neutral-400 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-neutral-800 hover:border-orange-600 disabled:opacity-30 disabled:hover:border-neutral-800 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Info de paginación */}
      <div className="text-center mt-4">
        <span className="font-mono text-xs text-neutral-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, products.length)} de {products.length}
        </span>
      </div>
    </div>
  );
}
