'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/actions/favorites';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorite: boolean;
  isAuthenticated: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FavoriteButton({
  productId,
  initialIsFavorite,
  isAuthenticated,
  size = 'md',
  className = '',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Inicia sesión para guardar favoritos');
      router.push('/login');
      return;
    }

    // Optimistic update
    setIsFavorite(!isFavorite);

    startTransition(async () => {
      const result = await toggleFavorite(productId);

      if (!result.success) {
        // Revertir si hay error
        setIsFavorite(isFavorite);
        toast.error(result.error || 'Error al actualizar favorito');
      } else {
        if (result.isFavorite) {
          toast.success('Agregado a favoritos');
        } else {
          toast('Eliminado de favoritos');
        }
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`
        p-2 transition-all duration-200
        ${isFavorite
          ? 'text-red-500 hover:text-red-400'
          : 'text-neutral-500 hover:text-red-500'
        }
        ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        hover:scale-110 active:scale-95
        ${className}
      `}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        size={sizeMap[size]}
        fill={isFavorite ? 'currentColor' : 'none'}
        className={isPending ? 'animate-pulse' : ''}
      />
    </button>
  );
}
