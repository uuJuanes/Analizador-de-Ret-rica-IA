import * as gemini from './geminiService';
import * as deepseek from './deepseekService';
import * as openai from './openAiService';
import { AiProvider, AnalysisResult, ChatMessage, RolePlayAnalysisResult, RolePlayTurn, TokenUsage, AnalysisMode, CaseStudy } from '../types';

export const analyzeContent = (
    provider: AiProvider, 
    apiKey: string,
    content: string | File, 
    historicalTexts: string[] = [],
    analysisMode: AnalysisMode
): Promise<AnalysisResult> => {
    switch (provider) {
        case 'deepseek':
            if (content instanceof File) {
                throw new Error("DeepSeek no soporta análisis de audio en esta aplicación.");
            }
            return deepseek.analyzeContent(apiKey, content, historicalTexts, provider, analysisMode);
        case 'openai':
            if (content instanceof File) {
                 throw new Error("ChatGPT no soporta análisis de audio en esta aplicación.");
            }
            return openai.analyzeContent(apiKey, content, historicalTexts, provider, analysisMode);
        case 'gemini':
        default:
            return gemini.analyzeContent(content, historicalTexts, provider, analysisMode);
    }
};

export const categorizeText = (provider: AiProvider, apiKey: string, text: string): Promise<{ data: string; tokenUsage: TokenUsage; }> => {
    switch (provider) {
        case 'deepseek':
            return deepseek.categorizeText(apiKey, text);
        case 'openai':
            return openai.categorizeText(apiKey, text);
        case 'gemini':
        default:
            return gemini.categorizeText(text);
    }
};

export const analyzeRolePlay = (
    provider: AiProvider,
    apiKey: string,
    conversation: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<RolePlayAnalysisResult> => {
     switch (provider) {
        case 'deepseek':
            return deepseek.analyzeRolePlay(apiKey, conversation, clientProfile, product);
        case 'openai':
            return openai.analyzeRolePlay(apiKey, conversation, clientProfile, product);
        case 'gemini':
        default:
            return gemini.analyzeRolePlay(apiKey, conversation, clientProfile, product);
    }
};

export const generateScript = (
    provider: AiProvider,
    apiKey: string,
    product: string,
    keyPoints: string,
    tone: string,
    channel: string
): Promise<{ data: string; tokenUsage: TokenUsage; }> => {
    switch (provider) {
        case 'deepseek':
            return deepseek.generateScript(apiKey, product, keyPoints, tone, channel);
        case 'openai':
            return openai.generateScript(apiKey, product, keyPoints, tone, channel);
        case 'gemini':
        default:
            return gemini.generateScript(product, keyPoints, tone, channel);
    }
};

export const getRolePlayResponse = (
    provider: AiProvider,
    apiKey: string,
    history: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<{ data: string; tokenUsage: TokenUsage; }> => {
    switch (provider) {
        case 'deepseek':
            return deepseek.getRolePlayResponse(apiKey, history, clientProfile, product);
        case 'openai':
            return openai.getRolePlayResponse(apiKey, history, clientProfile, product);
        case 'gemini':
        default:
            return gemini.getRolePlayResponse(history, clientProfile, product);
    }
};

export const getRolePlayMultipleChoiceTurn = (
    provider: AiProvider,
    apiKey: string,
    history: ChatMessage[],
    clientProfile: string,
    product: string
): Promise<{ data: RolePlayTurn; tokenUsage: TokenUsage; }> => {
    switch (provider) {
        case 'deepseek':
            return deepseek.getRolePlayMultipleChoiceTurn(apiKey, history, clientProfile, product);
        case 'openai':
            return openai.getRolePlayMultipleChoiceTurn(apiKey, history, clientProfile, product);
        case 'gemini':
        default:
            return gemini.getRolePlayMultipleChoiceTurn(history, clientProfile, product);
    }
};

export const generateCaseStudy = (
    provider: AiProvider,
    apiKey: string,
    problemType: string,
    userNotes: string
): Promise<{ data: CaseStudy; tokenUsage: TokenUsage; }> => {
    // Por ahora, solo Gemini tiene esta implementación avanzada.
    // Se podría extender a otros proveedores en el futuro.
    switch (provider) {
        case 'gemini':
        default:
            return gemini.generateCaseStudy(problemType, userNotes);
    }
};