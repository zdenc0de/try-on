import Link from 'next/link';
import { PlusCircle, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-black text-white p-2 rounded-lg">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">ReVibe AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/vender"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            <PlusCircle size={16} />
            Vender Ropa
          </Link>
        </div>
      </div>
    </nav>
  );
}
