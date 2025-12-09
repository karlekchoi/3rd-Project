
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Book, DictionaryEntry, VocabWord } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY not set");
  throw new Error("VITE_GEMINI_API_KEY not set. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// JSON 추출 헬퍼 함수
const extractJSON = (text: string): any => {
  try {
    // ```json ``` 마크다운 제거
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // 직접 JSON 파싱 시도
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON 파싱 실패:", text);
    throw new Error("AI 응답을 파싱할 수 없습니다.");
  }
};

// ==================== 사전 ====================

export const getSlangDefinition = async (word: string, language: string = 'ko'): Promise<DictionaryEntry> => {
  // 언어별 프롬프트 설정
  const prompts: Record<string, { system: string; user: string }> = {
    ko: {
      system: "당신은 한국어 사전 전문가입니다. traditionalMeaning에는 표준 사전적 의미를, slangMeaning에는 최신 인터넷 밈/신조어 의미를 제공하세요. 각 필드는 20자 이상 상세하게 작성하세요.",
      user: `단어 "${word}"의 정의를 JSON 형식으로:\n{\n  "word": "${word}",\n  "traditionalMeaning": "사전적 의미 (품사 포함)",\n  "slangMeaning": "인터넷 밈/신조어 의미 (없으면 '신조어가 아닌 일반 단어입니다')",\n  "exampleSentence": "자연스러운 예문"\n}\n\n예시) 고구마: traditionalMeaning="[명사] 메꽃과의 식물...", slangMeaning="답답한 상황을 표현하는 밈. 반대말은 사이다"`
    },
    en: {
      system: "You are a Korean dictionary expert. Provide the standard dictionary meaning in traditionalMeaning and the latest internet meme/slang meaning in slangMeaning. Each field should be at least 20 characters and detailed.",
      user: `Provide the definition of the word "${word}" in JSON format:\n{\n  "word": "${word}",\n  "traditionalMeaning": "Dictionary meaning (including part of speech)",\n  "slangMeaning": "Internet meme/slang meaning (or 'This is not a neologism, but a common word' if none)",\n  "exampleSentence": "Natural example sentence"\n}\n\nExample) 고구마: traditionalMeaning="[Noun] A plant of the morning glory family...", slangMeaning="A meme expressing a frustrating situation. The opposite is 사이다"`
    },
    ja: {
      system: "あなたは韓国語辞書の専門家です。traditionalMeaningには標準的な辞書的意味を、slangMeaningには最新のインターネットミーム/新語の意味を提供してください。各フィールドは20文字以上で詳細に記述してください。",
      user: `単語"${word}"の定義をJSON形式で:\n{\n  "word": "${word}",\n  "traditionalMeaning": "辞書的意味（品詞を含む）",\n  "slangMeaning": "インターネットミーム/新語の意味（ない場合は'新語ではない一般単語です'）",\n  "exampleSentence": "自然な例文"\n}`
    },
    zh: {
      system: "您是韩语词典专家。在traditionalMeaning中提供标准词典含义，在slangMeaning中提供最新网络流行语/新词含义。每个字段至少20个字符，详细描述。",
      user: `以JSON格式提供单词"${word}"的定义:\n{\n  "word": "${word}",\n  "traditionalMeaning": "词典含义（包括词性）",\n  "slangMeaning": "网络流行语/新词含义（如果没有则为'这不是新词，而是常用词'）",\n  "exampleSentence": "自然的例句"\n}`
    },
    vi: {
      system: "Bạn là chuyên gia từ điển tiếng Hàn. Cung cấp nghĩa từ điển tiếng chuẩn trong traditionalMeaning và nghĩa meme/slang internet mới nhất trong slangMeaning. Mỗi trường phải có ít nhất 20 ký tự và chi tiết.",
      user: `Cung cấp định nghĩa của từ "${word}" ở định dạng JSON:\n{\n  "word": "${word}",\n  "traditionalMeaning": "Nghĩa từ điển (bao gồm loại từ)",\n  "slangMeaning": "Nghĩa meme/slang internet (hoặc 'Đây không phải từ mới mà là từ thông thường' nếu không có)",\n  "exampleSentence": "Câu ví dụ tự nhiên"\n}`
    },
    fr: {
      system: "Vous êtes un expert en dictionnaire coréen. Fournissez la signification standard du dictionnaire dans traditionalMeaning et la signification meme/slang internet la plus récente dans slangMeaning. Chaque champ doit contenir au moins 20 caractères et être détaillé.",
      user: `Fournissez la définition du mot "${word}" au format JSON:\n{\n  "word": "${word}",\n  "traditionalMeaning": "Signification du dictionnaire (y compris la partie du discours)",\n  "slangMeaning": "Signification meme/slang internet (ou 'Ce n'est pas un néologisme mais un mot commun' s'il n'y en a pas)",\n  "exampleSentence": "Phrase d'exemple naturelle"\n}`
    },
    sv: {
      system: "Du är en expert på koreanska ordböcker. Ge standardordboksbetydelsen i traditionalMeaning och den senaste internetmeme/slang-betydelsen i slangMeaning. Varje fält ska vara minst 20 tecken och detaljerat.",
      user: `Ge definitionen av ordet "${word}" i JSON-format:\n{\n  "word": "${word}",\n  "traditionalMeaning": "Ordboksbetydelse (inklusive ordklass)",\n  "slangMeaning": "Internetmeme/slang-betydelse (eller 'Detta är inte ett nyord utan ett vanligt ord' om inget finns)",\n  "exampleSentence": "Naturlig exempelmening"\n}`
    }
  };

  const prompt = prompts[language] || prompts['en'];
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
      }
    });

    const fullPrompt = `${prompt.system}\n\n${prompt.user}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJSON(text);
    return parsed as DictionaryEntry;
  } catch (error: any) {
    console.error("사전 API 오류:", error);
    throw new Error(`사전 검색 실패: ${error.message}`);
  }
};

// ==================== 도서 추천 (Gemini 직접 사용) ====================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * Gemini AI로 직접 책 추천 (빠른 버전)
 */
export const recommendBooksByLevelWithGemini = async (level: string): Promise<Book[]> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
      }
    });

    const prompt = `한국어 학습자를 위한 ${level} 수준의 책 5권을 추천해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
