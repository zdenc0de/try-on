'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay imágenes o el array está vacío, no renderizar nada
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <span className="text-neutral-600 font-mono text-sm">Sin imagen</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Si solo hay una imagen, mostrarla sin controles
  if (images.length === 1) {
    return (
      <div className="aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden">
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Imagen Principal */}
      <div className="relative aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden group">
        <img
          src={images[currentIndex]}
          alt={`${title} - Imagen ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Flechas de navegación */}
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
          aria-label="Imagen siguiente"
        >
          <ChevronRight size={24} />
        </button>

        {/* Contador */}
        <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 font-mono text-xs text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToIndex(index)}
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 overflow-hidden transition-all ${
              index === currentIndex
                ? 'border-orange-600'
                : 'border-neutral-800 hover:border-neutral-600 opacity-60 hover:opacity-100'
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          >
            <img
              src={image}
              alt={`${title} - Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
