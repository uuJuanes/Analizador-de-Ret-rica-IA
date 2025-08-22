export interface PersuasionScores {
  presuasion: number;
  ethos: number;
  pathos: number;
  logos: number;
}

export interface Highlight {
  text: string;
  type: 'ethos' | 'pathos' | 'logos' | 'presuasion';
  explanation: string;
}

export interface EthosFeedbackItem {
  advice: string;
  example: {
    before: string;
    after: string;
  };
}

export interface EthosFeedback {
    phronesis: EthosFeedbackItem; // Sabiduría Práctica
    arete: EthosFeedbackItem;      // Virtud/Integridad
    eunoia: EthosFeedbackItem;     // Benevolencia
}

export interface FeedbackItem {
  advice: string;
  example: {
    before: string;
    after: string;
  };
}

export interface Feedback {
  ethos: EthosFeedback;
  pathos: FeedbackItem;
  logos: FeedbackItem;
}

export interface Exercise {
  type: 'ethos' | 'pathos' | 'logos' | 'presuasion';
  title: string;
  description: string;
}

export interface ComparisonAnalysis {
  keyImprovement: string;
  recurringWeakness: string;
  strategicAdvice: string;
  averagePreviousScores: PersuasionScores;
}

export interface ToneAnalysis {
  fillerWordCount: number;
  wordsPerMinute: number;
  feedback: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  wasCorrect?: boolean; // For multiple choice mode
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  title: string;
  originalText: string;
  scores: PersuasionScores;
  highlights: Highlight[];
  feedback?: Feedback;
  exercises?: Exercise[];
  improvedText?: string;
  category: string;
  comparisonAnalysis?: ComparisonAnalysis;
  toneAnalysis?: ToneAnalysis;
  aiProvider: AiProvider;
  tokenUsage?: TokenUsage;
}

// --- Case Study Generator Types ---
export interface CaseStudyStep {
  title: string;
  description: string;
  exampleDialog: string;
}

export interface CaseStudy {
  id: string;
  timestamp: string;
  scenario: {
    clientProfile: string;
    problem: string;
  };
  deficientInteraction: {
    transcript: string;
    criticalAnalysis: string[];
  };
  idealProcess: {
    step1_empathy: CaseStudyStep;
    step2_diagnosis: CaseStudyStep;
    step3_solution: CaseStudyStep;
    step4_crossSell: CaseStudyStep;
    step5_closure: CaseStudyStep;
  };
  tokenUsage?: TokenUsage;
}


// --- Gamification Types ---

export type AchievementId = 'FIRST_ANALYSIS' | 'FIVE_ANALYSES' | 'MASTER_PERSUADER' | 'STREAK_3_DAYS';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export interface UserStats {
  analysisCount: number;
  lastAnalysisDate: string | null; // ISO string
  currentStreak: number;
  highestScore: number;
  unlockedAchievements: Set<AchievementId>;
}

// --- Role Play Types ---

export interface RolePlayProfile {
    name: string;
    description: string;
    difficulty?: 'Fácil' | 'Medio' | 'Difícil';
}

export interface RolePlayOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface RolePlayTurn {
  clientResponse: string;
  options: RolePlayOption[];
}

export interface RolePlayScores {
  adaptability: number;
  questioning: number;
  objectionHandling: number;
  closing: number;
}

export interface KeyMoment {
  type: 'praise' | 'suggestion';
  exchange: {
    user: string;
    model: string;
  };
  feedback: string;
}

export interface RolePlayExercise {
    title: string;
    description: string;
    scenario: string;
}

export interface RolePlayAnalysisResult {
  id: string;
  timestamp: string;
  title: string;
  clientProfile: string;
  product: string;
  conversation: ChatMessage[];
  scores: RolePlayScores;
  keyMoments: KeyMoment[];
  overallFeedback: string;
  exercises: RolePlayExercise[];
  correctChoices?: number;
  totalChoices?: number;
  tokenUsage?: TokenUsage;
}

// --- AI Provider Type ---
export type AiProvider = 'gemini' | 'deepseek' | 'openai';

// --- Analysis Mode Type ---
export type AnalysisMode = 'quick' | 'full';

// --- User Authentication and API Keys ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export interface ApiKeys {
  deepseek: string;
  openai: string;
}

// --- Token Usage & Notifications ---
export interface TokenUsageStats {
  monthlyBudget: number;
  usedInMonth: number;
  lastReset: string; // ISO string date
}

export interface Notification {
  id: string;
  type: 'info' | 'warning';
  message: string;
}