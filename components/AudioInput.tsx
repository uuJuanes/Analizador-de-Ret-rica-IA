// TypeScript type definitions for the Web Speech API
// This is necessary because these types are not included by default in all TypeScript environments.

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

// Added for robust speech synthesis error handling
interface SpeechSynthesisErrorEvent extends Event {
  readonly utterance: SpeechSynthesisUtterance;
  readonly charIndex: number;
  readonly elapsedTime: number;
  readonly name: string;
  readonly error: string;
}


interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { WandIcon } from './icons/WandIcon';
import { TrashIcon } from './icons/TrashIcon';
import { RolePlayIcon } from './icons/RolePlayIcon';
import { ChatMessage, AiProvider, RolePlayTurn, RolePlayOption, AnalysisMode } from '../types';
import { CLIENT_PROFILES } from '../config/rolePlayConfig';
import { COMMON_PROBLEMS } from '../config/caseStudyConfig';
import { bancolombiaProductData } from '../config/productData';
import { SendIcon } from './icons/SendIcon';
import { CheckIcon } from './icons/CheckIcon';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AudioInputProps {
    aiProvider: AiProvider;
    onAnalyze: (value: string | File, type: 'text' | 'audio' | 'roleplay', metadata?: any, analysisMode?: AnalysisMode) => void;
    onGenerateScript: (product: string, keyPoints: string, tone: string, channel: string) => Promise<string>;
    onGenerateCaseStudy: (problemType: string, userNotes: string) => void;
    onGetRolePlayResponse: (history: ChatMessage[], clientProfile: string, product: string) => Promise<string>;
    onGetRolePlayMultipleChoiceTurn: (history: ChatMessage[], clientProfile: string, product: string) => Promise<RolePlayTurn>;
    onRolePlayStart: (clientName: string) => void;
    isLoading: boolean;
    initialText: string;
    checkApiKey: () => boolean;
}

const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
);
const CaseStudyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
);
const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 5.25v1.5a6 6 0 01-12 0v-1.5m6-13.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" /></svg>
);
const AiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25" />
    </svg>
);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);
const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const FormLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{children}</label>
);
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800" />
);
const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
     <textarea {...props} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800" />
);
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800" />
);

const TabButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; disabled?: boolean; disabledTooltip?: string }> = ({ icon, label, isActive, onClick, disabled = false, disabledTooltip }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                isActive
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon} {label}
        </button>
        {disabled && disabledTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {disabledTooltip}
            </div>
        )}
    </div>
);

