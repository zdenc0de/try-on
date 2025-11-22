'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { analyzeClothingImage } from '@/app/actions/analyze-image'; // Tu función
import { saveProduct } from '@/app/actions/save-product'; // La función que harás TÚ en el paso 2
import { Camera, Loader2 } from 'lucide-react';

export default function SellerForm() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  // 1. Manejar la subida de imagen y llamar a Gemini
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mostrar previsualización
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      // Convertir a Base64 para Gemini
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // Quitamos el header data:image...
        
        // 🔥 AQUÍ OCURRE LA MAGIA DE GEMINI
        const result = await analyzeClothingImage(base64data);
        
        if (result.success) {
          const data = result.data;
          // Rellenamos el formulario solos
          setValue('title', data.title);
          setValue('description', data.description);
          setValue('category', data.category);
          setValue('price', data.estimatedPrice);
          setValue('tags', data.tags.join(', ')); // Lo mostramos como texto
          setAnalyzed(true);
        }
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 2. Guardar en Supabase (Esto conectará con tu tarea siguiente)
  const onSubmit = async (data) => {
    // Aquí iría la lógica de guardar (Tarea de Dev A)
    const formData = new FormData();
    // ... lógica de envío que haremos en el siguiente paso
    alert("¡Producto listo para guardar! (Falta conectar backend)");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto h-64 object-cover rounded" />
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <Camera size={48} />
            <p>Toca para tomar foto o subir</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center text-purple-600">
          <Loader2 className="animate-spin mr-2" />
          <span>Gemini está analizando tu prenda...</span>
        </div>
      )}

      {analyzed && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <input {...register('title')} placeholder="Título" className="w-full p-2 border rounded" />
          <textarea {...register('description')} placeholder="Descripción" className="w-full p-2 border rounded" rows={3} />
          <div className="grid grid-cols-2 gap-2">
             <input {...register('category')} placeholder="Categoría" className="w-full p-2 border rounded" />
             <input {...register('price')} type="number" placeholder="Precio" className="w-full p-2 border rounded" />
          </div>
          <input {...register('tags')} placeholder="Tags (separados por coma)" className="w-full p-2 border rounded" />
          
          <button type="submit" className="w-full bg-black text-white p-3 rounded-lg font-bold">
            Publicar Prenda
          </button>
        </form>
      )}
    </div>
  );
}