import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
          ${product.price}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {product.tags?.slice(0, 3).map((tag: string, i: number) => (
            <span
              key={i}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