const AudioInput: React.FC<AudioInputProps> = ({ aiProvider, onAnalyze, onGenerateScript, onGenerateCaseStudy, onGetRolePlayResponse, onGetRolePlayMultipleChoiceTurn, onRolePlayStart, isLoading, initialText, checkApiKey }) => {
    const [activeTab, setActiveTab] = useState<'text' | 'create' | 'scenario' | 'roleplay' | 'audio'>('text');
    const [text, setText] = useState<string>(initialText);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('full');

    // --- Script generator state ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [product, setProduct] = useState(bancolombiaProductData[0].products[0].name);
    const [keyPoints, setKeyPoints] = useState('');
    const [tone, setTone] = useState('Amistoso y profesional');
    const [channel, setChannel] = useState('Llamada Telefónica');
    
    // --- Case Study Generator state ---
    const [problemType, setProblemType] = useState(COMMON_PROBLEMS[0]);
    const [userNotes, setUserNotes] = useState('');


    // --- Role-play state ---
    const [rolePlayStatus, setRolePlayStatus] = useState<'setup' | 'active' | 'analyzing'>('setup');
    const [rolePlayMode, setRolePlayMode] = useState<'freestyle' | 'choices'>('freestyle');
    const [clientProfile, setClientProfile] = useState(CLIENT_PROFILES[0].description);
    const [rolePlayProduct, setRolePlayProduct] = useState(bancolombiaProductData[0].products[0].name);
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isUserListening, setIsUserListening] = useState(false);
    const [userRolePlayInput, setUserRolePlayInput] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [currentOptions, setCurrentOptions] = useState<RolePlayOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<RolePlayOption | null>(null);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useLocalStorage('tts-enabled', true);

    // Fisher-Yates shuffle algorithm
    const shuffle = (array: any[]) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };
    
    const processUserMessage = async (messageText: string, wasCorrect?: boolean) => {
        if (!messageText.trim() || isProcessingTurn) return;

        setIsProcessingTurn(true);
        recognitionRef.current?.stop();
        const newMessage: ChatMessage = { role: 'user', text: messageText.trim(), timestamp: Date.now(), wasCorrect };
        const newHistory = [...conversation, newMessage];
        setConversation(newHistory);
        
        try {
            if (rolePlayMode === 'freestyle') {
                const aiResponse = await onGetRolePlayResponse(newHistory, clientProfile, rolePlayProduct);
                setConversation(prev => [...prev, { role: 'model', text: aiResponse, timestamp: Date.now() + 1 }]);
                await speak(aiResponse);
                setTimeout(() => {
                    if (rolePlayStatus === 'active') {
                        listen();
                    }
                }, 200);
            } else { // choices mode
                const turnResult = await onGetRolePlayMultipleChoiceTurn(newHistory, clientProfile, rolePlayProduct);
                setConversation(prev => [...prev, { role: 'model', text: turnResult.clientResponse, timestamp: Date.now() + 1 }]);
                setCurrentOptions(shuffle(turnResult.options));
                await speak(turnResult.clientResponse);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            if (errorMessage.includes('interrupted')) {
                console.warn("Speech synthesis was interrupted, likely by a new turn or action from the user.");
            } else {
                console.error("Error in AI response:", e);
                setSpeechError(`${errorMessage}. Inténtalo de nuevo.`);
            }
        } finally {
            setIsProcessingTurn(false);
        }
    };


    // --- Role-play logic ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechError("La API de reconocimiento de voz no es compatible con este navegador.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'es-ES';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
            if (transcript) {
                 processUserMessage(transcript);
            }
        };

        recognition.onstart = () => setIsUserListening(true);
        recognition.onend = () => setIsUserListening(false);
        recognition.onerror = (event) => {
             if (event.error !== 'no-speech') {
                console.error('Speech recognition error:', event.error);
                setSpeechError(`Error de reconocimiento: ${event.error}`);
             }
             setIsUserListening(false);
        };
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [conversation]);
    
    const speak = (text: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!isTtsEnabled || !text) {
                resolve();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.onstart = () => setIsAISpeaking(true);
            utterance.onend = () => {
                setIsAISpeaking(false);
                resolve();
            };
            utterance.onerror = (e) => {
                const synthError = e as SpeechSynthesisErrorEvent;
                // The 'interrupted' error is expected when the user stops the simulation,
                // starts a new turn, or clicks another interactive element. We can treat
                // it as a successful cancellation rather than a failure.
                if (synthError.error === 'interrupted') {
                    console.log('Speech synthesis was interrupted as expected.');
                    setIsAISpeaking(false);
                    resolve(); // Resolve the promise, as this is not a critical failure.
                } else {
                    console.error("SpeechSynthesis Error:", synthError.error);
                    setIsAISpeaking(false);
                    reject(new Error(`Error de síntesis de voz: ${synthError.error}`));
                }
            };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        });
    };

    const listen = () => {
        if (rolePlayMode === 'freestyle' && recognitionRef.current && !isUserListening && !isAISpeaking) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting recognition", e);
            }
        }
    };
    
    const handleSendTextMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userRolePlayInput.trim()) return;
        processUserMessage(userRolePlayInput);
        setUserRolePlayInput('');
    };
    
    const handleOptionClick = (option: RolePlayOption) => {
        if (isProcessingTurn || selectedOption) return;
        setCurrentOptions([]);
        setSelectedOption(option);
    };

    const handleContinueAfterFeedback = () => {
        if (!selectedOption) return;
        const optionToProcess = selectedOption;
        setSelectedOption(null);
        processUserMessage(optionToProcess.text, optionToProcess.isCorrect);
    };

    const handleStartSimulation = async () => {
        if (!checkApiKey()) return;
        if (!rolePlayProduct) return;
        const currentProfile = CLIENT_PROFILES.find(p => p.description === clientProfile);
        const clientName = currentProfile ? `el "${currentProfile.name}"` : 'un cliente';
        onRolePlayStart(clientName);

        setConversation([]);
        setCurrentOptions([]);
        setRolePlayStatus('active');
        setSpeechError(null);
        setIsProcessingTurn(true);
        
        try {
            const userGreeting: ChatMessage = { role: 'user', text: 'Hola, buenos días.', timestamp: Date.now()};
            setConversation([userGreeting]);

            if (rolePlayMode === 'freestyle') {
                const aiResponse = await onGetRolePlayResponse([userGreeting], clientProfile, rolePlayProduct);
                setConversation(prev => [...prev, { role: 'model', text: aiResponse, timestamp: Date.now() + 1 }]);
                await speak(aiResponse);
                setTimeout(() => {
                    if (rolePlayStatus === 'active') {
                        listen();
                    }
                }, 200);
            } else { // choices mode
                const turnResult = await onGetRolePlayMultipleChoiceTurn([userGreeting], clientProfile, rolePlayProduct);
                setConversation(prev => [...prev, { role: 'model', text: turnResult.clientResponse, timestamp: Date.now() + 1 }]);
                setCurrentOptions(shuffle(turnResult.options));
                await speak(turnResult.clientResponse);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            if (errorMessage.includes('interrupted')) {
                 console.warn("Initial speech synthesis was interrupted.");
                 setRolePlayStatus('setup');
            } else {
                console.error("Error starting simulation:", e);
                setSpeechError(`No se pudo iniciar la simulación: ${errorMessage}.`);
                setRolePlayStatus('setup');
            }
        } finally {
            setIsProcessingTurn(false);
        }
    };

    const handleEndSimulation = () => {
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();
        setRolePlayStatus('analyzing');
        
        onAnalyze('', 'roleplay', {
            conversation,
            clientProfile,
            product: rolePlayProduct
        });
    };

    // --- Other logic ---
    const handleGenerateScript = async () => {
        if (!product) return;
        setIsGenerating(true);
        try {
            const script = await onGenerateScript(product, keyPoints, tone, channel);
            setText(script);
            setActiveTab('text');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            alert(`No se pudo generar el guion: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleGenerateCaseStudyClick = () => {
        onGenerateCaseStudy(problemType, userNotes);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAudioFile(event.target.files[0]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                chunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], "grabacion.webm", { type: "audio/webm" });
                setAudioFile(file);
                chunksRef.current = [];
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error al acceder al micrófono:", err);
            alert("No se pudo acceder al micrófono. Asegúrate de haber concedido los permisos necesarios.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
        }
    };
    
    const handleAnalyzeClick = () => {
        if (activeTab === 'text') {
            onAnalyze(text, 'text', {}, analysisMode);
        } else if (activeTab === 'audio' && audioFile) {
            onAnalyze(audioFile, 'audio', {}, analysisMode);
        }
    };

    const handlePaste = async () => {
        try {
            if (navigator.clipboard?.readText) {
                const clipboardText = await navigator.clipboard.readText();
                setText(clipboardText);
            }
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            alert('No se pudo pegar el texto del portapapeles. Es posible que tu navegador no lo admita o que no hayas concedido los permisos.');
        }
    };
    
    const isAnalyzeDisabled = isLoading || (activeTab === 'text' && !text.trim()) || (activeTab === 'audio' && !audioFile);
    const isAudioDisabled = aiProvider !== 'gemini';
    const isScenarioGenDisabled = aiProvider !== 'gemini';
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <TabButton icon={<TextIcon className="h-5 w-5"/>} label="Analizar Texto" isActive={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                <TabButton icon={<WandIcon className="h-5 w-5"/>} label="Crear Guion" isActive={activeTab === 'create'} onClick={() => setActiveTab('create')} />
                <TabButton icon={<CaseStudyIcon className="h-5 w-5"/>} label="Generar Escenario" isActive={activeTab === 'scenario'} onClick={() => setActiveTab('scenario')} disabled={isScenarioGenDisabled} disabledTooltip="Función disponible solo con Gemini." />
                <TabButton icon={<RolePlayIcon className="h-5 w-5"/>} label="Role-Play" isActive={activeTab === 'roleplay'} onClick={() => setActiveTab('roleplay')} />
                <TabButton icon={<MicIcon className="h-5 w-5"/>} label="Analizar Audio" isActive={activeTab === 'audio'} onClick={() => setActiveTab('audio')} disabled={isAudioDisabled} disabledTooltip="El análisis de audio solo está disponible con Gemini." />
            </div>

            <div className="pt-4 min-h-[224px]">
                {activeTab === 'text' && (
                    <div className="space-y-4">
                        <div className="relative w-full">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Escribe o pega aquí tu guion de ventas para analizarlo..."
                                className="w-full h-40 p-3 pr-24 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800 resize-none"
                                disabled={isLoading}
                            />
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button onClick={handlePaste} title="Pegar desde Portapapeles" className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    <ClipboardIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => setText('')} title="Limpiar" className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Modo de Análisis</label>
                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                <button
                                    onClick={() => setAnalysisMode('full')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${analysisMode === 'full' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Completo
                                </button>
                                <button
                                    onClick={() => setAnalysisMode('quick')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${analysisMode === 'quick' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Rápido (Ahorro)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'create' && (
                     <div className="space-y-4">
                        <div>
                            <FormLabel htmlFor="product">Producto o Servicio</FormLabel>
                            <FormSelect id="product" value={product} onChange={(e) => setProduct(e.target.value)}>
                                {bancolombiaProductData.map((category) => (
                                    <optgroup label={category.categoryName} key={category.categoryName}>
                                        {category.products.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                    </optgroup>
                                ))}
                            </FormSelect>
                        </div>
                         <div>
                            <FormLabel htmlFor="key-points">Puntos Clave (Opcional)</FormLabel>
                            <FormInput id="key-points" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Ej: Tasa fija, consolidación de deudas" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel htmlFor="tone">Tono</FormLabel>
                                <FormSelect id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                                    <option>Amistoso y profesional</option>
                                    <option>Directo y conciso</option>
                                    <option>Urgente y persuasivo</option>
                                    <option>Empático y consultivo</option>
                                </FormSelect>
                            </div>
                            <div>
                                <FormLabel htmlFor="channel">Canal</FormLabel>
                                <FormSelect id="channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
                                    <option>Llamada Telefónica</option>
                                    <option>Mensaje de WhatsApp</option>
                                    <option>Correo Electrónico</option>
                                </FormSelect>
                            </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'scenario' && (
                     <div className="space-y-4">
                        <div>
                            <FormLabel htmlFor="problem-type">Tipo de Problema del Cliente</FormLabel>
                            <FormSelect id="problem-type" value={problemType} onChange={(e) => setProblemType(e.target.value)}>
                                {COMMON_PROBLEMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </FormSelect>
                        </div>
                         <div>
                            <FormLabel htmlFor="user-notes">Notas Adicionales (Opcional)</FormLabel>
                            <FormTextarea rows={3} id="user-notes" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} placeholder="Añade detalles específicos que quieras ver en la simulación. Ej: 'el cliente está de viaje' o 'ya ha llamado dos veces antes'." />
                        </div>
                    </div>
                )}
                 {activeTab === 'roleplay' && (
                    rolePlayStatus === 'setup' ? (
                        <div className="space-y-4">
                            <div>
                                <FormLabel htmlFor="rp-product">Producto a Vender</FormLabel>
                                <FormSelect id="rp-product" value={rolePlayProduct} onChange={(e) => setRolePlayProduct(e.target.value)}>
                                    {bancolombiaProductData.map((category) => (
                                        <optgroup label={category.categoryName} key={category.categoryName}>
                                            {category.products.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                        </optgroup>
                                    ))}
                                </FormSelect>
                            </div>
                            <div>
                                <FormLabel htmlFor="rp-client">Perfil del Cliente</FormLabel>
                                <FormSelect id="rp-client" value={clientProfile} onChange={(e) => setClientProfile(e.target.value)}>
                                    {CLIENT_PROFILES.map(p => <option key={p.name} value={p.description}>{p.name}</option>)}
                                </FormSelect>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <FormLabel>Voz de la IA</FormLabel>
                                <button
                                    onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                                    className={`${isTtsEnabled ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
                                    role="switch"
                                    aria-checked={isTtsEnabled}
                                >
                                    <span
                                        className={`${isTtsEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                             <div>
                                <FormLabel>Modo de Simulación</FormLabel>
                                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                    <button onClick={() => setRolePlayMode('freestyle')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${rolePlayMode === 'freestyle' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow' : 'text-slate-600 dark:text-slate-300'}`}>Modo Libre</button>
                                    <button onClick={() => setRolePlayMode('choices')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${rolePlayMode === 'choices' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow' : 'text-slate-600 dark:text-slate-300'}`}>Modo Juego</button>
                                </div>
                             </div>
                            <button onClick={handleStartSimulation} disabled={isLoading || !rolePlayProduct} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
                                Iniciar Simulación
                            </button>
                        </div>
                    ) : (
                       <div className="flex flex-col h-[60vh] max-h-[700px]">
                           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-t-lg">
                                {conversation.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                        {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"><AiIcon className="w-5 h-5"/></div>}
                                        <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-slate-700'}`}>
                                            <p className="text-sm text-slate-800 dark:text-slate-100">{msg.text}</p>
                                        </div>
                                        {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center"><UserIcon className="w-5 h-5"/></div>}
                                    </div>
                                ))}
                                 {selectedOption && (
                                    <div className={`p-4 rounded-lg border-l-4 ${selectedOption.isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-green-500' : 'bg-red-50 dark:bg-red-900/30 border-red-500'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-semibold">{selectedOption.isCorrect ? '¡Buena elección!' : 'Punto de Mejora'}</p>
                                                <p className="text-xs mt-1">{selectedOption.explanation}</p>
                                            </div>
                                            <button onClick={handleContinueAfterFeedback} className="ml-4 flex-shrink-0 px-3 py-1 text-xs font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark">
                                                Continuar
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div ref={conversationEndRef} />
                           </div>
                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                               {speechError && <p className="text-xs text-red-500 mb-2 text-center">{speechError}</p>}
                               {rolePlayMode === 'freestyle' ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isUserListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <MicIcon className="w-5 h-5" />
                                        </div>
                                        <form onSubmit={handleSendTextMessage} className="flex-1 flex gap-2">
                                            <FormInput value={userRolePlayInput} onChange={(e) => setUserRolePlayInput(e.target.value)} placeholder="Escribe tu respuesta..." disabled={isProcessingTurn}/>
                                            <button type="submit" disabled={isProcessingTurn} className="p-2 bg-brand-primary text-white rounded-md disabled:opacity-50"><SendIcon className="w-5 h-5"/></button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {currentOptions.map((opt, i) => (
                                            <button key={i} onClick={() => handleOptionClick(opt)} disabled={isProcessingTurn || selectedOption !== null} className="w-full text-left p-3 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                                                {opt.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={handleEndSimulation} disabled={isLoading} className="w-full mt-3 text-center text-sm text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 font-medium">Finalizar y Analizar Simulación</button>
                            </div>
                       </div>
                    )
                )}
                {activeTab === 'audio' && (
                    <div className="flex flex-col items-center justify-center h-full">
                        {audioFile ? (
                             <div className="text-center">
                                <p className="font-medium text-slate-700 dark:text-slate-300">Archivo listo: {audioFile.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">({(audioFile.size / 1024).toFixed(1)} KB)</p>
                                <button onClick={() => setAudioFile(null)} className="mt-2 text-sm text-brand-primary hover:underline">Cambiar archivo</button>
                            </div>
                        ) : isRecording ? (
                            <div className="flex flex-col items-center gap-4">
                               <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 bg-brand-light rounded-full animate-ping"></div>
                                    <button onClick={stopRecording} className="relative w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"></path></svg>
                                    </button>
                               </div>
                               <p className="font-mono text-lg text-slate-700 dark:text-slate-200">{formatTime(recordingTime)}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <button onClick={startRecording} className="flex items-center gap-3 px-6 py-3 bg-brand-primary text-white font-medium rounded-full shadow-lg hover:bg-brand-dark transition-colors">
                                    <MicIcon className="h-6 w-6" />
                                    Iniciar Grabación
                                </button>
                                <span className="text-slate-500 dark:text-slate-400">o</span>
                                <label className="cursor-pointer text-brand-primary hover:underline font-medium">
                                    Sube un archivo
                                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        )}
                         { (audioFile && !isRecording) && (
                            <div className="mt-4 w-full">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Modo de Análisis</label>
                                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                    <button
                                        onClick={() => setAnalysisMode('full')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${analysisMode === 'full' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        Completo
                                    </button>
                                    <button
                                        onClick={() => setAnalysisMode('quick')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${analysisMode === 'quick' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        Rápido (Ahorro)
                                    </button>
                                </div>
                            </div>
                         )}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                {activeTab === 'text' || (activeTab === 'audio' && audioFile) ? (
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isAnalyzeDisabled}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analizando...' : `Analizar Contenido (${analysisMode === 'full' ? 'Completo' : 'Rápido'})`}
                    </button>
                ) : activeTab === 'create' ? (
                     <button onClick={handleGenerateScript} disabled={isGenerating || isLoading || !product} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
                        {isGenerating ? 'Generando...' : 'Generar Guion'}
                    </button>
                ) : activeTab === 'scenario' ? (
                     <button onClick={handleGenerateCaseStudyClick} disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
                        {isLoading ? 'Generando...' : 'Generar Escenario'}
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default AudioInput;