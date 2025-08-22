import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AnalysisResult, UserStats, AchievementId, RolePlayAnalysisResult, AiProvider, UserProfile, ApiKeys, ChatMessage, RolePlayTurn, TokenUsage, TokenUsageStats, Notification, AnalysisMode, CaseStudy } from './types';
import * as apiService from './services/apiService';
import AudioInput from './components/AudioInput';
import AnalysisResults from './components/AnalysisResults';
import RolePlayResults from './components/RolePlayResults';
import HistoryPanel from './components/HistoryPanel';
import ProviderSelector from './components/ProviderSelector';
import SettingsModal from './components/SettingsModal';
import { LogoIcon } from './components/icons/LogoIcon';
import { useLocalStorage } from './hooks/useLocalStorage';
import AchievementToast from './components/gamification/AchievementToast';
import { ALL_ACHIEVEMENTS } from './config/achievements';
import TokenUsageIndicator from './components/TokenUsageIndicator';
import NotificationToast from './components/NotificationToast';
import CaseStudyResults from './components/CaseStudyResults';

const INITIAL_STATS = {
  analysisCount: 0,
  lastAnalysisDate: null,
  currentStreak: 0,
  highestScore: 0,
  unlockedAchievements: [],
};

const INITIAL_API_KEYS: ApiKeys = {
  deepseek: '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',
  openai: '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',
};

const INITIAL_TOKEN_STATS: TokenUsageStats = {
    monthlyBudget: 500000,
    usedInMonth: 0,
    lastReset: new Date().toISOString(),
};

