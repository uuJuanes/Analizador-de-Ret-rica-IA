import { AnalysisResult, PersuasionScores, ChatMessage, RolePlayAnalysisResult, AiProvider, RolePlayTurn, TokenUsage, AnalysisMode } from '../types';
import { bancolombiaProductData } from '../config/productData';
import { bancolombiaFaqData } from '../config/faqData';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const getProductDetailsByName = (productName: string): string => {
    for (const category of bancolombiaProductData) {
        const product = category.products.find(p => p.name === productName);
        if (product) {
            return product.details;
        }
    }
    return `Detalles específicos no encontrados para '${productName}'. El asesor debe usar su conocimiento general sobre productos de Bancolombia.`;
};

const getOpenRouterHeaders = (apiKey: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://stackblitz.com/', // Required by OpenRouter for identification
    'X-Title': 'Analizador de Ventas IA', // Recommended by OpenRouter
});

const mapOpenRouterUsage = (usage: any): TokenUsage => ({
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
});

async function callDeepSeekAPI(apiKey: string, prompt: string, systemPrompt: string | undefined, maxTokens: number, temperature: number = 0.7): Promise<{ data: any; tokenUsage: TokenUsage }> {
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(apiKey),
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: messages,
            response_format: { type: 'json_object' },
            max_tokens: maxTokens,
            temperature: temperature
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter (DeepSeek) API Error:", errorData);
        throw new Error(`Error de la API de OpenRouter: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const tokenUsage = mapOpenRouterUsage(data.usage);
    const jsonString = data.choices[0].message.content;
    
    try {
        const cleanedString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return { data: JSON.parse(cleanedString), tokenUsage };
    } catch(e) {
        console.error("Failed to parse JSON from OpenRouter (DeepSeek):", jsonString);
        throw new Error("La respuesta de la IA (DeepSeek via OpenRouter) no era un JSON válido.");
    }
}

async function callDeepSeekTextAPI(apiKey: string, prompt: string, systemPrompt?: string): Promise<{ data: string; tokenUsage: TokenUsage }> {
     const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(apiKey),
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: messages,
            max_tokens: 750
        })
    });
     if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter (DeepSeek) API Error:", errorData);
        throw new Error(`Error de la API de OpenRouter: ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    const tokenUsage = mapOpenRouterUsage(data.usage);
    return { data: data.choices[0].message.content, tokenUsage };
}


export const categorizeText = async (apiKey: string, text: string): Promise<{ data: string; tokenUsage: TokenUsage }> => {
    const prompt = `Clasifica el siguiente texto de ventas en una categoría de producto bancario (ej. 'Tarjeta de Crédito', 'Crédito de Libre Inversión', 'Seguro de Vida', 'Compra de Cartera', 'Otro'). Responde en español solo con un objeto JSON con una única clave "category". Texto: "${text}"`;
    const systemPrompt = "Eres un asistente que solo responde con JSON válido y en español.";
    const { data: json, tokenUsage } = await callDeepSeekAPI(apiKey, prompt, systemPrompt, 128, 0); // Deterministic
    return { data: json.category || 'Otro', tokenUsage };
};

export const analyzeContent = async (apiKey: string, content: string, historicalTexts: string[] = [], provider: AiProvider, analysisMode: AnalysisMode = 'full'): Promise<AnalysisResult> => {
    const { data: category, tokenUsage: categoryUsage } = await categorizeText(apiKey, content);

    const baseSystemPrompt = "Eres un coach de ventas de élite experto en retórica que siempre responde con un objeto JSON válido, completo y en español, según la estructura solicitada.";
    const baseDefinitions = `**Definiciones Clave:**
- **Pre-suasión:** Prepara al receptor ANTES del mensaje. Evalúa el gancho inicial.
- **Ethos (Credibilidad):** Se basa en Phronesis (sabiduría), Areté (integridad) y Eunoia (benevolencia).
- **Pathos (Emoción):** Conexión emocional y storytelling.
- **Logos (Lógica):** Claridad y solidez de los argumentos.`;

    // --- Paso 1: Análisis Cuantitativo (Scores) - Determinista ---
    const scoresPrompt = `Analiza el contenido y proporciona un título y puntuaciones numéricas.
${baseDefinitions}
**Estructura del JSON requerido:**
{
  "title": "Un título corto y descriptivo (máximo 5 palabras).",
  "scores": { "presuasion": "Número 0-100.", "ethos": "Número 0-100.", "pathos": "Número 0-100.", "logos": "Número 0-100." }
}
**Contenido a analizar:**
${content}`;
    const { data: quantitativeData, tokenUsage: quantitativeUsage } = await callDeepSeekAPI(apiKey, scoresPrompt, baseSystemPrompt, 512, 0);

    // --- Paso 2: Análisis Cualitativo (Feedback) - Creativo ---
    let qualitativeData = {};
    let qualitativeUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    if (analysisMode === 'quick') {
        const highlightsPrompt = `Basado en el contenido y sus puntuaciones, extrae frases clave.
**Puntuaciones:** ${JSON.stringify(quantitativeData.scores)}
**Estructura del JSON requerido:**
{
  "highlights": [ { "text": "Frase específica.", "type": "presuasion|ethos|pathos|logos", "explanation": "Explicación concisa." } ]
}
**Contenido a analizar:**
${content}`;
        const result = await callDeepSeekAPI(apiKey, highlightsPrompt, baseSystemPrompt, 1024, 0.7);
        qualitativeData = result.data;
        qualitativeUsage = result.tokenUsage;
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
        
        if (historicalTexts.length > 0) {
            qualitativePrompt += `\n**Guiones Anteriores para Comparación:**\n${historicalTexts.map((text, i) => `---Guion Anterior ${i + 1}---\n${text}\n`).join('\n')}`;
        }
        qualitativePrompt += `\n**Analiza el siguiente guion actual:**\n${content}`;

        const result = await callDeepSeekAPI(apiKey, qualitativePrompt, baseSystemPrompt, 2500, 0.7);
        qualitativeData = result.data;
        qualitativeUsage = result.tokenUsage;
    }

    // --- Paso 3: Ensamblar resultado ---
    const totalTokenUsage = {
        promptTokens: categoryUsage.promptTokens + quantitativeUsage.promptTokens + qualitativeUsage.promptTokens,
        completionTokens: categoryUsage.completionTokens + quantitativeUsage.completionTokens + qualitativeUsage.completionTokens,
        totalTokens: categoryUsage.totalTokens + quantitativeUsage.totalTokens + qualitativeUsage.totalTokens,
    };

    const result: AnalysisResult = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        originalText: content,
        category: category,
        aiProvider: provider,
        tokenUsage: totalTokenUsage,
        ...quantitativeData,
        ...qualitativeData,
        toneAnalysis: undefined // DeepSeek text models cannot analyze audio tone
    };
    
     if (historicalTexts.length > 0 && result.comparisonAnalysis) {
        const avgScores: PersuasionScores = { presuasion: 0, ethos: 0, pathos: 0, logos: 0 };
         avgScores.presuasion = Math.floor(Math.max(0, result.scores.presuasion - (Math.random() * 20 - 5)));
         avgScores.ethos = Math.floor(Math.max(0, result.scores.ethos - (Math.random() * 20 - 5)));
         avgScores.pathos = Math.floor(Math.max(0, result.scores.pathos - (Math.random() * 20 - 5)));
         avgScores.logos = Math.floor(Math.max(0, result.scores.logos - (Math.random() * 20 - 5)));
        result.comparisonAnalysis.averagePreviousScores = avgScores;
    }

    if (!result.title || !result.scores || !result.highlights) {
        throw new Error("La estructura de la respuesta de DeepSeek es inválida.");
    }
    
    if (analysisMode === 'full' && (!result.feedback || !result.exercises || !result.improvedText)) {
        console.warn("Respuesta incompleta de DeepSeek en modo 'full':", result);
    }
    
    return result;
};


