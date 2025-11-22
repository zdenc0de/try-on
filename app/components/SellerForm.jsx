'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { analyzeClothingImage } from '@/app/actions/analyze-image';
import { saveProduct } from '@/app/actions/save-product'; 
import { Camera, Loader2, CheckCircle, UploadCloud } from 'lucide-react';
import { toast } from 'sonner'; // Opcional: Si instalaron sonner, si no usa alert()

export default function SellerForm() {
  const { register, handleSubmit, setValue } = useForm();
  
  // Estados para controlar la UI
  const [loadingAnalysis, setLoadingAnalysis] = useState(false); // Analizando con Gemini
  const [isSaving, setIsSaving] = useState(false); // Guardando en Supabase
  const [preview, setPreview] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [fileObj, setFileObj] = useState(null); // Guardamos el archivo real aquí

  // 1. Manejar la subida de imagen y llamar a Gemini
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Guardamos el archivo y el preview
    setFileObj(file);
    setPreview(URL.createObjectURL(file));
    setLoadingAnalysis(true);
    setAnalyzed(false); // Reseteamos por si cambia de foto

    try {
      // Convertir a Base64 SOLO para enviarlo a Gemini (análisis)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; 
        
        // 🔥 LLAMADA A GEMINI
        const result = await analyzeClothingImage(base64data);
        
        if (result.success) {
          const data = result.data;
          // Rellenamos el formulario automáticamente
          setValue('title', data.title);
          setValue('description', data.description);
          setValue('category', data.category);
          setValue('price', data.estimatedPrice);
          setValue('tags', data.tags.join(', ')); 
          setAnalyzed(true);
        } else {
          alert("Error analizando imagen: " + result.error);
        }
        setLoadingAnalysis(false);
      };
    } catch (error) {
      console.error(error);
      setLoadingAnalysis(false);
      alert("Error procesando la imagen");
    }
  };

  // 2. Guardar en Supabase (Conectado y funcionando)
  const onSubmit = async (dataForm) => {
    if (!fileObj) return alert("No hay imagen seleccionada");

    setIsSaving(true);

    // Creamos el paquete de datos para el Servidor
    const formData = new FormData();
    formData.append('image', fileObj); // El archivo real
    formData.append('title', dataForm.title);
    formData.append('description', dataForm.description);
    formData.append('category', dataForm.category);
    formData.append('price', dataForm.price);
    formData.append('tags', dataForm.tags);

    // Llamamos a la Server Action
    const result = await saveProduct(formData);

    if (result.success) {
      // ÉXITO TOTAL
      alert("¡Prenda publicada con éxito! 🚀");
      // Opcional: Recargar la página para subir otro
      window.location.reload();
    } else {
      alert("Error al guardar: " + result.error);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 bg-white shadow-sm rounded-xl my-4">
      
      {/* Área de Carga de Imagen */}
      <div className={`border-2 border-dashed rounded-xl p-8 text-center relative transition-colors ${preview ? 'border-green-500' : 'border-gray-300 hover:border-purple-500'}`}>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleImageChange}
          disabled={isSaving}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="mx-auto h-64 object-cover rounded-lg shadow-md" />
            {analyzed && <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full"><CheckCircle size={20}/></div>}
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 py-8">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Camera size={32} className="text-purple-600" />
            </div>
            <p className="font-medium text-lg">Sube una foto</p>
            <p className="text-sm text-gray-400">Gemini escribirá la descripción por ti</p>
          </div>
        )}
      </div>

      {/* Loader de Análisis */}
      {loadingAnalysis && (
        <div className="bg-purple-50 text-purple-700 p-4 rounded-lg flex items-center justify-center animate-pulse">
          <Loader2 className="animate-spin mr-3" />
          <span className="font-medium">Gemini está analizando tu estilo...</span>
        </div>
      )}

      {/* Formulario (Solo aparece cuando Gemini termina) */}
      {analyzed && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título</label>
            <input {...register('title')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción IA</label>
            <textarea {...register('description')} rows={3} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</label>
               <input {...register('category')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Precio Estimado</label>
               <div className="relative">
                 <span className="absolute left-3 top-3 text-gray-400">$</span>
                 <input {...register('price')} type="number" className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-green-700" />
               </div>
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags (Búsqueda)</label>
            <input {...register('tags')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600" />
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-black hover:bg-gray-800 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Publicando...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2" /> Vender Prenda
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}