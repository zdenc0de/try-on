'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteProduct } from '@/app/actions/product-management';
import EditProductModal from './EditProductModal';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags?: string[];
}

interface ProductCardEditableProps {
  product: Product;
  onProductDeleted?: () => void;
  onProductUpdated?: () => void;
}

export default function ProductCardEditable({
  product,
  onProductDeleted,
  onProductUpdated,
}: ProductCardEditableProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteProduct(product.id);

      if (result.success) {
        toast.success('Producto eliminado');
        setShowDeleteConfirm(false);
        onProductDeleted?.();
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    });
  };

  return (
    <>
      <div className="relative group">
        {/* Botones de acción */}
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="p-2 bg-black/70 backdrop-blur-sm text-white hover:text-orange-500 transition-colors"
            title="Editar producto"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-black/70 backdrop-blur-sm text-white hover:text-red-500 transition-colors"
            title="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Card del producto */}
        <Link href={`/producto/${product.id}`}>
          <div className="bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors duration-200 flex flex-col cursor-pointer">
            {/* Imagen */}
            <div className="relative aspect-3/4 overflow-hidden bg-neutral-950">
              <img
                src={product.image_url}
                alt={product.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Info */}
            <div className="p-3 border-t border-neutral-800 space-y-2">
              {/* Precio */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-orange-600 text-sm font-bold">
                  ${product.price} MXN
                </span>
              </div>

              {/* Título */}
              <h3 className="font-bold text-white text-sm uppercase tracking-tight truncate">
                {product.title}
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {product.tags?.slice(0, 3).map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="font-mono text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Modal de edición */}
      <EditProductModal
        product={product}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => onProductUpdated?.()}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-sm p-6">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-center mb-2">
              ¿Eliminar producto?
            </h3>

            <p className="text-neutral-500 text-sm text-center mb-6">
              Esta acción no se puede deshacer. El producto &quot;{product.title}&quot; será eliminado permanentemente.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm uppercase font-bold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white transition-colors text-sm uppercase font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
