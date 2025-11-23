import Link from 'next/link';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags?: string[];
}

interface ProductGridProps {
  products: Product[] | null;
  error?: { message: string } | null;
}

export default function ProductGrid({ products, error }: ProductGridProps) {
  return (
    <div>
      {/* Estado de Error */}
      {error && (
        <p className="text-red-500 font-mono text-sm">
          Error: {error.message}
        </p>
      )}

      {/* Estado Vacío */}
      {products && products.length === 0 && (
        <div className="text-center py-20 border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-mono text-sm uppercase">
            // No hay productos
          </p>
          <Link
            href="/vender"
            className="text-orange-600 font-bold hover:underline mt-2 inline-block text-sm"
          >
            Publicar primero
          </Link>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
