
import OpenAI from "openai";
import { Book, DictionaryEntry, VocabWord, QuizQuestion } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("VITE_OPENAI_API_KEY not set");
  throw new Error("VITE_OPENAI_API_KEY not set. Please add it to your .env file.");
}

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

// ==================== 사전 ====================
export const getSlangDefinition = async (word: string): Promise<DictionaryEntry> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "당신은 한국어 사전 전문가입니다. traditionalMeaning에는 표준 사전적 의미를, slangMeaning에는 최신 인터넷 밈/신조어 의미를 제공하세요. 각 필드는 20자 이상 상세하게 작성하세요." 
        },
        { 
          role: "user", 
          content: `단어 "${word}"의 정의를 JSON 형식으로:\n{\n  "word": "${word}",\n  "traditionalMeaning": "사전적 의미 (품사 포함)",\n  "slangMeaning": "인터넷 밈/신조어 의미 (없으면 '신조어가 아닌 일반 단어입니다')",\n  "exampleSentence": "자연스러운 예문"\n}\n\n예시) 고구마: traditionalMeaning="[명사] 메꽃과의 식물...", slangMeaning="답답한 상황을 표현하는 밈. 반대말은 사이다"` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return parsed as DictionaryEntry;
  } catch (error: any) {
    console.error("사전 API 오류:", error);
    throw new Error(`사전 검색 실패: ${error.message}`);
  }
};

// ==================== 도서 추천 ====================
const getBookCoverByISBN = async (isbn: string): Promise<string | undefined> => {
  if (!isbn) return undefined;
  
  try {
    // Google Books API
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();
    if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
      return data.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
    }
    
    // Open Library fallback
    const olResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
    if (olResponse.ok) return olResponse.url;
  } catch (error) {
    console.warn("책 표지 가져오기 실패:", isbn);
  }
  
  return undefined;
};

export const recommendBooksByLevel = async (level: string): Promise<Book[]> => {
  const levelMap: { [key: string]: string } = {
    beginner: "초급 (TOPIK 1-2급)",
    intermediate: "중급 (TOPIK 3-4급)",
    advanced: "고급 (TOPIK 5-6급)"
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "한국어 학습 도서 추천 전문가입니다. 실제 출판된 책의 정확한 정보(제목, 저자, ISBN)를 제공하세요." },
        { role: "user", content: `${levelMap[level]} 한국어 학습자를 위한 책 5권을 추천해주세요. JSON 형식:\n{"books": [{"title": "책 제목", "author": "저자", "description": "설명", "isbn": "ISBN-13"}]}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const books = parsed.books || [];
    
    const booksWithCovers = await Promise.all(
      books.map(async (book: any) => ({
        ...book,
        coverImageUrl: await getBookCoverByISBN(book.isbn) || 'https://via.placeholder.com/200x300?text=No+Cover'
      }))
    );
    
    return booksWithCovers;
  } catch (error: any) {
    console.error("도서 추천 오류:", error);
    throw new Error(`도서 추천 실패: ${error.message}`);
  }
};

export const recommendBooksByPreference = async (genres: string[]): Promise<Book[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "한국어 학습 도서 추천 전문가입니다. 실제 출판된 책의 정확한 정보를 제공하세요." },
        { role: "user", content: `${genres.join(', ')} 장르에 관심있는 한국어 학습자를 위한 책 5권을 추천해주세요. JSON 형식:\n{"books": [{"title": "제목", "author": "저자", "description": "설명", "isbn": "ISBN-13"}]}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const books = parsed.books || [];
    
    const booksWithCovers = await Promise.all(
      books.map(async (book: any) => ({
        ...book,
        coverImageUrl: await getBookCoverByISBN(book.isbn) || 'https://via.placeholder.com/200x300?text=No+Cover'
      }))
    );
    
    return booksWithCovers;
  } catch (error: any) {
    console.error("도서 추천 오류:", error);
    throw new Error(`도서 추천 실패: ${error.message}`);
  }
};

