import { GoogleGenAI, Part } from '@google/genai';
import { AnalysisResult, PersuasionScores, ChatMessage, RolePlayAnalysisResult, AiProvider, RolePlayTurn, ToneAnalysis, TokenUsage, AnalysisMode, CaseStudy } from '../types';
import { bancolombiaProductData } from '../config/productData';
import { bancolombiaFaqData } from '../config/faqData';

// La clave de API es manejada por el entorno de ejecución, como lo solicita el usuario.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME_TEXT = 'gemini-2.5-flash';

const getProductDetailsByName = (productName: string): string => {
    for (const category of bancolombiaProductData) {
        const product = category.products.find(p => p.name === productName);
        if (product) {
            return product.details;
        }
    }
    return `Detalles específicos no encontrados para '${productName}'. El asesor debe usar su conocimiento general sobre productos de Bancolombia.`;
};

const extractTokenUsage = (response: any): TokenUsage => ({
    promptTokens: response.usageMetadata?.promptTokenCount || 0,
    completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
    totalTokens: response.usageMetadata?.totalTokenCount || 0,
});

const sumTokenUsages = (usages: TokenUsage[]): TokenUsage => {
    return usages.reduce((acc, current) => ({
        promptTokens: acc.promptTokens + current.promptTokens,
        completionTokens: acc.completionTokens + current.completionTokens,
        totalTokens: acc.totalTokens + current.totalTokens,
    }), { promptTokens: 0, completionTokens: 0, totalTokens: 0 });
};

// Helper para llamar a la API de Gemini y esperar una respuesta JSON
async function callGenerativeModel(prompt: string, systemPrompt?: string, temperature: number = 0.7): Promise<{ data: any; tokenUsage: TokenUsage }> {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME_TEXT,
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                temperature: temperature
            }
        });
        const jsonText = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return { data: JSON.parse(jsonText), tokenUsage: extractTokenUsage(response) };
    } catch (e) {
        console.error("Error calling Gemini API:", e, "Response:", (e as any).response?.text);
        if (e instanceof Error) {
            throw new Error(`Error de la API de Gemini: ${e.message}`);
        }
        throw new Error("Error desconocido al llamar a la API de Gemini.");
    }
}

// Helper para llamar a la API con contenido multi-parte (texto + audio)
async function callGenerativeModelWithParts(parts: Part[], systemPrompt?: string, temperature: number = 0.7): Promise<{ data: any; tokenUsage: TokenUsage }> {
     try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME_TEXT,
            contents: { parts },
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                temperature: temperature,
            }
        });

        const jsonText = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return { data: JSON.parse(jsonText), tokenUsage: extractTokenUsage(response) };
    } catch (e) {
        console.error("Error calling Gemini API with parts:", e);
        if (e instanceof Error) {
            throw new Error(`Error de la API de Gemini con partes: ${e.message}`);
        }
        throw new Error("Error desconocido al llamar a la API de Gemini con partes.");
    }
}

// Helper para llamar a la API y obtener solo texto
async function callGenerativeModelForText(prompt: string, systemPrompt?: string): Promise<{ data: string; tokenUsage: TokenUsage }> {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME_TEXT,
            contents: prompt,
            config: { systemInstruction: systemPrompt }
        });
        return { data: response.text, tokenUsage: extractTokenUsage(response) };
    } catch (e) {
        console.error("Error calling Gemini API for text:", e);
         if (e instanceof Error) {
            throw new Error(`Error de la API de Gemini para texto: ${e.message}`);
        }
        throw new Error("Error desconocido al llamar a la API de Gemini para texto.");
    }
}

// Helper para convertir un archivo a la estructura que necesita Gemini
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const categorizeText = async (text: string): Promise<{ data: string, tokenUsage: TokenUsage }> => {
    const prompt = `Clasifica el siguiente texto de ventas en una categoría de producto bancario (ej. 'Tarjeta de Crédito', 'Crédito de Libre Inversión', 'Seguro de Vida', 'Compra de Cartera', 'Otro'). Responde en español solo con un objeto JSON con una única clave "category". Texto: "${text}"`;
    const systemPrompt = "Eres un asistente que solo responde con JSON válido en español.";
    const { data: json, tokenUsage } = await callGenerativeModel(prompt, systemPrompt, 0); // Deterministic
    return { data: json.category || 'Otro', tokenUsage };
};