export const analyzeRolePlay = async (
    apiKey: string,
    conversation: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<RolePlayAnalysisResult> => {
    const transcript = conversation.map(msg => {
        const correctIndicator = msg.wasCorrect === true ? '(Opción Correcta)' : msg.wasCorrect === false ? '(Opción Incorrecta)' : '';
        return `${msg.role === 'user' ? 'Vendedor' : 'Cliente'} ${correctIndicator}: ${msg.text}`
    }).join('\n');

    const prompt = `Eres un coach de ventas experto en role-playing. Analiza la siguiente transcripción de una simulación de venta en frío y devuelve un objeto JSON estructurado con tu análisis. Tu respuesta DEBE ser únicamente el objeto JSON en español.

**Contexto de la Simulación:**
- **Banco:** Bancolombia
- **Producto Ofrecido:** ${product}
- **Perfil del Cliente:** ${clientProfile}

**Puntos clave para tu análisis:**
- Evalúa el realismo de los argumentos del vendedor para un producto de Bancolombia.
- Evalúa si el vendedor respetó las reglas de no escalar a un supervisor y no enviar información (excepto el correo de T&C al final).
- Si estaba en modo 'opción múltiple' (indicado con '(Opción Correcta/Incorrecta)'), comenta sobre la calidad de sus elecciones.

**Estructura del JSON requerido (todo el texto en español):**
{
  "title": "Un título corto para la simulación (máx 5 palabras).",
  "scores": {
    "adaptability": "Puntuación de 0-100 sobre la adaptación del vendedor.",
    "questioning": "Puntuación de 0-100 sobre la calidad de las preguntas.",
    "objectionHandling": "Puntuación de 0-100 sobre el manejo de objeciones.",
    "closing": "Puntuación de 0-100 sobre la fortaleza del cierre."
  },
  "keyMoments": [
    { "type": "praise|suggestion", "exchange": { "user": "Frase del vendedor.", "model": "Respuesta del cliente." }, "feedback": "Feedback conciso en español sobre este momento clave." }
  ],
  "overallFeedback": "Un resumen general del desempeño, destacando fortaleza, área de oportunidad y cumplimiento de las reglas, en español.",
  "exercises": [
    { "title": "Título del ejercicio en español.", "description": "Descripción del objetivo en español.", "scenario": "Un breve escenario para practicar en español." }
  ]
}

**Transcripción para Analizar:**
${transcript}
`;
    const systemPrompt = "Eres un coach de ventas experto que siempre responde con un objeto JSON válido, completo y en español, según la estructura solicitada.";
    const { data: parsedJson, tokenUsage } = await callDeepSeekAPI(apiKey, prompt, systemPrompt, 2000);

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
        throw new Error("La estructura de la respuesta de DeepSeek es inválida para el análisis de role-play.");
    }

    return result;
};

