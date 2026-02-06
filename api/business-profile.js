export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { businessName, city } = req.body;

  if (!businessName || !city) {
    return res.status(400).json({ error: 'businessName and city are required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!API_KEY) {
    console.error('API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

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
};

  const prompt = `Realiza una investigación OSINT exhaustiva de:
- Negocio: ${businessName}
- Ciudad: ${city}

Búsquedas obligatorias:
1. Detalles operativos: ¿Qué tipo de comida sirven? ¿Tienen terraza? ¿Aceptan reservas (TheFork, web propia)? ¿Aceptan American Express (verificar en web o reseñas)?
2. Decision Makers: CFO, Gerente, Propietario.
3. Herramientas: ¿Qué TPV usan? ¿Qué software de gestión se menciona en ofertas de empleo o artículos técnicos?`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=' + API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: {
            text: systemInstruction,
          },
        },
        contents: {
          parts: {
            text: prompt,
          },
        },
        tools: [
          {
            googleSearch: {},
          },
        ],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 8000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ error: 'Gemini API error', details: errorData });
    }

    const data = await response.json();

    let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!jsonText) {
      return res.status(500).json({ error: 'No text in response' });
    }

    jsonText = jsonText.trim();
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      return res.status(500).json({ error: 'Invalid JSON format in response' });
    }

    jsonText = jsonText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(jsonText);

    const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
    parsedData.googleSearchSources = groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter(web => web?.uri && web?.title) || [];

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Business Profile Error:', error);
    return res.status(500).json({ error: 'Failed to generate business profile', message: error.message });
  }
};
