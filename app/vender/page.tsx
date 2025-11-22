import SellerForm from '@/app/components/SellerForm';

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Publicar Prenda</h1>
          <p className="text-gray-500">
            Sube una foto y deja que nuestra IA haga el resto del trabajo.
          </p>
        </div>

        <SellerForm />
      </main>
    </div>
  );
}
