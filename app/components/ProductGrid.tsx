import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
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
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag size={24} />
        Recién llegados
      </h2>

      {/* Estado de Error */}
      {error && <p className="text-red-500">Error cargando productos: {error.message}</p>}

      {/* Estado Vacío */}
      {products && products.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Aún no hay ropa publicada.</p>
          <Link href="/vender" className="text-purple-600 font-bold hover:underline mt-2 inline-block">
            ¡Sé el primero en vender algo!
          </Link>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
