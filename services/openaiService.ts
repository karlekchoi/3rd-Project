
import OpenAI from "openai";
import { Book, DictionaryEntry, VocabWord } from '../types';

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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: prompt.system
        },
        { 
          role: "user", 
          content: prompt.user
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
    '초급': "초급 (TOPIK 1-2급)",
    '중급': "중급 (TOPIK 3-4급)",
    '고급': "고급 (TOPIK 5-6급)"
  };

  try {
    const levelDescription = levelMap[level] || level;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "한국어 학습 도서 추천 전문가입니다. 실제 출판된 책의 정확한 정보(제목, 저자)를 제공하세요." },
        { role: "user", content: `${levelDescription} 한국어 학습자를 위한 책 5권을 추천해주세요. JSON 형식:\n{"books": [{"title": "책 제목", "author": "저자", "description": "이 책을 추천하는 이유와 학습자에게 도움이 되는 점"}]}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const books = parsed.books || [];
    
    // 네이버 검색을 통해 실제 책 정보 가져오기
    const { searchBookByTitleAndAuthor } = await import('./naverService');
    
    const booksWithNaverInfo = await Promise.all(
      books.map(async (book: any) => {
        // 네이버에서 책 정보 검색
        const naverBook = await searchBookByTitleAndAuthor(book.title, book.author);
        
        if (naverBook) {
          // 네이버 정보와 AI 추천 설명 결합
          return {
            ...naverBook,
            description: book.description || naverBook.description, // AI 추천 설명 우선
          };
        }
        
        // 네이버에서 찾지 못한 경우 AI 추천 정보만 사용
        return {
          title: book.title,
          author: book.author,
          description: book.description,
          coverImageUrl: await getBookCoverByISBN(book.isbn) || undefined,
          isbn: book.isbn,
        };
      })
    );
    
    return booksWithNaverInfo;
  } catch (error: any) {
    console.error("도서 추천 오류:", error);
    throw new Error(`도서 추천 실패: ${error.message}`);
  }
};


/**
 * 기분, 상황, 목적 기반 책 추천
 * @param mood 사용자의 현재 기분
 * @param situation 현재 상황 설명
 * @param purpose 책을 통해 얻고 싶은 것
 * @param genre 선호 장르 (선택)
 * @param level 학습 수준 (선택)
 */
export const recommendBooksByMood = async (
  mood: string,
  situation?: string,
  purpose?: string,
  genre?: string,
  level?: string
): Promise<Book[]> => {
  try {
    let prompt = `현재 기분이 "${mood}"인 한국어 학습자를 위한 책 5권을 추천해주세요.`;
    
    if (situation) {
      prompt += `\n\n현재 상황: ${situation}`;
    }
    
    if (purpose) {
      prompt += `\n\n이 책을 통해 얻고 싶은 것: ${purpose}`;
    }
    
    if (genre) {
      prompt += `\n\n선호 장르: ${genre}`;
    }
    
    if (level) {
      const levelMap: { [key: string]: string } = {
        '초급': "초급 (TOPIK 1-2급)",
        '중급': "중급 (TOPIK 3-4급)",
        '고급': "고급 (TOPIK 5-6급)"
      };
      prompt += `\n\n학습 수준: ${levelMap[level] || level}`;
    }
    
    prompt += `\n\n기분과 상황에 맞는 책을 추천해주세요. 실제 출판된 책의 정확한 정보(제목, 저자)를 제공하세요. JSON 형식:\n{"books": [{"title": "책 제목", "author": "저자", "description": "이 책을 추천하는 이유와 현재 기분/상황에 어떻게 도움이 되는지 설명"}]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "한국어 학습 도서 추천 전문가입니다. 사용자의 기분과 상황을 깊이 이해하고, 그에 맞는 책을 추천해주세요. 실제 출판된 책의 정확한 정보(제목, 저자)를 제공하세요." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const books = parsed.books || [];
    
    // 네이버 검색을 통해 실제 책 정보 가져오기
    const { searchBookByTitleAndAuthor } = await import('./naverService');
    
    const booksWithNaverInfo = await Promise.all(
      books.map(async (book: any) => {
        const naverBook = await searchBookByTitleAndAuthor(book.title, book.author);
        
        if (naverBook) {
          return {
            ...naverBook,
            description: book.description || naverBook.description,
            id: `${book.title}-${book.author}-${Date.now()}`,
          };
        }
        
        return {
          title: book.title,
          author: book.author,
          description: book.description,
          coverImageUrl: await getBookCoverByISBN(book.isbn) || undefined,
          isbn: book.isbn,
          id: `${book.title}-${book.author}-${Date.now()}`,
        };
      })
    );
    
    return booksWithNaverInfo;
  } catch (error: any) {
    console.error("기분 기반 도서 추천 오류:", error);
    throw new Error(`도서 추천 실패: ${error.message}`);
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