export const analyzeContent = async (content: string | File, historicalTexts: string[] = [], provider: AiProvider, analysisMode: AnalysisMode = 'full'): Promise<AnalysisResult> => {
    
    const baseSystemPrompt = "Eres un coach de ventas de élite experto en retórica que siempre responde con un objeto JSON válido, completo y en español, según la estructura solicitada.";
    const baseDefinitions = `**Definiciones Clave:**
- **Pre-suasión:** Prepara al receptor ANTES del mensaje. Evalúa el gancho inicial.
- **Ethos (Credibilidad):** Se basa en Phronesis (sabiduría), Areté (integridad) y Eunoia (benevolencia).
- **Pathos (Emoción):** Conexión emocional y storytelling.
- **Logos (Lógica):** Claridad y solidez de los argumentos.`;

    let originalText: string;
    let category: string = 'General';
    let toneAnalysis: ToneAnalysis | undefined = undefined;
    let totalTokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let audioPart: Part | null = null;
    let contentPartsForQualitative: Part[] = [];

    // --- Paso 1: Preparar contenido y categorizar (si es texto) ---
    if (typeof content === 'string') {
        originalText = content;
        const { data: catData, tokenUsage: catUsage } = await categorizeText(originalText);
        category = catData;
        totalTokenUsage = sumTokenUsages([totalTokenUsage, catUsage]);
        contentPartsForQualitative.push({ text: `\n**Analiza el siguiente guion actual:**\n${originalText}`});
    } else {
        originalText = `Audio: ${content.name}`;
        audioPart = await fileToGenerativePart(content);
        contentPartsForQualitative.push({ text: `\n\n**Analiza la transcripción y el tono del siguiente audio de ventas:**` }, audioPart);
    }

    // --- Paso 2: Análisis Cuantitativo (Scores) - Determinista ---
    const scoresPrompt = `Analiza el contenido y proporciona un título y puntuaciones numéricas.
${baseDefinitions}
**Estructura del JSON requerido:**
{
  "title": "Un título corto y descriptivo (máximo 5 palabras).",
  "scores": { "presuasion": "Número 0-100.", "ethos": "Número 0-100.", "pathos": "Número 0-100.", "logos": "Número 0-100." }
}`;
    
    let quantitativeResult;
    if (audioPart) {
        const parts = [{ text: scoresPrompt }, audioPart];
        quantitativeResult = await callGenerativeModelWithParts(parts, baseSystemPrompt, 0);
    } else {
        const fullPrompt = `${scoresPrompt}\n**Contenido a analizar:**\n${originalText}`;
        quantitativeResult = await callGenerativeModel(fullPrompt, baseSystemPrompt, 0);
    }

    const { data: quantitativeData, tokenUsage: quantitativeUsage } = quantitativeResult;
    totalTokenUsage = sumTokenUsages([totalTokenUsage, quantitativeUsage]);

    // --- Paso 3: Análisis Cualitativo (Feedback) - Creativo ---
    let qualitativeData = {};
    if (analysisMode === 'quick') {
        const highlightsPrompt = `Basado en el contenido y sus puntuaciones, extrae frases clave.
**Puntuaciones:** ${JSON.stringify(quantitativeData.scores)}
**Estructura del JSON requerido:**
{
  "highlights": [ { "text": "Frase específica.", "type": "presuasion|ethos|pathos|logos", "explanation": "Explicación concisa." } ]
}`;
        if (audioPart) {
             const parts = [{ text: highlightsPrompt }, audioPart];
             const { data, tokenUsage } = await callGenerativeModelWithParts(parts, baseSystemPrompt, 0.7);
             qualitativeData = data;
             totalTokenUsage = sumTokenUsages([totalTokenUsage, tokenUsage]);
        } else {
             const fullPrompt = `${highlightsPrompt}\n**Contenido a analizar:**\n${originalText}`;
             const { data, tokenUsage } = await callGenerativeModel(fullPrompt, baseSystemPrompt, 0.7);
             qualitativeData = data;
             totalTokenUsage = sumTokenUsages([totalTokenUsage, tokenUsage]);
        }
    } else { // 'full' mode
        let qualitativePrompt = `Basado en el contenido y sus puntuaciones, proporciona un feedback detallado.
${baseDefinitions}
**Puntuaciones Asignadas:** ${JSON.stringify(quantitativeData.scores)}
**Estructura del JSON requerido:**
{
  "highlights": [ { "text": "Frase específica.", "type": "presuasion|ethos|pathos|logos", "explanation": "Explicación." } ],
  "feedback": { 
    "ethos": { 
        "phronesis": { "advice": "Consejo.", "example": { "before": "Frase.", "after": "Frase." } },
        "arete": { "advice": "Consejo.", "example": { "before": "Frase.", "after": "Frase." } },
        "eunoia": { "advice": "Consejo.", "example": { "before": "Frase.", "after": "Frase." } }
    }, 
    "pathos": { "advice": "...", "example": { "before": "...", "after": "..." } }, 
    "logos": { "advice": "...", "example": { "before": "...", "after": "..." } } 
  },
  "exercises": [ { "type": "presuasion|ethos|pathos|logos", "title": "Título.", "description": "Descripción." } ],
  "improvedText": "Versión mejorada del guion."
`;
        if (historicalTexts.length > 0) {
            qualitativePrompt += `,
  "comparisonAnalysis": { "keyImprovement": "Mejora clave.", "recurringWeakness": "Debilidad recurrente.", "strategicAdvice": "Consejo." }`;
        }
        qualitativePrompt += `\n}`;

        if (audioPart) {
            const parts: Part[] = [{ text: qualitativePrompt }];
            if (historicalTexts.length > 0) {
                parts.unshift({ text: `\n**Guiones Anteriores para Comparación:**\n${historicalTexts.map((text, i) => `---Guion Anterior ${i + 1}---\n${text}\n`).join('\n')}` });
            }
            parts.push({ text: `\n\n**Analiza la transcripción del siguiente audio:**` }, audioPart);
            const { data, tokenUsage } = await callGenerativeModelWithParts(parts, baseSystemPrompt, 0.7);
            qualitativeData = data;
            totalTokenUsage = sumTokenUsages([totalTokenUsage, tokenUsage]);
        } else {
             let fullPrompt = qualitativePrompt;
             if (historicalTexts.length > 0) {
                fullPrompt += `\n**Guiones Anteriores para Comparación:**\n${historicalTexts.map((text, i) => `---Guion Anterior ${i + 1}---\n${text}\n`).join('\n')}`;
            }
            fullPrompt += `\n**Analiza el siguiente guion actual:**\n${originalText}`;
            const { data, tokenUsage } = await callGenerativeModel(fullPrompt, baseSystemPrompt, 0.7);
            qualitativeData = data;
            totalTokenUsage = sumTokenUsages([totalTokenUsage, tokenUsage]);
        }
    }

    // --- Paso 4: Análisis de Tono (si es audio) - Determinista ---
    if (audioPart) {
        const tonePrompt = `Analiza el tono, el ritmo y el uso de muletillas en el siguiente audio. Devuelve un objeto JSON en español con "fillerWordCount" (número), "wordsPerMinute" (número entre 120-180) y "feedback" (string conciso en español sobre cómo mejorar la elocución).`;
        const toneParts: Part[] = [{ text: tonePrompt }, audioPart];
        const { data: toneData, tokenUsage: toneUsage } = await callGenerativeModelWithParts(toneParts, "Eres un coach de elocución experto que solo responde en JSON y en español.", 0);
        toneAnalysis = toneData;
        totalTokenUsage = sumTokenUsages([totalTokenUsage, toneUsage]);
    }

    // --- Paso 5: Ensamblar el resultado final ---
    const combinedData = { ...quantitativeData, ...qualitativeData };

    const result: AnalysisResult = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        originalText,
        category,
        aiProvider: provider,
        tokenUsage: totalTokenUsage,
        ...combinedData,
        toneAnalysis,
    };
    
     if (historicalTexts.length > 0 && result.comparisonAnalysis) {
        // Simulación de puntajes promedio para la demo
        const avgScores: PersuasionScores = { presuasion: 0, ethos: 0, pathos: 0, logos: 0 };
         avgScores.presuasion = Math.floor(Math.max(0, result.scores.presuasion - (Math.random() * 20 - 5)));
         avgScores.ethos = Math.floor(Math.max(0, result.scores.ethos - (Math.random() * 20 - 5)));
         avgScores.pathos = Math.floor(Math.max(0, result.scores.pathos - (Math.random() * 20 - 5)));
         avgScores.logos = Math.floor(Math.max(0, result.scores.logos - (Math.random() * 20 - 5)));
        result.comparisonAnalysis.averagePreviousScores = avgScores;
    }

    // --- Validación Final ---
    if (!result.title || !result.scores || !result.highlights) {
        throw new Error("La estructura de la respuesta de Gemini es inválida.");
    }
     if (analysisMode === 'full' && (!result.feedback || !result.exercises || !result.improvedText)) {
        console.warn("Respuesta incompleta en modo 'full':", result);
        // No lanzar error fatal, pero advertir. Podría ser que el modelo decidiera no generar una sección.
    }
    
    return result;
};

