'use client';

import Link from 'next/link';
import ProductCardEditable from './ProductCardEditable';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags?: string[];
}

interface EditableProductGridProps {
  products: Product[] | null;
  onProductDeleted?: () => void;
  onProductUpdated?: () => void;
}

export default function EditableProductGrid({
  products,
  onProductDeleted,
  onProductUpdated,
}: EditableProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-neutral-800">
        <p className="text-neutral-500 font-mono text-sm uppercase">
          No hay productos
        </p>
        <Link
          href="/vender"
          className="text-orange-600 font-bold hover:underline mt-2 inline-block text-sm"
        >
          Publicar primero
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCardEditable
          key={product.id}
          product={product}
          onProductDeleted={onProductDeleted}
          onProductUpdated={onProductUpdated}
        />
      ))}
    </div>
  );
}
