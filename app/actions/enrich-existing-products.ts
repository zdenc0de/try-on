// Script para enriquecer productos EXISTENTES (ejecutar una sola vez)
// app/actions/enrich-existing-products.ts

'use server'

import { createClient } from '@/lib/supabase/server';
import { generateProductTags } from './auto-tag-on-upload';

export async function enrichExistingProducts() {
  const supabase = await createClient();
  
  // 1. Obtener todos los productos
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, description, tags')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error obteniendo productos:", error);
    return { success: false, error: error.message };
  }

  console.log(`\n🔄 Enriqueciendo ${products.length} productos...`);
  
  let processedCount = 0;
  let errorCount = 0;

  // 2. Procesar cada producto
  for (const product of products) {
    try {
      console.log(`\n📦 [${processedCount + 1}/${products.length}] ${product.title}`);
      console.log(`   Tags actuales (${product.tags?.length || 0}):`, product.tags);

      // Generar nuevos tags
      const newTags = await generateProductTags(
        product.title,
        product.description
      );

      // Combinar tags viejos y nuevos (sin duplicados)
      const oldTags = product.tags || [];
      const combinedTags = Array.from(new Set([...oldTags, ...newTags]));

      console.log(`   Tags nuevos (${combinedTags.length}):`, combinedTags);

      // Actualizar en base de datos
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          tags: combinedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`   ❌ Error actualizando:`, updateError);
        errorCount++;
      } else {
        console.log(`   ✅ Actualizado: ${oldTags.length} → ${combinedTags.length} tags`);
        processedCount++;
      }

      // Rate limiting: 1 segundo entre requests (Gemini Flash es rápido)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      console.error(`   ❌ Error procesando ${product.id}:`, err);
      errorCount++;
    }
  }

  const summary = `
    ✅ Procesados exitosamente: ${processedCount}/${products.length}
    ❌ Errores: ${errorCount}
  `;
  
  console.log("\n" + "=".repeat(60));
  console.log(summary);
  console.log("=".repeat(60));

  return { 
    success: true, 
    processed: processedCount,
    errors: errorCount,
    total: products.length,
    message: summary
  };
}