[
  {
    "title": "책 제목",
    "author": "저자명",
    "description": "왜 이 책을 추천하는지 2-3문장으로 설명"
  }
]

중요:
- 한국어로 된 책만 추천
- ${level} 수준에 맞는 난이도
- 실제로 존재하는 인기 도서만
- 반드시 JSON 배열로만 응답`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJSON(text);
    return parsed.map((book: any) => ({
      ...book,
      coverImageUrl: undefined,
      isbn: undefined,
    }));
  } catch (error: any) {
    console.error("Gemini 도서 추천 오류:", error);
    throw new Error(`도서 추천 실패: ${error.message}`);
  }
};

/**
 * 레벨별 책 추천 (백엔드 우선, 실패 시 Gemini)
 */
export const recommendBooksByLevel = async (level: string): Promise<Book[]> => {
  try {
    // 백엔드 시도 (20초 타임아웃)
    console.log("📚 백엔드로 책 추천 요청 중...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(`${BACKEND_URL}/recommend/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'level',
        level: level
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const books = await response.json();
    console.log("✅ 백엔드 응답 성공 (알라딘 API 포함)");
    return books;
  } catch (error: any) {
    console.warn("⚠️ 백엔드 실패, Gemini로 전환:", error.message);
    // 백엔드 실패 시 Gemini 사용
    return recommendBooksByLevelWithGemini(level);
  }
};

/**
 * Gemini AI로 직접 기분별 책 추천 (빠른 버전)
 */
export const recommendBooksByMoodWithGemini = async (
  mood: string,
  situation?: string,
  purpose?: string,
  genre?: string,
  level?: string
): Promise<Book[]> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
      }
    });

    const prompt = `한국어 학습자를 위한 책 추천:
- 기분: ${mood}
${situation ? `- 상황: ${situation}` : ''}
${purpose ? `- 목적: ${purpose}` : ''}
${genre ? `- 선호 장르: ${genre}` : ''}
${level ? `- 한국어 수준: ${level}` : ''}

위 조건에 맞는 한국어 책 5권을 추천해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
[
  {
    "title": "책 제목",
    "author": "저자명",
    "description": "왜 이 책이 현재 기분/상황에 맞는지 2-3문장으로 설명"
  }
]

중요:
- 한국어로 된 책만 추천
- 실제로 존재하는 인기 도서만
- 현재 기분과 상황에 공감하는 추천 이유 작성
- 반드시 JSON 배열로만 응답`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJSON(text);
    return parsed.map((book: any) => ({
      ...book,
      coverImageUrl: undefined,
      isbn: undefined,
    }));
  } catch (error: any) {
    console.error("Gemini 기분별 도서 추천 오류:", error);
    throw new Error(`도서 추천 실패: ${error.message}`);
  }
};

