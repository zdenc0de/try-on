'use client';

import { useState, useTransition } from 'react';
import { X, Save, Loader2, Tag } from 'lucide-react';
import { updateProduct, UpdateProductData } from '@/app/actions/product-management';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags?: string[];
}

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price.toString());
  const [tagsInput, setTagsInput] = useState(product.tags?.join(', ') || '');
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const updateData: UpdateProductData = {
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      tags,
    };

    startTransition(async () => {
      const result = await updateProduct(product.id, updateData);

      if (result.success) {
        toast.success('Producto actualizado');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Error al actualizar');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold uppercase tracking-wider">Editar Producto</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview de imagen */}
        <div className="p-4 border-b border-neutral-800">
          <div className="aspect-square w-32 mx-auto overflow-hidden bg-neutral-900">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-black border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors"
              placeholder="Nombre del producto"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors resize-none"
              placeholder="Describe tu prenda..."
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
              Precio (MXN)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
              step="1"
              className="w-full bg-black border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors font-mono"
              placeholder="0"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
              <Tag size={12} className="inline mr-1" />
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-black border border-neutral-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange-600 transition-colors"
              placeholder="casual, verano, vintage..."
            />
            <p className="text-xs text-neutral-600 mt-1">
              Los tags ayudan a que encuentren tu prenda en las búsquedas
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm uppercase font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white transition-colors text-sm uppercase font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