export const analyzeRolePlay = async (
    _apiKey: string, // Kept for signature consistency, but unused for Gemini
    conversation: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<RolePlayAnalysisResult> => {
    const transcript = conversation.map(msg => {
        const correctIndicator = msg.wasCorrect === true ? '(Opción Correcta)' : msg.wasCorrect === false ? '(Opción Incorrecta)' : '';
        return `${msg.role === 'user' ? 'Vendedor' : 'Cliente'} ${correctIndicator}: ${msg.text}`
    }).join('\n');

    const prompt = `Eres un coach de ventas experto en role-playing. Analiza la siguiente transcripción de una simulación de venta en frío y devuelve un objeto JSON estructurado con tu análisis. Tu respuesta DEBE ser en español y únicamente el objeto JSON.

**Contexto de la Simulación:**
- **Banco:** Bancolombia, **Producto Ofrecido:** ${product}, **Perfil del Cliente:** ${clientProfile}

**Estructura del JSON requerido (todo el texto debe estar en español):**
{
  "title": "Título corto (máx 5 palabras).",
  "scores": { "adaptability": "Puntuación 0-100.", "questioning": "Puntuación 0-100.", "objectionHandling": "Puntuación 0-100.", "closing": "Puntuación 0-100." },
  "keyMoments": [ { "type": "praise|suggestion", "exchange": { "user": "Frase vendedor.", "model": "Respuesta cliente." }, "feedback": "Feedback conciso en español." } ],
  "overallFeedback": "Resumen general del desempeño en español.",
  "exercises": [ { "title": "Título ejercicio.", "description": "Descripción en español.", "scenario": "Escenario para practicar en español." } ]
}

**Transcripción para Analizar:**
${transcript}
`;
    const systemPrompt = "Eres un coach de ventas experto que siempre responde con un objeto JSON válido y completo en español, según la estructura solicitada.";
    const { data: parsedJson, tokenUsage } = await callGenerativeModel(prompt, systemPrompt);

    const totalChoices = conversation.filter(m => m.role === 'user' && m.wasCorrect !== undefined).length;
    const correctChoices = conversation.filter(m => m.role === 'user' && m.wasCorrect === true).length;

    const result: RolePlayAnalysisResult = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        clientProfile,
        product,
        conversation,
        tokenUsage,
        correctChoices: totalChoices > 0 ? correctChoices : undefined,
        totalChoices: totalChoices > 0 ? totalChoices : undefined,
        ...parsedJson
    };
    
    if (!result.title || !result.scores || !result.keyMoments || !result.overallFeedback || !result.exercises) {
        throw new Error("La estructura de la respuesta de Gemini es inválida para el análisis de role-play.");
    }

    return result;
};

