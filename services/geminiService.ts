
import { GoogleGenAI } from "@google/genai";
import type { BusinessProfile } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const fetchBusinessProfile = async (businessName: string, city: string): Promise<BusinessProfile> => {
    const systemInstruction = `Actúa como analista OSINT B2B especializado en hostelería (España). Tu objetivo es identificar DECISION MAKERS y CANALES DE CONTACTO de empresas de restauración para vender "Honei Terminal" (Datáfono integrado), usando únicamente fuentes públicas y citando siempre la fuente.

REGLAS DE CUMPLIMIENTO (OBLIGATORIAS):
- Solo datos públicos. Prioriza precisión sobre completitud.
- Si infieres un patrón de email, márcalo como "Inferido" y explica la evidencia.
- Verifica vigencia: roles actuales o de los últimos 24 meses.
- FOCO HONEI TERMINAL: El producto resuelve descuadres de caja, ahorra 3h/día en cierres, ahorra comisiones (~250€/mes) vía enrutamiento inteligente multibanco, y aumenta propinas (+150%).

TAREA A - DECISION MAKERS:
Identifica 2-5 personas clave (CFO, Director Financiero, Controller, COO, Gerente).
Para cada uno define: Nombre, Cargo, Área, Motivo relevancia (pagos/TPV), Vigencia, Confianza y Fuente.

TAREA B - CANALES DE CONTACTO:
Identifica emails corporativos. Si no hay directos, infiere patrón con evidencia de emails genéricos publicados.
Diferencia entre "Público" e "Inferido". Calcula riesgo de rebote.

ESTRUCTURA JSON REQUERIDA (OBLIGATORIO RESPETAR NOMBRES DE CAMPOS):
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
  "operationalInfo": { "menuType": "string", "orderingSystem": "string", "paymentMethods": ["string"] },
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "estimatedVolume": "string",
  "painPoints": ["string"],
  "honeiAnalysis": { 
    "fitScore": number, 
    "fitLabel": "Muy Alta" | "Alta" | "Media" | "Baja", 
    "executiveSummary": "Resumen ejecutivo de 3-5 líneas sobre quién decide y qué canal es fiable.",
    "reasoning": "Tesis financiera para el CFO.",
    "matchedFeatures": ["Cero Descuadres", "Multibanco", "Cierre automático", "Propinas", "División Cuentas"]
  },
  "osintNotes": {
    "unverified": "Qué no se pudo verificar",
    "verificationSteps": "Pasos para confirmar"
  }
}`;
    
    const prompt = `Realiza una investigación OSINT exhaustiva de:
- Negocio: ${businessName}
- Ciudad: ${city}

Búsquedas obligatorias:
1. "Aviso legal ${businessName}" o "Política privacidad ${businessName}" para datos fiscales y emails de administración.
2. "CFO ${businessName}", "Director Financiero ${businessName}", "Gerente ${businessName}" en LinkedIn y prensa.
3. Patrones de email en sitios como "RocketReach", "Hunter" o menciones públicas.
4. "Honei Terminal" vs TPV actual: Identifica el TPV si es posible.`;

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
        throw new Error("La investigación OSINT ha fallado o no ha devuelto un formato válido. Reintente.");
    }
};
