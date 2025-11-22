'use server'

import { GoogleGenerativeAI } from "@google/genereative-ai"; // Ojo: asegúrate de importar la librería correcta instalada
// Si instalaste la estándar: import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializamos Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeClothingImage(imageBase64) {
  console.log("🤖 Gemini: Analizando imagen...");

  try {
    // 1. Configuramos el modelo (Flash es rápido y barato para esto)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. El Prompt de Sistema (La parte más importante)
    // Le decimos explícitamente que actúe como API y devuelva JSON.
    const prompt = `
      Eres un experto asistente de moda en un marketplace de ropa de segunda mano.
      Tu tarea es analizar la imagen de una prenda y extraer sus detalles para venderla.
      
      Instrucciones de salida:
      1. Devuelve SOLAMENTE un objeto JSON válido.
      2. No incluyas bloques de código markdown (\`\`\`json).
      3. Responde siempre en Español.
      
      Estructura del JSON requerida:
      {
        "title": "Un título corto y atractivo para la venta (ej: Chamarra Denim Vintage 90s)",
        "description": "Una descripción vendedora de 2 frases mencionando estado, material y ocasión de uso.",
        "category": "Categoría principal (ej: Chamarras, Pantalones, Vestidos, Calzado, Accesorios)",
        "tags": ["array", "de", "5", "palabras", "clave", "para", "busqueda", "estilo", "color"],
        "color": "Color principal",
        "estimatedPrice": 0 (Un número entero estimado en Pesos Mexicanos MXN, sé realista para segunda mano)
      }
    `;

    // 3. Preparamos la imagen para Gemini
    // Asumimos que imageBase64 viene limpia (sin el prefijo "data:image/jpeg;base64,")
    // Si tu frontend manda el prefijo, hay que quitarlo antes de llamar a esta función.
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg", // Puedes ajustar esto o detectarlo si quieres ser muy pro
      },
    };

    // 4. Generamos el contenido
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    // 5. Limpieza del JSON (Gemini a veces es necio y pone markdown)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 6. Convertimos texto a Objeto
    const data = JSON.parse(text);

    console.log("✅ Gemini: Análisis completado con éxito");
    return { success: true, data: data };

  } catch (error) {
    console.error("❌ Error en Gemini:", error);
    return { 
      success: false, 
      error: "No pude analizar la imagen. Intenta con otra foto más clara." 
    };
  }
}