/**
 * 기분, 상황, 목적 기반 책 추천 (백엔드 우선, 실패 시 Gemini)
 */
export const recommendBooksByMood = async (
  mood: string,
  situation?: string,
  purpose?: string,
  genre?: string,
  level?: string
): Promise<Book[]> => {
  try {
    // 백엔드 시도 (20초 타임아웃)
    console.log("📚 백엔드로 기분별 책 추천 요청 중...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(`${BACKEND_URL}/recommend/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'mood',
        mood: mood,
        situation: situation || '',
        purpose: purpose || '',
        genre: genre || '',
        moodLevel: level || ''
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const books = await response.json();
    console.log("✅ 백엔드 응답 성공 (알라딘 API 포함)");
    return books;
  } catch (error: any) {
    console.warn("⚠️ 백엔드 기분별 추천 실패, Gemini로 전환:", error.message);
    // 백엔드 실패 시 Gemini 사용
    return recommendBooksByMoodWithGemini(mood, situation, purpose, genre, level);
  }
};


// ==================== 미니게임 관련 코드 제거됨 ====================

export const calculateSimilarity = async (text1: string, text2: string): Promise<{ similarity: number; is_similar: boolean }> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    const response = await fetch(`${BACKEND_URL}/similarity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text1, text2 })
    });

    if (!response.ok) {
      throw new Error("유사도 계산 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("유사도 계산 오류, Levenshtein 사용:", error);
    
    // 간단한 Levenshtein 거리 기반 유사도
    const levenshtein = (a: string, b: string): number => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = [];
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    };
    
    const distance = levenshtein(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    return {
      similarity: Math.round(similarity),
      is_similar: similarity >= 70
    };
  }
};

// ==================== 손글씨 인식 ====================
import { recognizeHandwritingWithMCP } from './mcpService';

export const recognizeHandwritingWithTrOCR = async (base64ImageData: string): Promise<string> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    const response = await fetch(`${BACKEND_URL}/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: `data:image/png;base64,${base64ImageData}` })
    });

    if (!response.ok) throw new Error('TrOCR 인식 실패');

    const data = await response.json();
    return data.text || "";
  } catch (error: any) {
    // 연결 오류인 경우 더 명확한 메시지 제공
    if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.warn("⚠️ TrOCR 백엔드 서버가 실행되지 않았습니다. Gemini로 대체합니다.");
      console.info("💡 백엔드 서버 실행: backend 폴더에서 'python app.py' 실행");
    } else {
      console.warn("TrOCR 백엔드 오류, Gemini로 대체:", error);
    }
    return recognizeHandwritingWithGemini(base64ImageData);
  }
};

export const recognizeHandwritingWithGemini = async (base64ImageData: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    });

    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: "image/png"
      }
    };

    const result = await model.generateContent([
      "이 이미지의 손글씨 한글을 정확히 읽어주세요. 한글만 추출하세요.",
      imagePart
    ]);
    
    const response = await result.response;
    return response.text().trim() || "";
  } catch (error: any) {
    console.error("Gemini 손글씨 인식 오류:", error);
    throw new Error("손글씨 인식 실패");
  }
};

/**
 * 손글씨 인식 메인 함수
 * 
 * 속도 최적화: Gemini > TrOCR 백엔드
 * Gemini가 훨씬 빠르고 정확해요! (2-5초 vs 15-45초)
 */
