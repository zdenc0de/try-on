'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { analyzeClothingImage } from '@/app/actions/analyze-image';
import { saveProduct } from '@/app/actions/save-product';
import { Camera, Loader2, CheckCircle, UploadCloud, Info, X, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Función para comprimir imagen - siempre comprime para optimizar subida
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Reducir dimensiones máximas para subida más rápida
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(`Imagen comprimida: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          0.75 // Calidad 75%
        );
      };
    };
  });
};

const MAX_IMAGES = 5;

export default function SellerForm() {
  const { register, handleSubmit, setValue } = useForm();
  const router = useRouter();

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Estado para múltiples imágenes: array de { file, preview }
  const [images, setImages] = useState([]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Verificar límite
    const totalImages = images.length + files.length;
    if (totalImages > MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes permitidas`);
      return;
    }

    setLoadingAnalysis(true);

    try {
      // Comprimir todas las imágenes nuevas
      const newImages = [];
      for (const file of files) {
        const compressedFile = await compressImage(file);
        newImages.push({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile)
        });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Si es la primera imagen, analizar con IA
      if (images.length === 0 && newImages.length > 0) {
        const firstImage = newImages[0].file;
        const reader = new FileReader();
        reader.readAsDataURL(firstImage);
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
      } else {
        setLoadingAnalysis(false);
        if (!analyzed && updatedImages.length > 0) {
          // Si ya hay imágenes pero no se ha analizado, analizar la primera
          analyzeFirstImage(updatedImages[0].file);
        }
      }
    } catch (error) {
      console.error(error);
      setLoadingAnalysis(false);
      toast.error('Error procesando imágenes');
    }

    // Limpiar input para permitir seleccionar la misma imagen
    e.target.value = '';
  };

  const analyzeFirstImage = async (file) => {
    setLoadingAnalysis(true);
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
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // Si eliminamos todas las imágenes, resetear análisis
    if (newImages.length === 0) {
      setAnalyzed(false);
    }
    // Si eliminamos la primera imagen y hay más, re-analizar
    else if (index === 0 && newImages.length > 0) {
      analyzeFirstImage(newImages[0].file);
    }
  };

  const setAsPrimary = (index) => {
    if (index === 0) return; // Ya es la principal

    const newImages = [...images];
    const [removed] = newImages.splice(index, 1);
    newImages.unshift(removed);
    setImages(newImages);

    // Re-analizar con la nueva imagen principal
    analyzeFirstImage(removed.file);
  };

  const onSubmit = async (dataForm) => {
    if (images.length === 0) return toast.error('No hay imágenes seleccionadas');

    setIsSaving(true);
    toast.loading(`Subiendo ${images.length} ${images.length === 1 ? 'imagen' : 'imágenes'}...`, { id: 'upload' });

    try {
      const formData = new FormData();

      // Agregar todas las imágenes
      images.forEach((img) => {
        formData.append('images', img.file);
      });

      formData.append('title', dataForm.title);
      formData.append('description', dataForm.description || '');
      formData.append('category', dataForm.category || '');
      formData.append('price', dataForm.price || '0');
      formData.append('tags', dataForm.tags || '');

      const result = await saveProduct(formData);

      if (result.success) {
        toast.success('Prenda publicada', { id: 'upload' });
        router.push('/');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al publicar', { id: 'upload' });
      }
    } catch (error) {
      console.error('Error en onSubmit:', error);
      toast.error('Error de conexión. Intenta de nuevo.', { id: 'upload' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 bg-neutral-900 border border-neutral-800">

      {/* Área de Carga de Imágenes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
            Fotos ({images.length}/{MAX_IMAGES})
          </label>
          {images.length > 0 && (
            <span className="text-xs text-neutral-600">
              La primera foto será la principal
            </span>
          )}
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-3 gap-2">
          {/* Imágenes existentes */}
          {images.map((img, index) => (
            <div
              key={index}
              className={`relative aspect-square bg-neutral-950 border-2 ${
                index === 0 ? 'border-orange-600' : 'border-neutral-800'
              } overflow-hidden group`}
            >
              <img
                src={img.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badge de imagen principal */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-orange-600 text-black p-1" title="Imagen principal">
                  <Star size={12} fill="currentColor" />
                </div>
              )}

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsPrimary(index)}
                    className="p-2 bg-orange-600 text-black hover:bg-orange-500 transition-colors"
                    title="Establecer como principal"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-600 text-white hover:bg-red-500 transition-colors"
                  title="Eliminar"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Indicador de análisis en primera imagen */}
              {index === 0 && analyzed && (
                <div className="absolute bottom-1 right-1 bg-green-600 text-white p-1">
                  <CheckCircle size={12} />
                </div>
              )}
            </div>
          ))}

          {/* Botón para agregar más imágenes */}
          {images.length < MAX_IMAGES && (
            <div className={`relative aspect-square border-2 border-dashed ${
              images.length === 0 ? 'border-orange-600/50 hover:border-orange-600' : 'border-neutral-700 hover:border-neutral-500'
            } transition-colors cursor-pointer`}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isSaving || loadingAnalysis}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
                {images.length === 0 ? (
                  <>
                    <Camera size={24} className="text-orange-600 mb-1" />
                    <span className="text-[10px] uppercase font-bold">Subir fotos</span>
                  </>
                ) : (
                  <>
                    <Plus size={24} className="mb-1" />
                    <span className="text-[10px] uppercase">Agregar</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {images.length === 0 && (
          <p className="text-xs text-neutral-600 font-mono text-center">
            La IA analizará la primera foto para generar la descripción
          </p>
        )}
      </div>

      {/* Loader de Análisis */}
      {loadingAnalysis && (
        <div className="bg-neutral-800 text-orange-600 p-4 flex items-center justify-center font-mono text-sm">
          <Loader2 className="animate-spin mr-3" />
          <span>Analizando imagen...</span>
        </div>
      )}

      {/* Formulario */}
      {analyzed && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">

          {/* Nota de advertencia */}
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
                <Loader2 className="animate-spin mr-2" /> Publicando {images.length} {images.length === 1 ? 'foto' : 'fotos'}...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2" size={18} /> Publicar ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