export const generateScript = async (
    product: string,
    keyPoints: string,
    tone: string,
    channel: string
): Promise<{ data: string; tokenUsage: TokenUsage }> => {
    const productDetails = getProductDetailsByName(product);
    const prompt = `
    Eres un copywriter experto y coach de ventas de élite de Bancolombia. Crea un guion de ventas en frío para un asesor.
    **Reglas y Contexto:**
    1.  **Sin escalado:** El asesor no puede derivar a un supervisor.
    2.  **Sin envío de info:** Todo se resuelve en la llamada.
    3.  **Cierre permitido:** Se puede mencionar el envío de T&C post-aceptación.
    4.  **Producto Realista:** Usa características realistas de Bancolombia.

    **Detalles para este Guion:**
    -   **Producto/Servicio:** ${product}
    -   **Puntos clave:** ${keyPoints ? `Usa exclusivamente: "${keyPoints}"` : `Genera 3-4 puntos clave realistas para '${product}' de Bancolombia.`}
    -   **Tono:** ${tone}
    -   **Canal:** ${channel}.
    -   **Información Detallada del Producto (para tu referencia y realismo):**
        ---
        ${productDetails}
        ---
    -   **Preguntas Frecuentes de Clientes (Usa este conocimiento para anticipar y pre-resolver objeciones comunes en el guion):**
        ---
        ${bancolombiaFaqData}
        ---

    **Formato de Salida:**
    Responde ÚNICAMENTE con el texto del guion en español. Sin introducciones ni markdown.
    `;

    return callGenerativeModelForText(prompt);
};

