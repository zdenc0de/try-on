import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tighter uppercase bg-orange-600 text-black px-2 py-1">
            Try On
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/vender"
            className="flex items-center gap-2 bg-white text-black hover:bg-orange-600 hover:text-white px-4 py-2 font-bold uppercase text-xs tracking-wide transition-colors duration-200"
          >
            <PlusCircle size={14} />
            Vender
          </Link>
        </div>
      </div>
    </nav>
  );
}