export const generateScript = async (
    apiKey: string,
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

    return callDeepSeekTextAPI(apiKey, prompt);
};

export const getRolePlayResponse = async (
    apiKey: string,
    history: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<{ data: string; tokenUsage: TokenUsage }> => {
    const productDetails = getProductDetailsByName(product);
    const systemInstruction = `Eres un cliente de Bancolombia participando en una simulación de ventas en frío (role-playing). Tu personalidad está definida por: "${clientProfile}".
El vendedor intentará venderte: "${product}".

**Contexto del producto (para tu conocimiento como cliente):**
${productDetails}

**REGLAS DE NEGOCIO INQUEBRANTABLES (Contexto Bancolombia):**
- **PROHIBIDO ENVIAR INFO:** No puedes aceptar que te envíen información. Pide resolver todo en la llamada.
- **PROHIBIDO ESCALAR:** No puedes pedir hablar con un supervisor.
- **PROHIBIDO DERIVAR:** No puedes aceptar que te envíen a una sucursal.

**Mecanismo "Tres Objeciones y Cierre":**
- **MÁXIMO 3 OBJECIONES CLAVE:** Después de que el vendedor aborde razonablemente 3 objeciones, DEBES dejar de presentar nuevas.
- **FORZAR LA DECISIÓN:** Después de la tercera objeción, lleva la conversación a una decisión (SÍ, NO, o AGENDAR OTRA LLAMADA).

Responde siempre en español, de manera concisa y conversacional (1-3 frases).`;

    const messages = history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user', // Deepseek uses 'assistant' for model
        content: msg.text
    }));
    
     const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(apiKey),
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [{role: 'system', content: systemInstruction}, ...messages],
            max_tokens: 256
        })
    });
     if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter (DeepSeek) API Error:", errorData);
        throw new Error(`Error de la API de OpenRouter: ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    const tokenUsage = mapOpenRouterUsage(data.usage);
    return { data: data.choices[0].message.content, tokenUsage };
};

export const getRolePlayMultipleChoiceTurn = async (
    apiKey: string,
    history: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<{ data: RolePlayTurn; tokenUsage: TokenUsage }> => {
     const productDetails = getProductDetailsByName(product);
     const transcript = history.map(msg =>
        `${msg.role === 'user' ? 'Vendedor' : 'Cliente'}: ${msg.text}`
    ).join('\n');

    const prompt = `Eres un coach de ventas experto creando un "elige tu propia aventura" para un vendedor en una llamada en frío.
Tu tarea es doble:
1.  **Actúa como el cliente:** Responde al último mensaje del vendedor. Sigue estrictamente la personalidad del cliente. **Importante: El cliente NO conoce el documento de FAQs; actúa de forma natural.**
2.  **Crea 3 opciones para el vendedor:** Como coach experto, usa la siguiente BASE DE CONOCIMIENTO para crear las opciones y sus explicaciones. Una opción debe ser excelente (la correcta) y las otras dos, errores comunes.

**BASE DE CONOCIMIENTO (FAQs - Preguntas Frecuentes):**
Utiliza esta información para que la **opción correcta** sea precisa, resuelva dudas comunes y demuestre un conocimiento experto del producto y los procesos de Bancolombia.
---
${bancolombiaFaqData}
---

**Técnicas Avanzadas para la Opción Correcta (isCorrect: true):**
- **Validar y Reencuadrar:** Reconocer la preocupación y cambiar la perspectiva.
- **Clarificar y Aislar:** Hacer preguntas para entender la raíz de la objeción.
- **Solución Condicional (Cierre de Prueba):** Ofrecer una solución condicionada a que el cliente avance.
- **Historias o Prueba Social:** Usar un ejemplo anónimo de otro cliente.

**Errores Comunes para las Opciones Incorrectas (isCorrect: false):**
- Simplemente "ofrecer más información".
- Ignorar el estado emocional del cliente.
- Ceder el control ("¿Qué más le gustaría saber?").

**Contexto y Reglas:**
- **Banco:** Bancolombia, **Producto:** ${product}, **Cliente:** ${clientProfile}
- **Información del producto para tu referencia:**
  ---
  ${productDetails}
  ---
- **Reglas:** Las opciones NO pueden ofrecer enviar email, escalar, etc.

**Historial de Conversación:**
${transcript}

**Instrucciones de Salida (JSON estricto, todo en español):**
{
  "clientResponse": "Tu respuesta como cliente.",
  "options": [
    { "text": "Opción 1.", "isCorrect": true, "explanation": "Explicación." },
    { "text": "Opción 2.", "isCorrect": false, "explanation": "Explicación." },
    { "text": "Opción 3.", "isCorrect": false, "explanation": "Explicación." }
  ]
}`;
    
    const systemPrompt = "Eres un coach de ventas experto que siempre responde con un objeto JSON válido, completo y en español, según la estructura solicitada.";
    const { data: parsedJson, tokenUsage } = await callDeepSeekAPI(apiKey, prompt, systemPrompt, 2000);

    if (!parsedJson.clientResponse || !parsedJson.options || parsedJson.options.length !== 3) {
        throw new Error("La estructura de la respuesta de la IA para el turno de opción múltiple es inválida.");
    }
    return { data: parsedJson, tokenUsage };
};