export const getRolePlayResponse = async (
    history: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<{ data: string; tokenUsage: TokenUsage }> => {
    const productDetails = getProductDetailsByName(product);
    const systemInstruction = `Eres un cliente de Bancolombia en un role-playing de ventas. Tu personalidad: "${clientProfile}". El vendedor ofrece: "${product}".
**Contexto del producto (para tu conocimiento como cliente):**
${productDetails}

**REGLAS INQUEBRANTABLES:**
- **NO ENVIAR INFO:** Rechaza ofertas de email. Pide resolver todo en la llamada.
- **NO ESCALAR:** No pidas hablar con un supervisor.
- **NO DERIVAR:** No aceptes ir a una sucursal.
**Mecanismo "Tres Objeciones y Cierre":**
Presenta un máximo de 3 objeciones clave. Después de la tercera, debes mover la conversación a una decisión (SÍ, NO, o agendar otra llamada). Sé un cliente realista que toma una decisión. Responde siempre en español, de manera concisa (1-3 frases).`;

    const fullPrompt = `${history.map(msg => `${msg.role === 'user' ? 'Vendedor' : 'Cliente'}: ${msg.text}`).join('\n')}\nCliente:`;
    
    return callGenerativeModelForText(fullPrompt, systemInstruction);
};

export const getRolePlayMultipleChoiceTurn = async (
    history: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<{ data: RolePlayTurn; tokenUsage: TokenUsage }> => {
     const productDetails = getProductDetailsByName(product);
     const transcript = history.map(msg => {
        const correctIndicator = msg.wasCorrect === true ? '(Opción Correcta)' : msg.wasCorrect === false ? '(Opción Incorrecta)' : '';
        return `${msg.role === 'user' ? 'Vendedor' : 'Cliente'} ${correctIndicator}: ${msg.text}`
    }).join('\n');

    const prompt = `Eres un coach de ventas experto creando un "elige tu propia aventura" para un vendedor en una llamada en frío.
Tu tarea es doble:
1.  **Actúa como el cliente:** Responde al último mensaje del vendedor. Sigue estrictamente la personalidad del cliente. **Importante: El cliente NO conoce el documento de FAQs; actúa de forma natural.**
2.  **Crea 3 opciones para el vendedor:** Como coach experto, usa la siguiente BASE DE CONOCIMIENTO para crear las opciones y sus explicaciones. Una opción debe ser excelente (la correcta) y las otras dos, errores comunes.

**BASE DE CONOCIMIENTO (FAQs - Preguntas Frecuentes):**
Utiliza esta información para que la **opción correcta** sea precisa, resuelva dudas comunes y demuestre un conocimiento experto del producto y los procesos de Bancolombia.
---
${bancolombiaFaqData}
---

**Técnicas Avanzadas para la Opción Correcta:**
La opción "correcta" no solo debe ser buena, debe ser estratégica. Debe aplicar una de estas técnicas de manejo de objeciones para hacer avanzar la venta:
- **Validar y Reencuadrar:** Reconocer la validez de la preocupación del cliente y luego cambiar la perspectiva. (Ej: "Entiendo que la tasa es importante. Permítame mostrarle cómo nuestro seguro de desempleo protege su flujo de caja, lo cual es un beneficio que va más allá de la tasa.").
- **Clarificar y Aislar:** Hacer preguntas para entender la raíz de la objeción y asegurarse de que es la única. (Ej: "Cuando dice que es 'muy caro', ¿lo compara con alguna otra oferta o se refiere al impacto en su presupuesto mensual?").
- **Solución Condicional (Cierre de Prueba):** Ofrecer una solución a la objeción, pero condicionada a que el cliente avance. (Ej: "Si pudiera demostrarle que con nuestro plan de pagos la cuota mensual es menor de lo que imagina, ¿estaría dispuesto a revisar los números conmigo ahora?").
- **Historias o Prueba Social:** Usar un ejemplo anónimo de otro cliente para ilustrar cómo se superó una preocupación similar. (Ej: "Entiendo su duda. Tenía un cliente en una situación parecida y descubrió que al consolidar sus deudas, en realidad liberó X cantidad de dinero al mes.").

**Errores Comunes para las Opciones Incorrectas:**
Las opciones incorrectas deben reflejar "trampas" realistas:
- Una que simplemente "ofrece más información" sin pedir nada a cambio.
- Una que es lógicamente correcta pero ignora el estado emocional del cliente.
- Una que cede el control al cliente ("¿Qué más le gustaría saber?").

**Contexto y Reglas:**
- **Banco:** Bancolombia, **Producto:** ${product}, **Cliente:** ${clientProfile}
- **Información del producto para tu referencia al crear opciones y explicaciones:**
  ---
  ${productDetails}
  ---
- **Reglas:** Las opciones NO pueden ofrecer enviar email, escalar, etc.

**Historial de Conversación:**
${transcript}

**Instrucciones de Salida (JSON estricto, todo el texto en español):**
{
  "clientResponse": "Tu respuesta como cliente en español.",
  "options": [
    { "text": "Opción 1 en español.", "isCorrect": true/false, "explanation": "Explicación en español." },
    { "text": "Opción 2 en español.", "isCorrect": true/false, "explanation": "Explicación en español." },
    { "text": "Opción 3 en español.", "isCorrect": true/false, "explanation": "Explicación en español." }
  ]
}`;
    
    const systemPrompt = "Eres un coach de ventas experto que siempre responde con un objeto JSON válido y completo en español, según la estructura solicitada.";
    const { data: parsedJson, tokenUsage } = await callGenerativeModel(prompt, systemPrompt);

    if (!parsedJson.clientResponse || !parsedJson.options || parsedJson.options.length !== 3) {
        throw new Error("La estructura de la respuesta de la IA para el turno de opción múltiple es inválida.");
    }
    return { data: parsedJson, tokenUsage };
};

export const generateCaseStudy = async (
  problemType: string,
  userNotes: string
): Promise<{ data: CaseStudy; tokenUsage: TokenUsage }> => {
  const prompt = `
  **Rol:** Eres un experto en diseño de material de entrenamiento para equipos de ventas de Bancolombia. Tu especialidad es crear simulaciones realistas basadas en quejas comunes de clientes.

  **Objetivo:** Generar una simulación detallada de una interacción telefónica. La simulación debe contrastar una gestión deficiente con un proceso ideal que resuelva el problema y presente una oferta de valor relevante.

  **Contexto para esta Simulación:**
  - **Tipo de Problema:** ${problemType}
  - **Notas Adicionales del Usuario:** ${userNotes || 'Ninguna.'}

  **Estructura del JSON Requerido (DEBES responder únicamente con este objeto JSON en español):**
  {
    "scenario": {
      "clientProfile": "Perfil del cliente (nombre, rol, estado emocional).",
      "problem": "Descripción clara del problema del cliente."
    },
    "deficientInteraction": {
      "transcript": "Transcripción COMPLETA de una llamada fallida, mostrando mal manejo de los 5 pasos: Saludo, Motivo, Oferta, Objeción, Cierre.",
      "criticalAnalysis": [
        "Análisis del fallo en el saludo y la empatía.",
        "Análisis del error en el sondeo y la oferta.",
        "Análisis del mal manejo de la objeción.",
        "Análisis del cierre contraproducente."
      ]
    },
    "idealProcess": {
      "step1_empathy": {
        "title": "Acogida Empática y Escucha Activa",
        "description": "Validar la emoción del cliente para crear confianza.",
        "exampleDialog": "ASESOR: 'Entiendo completamente su frustración, Sra. Pérez. Lamento el inconveniente. Estoy aquí para encontrar una solución.'"
      },
      "step2_diagnosis": {
        "title": "Diagnóstico y Explicación Transparente",
        "description": "Investigar la causa y comunicarla de manera simple.",
        "exampleDialog": "ASESOR: 'He revisado y veo que hubo una intermitencia en el sistema. Lo importante es que el dinero nunca salió de su cuenta y ya estoy procesando la anulación.'"
      },
      "step3_solution": {
        "title": "Ofrecer una Solución Proactiva y Concreta",
        "description": "Proporcionar acciones específicas y compensar el inconveniente.",
        "exampleDialog": "ASESOR: 'La anulación quedará efectiva en 2 horas. Como compensación, voy a exonerar su cuota de manejo por los próximos 3 meses.'"
      },
      "step4_crossSell": {
        "title": "Transición y Oferta de Venta Cruzada Relevante",
        "description": "Una vez resuelto, encontrar una transición natural para ofrecer un producto de valor.",
        "exampleDialog": "ASESOR: 'Para evitar esto a futuro, noto que no tiene activadas las notificaciones. ¿Le gustaría que le guíe para activarlas? Adicionalmente, veo que califica para nuestro seguro de protección de tarjetas.'"
      },
      "step5_closure": {
        "title": "Cierre y Confirmación",
        "description": "Asegurarse de la satisfacción del cliente y resumir los próximos pasos.",
        "exampleDialog": "ASESOR: 'Entonces, el cobro está anulado y la exoneración aplicada. ¿Hay algo más en lo que pueda ayudarle hoy? Fue un placer.'"
      }
    }
  }`;
  
  const systemPrompt = "Eres un coach de ventas experto que siempre responde con un objeto JSON válido, completo y en español, según la estructura solicitada.";
  const { data, tokenUsage } = await callGenerativeModel(prompt, systemPrompt);

  const caseStudy: CaseStudy = {
    id: new Date().toISOString() + Math.random(),
    timestamp: new Date().toISOString(),
    tokenUsage: tokenUsage,
    ...data
  };
  
  // Basic validation to ensure the AI returned the core structure
  if (!caseStudy.scenario || !caseStudy.deficientInteraction || !caseStudy.idealProcess) {
    throw new Error("La estructura de la respuesta de la IA para el caso de estudio es inválida.");
  }
  
  return { data: caseStudy, tokenUsage };
};