// ==================== 미니게임 ====================
export const generateMinigameQuestions = async (count: number = 5): Promise<QuizQuestion[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "2024-2025년 한국 인터넷에서 실제 유행하는 신조어 전문가입니다. 객관식(mcq)과 문장 빈칸(sentence_blank)만 생성하세요. 주관식(fill)은 생성하지 마세요." 
        },
        { 
          role: "user", 
          content: `최신 유행 신조어로 퀴즈 ${count}개를 만드세요.\n\n포함할 단어: ㄹㅇ, ㅇㅈ, ㄱㅇㄷ, 갓생, 존버, 킹받다, 오운완, 취존 등\n\nJSON 형식:\n{\n  "questions": [\n    {"type": "mcq", "definition": "의미 설명 (20자 이상)", "options": ["선택1", "선택2", "선택3", "선택4"], "correctAnswer": "정답"},\n    {"type": "sentence_blank", "sentence": "문장 (___)", "options": ["선택1", "선택2", "선택3", "선택4"], "correctAnswer": "정답"}\n  ]\n}\n\n객관식과 문장 빈칸을 50:50으로 섞어주세요.` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });
    
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const questions = (parsed.questions || []).filter((q: any) => q.type !== 'fill');
    
    console.log(`✅ 미니게임 퀴즈 생성: ${questions.length}개`);
    return questions;
  } catch (error: any) {
    console.error("미니게임 퀴즈 생성 오류:", error);
    throw new Error(`퀴즈 생성 실패: ${error.message}`);
  }
};

export const generateQuizFromVocabulary = async (
  words: VocabWord[], 
  count: number = 5, 
  quizTypes: ('mcq' | 'fill' | 'sentence')[] = ['mcq', 'fill', 'sentence']
): Promise<QuizQuestion[]> => {
  if (words.length === 0) {
    throw new Error("단어장이 비어있습니다.");
  }

  const selectedWords = words.length > count 
    ? words.sort(() => 0.5 - Math.random()).slice(0, count)
    : words;

  const wordsInfo = selectedWords.map(w => `${w.word}: ${w.slangMeaning || w.traditionalMeaning}`).join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "한국어 학습 퀴즈 생성 전문가입니다. 주어진 단어로 다양한 유형의 퀴즈를 만드세요." },
        { 
          role: "user", 
          content: `다음 단어들로 퀴즈 ${count}개를 만드세요:\n\n${wordsInfo}\n\nJSON 형식:\n{\n  "questions": [\n    {"type": "mcq", "definition": "의미", "options": [...], "correctAnswer": "정답"},\n    {"type": "fill", "definition": "의미", "correctAnswer": "정답"},\n    {"type": "sentence_blank", "sentence": "문장", "options": [...], "correctAnswer": "정답"}\n  ]\n}\n\n3가지 유형을 골고루 섞어주세요.` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });
    
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const questions = parsed.questions || [];
    
    console.log(`✅ 단어장 퀴즈 생성: ${questions.length}개`);
    return questions;
  } catch (error: any) {
    console.error("단어장 퀴즈 생성 오류:", error);
    throw new Error(`퀴즈 생성 실패: ${error.message}`);
  }
};

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
    console.warn("TrOCR 백엔드 오류, OpenAI로 대체:", error);
    return recognizeHandwritingWithOpenAI(base64ImageData);
  }
};

export const recognizeHandwritingWithOpenAI = async (base64ImageData: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "이 이미지의 손글씨 한글을 정확히 읽어주세요. 한글만 추출하세요." },
            { type: "image_url", image_url: { url: `data:image/png;base64,${base64ImageData}`, detail: "high" } }
          ]
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error: any) {
    console.error("OpenAI 손글씨 인식 오류:", error);
    throw new Error("손글씨 인식 실패");
  }
};

export const recognizeHandwriting = recognizeHandwritingWithTrOCR;

// ==================== 음성 ====================
export const generatePronunciationAudio = async (text: string): Promise<string> => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy",
      input: text,
      speed: 0.9
    });

    const buffer = await mp3.arrayBuffer();
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("TTS 생성 오류:", error);
    throw new Error("음성 생성 실패");
  }
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

export const transcribeAudioWithOpenAI = async (audioBlob: Blob, context?: string): Promise<string> => {
  try {
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "ko",
      prompt: context || "한국어 발음"
    });

    return response.text || "";
  } catch (error: any) {
    console.error("OpenAI Whisper 오류:", error);
    throw new Error("음성 인식 실패");
  }
};

export const transcribeAudio = async (audioBlob: Blob, context?: string): Promise<string> => {
  try {
    return await transcribeAudioWithLocalWhisper(audioBlob);
  } catch (error) {
    return await transcribeAudioWithOpenAI(audioBlob, context);
  }
};

















