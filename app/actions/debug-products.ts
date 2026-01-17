'use server'

import { createClient } from '@/lib/supabase/server';

export async function debugProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, tags')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  console.log("\n[Debug] PRODUCTOS EN BASE DE DATOS:");
  console.log("=".repeat(80));

  products.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.title}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Tags (${product.tags?.length || 0}):`, product.tags);
  });

  console.log("\n" + "=".repeat(80));
  console.log(`\nTotal: ${products.length} productos`);

  const allTags = new Set<string>();
  products.forEach(p => {
    (p.tags || []).forEach((tag: string) => allTags.add(tag));
  });

  console.log(`\n[Debug] Tags unicos en tu sistema (${allTags.size}):`);
  console.log(Array.from(allTags).sort().join(', '));

  return {
    success: true,
    products: products.map(p => ({
      title: p.title,
      tags: p.tags
    })),
    uniqueTags: Array.from(allTags).sort()
  };
}