export const recognizeHandwriting = async (base64ImageData: string): Promise<string> => {
  // 배포 환경에서는 빠른 Gemini를 우선 사용
  const isProduction = import.meta.env.PROD;
  const useMCP = import.meta.env.VITE_USE_MCP === 'true' && !isProduction;
  
  // 개발 환경에서만 MCP 사용 시도
  if (useMCP) {
    try {
      console.log('MCP를 사용하여 손글씨 인식 시도...');
      return await recognizeHandwritingWithMCP(base64ImageData);
    } catch (mcpError: any) {
      console.warn("MCP 손글씨 인식 실패, Gemini로 대체:", mcpError);
      // MCP 실패 시 Gemini로 fallback
    }
  }
  
  // 배포 환경: Gemini 우선 (빠름!) → TrOCR 백업
  try {
    console.log('⚡ Gemini로 빠른 손글씨 인식 시도...');
    return await recognizeHandwritingWithGemini(base64ImageData);
  } catch (geminiError: any) {
    console.warn("Gemini 실패, TrOCR 백엔드로 대체:", geminiError);
    
    // Gemini 실패 시에만 TrOCR 사용
    try {
      console.log('TrOCR 백엔드를 사용하여 손글씨 인식 시도...');
      return await recognizeHandwritingWithTrOCR(base64ImageData);
    } catch (trocrError: any) {
      console.error("모든 손글씨 인식 방법 실패:", trocrError);
      throw new Error("손글씨 인식에 실패했습니다.");
    }
  }
};

// ==================== 음성 ====================
// Gemini는 TTS를 지원하지 않으므로 Web Speech API 사용
// Web Speech API는 직접 오디오 URL을 생성할 수 없으므로, 
// 재생용 함수로 변경하거나 Google TTS API를 사용할 수 있습니다.
// 여기서는 간단하게 Web Speech API를 사용하되, URL 대신 재생 함수를 제공합니다.
export const generatePronunciationAudio = async (text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Web Speech API는 직접 오디오 파일을 생성하지 않으므로,
      // 대신 data URL을 반환하거나 재생 함수를 제공합니다.
      // 여기서는 호환성을 위해 빈 오디오 URL을 반환하고,
      // 실제 재생은 Web Speech API를 직접 사용하도록 합니다.
      
      // 실제 사용 시에는 KoreanStudyView에서 직접 speechSynthesis를 사용하는 것을 권장합니다.
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // 호환성을 위해 빈 오디오 URL 반환 (실제 재생은 speechSynthesis 사용)
      const emptyAudio = new Blob([], { type: 'audio/wav' });
      const url = URL.createObjectURL(emptyAudio);
      
      // 실제 재생은 KoreanStudyView에서 처리
      window.speechSynthesis.speak(utterance);
      
      resolve(url);
    } catch (error: any) {
      console.error("TTS 생성 오류:", error);
      reject(new Error("음성 생성 실패: Web Speech API를 지원하지 않는 브라우저입니다."));
    }
  });
};

export const transcribeAudioWithLocalWhisper = async (audioBlob: Blob): Promise<string> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    const response = await fetch(`${BACKEND_URL}/transcribe`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Whisper 백엔드 오류');

    const data = await response.json();
    return data.text || "";
  } catch (error: any) {
    console.warn("로컬 Whisper 오류, OpenAI로 대체:", error);
    throw error;
  }
};

// Gemini는 STT를 지원하지 않으므로 Web Speech API 사용
export const transcribeAudioWithWebSpeech = async (audioBlob: Blob, context?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      audio.src = url;

      const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        URL.revokeObjectURL(url);
        resolve(transcript);
      };

      recognition.onerror = (error: any) => {
        URL.revokeObjectURL(url);
        reject(new Error(`음성 인식 실패: ${error.error}`));
      };

      recognition.onend = () => {
        URL.revokeObjectURL(url);
      };

      // Web Speech API는 마이크 입력만 지원하므로, 오디오 파일 재생 후 마이크로 녹음하는 방식은 불가능
      // 대신 로컬 Whisper 백엔드 사용
      reject(new Error("Web Speech API는 실시간 마이크 입력만 지원합니다. 로컬 Whisper 백엔드를 사용하세요."));
    } catch (error: any) {
      reject(new Error(`음성 인식 실패: ${error.message}`));
    }
  });
};

export const transcribeAudio = async (audioBlob: Blob, context?: string): Promise<string> => {
  try {
    return await transcribeAudioWithLocalWhisper(audioBlob);
  } catch (error) {
    // 로컬 Whisper 실패 시 에러 throw (Gemini는 STT 미지원)
    throw new Error("음성 인식 실패: 로컬 Whisper 백엔드가 필요합니다.");
  }
};

