import { SlangEntry, GlossaryData, FavoritesData, GameQuestion, GameOption, AnswerFeedback, GameStatus, WordbookComplete } from '../types';
import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const openai = API_KEY ? new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
}) : null;

// ==================== 게임 상태 관리 ====================

interface GameState {
  mode: '신조어' | '단어장';
  glossary: SlangEntry[];
  favorites: SlangEntry[];
  activeSet: SlangEntry[]; // 단어장 모드에서 틀린 문제만 저장
  currentRound: number;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  totalQuestionsEver: number; // 단어장 모드에서 누적 문제 수
  history: Array<{
    round: number;
    asked: number;
    correct: number;
    wrongSlangs: string[];
  }>;
  currentQuestion?: SlangEntry;
  shuffledQuestions: SlangEntry[];
  wrongAnswers: Set<string>; // 단어장 모드에서 틀린 문제 추적
  options?: {
    maxQuestions?: number;
    shuffleQuestions?: boolean;
    seed?: number;
  };
  language?: string;
}

let gameState: GameState | null = null;

// ==================== 유틸리티 함수 ====================

const shuffleArray = <T>(array: T[], seed?: number): T[] => {
  const shuffled = [...array];
  if (seed !== undefined) {
    // 시드 기반 셔플 (재현 가능)
    let rng = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      rng = (rng * 9301 + 49297) % 233280;
      const j = Math.floor((rng / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } else {
    // 일반 랜덤 셔플
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  return shuffled;
};

const generateWrongAnswers = (
  correctSlang: string,
  allEntries: SlangEntry[],
  exclude: string[] = []
): string[] => {
  const available = allEntries
    .filter(e => e.slang !== correctSlang && !exclude.includes(e.slang))
    .map(e => e.slang);
  
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, 3);
};

// ==================== 게임 엔진 API ====================

export const initGame = (
  mode: '신조어' | '단어장',
  sourceData?: GlossaryData,
  favorites?: FavoritesData,
  options?: { maxQuestions?: number; shuffleQuestions?: boolean; seed?: number; language?: string }
): { success: boolean; message: string } => {
  try {
    if (mode === '신조어') {
      if (!sourceData || !sourceData.entries || sourceData.entries.length < 4) {
        return {
          success: false,
          message: '전체 레코드 수가 4보다 작습니다. 최소 4개의 신조어가 필요합니다.'
        };
      }
      
      gameState = {
        mode: '신조어',
        glossary: sourceData.entries,
        favorites: [],
        activeSet: [],
        currentRound: 1,
        questionIndex: 0,
        totalQuestions: options?.maxQuestions || sourceData.entries.length,
        score: 0,
        totalQuestionsEver: 0,
        history: [],
        shuffledQuestions: options?.shuffleQuestions !== false 
          ? shuffleArray(sourceData.entries, options?.seed)
          : sourceData.entries,
        wrongAnswers: new Set(),
        options: options || {},
        language: options?.language || 'ko'
      };
    } else if (mode === '단어장') {
      if (!favorites || !favorites.favorites || favorites.favorites.length === 0) {
        return {
          success: false,
          message: '즐겨찾기 목록이 비어있습니다.'
        };
      }
      
      // 전체 glossary도 필요 (오답 생성용)
      const allGlossary = sourceData?.entries || [];
      
      gameState = {
        mode: '단어장',
        glossary: allGlossary,
        favorites: favorites.favorites,
        activeSet: [...favorites.favorites], // 초기 세트는 favorites 전체
        currentRound: 1,
        questionIndex: 0,
        totalQuestions: favorites.favorites.length,
        score: 0,
        totalQuestionsEver: 0,
        history: [],
        shuffledQuestions: options?.shuffleQuestions !== false
          ? shuffleArray(favorites.favorites, options?.seed)
          : favorites.favorites,
        wrongAnswers: new Set(),
        options: options || {},
        language: options?.language || 'ko'
      };
    }
    
    return { success: true, message: '게임 초기화 완료' };
  } catch (error: any) {
    return { success: false, message: `초기화 실패: ${error.message}` };
  }
};

export const startGame = async (): Promise<GameQuestion | { error: boolean; code: string; message: string }> => {
  if (!gameState) {
    return { error: true, code: 'NOT_INITIALIZED', message: '게임이 초기화되지 않았습니다.' };
  }
  
  if (gameState.mode === '단어장' && gameState.activeSet.length === 0) {
    return { error: true, code: 'NO_ACTIVE_SET', message: '활성 세트가 비어있습니다.' };
  }
  
  // 현재 라운드의 문제 세트 준비
  const questions = gameState.mode === '단어장' 
    ? gameState.activeSet 
    : gameState.shuffledQuestions;
  
  if (questions.length === 0) {
    return { error: true, code: 'NO_QUESTIONS', message: '문제가 없습니다.' };
  }
  
  // 모든 단어 사용 (maxQuestions 제한 제거)
  const questionsToUse = questions; // 모든 문제 사용
  
  gameState.shuffledQuestions = gameState.options?.shuffleQuestions !== false
    ? shuffleArray(questionsToUse, gameState.options?.seed)
    : questionsToUse;
  
  console.log(`🎮 게임 시작: ${gameState.mode} 모드, ${questionsToUse.length}개 문제`);
  
  gameState.questionIndex = 0;
  gameState.totalQuestions = gameState.shuffledQuestions.length;
  gameState.score = 0;
  gameState.wrongAnswers.clear(); // 새 라운드 시작 시 초기화
  
  if (gameState.mode === '단어장') {
    gameState.totalQuestionsEver += gameState.totalQuestions;
  }
  
  return await presentQuestion();
};

// 의미 번역 함수
const translateMeaning = async (meaning: string, language: string): Promise<string> => {
  if (language === 'ko' || !openai) {
    return meaning; // 한국어이거나 OpenAI가 없으면 원문 반환
  }

  try {
    const languageNames: Record<string, string> = {
      en: 'English',
      ja: 'Japanese',
      zh: 'Chinese',
      vi: 'Vietnamese',
      fr: 'French',
      sv: 'Swedish'
    };

    const targetLanguage = languageNames[language] || 'English';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translator. Translate the Korean text to ${targetLanguage} accurately. Only return the translation, no additional text.`
        },
        {
          role: "user",
          content: meaning
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    return response.choices[0].message.content?.trim() || meaning;
  } catch (error) {
    console.error('번역 실패:', error);
    return meaning; // 번역 실패 시 원문 반환
  }
};

const presentQuestion = async (): Promise<GameQuestion> => {
  if (!gameState) throw new Error('게임 상태가 없습니다.');
  
  if (gameState.questionIndex >= gameState.shuffledQuestions.length) {
    throw new Error('더 이상 문제가 없습니다.');
  }
  
  const question = gameState.shuffledQuestions[gameState.questionIndex];
  gameState.currentQuestion = question;
  
  // 정답과 오답 3개 선택
  const correctAnswer = question.slang;
  
  // 오답 생성: 전체 glossary에서 선택 (단어장 모드도 전체 glossary 사용)
  const allEntriesForWrongAnswers = gameState.glossary.length >= 4 
    ? gameState.glossary 
    : (gameState.mode === '단어장' ? gameState.favorites : gameState.glossary);
  
  const wrongAnswers = generateWrongAnswers(correctAnswer, allEntriesForWrongAnswers);
  
  // 오답이 3개 미만이면 에러
  if (wrongAnswers.length < 3) {
    throw new Error(`오답 생성 실패: 전체 레코드 수가 부족합니다. (필요: 4개 이상, 현재: ${allEntriesForWrongAnswers.length}개)`);
  }
  
  // 보기 4개 생성 및 섞기
  const allOptions: GameOption[] = [
    { label: 'A', text: correctAnswer },
    { label: 'B', text: wrongAnswers[0] },
    { label: 'C', text: wrongAnswers[1] },
    { label: 'D', text: wrongAnswers[2] }
  ];
  
  const shuffledOptions = shuffleArray(allOptions);
  currentQuestionOptions = shuffledOptions; // submitAnswer에서 사용할 수 있도록 저장
  
  // 문제 텍스트 번역
  const translatedMeaning = await translateMeaning(question.meaning, gameState.language || 'ko');
  
  return {
    questionIndex: gameState.questionIndex + 1,
    totalQuestions: gameState.totalQuestions,
    questionText: translatedMeaning,
    options: shuffledOptions,
    correctAnswer: correctAnswer,
    canHint: true
  };
};

// 현재 문제의 옵션을 저장 (submitAnswer에서 사용)
let currentQuestionOptions: GameOption[] = [];

export const submitAnswer = (
  answer: string // "A", "B", "C", "D" 또는 실제 단어 텍스트
): AnswerFeedback | { phase: string; message: string } => {
  if (!gameState || !gameState.currentQuestion) {
    return { phase: 'invalid_input', message: '게임 상태가 올바르지 않습니다.' };
  }
  
  const question = gameState.currentQuestion;
  const correctSlang = question.slang;
  
  // 사용자 입력 파싱
  let selectedOption: GameOption | null = null;
  
  // 라벨로 입력한 경우 (A, B, C, D)
  if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(answer.trim())) {
    const label = answer.trim().toUpperCase();
    selectedOption = currentQuestionOptions.find(opt => opt.label === label) || null;
  } else {
    // 텍스트로 입력한 경우
    selectedOption = currentQuestionOptions.find(opt => opt.text === answer.trim()) || null;
  }
  
  if (!selectedOption) {
    return { phase: 'invalid_input', message: '유효한 입력이 아닙니다. A/B/C/D 또는 보기 텍스트 중 하나를 입력하세요.' };
  }
  
  const isCorrect = selectedOption.text === correctSlang;
  const correctOption = currentQuestionOptions.find(opt => opt.text === correctSlang)!;
  
  if (isCorrect) {
    gameState.score++;
    // 단어장 모드에서 정답 맞춘 문제는 wrongAnswers에서 제거
    if (gameState.mode === '단어장') {
      gameState.wrongAnswers.delete(correctSlang);
    }
  } else {
    // 단어장 모드에서 틀린 문제 기록
    if (gameState.mode === '단어장') {
      gameState.wrongAnswers.add(correctSlang);
    }
  }
  
  gameState.questionIndex++;
  
  const explanation = isCorrect
    ? `정답입니다! 예: "${question.example}"`
    : `틀렸습니다. 정답은 "${correctSlang}"입니다. 예: "${question.example}"`;
  
  return {
    isCorrect,
    selected: selectedOption,
    correct: correctOption,
    explanation,
    currentScore: gameState.score,
    remaining: gameState.totalQuestions - gameState.questionIndex
  };
};

export const getNextQuestion = async (): Promise<GameQuestion | WordbookComplete | { phase: string; round?: number; message?: string; totalQuestions?: number; correctAnswers?: number; wrongAnswers?: number; percentage?: number }> => {
  if (!gameState) {
    throw new Error('게임 상태가 없습니다.');
  }
  
  // 모든 문제를 풀었는지 확인
  if (gameState.questionIndex >= gameState.totalQuestions) {
    if (gameState.mode === '단어장') {
      // 틀린 문제만 activeSet에 남기기
      const wrongSlangsArray = Array.from(gameState.wrongAnswers);
      gameState.activeSet = gameState.activeSet.filter(e => wrongSlangsArray.includes(e.slang));
      
      // 정답률 100%이면 게임 완료
      if (gameState.wrongAnswers.size === 0) {
        // 현재 라운드 기록
        gameState.history.push({
          round: gameState.currentRound,
          asked: gameState.totalQuestions,
          correct: gameState.score,
          wrongSlangs: []
        });
        
        return {
          phase: 'wordbook_complete',
          rounds: gameState.currentRound,
          totalQuestionsEver: gameState.totalQuestionsEver + gameState.totalQuestions,
          totalCorrect: gameState.history.reduce((sum, h) => sum + h.correct, 0),
          history: gameState.history
        };
      }
      
      // 틀린 문제가 있으면 다음 라운드
      if (gameState.activeSet.length > 0) {
        // 현재 라운드 기록
        const wrongSlangs = gameState.activeSet.map(e => e.slang);
        gameState.history.push({
          round: gameState.currentRound,
          asked: gameState.totalQuestions,
          correct: gameState.score,
          wrongSlangs
        });
        
        // 다음 라운드 준비
        gameState.currentRound++;
        gameState.shuffledQuestions = gameState.options?.shuffleQuestions !== false
          ? shuffleArray(gameState.activeSet, gameState.options?.seed)
          : gameState.activeSet;
        gameState.questionIndex = 0;
        gameState.totalQuestions = gameState.shuffledQuestions.length;
        gameState.totalQuestionsEver += gameState.totalQuestions;
        gameState.score = 0;
        
        return {
          phase: 'next_round',
          round: gameState.currentRound,
          message: `라운드 ${gameState.currentRound} 시작! 틀린 문제 ${gameState.activeSet.length}개를 다시 풀어보세요.`
        };
      } else {
        // 모든 문제 정답 처리 완료
        gameState.history.push({
          round: gameState.currentRound,
          asked: gameState.totalQuestions,
          correct: gameState.score,
          wrongSlangs: []
        });
        
        return {
          phase: 'wordbook_complete',
          rounds: gameState.currentRound,
          totalQuestionsEver: gameState.totalQuestionsEver,
          totalCorrect: gameState.history.reduce((sum, h) => sum + h.correct, 0),
          history: gameState.history
        };
      }
    } else {
      // 신조어 모드: 게임 완료
      return {
        phase: 'quiz_complete',
        totalQuestions: gameState.totalQuestions,
        correctAnswers: gameState.score,
        wrongAnswers: gameState.totalQuestions - gameState.score,
        percentage: Math.round((gameState.score / gameState.totalQuestions) * 100 * 10) / 10
      };
    }
  }
  
  return await presentQuestion();
};

export const stopGame = (): GameStatus & { message: string } => {
  if (!gameState) {
    throw new Error('게임 상태가 없습니다.');
  }
  
  return {
    mode: gameState.mode,
    score: gameState.score,
    remaining: gameState.totalQuestions - gameState.questionIndex,
    activeSetSize: gameState.mode === '단어장' ? gameState.activeSet.length : undefined,
    round: gameState.mode === '단어장' ? gameState.currentRound : undefined,
    totalQuestionsEver: gameState.mode === '단어장' ? gameState.totalQuestionsEver : undefined,
    message: '게임이 중단되었습니다. resume_game()으로 재개할 수 있습니다.'
  };
};

export const resumeGame = async (): Promise<GameQuestion | { error: boolean; code: string; message: string }> => {
  if (!gameState) {
    return { error: true, code: 'NO_STATE', message: '저장된 게임 상태가 없습니다.' };
  }
  
  if (gameState.mode === '단어장' && gameState.activeSet.length === 0) {
    return { error: true, code: 'NO_ACTIVE_SET', message: '활성 세트가 비어있습니다.' };
  }
  
  return await presentQuestion();
};

export const getStatus = (): GameStatus => {
  if (!gameState) {
    throw new Error('게임 상태가 없습니다.');
  }
  
  return {
    mode: gameState.mode,
    score: gameState.score,
    remaining: gameState.totalQuestions - gameState.questionIndex,
    activeSetSize: gameState.mode === '단어장' ? gameState.activeSet.length : undefined,
    round: gameState.mode === '단어장' ? gameState.currentRound : undefined,
    totalQuestionsEver: gameState.mode === '단어장' ? gameState.totalQuestionsEver : undefined
  };
};

export const resetWordbook = (): { success: boolean; message: string } => {
  if (!gameState || gameState.mode !== '단어장') {
    return { success: false, message: '단어장 모드가 아닙니다.' };
  }
  
  gameState.activeSet = [...gameState.favorites];
  gameState.currentRound = 1;
  gameState.questionIndex = 0;
  gameState.score = 0;
  gameState.totalQuestionsEver = 0;
  gameState.history = [];
  gameState.wrongAnswers.clear();
  gameState.shuffledQuestions = gameState.options?.shuffleQuestions !== false
    ? shuffleArray(gameState.favorites, gameState.options?.seed)
    : gameState.favorites;
  
  return { success: true, message: '단어장 진행상황이 초기화되었습니다.' };
};

