
export enum View {
  Home = 'home',
  Dictionary = 'dictionary',
  KoreanStudy = 'koreanStudy',
  Books = 'books',
  Games = 'games',
  Vocabulary = 'vocabulary',
  Settings = 'settings',
}

export interface DictionaryEntry {
  word: string;
  traditionalMeaning: string;
  slangMeaning: string;
  exampleSentence: string;
}

export interface Book {
  id?: string; // 북마크용 고유 ID
  title: string;
  author: string;
  description: string;
  coverImageUrl?: string;
  isbn?: string;
  link?: string; // 네이버 쇼핑 링크
  price?: string; // 가격 정보
  publisher?: string; // 출판사
  pubdate?: string; // 출판일
  isTranslation?: boolean;
  originalInfo?: {
    title: string;
    author: string;
  };
}

export interface VocabWord extends DictionaryEntry {
  id: string;
}

export interface VocabFolder {
  id: string;
  name: string;
  words: VocabWord[];
}

export interface User {
  email: string;
  password?: string; // Optional: only for email/password auth
  fullName: string;
  nickname: string;
  profileImage?: string; // 프로필 이미지 URL 또는 base64
  folders: VocabFolder[];
  hangulProgress?: Record<string, 'completed' | 'unlocked' | 'locked'>;
}

// ==================== 미니게임 타입 ====================

export interface SlangEntry {
  slang: string;
  meaning: string;
  example: string;
}

export interface GlossaryData {
  entries: SlangEntry[];
}

export interface FavoritesData {
  favorites: SlangEntry[];
}

export interface GameOption {
  label: string; // "A", "B", "C", "D"
  text: string;  // 실제 단어
}

export interface GameQuestion {
  questionIndex: number;
  totalQuestions: number;
  questionText: string; // meaning
  options: GameOption[];
  correctAnswer: string; // slang
  canHint: boolean;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  selected: GameOption;
  correct: GameOption;
  explanation: string;
  currentScore: number;
  remaining: number;
}

export interface GameStatus {
  mode: '신조어' | '단어장';
  score: number;
  remaining: number;
  activeSetSize?: number; // 단어장 모드에서만
  round?: number; // 단어장 모드에서만
  totalQuestionsEver?: number; // 단어장 모드에서만
}

export interface WordbookComplete {
  phase: 'wordbook_complete';
  rounds: number;
  totalQuestionsEver: number;
  totalCorrect: number;
  history: Array<{
    round: number;
    asked: number;
    correct: number;
    wrongSlangs: string[];
  }>;
}

export interface QuizComplete {
  phase: 'quiz_complete';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
}
