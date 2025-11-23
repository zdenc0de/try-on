import SellerForm from '@/app/components/SellerForm';

export default function VenderPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            Publicar <span className="text-neutral-500">Prenda</span>
          </h1>
          <p className="text-neutral-500 font-mono text-sm">
            Sube una foto. La IA hace el resto.
          </p>
        </div>

        <SellerForm />
      </main>
    </div>
  );
}