declare global {
  interface Window {
    google: any;
  }
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [currentRolePlayResult, setCurrentRolePlayResult] = useState<RolePlayAnalysisResult | null>(null);
  const [currentCaseStudy, setCurrentCaseStudy] = useState<CaseStudy | null>(null);
  const [history, setHistory] = useLocalStorage<AnalysisResult[]>('rhetoric-history', []);
  const [rolePlayHistory, setRolePlayHistory] = useLocalStorage<RolePlayAnalysisResult[]>('roleplay-history', []);
  const [caseStudyHistory, setCaseStudyHistory] = useLocalStorage<CaseStudy[]>('casestudy-history', []);
  const [stats, setStats] = useLocalStorage('user-stats', INITIAL_STATS);
  const [achievementQueue, setAchievementQueue] = useState<AchievementId[]>([]);
  const [aiProvider, setAiProvider] = useLocalStorage<AiProvider>('ai-provider', 'gemini');

  // Role-play UI state
  const [isRolePlayActive, setIsRolePlayActive] = useState(false);
  const [rolePlayClientName, setRolePlayClientName] = useState<string | null>(null);

  // User Auth and API Keys
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('api-keys', INITIAL_API_KEYS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Token Usage and Notifications
  const [tokenUsageStats, setTokenUsageStats] = useLocalStorage<TokenUsageStats>('token-usage-stats', INITIAL_TOKEN_STATS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifiedThresholds, setNotifiedThresholds] = useState<Set<number>>(new Set());

  const userStats: UserStats = { ...stats, unlockedAchievements: new Set(stats.unlockedAchievements) };
  
  // Check for monthly token reset
  useEffect(() => {
    const lastResetDate = new Date(tokenUsageStats.lastReset);
    const now = new Date();
    if (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
        setTokenUsageStats(prev => ({ ...prev, usedInMonth: 0, lastReset: now.toISOString() }));
        setNotifiedThresholds(new Set());
    }
  }, [tokenUsageStats.lastReset, setTokenUsageStats]);
  
  const addNotification = useCallback((message: string, type: 'info' | 'warning') => {
    const newNotification: Notification = { id: new Date().toISOString(), message, type };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const updateTokenUsage = useCallback((usage: TokenUsage) => {
    const newUsedInMonth = tokenUsageStats.usedInMonth + usage.totalTokens;
    setTokenUsageStats(prev => ({ ...prev, usedInMonth: newUsedInMonth }));

    if (tokenUsageStats.monthlyBudget > 0) {
        const usagePercent = (newUsedInMonth / tokenUsageStats.monthlyBudget) * 100;
        const thresholds = [50, 75, 90, 100];
        
        thresholds.forEach(threshold => {
            if (usagePercent >= threshold && !notifiedThresholds.has(threshold)) {
                addNotification(
                    `Has consumido el ${threshold}% de tu presupuesto de tokens mensual.`,
                    threshold >= 90 ? 'warning' : 'info'
                );
                setNotifiedThresholds(prev => new Set(prev).add(threshold));
            }
        });
    }
  }, [tokenUsageStats, addNotification, notifiedThresholds]);


  const handleLoginSuccess = (credentialResponse: any) => {
    try {
        const profileObject: any = jwtDecode(credentialResponse.credential);
        setUserProfile({
          id: profileObject.sub,
          name: profileObject.name,
          email: profileObject.email,
          imageUrl: profileObject.picture,
        });
    } catch (error) {
        console.error("Error decoding JWT: ", error);
        setError("Hubo un problema al iniciar sesión. El token no es válido.");
    }
  };
  
  const handleLogout = () => {
    setUserProfile(null);
    setIsSettingsOpen(false);
  }

  useEffect(() => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
            // IMPORTANTE: Reemplaza este Client ID con el tuyo desde la Consola de Google Cloud.
            // Para que funcione, debes añadir tu dominio (ej. http://localhost:3000) a los
            // "Orígenes de JavaScript autorizados" en las credenciales de tu proyecto.
            client_id: '446423243063-v6b9d8pmpa6atsp1lefc0rtah5p8mcar.apps.googleusercontent.com',
            callback: handleLoginSuccess
        });
        window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large", type: 'standard', text: 'signin_with' }
        );
      } catch (error) {
          console.error("Error inicializando Google Sign-In:", error);
          setError("No se pudo cargar el inicio de sesión con Google. Revisa el Client ID.");
      }
    }
  }, []);

  const updateUserStats = (newStats: Partial<UserStats>) => {
    const updatedStats = { ...userStats, ...newStats };
    setStats({
      ...updatedStats,
      unlockedAchievements: Array.from(updatedStats.unlockedAchievements),
    });
  };

  const unlockAchievement = (id: AchievementId) => {
    if (!userStats.unlockedAchievements.has(id)) {
      const newUnlocked = new Set(userStats.unlockedAchievements);
      newUnlocked.add(id);
      updateUserStats({ unlockedAchievements: newUnlocked });
      setAchievementQueue(prev => [...prev, id]);
    }
  };
  
  const handleAnalysisCompletion = (result: AnalysisResult | RolePlayAnalysisResult) => {
    if (!userProfile) return; // Only track stats for logged-in users

    const newAnalysisCount = userStats.analysisCount + 1;
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userStats.lastAnalysisDate;
    let newStreak = userStats.currentStreak;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toISOString().split('T')[0]) {
        newStreak++;
      } else {
        newStreak = 1;
      }
    }
    
    let maxScore: number;
    if ('adaptability' in result.scores) {
      const { adaptability, questioning, objectionHandling, closing } = result.scores;
      maxScore = Math.max(adaptability, questioning, objectionHandling, closing, userStats.highestScore);
    } else {
      const { ethos, pathos, logos } = result.scores;
      maxScore = Math.max(ethos, pathos, logos, userStats.highestScore);
    }
    
    updateUserStats({
      analysisCount: newAnalysisCount,
      lastAnalysisDate: today,
      currentStreak: newStreak,
      highestScore: maxScore,
    });
    
    if (newAnalysisCount >= 1) unlockAchievement('FIRST_ANALYSIS');
    if (newAnalysisCount >= 5) unlockAchievement('FIVE_ANALYSES');
    if (maxScore > 90) unlockAchievement('MASTER_PERSUADER');
    if (newStreak >= 3) unlockAchievement('STREAK_3_DAYS');
  };
  
  const checkApiKey = () => {
    if (aiProvider !== 'gemini') {
      const currentApiKey = apiKeys[aiProvider as keyof ApiKeys];
      if (!currentApiKey) {
        setError(`Por favor, añade tu clave de API de OpenRouter para ${aiProvider.charAt(0).toUpperCase() + aiProvider.slice(1)} en los ajustes para continuar.`);
        setIsSettingsOpen(true);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleRolePlayStart = (clientName: string) => {
    setIsRolePlayActive(true);
    setRolePlayClientName(clientName);
    setCurrentResult(null);
    setCurrentRolePlayResult(null);
    setCurrentCaseStudy(null);
  };

  const handleRolePlayEnd = () => {
    setIsRolePlayActive(false);
    setRolePlayClientName(null);
  };

  const handleAnalyze = async (value: string | File, type: 'text' | 'audio' | 'roleplay', metadata?: any, analysisMode: AnalysisMode = 'full') => {
    if (!checkApiKey()) return;
    
    if (!value && type !== 'roleplay') {
      setError('Por favor, ingresa un contenido para analizar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentResult(null);
    setCurrentRolePlayResult(null);
    setCurrentCaseStudy(null);
    
    const apiKey = aiProvider !== 'gemini' ? apiKeys[aiProvider as keyof ApiKeys] : '';

    try {
      if (type === 'roleplay') {
        setLoadingMessage('Analizando la dinámica conversacional...');
        const { conversation, clientProfile, product } = metadata;
        const result = await apiService.analyzeRolePlay(aiProvider, apiKey, conversation, clientProfile, product);
        if (result.tokenUsage) updateTokenUsage(result.tokenUsage);
        setCurrentRolePlayResult(result);
        setRolePlayHistory([result, ...rolePlayHistory.slice(0, 9)]);
        handleAnalysisCompletion(result);
        handleRolePlayEnd();
      } else {
        setLoadingMessage('Clasificando y analizando el contenido...');
        let relevantHistory: AnalysisResult[] = [];
        if (type === 'text') {
          const categoryResult = await apiService.categorizeText(aiProvider, apiKey, value as string);
          if (categoryResult.tokenUsage) updateTokenUsage(categoryResult.tokenUsage);
          const category = categoryResult.data;
          relevantHistory = history.filter(item => item.category === category);
          if (analysisMode === 'full') {
            setLoadingMessage(`Comparando con ${relevantHistory.length} guion(es) anterior(es) de "${category}"...`);
          }
        }

        const historicalTexts = analysisMode === 'full' ? relevantHistory.map(item => item.originalText) : [];
        const result = await apiService.analyzeContent(aiProvider, apiKey, value, historicalTexts, analysisMode);
        if (result.tokenUsage) updateTokenUsage(result.tokenUsage);
        
        setCurrentResult(result);
        setHistory([result, ...history.slice(0, 9)]);
        setInputValue('');
        handleAnalysisCompletion(result);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      let displayError = `No se pudo analizar el contenido. (${errorMessage})`;
      if (aiProvider !== 'gemini' && (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('invalid'))) {
        displayError = `Tu clave de API de ${aiProvider} parece ser inválida. Por favor, revísala en los Ajustes.`;
      }
      setError(displayError);
      if (type === 'roleplay') {
        handleRolePlayEnd();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateCaseStudy = async (problemType: string, userNotes: string) => {
    if (!checkApiKey()) return;
    
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Construyendo el caso de estudio...');
    setCurrentResult(null);
    setCurrentRolePlayResult(null);
    setCurrentCaseStudy(null);
    
    const apiKey = aiProvider !== 'gemini' ? apiKeys[aiProvider as keyof ApiKeys] : '';

    try {
      const { data, tokenUsage } = await apiService.generateCaseStudy(aiProvider, apiKey, problemType, userNotes);
      if (tokenUsage) updateTokenUsage(tokenUsage);
      setCurrentCaseStudy(data);
      setCaseStudyHistory([data, ...caseStudyHistory.slice(0, 9)]);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`No se pudo generar el caso de estudio. (${errorMessage})`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGenerateScript = async (product: string, keyPoints: string, tone: string, channel: string): Promise<string> => {
    if (!checkApiKey()) return "Error: Falta la clave de API.";
    const apiKey = aiProvider !== 'gemini' ? apiKeys[aiProvider as keyof ApiKeys] : '';
    const { data, tokenUsage } = await apiService.generateScript(aiProvider, apiKey, product, keyPoints, tone, channel);
    updateTokenUsage(tokenUsage);
    return data;
  }

  const handleGetRolePlayResponse = async (conversation: ChatMessage[], clientProfile: string, product: string): Promise<string> => {
     if (!checkApiKey()) return "Error: Falta la clave de API.";
     const apiKey = aiProvider !== 'gemini' ? apiKeys[aiProvider as keyof ApiKeys] : '';
     const { data, tokenUsage } = await apiService.getRolePlayResponse(aiProvider, apiKey, conversation, clientProfile, product);
     updateTokenUsage(tokenUsage);
     return data;
  }

  const handleGetRolePlayMultipleChoiceTurn = async (conversation: ChatMessage[], clientProfile: string, product: string): Promise<RolePlayTurn> => {
    if (!checkApiKey()) {
      throw new Error("Falta la clave de API.");
    }
    const apiKey = aiProvider !== 'gemini' ? apiKeys[aiProvider as keyof ApiKeys] : '';
    const { data, tokenUsage } = await apiService.getRolePlayMultipleChoiceTurn(aiProvider, apiKey, conversation, clientProfile, product);
    updateTokenUsage(tokenUsage);
    return data;
  }

  const handleSelectHistory = (result: AnalysisResult | RolePlayAnalysisResult | CaseStudy, type: 'script' | 'roleplay' | 'casestudy') => {
    if (type === 'script') {
        setCurrentResult(result as AnalysisResult);
        setCurrentRolePlayResult(null);
        setCurrentCaseStudy(null);
        setInputValue((result as AnalysisResult).originalText);
    } else if (type === 'roleplay') {
        setCurrentRolePlayResult(result as RolePlayAnalysisResult);
        setCurrentResult(null);
        setCurrentCaseStudy(null);
        setInputValue('');
    } else { // type === 'casestudy'
        setCurrentCaseStudy(result as CaseStudy);
        setCurrentResult(null);
        setCurrentRolePlayResult(null);
        setInputValue('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearHistory = (type: 'script' | 'roleplay' | 'casestudy') => {
    if (type === 'script') {
      setHistory([]);
      setCurrentResult(null);
      setInputValue('');
    } else if (type === 'roleplay') {
      setRolePlayHistory([]);
      setCurrentRolePlayResult(null);
    } else { // type === 'casestudy'
        setCaseStudyHistory([]);
        setCurrentCaseStudy(null);
    }
  };
  
  const handleAchievementToastClosed = () => {
    setAchievementQueue(prev => prev.slice(1));
  };

  const handleNotificationClosed = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const currentAchievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementQueue[0]);
  const currentNotification = notifications[0];

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 font-sans">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Análisis de Ventas <span className="text-brand-primary">IA</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <TokenUsageIndicator used={tokenUsageStats.usedInMonth} budget={tokenUsageStats.monthlyBudget} />
             <ProviderSelector provider={aiProvider} onChange={setAiProvider} disabled={isLoading || isRolePlayActive} />
             {userProfile ? (
                 <button onClick={() => setIsSettingsOpen(true)} title="Abrir Ajustes">
                     <img src={userProfile.imageUrl} alt="User" className="w-9 h-9 rounded-full" />
                 </button>
             ) : (
                <div className="flex items-center gap-2">
                    <div id="google-signin-button"></div>
                    <button onClick={() => setIsSettingsOpen(true)} title="Abrir Ajustes" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                         <UserIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
             )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className={isRolePlayActive ? "lg:col-span-3 space-y-8" : "lg:col-span-2 space-y-8"}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                {isRolePlayActive && rolePlayClientName ? `Simulación con ${rolePlayClientName}` : 'Panel de Control IA'}
              </h2>
              <AudioInput
                aiProvider={aiProvider}
                onAnalyze={handleAnalyze}
                onGenerateScript={handleGenerateScript}
                onGenerateCaseStudy={handleGenerateCaseStudy}
                onGetRolePlayResponse={handleGetRolePlayResponse}
                onGetRolePlayMultipleChoiceTurn={handleGetRolePlayMultipleChoiceTurn}
                onRolePlayStart={handleRolePlayStart}
                isLoading={isLoading}
                initialText={inputValue}
                checkApiKey={checkApiKey}
                key={currentResult?.id || currentRolePlayResult?.id || currentCaseStudy?.id || 'initial'}
              />
               {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm">
                  <p><strong>Error:</strong> {error}</p>
                </div>
              )}
            </div>
            
            {isLoading && !currentResult && !currentRolePlayResult && !currentCaseStudy && (
              <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">{loadingMessage}</p>
              </div>
            )}

            {currentResult && <AnalysisResults result={currentResult} />}
            {currentRolePlayResult && <RolePlayResults result={currentRolePlayResult} />}
            {currentCaseStudy && <CaseStudyResults caseStudy={currentCaseStudy} />}
          </div>

          {!isRolePlayActive && (
            <aside className="lg:col-span-1 lg:sticky lg:top-24">
               <HistoryPanel 
                  history={history}
                  rolePlayHistory={rolePlayHistory} 
                  caseStudyHistory={caseStudyHistory}
                  userStats={userStats}
                  onSelect={handleSelectHistory}
                  onClear={handleClearHistory} 
                  currentResultId={currentResult?.id}
                  currentRolePlayResultId={currentRolePlayResult?.id}
                  currentCaseStudyId={currentCaseStudy?.id}
              />
            </aside>
          )}
        </div>
      </main>
      
      {currentAchievement && (
        <AchievementToast
          key={currentAchievement.id}
          achievement={currentAchievement}
          onClose={handleAchievementToastClosed}
        />
      )}

      {currentNotification && (
        <NotificationToast
          key={currentNotification.id}
          notification={currentNotification}
          onClose={() => handleNotificationClosed(currentNotification.id)}
        />
       )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userProfile={userProfile}
          onLogout={handleLogout}
          apiKeys={apiKeys}
          onSaveKeys={setApiKeys}
          tokenUsageStats={tokenUsageStats}
          onSaveTokenStats={setTokenUsageStats}
        />
      )}
      
      <footer className="bg-transparent mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Analizador de Retórica IA. Potencia tus ventas.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;