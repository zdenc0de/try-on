'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { analyzeClothingImage } from '@/app/actions/analyze-image';
import { saveProduct } from '@/app/actions/save-product';
import { Camera, Loader2, CheckCircle, UploadCloud, Info } from 'lucide-react'; // Importamos Info
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // Para navegación fluida

export default function SellerForm() {
  const { register, handleSubmit, setValue } = useForm();
  const router = useRouter();

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [fileObj, setFileObj] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileObj(file);
    setPreview(URL.createObjectURL(file));
    setLoadingAnalysis(true);
    setAnalyzed(false);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];

        const result = await analyzeClothingImage(base64data);

        if (result.success) {
          const data = result.data;
          setValue('title', data.title);
          setValue('description', data.description);
          setValue('category', data.category);
          setValue('price', data.estimatedPrice);
          setValue('tags', data.tags.join(', '));
          setAnalyzed(true);
          toast.success('Análisis completado');
        } else {
          toast.error(result.error);
        }
        setLoadingAnalysis(false);
      };
    } catch (error) {
      console.error(error);
      setLoadingAnalysis(false);
      toast.error('Error procesando imagen');
    }
  };

  const onSubmit = async (dataForm) => {
    if (!fileObj) return toast.error('No hay imagen seleccionada');

    setIsSaving(true);

    const formData = new FormData();
    formData.append('image', fileObj);
    formData.append('title', dataForm.title);
    formData.append('description', dataForm.description);
    formData.append('category', dataForm.category);
    formData.append('price', dataForm.price);
    formData.append('tags', dataForm.tags);

    const result = await saveProduct(formData);

    if (result.success) {
      toast.success('Prenda publicada');
      // Usamos router para no recargar toda la página
      router.push('/');
      router.refresh(); 
    } else {
      toast.error(result.error);
    }

    setIsSaving(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 bg-neutral-900 border border-neutral-800">

      {/* Área de Carga de Imagen */}
      <div className={`border border-dashed p-8 text-center relative transition-colors ${preview ? 'border-orange-600' : 'border-neutral-700 hover:border-neutral-500'}`}>
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
            <img src={preview} alt="Preview" className="mx-auto h-64 object-cover" />
            {analyzed && (
              <div className="absolute top-2 right-2 bg-orange-600 text-black p-1">
                <CheckCircle size={20} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-neutral-500 py-8">
            <div className="bg-neutral-800 p-4 mb-3">
              <Camera size={32} className="text-orange-600" />
            </div>
            <p className="font-bold text-sm uppercase">Subir foto</p>
            <p className="text-xs text-neutral-600 font-mono">La IA genera la descripción</p>
          </div>
        )}
      </div>

      {/* Loader de Análisis */}
      {loadingAnalysis && (
        <div className="bg-neutral-800 text-orange-600 p-4 flex items-center justify-center font-mono text-sm">
          <Loader2 className="animate-spin mr-3" />
          <span>Analizando...</span>
        </div>
      )}

      {/* Formulario */}
      {analyzed && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* --- NOTA DE ADVERTENCIA AGREGADA --- */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 text-xs text-yellow-500 flex gap-3 items-start rounded-sm">
            <Info className="shrink-0 mt-0.5" size={18} />
            <div className="font-mono">
              <span className="font-bold block mb-1 text-yellow-400 uppercase tracking-wide">Verificación Requerida</span>
              Gemini puede omitir detalles como la talla exacta o marca. 
              <span className="block mt-2 text-yellow-200/80">
                Por favor revisa y corrige la información antes de publicar.
              </span>
            </div>
          </div>
          {/* ----------------------------------- */}

          <div>
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Título</label>
            <input
              {...register('title')}
              className="w-full p-3 bg-black border border-neutral-800 text-white font-bold focus:border-orange-600 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Descripción</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full p-3 bg-black border border-neutral-800 text-white text-sm focus:border-orange-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Categoría</label>
              <input
                {...register('category')}
                className="w-full p-3 bg-black border border-neutral-800 text-white focus:border-orange-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Precio</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-neutral-600 font-mono">$</span>
                <input
                  {...register('price')}
                  type="number"
                  className="w-full p-3 pl-7 bg-black border border-neutral-800 text-orange-600 font-mono font-bold focus:border-orange-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Tags</label>
            <input
              {...register('tags')}
              className="w-full p-3 bg-black border border-neutral-800 text-neutral-400 text-sm font-mono focus:border-orange-600 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-white hover:bg-orange-600 text-black hover:text-white p-4 font-bold uppercase text-sm flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Publicando...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2" size={18} /> Publicar
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}