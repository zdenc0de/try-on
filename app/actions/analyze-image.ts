'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

interface AnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  color: string;
  estimatedPrice: number;
}

interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export async function analyzeClothingImage(imageBase64: string): Promise<AnalyzeResponse> {
  console.log("[Gemini] Analizando imagen...");

  const prompt = `Analiza esta prenda de ropa para venta en marketplace de segunda mano.
Responde SOLO JSON valido, sin markdown:
{"title":"titulo corto atractivo","description":"2 frases: material y ocasion","category":"Categoria","tags":["5-8 palabras clave"],"color":"color principal","estimatedPrice":numero en MXN}

Categorias: Playeras, Camisas, Sudaderas, Chamarras, Pantalones, Shorts, Vestidos, Faldas, Calzado, Accesorios`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: "image/jpeg",
    },
  };

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const data: AnalysisResult = JSON.parse(text);

      console.log(`[Gemini] OK con ${modelName}`);
      return { success: true, data };

    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("429") || msg.includes("404")) {
        console.warn(`[Gemini] ${modelName} no disponible, probando siguiente...`);
        continue;
      }
      console.error(`[Error] Gemini (${modelName}):`, error);
    }
  }

  return {
    success: false,
    error: "No pude analizar la imagen. Intenta de nuevo en unos segundos."
  };
}
