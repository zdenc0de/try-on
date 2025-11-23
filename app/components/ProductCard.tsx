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
    <div className="group bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors duration-200 flex flex-col">
      {/* Imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-950">
        <img
          src={product.image_url}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info - Estilo ficha técnica */}
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
  );
}
