
import { GoogleGenAI } from "@google/genai";
import type { BusinessProfile } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const fetchBusinessProfile = async (businessName: string, city: string): Promise<BusinessProfile> => {
    const systemInstruction = `Actúa como analista OSINT B2B especializado en hostelería (España). Tu objetivo es identificar DECISION MAKERS y DETALLES OPERATIVOS de empresas de restauración para vender "Honei Terminal".

REGLAS DE CUMPLIMIENTO:
- Solo datos públicos. Prioriza precisión.
- FOCO OPERATIVO: Es crítico identificar el tipo de cocina, si tienen terraza, si aceptan reservas y si aceptan American Express.
- FOCO TECH: Identifica herramientas que usen (TPV, sistemas de reserva como TheFork/CoverManager, delivery como Glovo/Uber).

ESTRUCTURA JSON REQUERIDA:
{
  "businessName": "string",
  "city": "string",
  "fullAddress": "string",
  "owners": [{ "firstName": "string", "lastName": "string" }],
  "strategicContacts": [{ 
    "name": "string", 
    "role": "string", 
    "area": "Finanzas" | "Operaciones" | "Tecnología" | "Propiedad",
    "relevance": "string",
    "validity": "string",
    "confidence": "Alto" | "Medio" | "Bajo",
    "source": "string" 
  }],
  "legalInfo": { "legalName": "string", "owners": ["string"] },
  "directContacts": { "email": "string", "phone": "string" },
  "emailDomain": "string",
  "suggestedEmails": [{ "email": "string", "status": "Público" | "Inferido", "source": "string", "bounceRisk": "Bajo" | "Medio" | "Alto" }],
  "contactChannels": [{ "type": "string", "data": "string", "status": "Público" | "Inferido", "source": "string" }],
  "techStack": [{ "category": "string", "provider": "string" }],
  "operationalInfo": { 
    "menuType": "string", 
    "orderingSystem": "string", 
    "paymentMethods": ["string"],
    "terrace": boolean,
    "reservations": boolean,
    "amex": boolean
  },
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "estimatedVolume": "string",
  "painPoints": ["string"],
  "honeiAnalysis": { 
    "fitScore": number, 
    "fitLabel": "Muy Alta" | "Alta" | "Media" | "Baja", 
    "executiveSummary": "string",
    "reasoning": "string",
    "matchedFeatures": ["string"]
  },
  "osintNotes": {
    "unverified": "string",
    "verificationSteps": "string"
  }
}`;
    
    const prompt = `Realiza una investigación OSINT exhaustiva de:
- Negocio: ${businessName}
- Ciudad: ${city}

Búsquedas obligatorias:
1. Detalles operativos: ¿Qué tipo de comida sirven? ¿Tienen terraza? ¿Aceptan reservas (TheFork, web propia)? ¿Aceptan American Express (verificar en web o reseñas)?
2. Decision Makers: CFO, Gerente, Propietario.
3. Herramientas: ¿Qué TPV usan? ¿Qué software de gestión se menciona en ofertas de empleo o artículos técnicos?`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', 
            contents: prompt,
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 15000 } 
            },
        });
        
        let jsonText = response.text.trim();
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) throw new Error("Error de formato en la respuesta de la IA.");
        jsonText = jsonText.substring(startIndex, endIndex + 1);

        const parsedData = JSON.parse(jsonText);
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        parsedData.googleSearchSources = groundingMetadata?.groundingChunks
            ?.map(chunk => chunk.web)
            .filter(web => web?.uri && web?.title) || [];

        return parsedData as BusinessProfile;
    } catch (error) {
        console.error("Gemini Error:", error);
        throw new Error("La investigación OSINT ha fallado. Reintente.");
    }
};