
import OpenAI from "openai";
import { Book, DictionaryEntry, McqQuestion, VocabWord, QuizQuestion } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("VITE_OPENAI_API_KEY environment variable not set");
  throw new Error("VITE_OPENAI_API_KEY environment variable not set. Please set it in your .env file.");
}

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true // 프로덕션에서는 백엔드를 통해 호출해야 합니다
});

export const getSlangDefinition = async (word: string): Promise<DictionaryEntry> => {
  try {
    const prompt = `당신은 네이버 국어사전과 표준국어대사전의 데이터베이스를 갖춘 전문 사전입니다.

**검색 단어**: "${word}"

**작성 지침**:

1. **traditionalMeaning (전통적/사전적 의미)**:
   ✅ 해야 할 것:
   - 표준국어대사전 또는 네이버 국어사전에 등재된 정의를 참고
   - "명사", "동사", "형용사" 등 품사 표시
   - 정확하고 객관적인 설명 (예: "~하는 것", "~을 의미함", "~을 가리키는 말")
   - 단어가 존재하지 않으면 "표준국어대사전에 등재되지 않은 단어"라고 명시
   
   ❌ 하지 말아야 할 것:
   - 추측이나 임의로 만든 정의
   - 부정확하거나 모호한 설명
   - 신조어 의미를 전통적 의미로 기술

2. **slangMeaning (신조어/인터넷 용어 의미)**:
   ✅ 해야 할 것:
   - 2020년 이후 실제로 온라인에서 사용되는 의미
   - 트위터, 인스타그램, 디시인사이드, 에브리타임 등에서의 용례
   - 어떤 맥락에서 사용되는지 구체적 설명
   - 신조어가 아니면 "신조어가 아닌 일반 단어입니다" 또는 traditionalMeaning과 동일하게
   
   ❌ 하지 말아야 할 것:
   - 없는 유행어를 만들어내기
   - 구시대 유행어 (2010년대 이전)

3. **exampleSentence (예문)**:
   - 실제 20대가 카톡이나 SNS에서 사용할 법한 자연스러운 문장
   - slangMeaning이 있으면 그 의미로, 없으면 traditionalMeaning으로 예문 작성

**예시 1 - 일반 단어**:
단어: "사과"
{
  "word": "사과",
  "traditionalMeaning": "[명사] 1. 장미과의 낙엽 활엽 교목. 2. 이 나무의 열매.",
  "slangMeaning": "신조어가 아닌 일반 단어입니다. 사전적 의미로 사용됩니다.",
  "exampleSentence": "오늘 마트에서 사과 한 박스 샀어."
}

**예시 2 - 신조어**:
단어: "ㄹㅇ"
{
  "word": "ㄹㅇ",
  "traditionalMeaning": "표준국어대사전에 등재되지 않은 단어입니다.",
  "slangMeaning": "'리얼(real)'의 초성. 진짜, 정말이라는 의미로 사용되며 무언가를 강조하거나 동의할 때 사용하는 인터넷 용어.",
  "exampleSentence": "ㄹㅇ 이 카페 커피 진짜 맛있다"
}

**예시 3 - 이중 의미 (일반 단어 + 밈)** ⭐ 중요:
단어: "고구마"
{
  "word": "고구마",
  "traditionalMeaning": "[명사] 메꽃과의 한해살이 덩굴식물. 또는 그 뿌리. 주로 식용으로 쓰인다.",
  "slangMeaning": "답답한 상황이나 속이 터질 것 같은 느낌을 표현하는 인터넷 밈. 고구마를 먹으면 목이 메는 느낌에서 유래했으며, 주로 드라마나 영화의 답답한 전개, 또는 일상에서 속터지는 상황을 묘사할 때 사용. 반대말은 '사이다' (시원하고 통쾌한 것).",
  "exampleSentence": "아 진짜 이 전개 너무 고구마야, 사이다 좀 주세요"
}

**예시 4 - 이중 의미 (일반 단어 + 밈)**:
단어: "사이다"
{
  "word": "사이다",
  "traditionalMeaning": "[명사] 탄산음료의 하나. 청량감이 있어 시원하다.",
  "slangMeaning": "시원하고 통쾌한 상황이나 전개를 표현하는 인터넷 밈. 막힌 속을 뚫어주는 사이다의 청량감에서 유래. 답답한 상황이 해결되거나 통쾌한 반전이 있을 때 사용. 반대말은 '고구마' (답답한 것).",
  "exampleSentence": "주인공이 드디어 복수 성공했다 완전 사이다!"
}

이제 "${word}"를 검색하여 위 형식으로 답변하세요.

JSON 형식:
{
  "word": "${word}",
  "traditionalMeaning": "정확한 사전적 의미",
  "slangMeaning": "신조어/인터넷 용어 의미 (없으면 명시)",
  "exampleSentence": "자연스러운 예문"
}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "당신은 네이버 국어사전과 표준국어대사전의 정확한 데이터를 갖춘 전문 사전입니다.\n\n**필수 규칙**:\n1. traditionalMeaning: 실제 사전의 정의와 일치해야 함 (품사 포함)\n2. slangMeaning: 2020년 이후 실제 사용되는 인터넷 밈/신조어 의미. 없으면 명확히 \"신조어가 아닌 일반 단어입니다\" 표시\n3. 각 필드는 최소 15자 이상 상세하게 작성\n4. 절대 추측하지 말고 정확한 정보만 제공\n5. 항상 JSON 형식으로만 답변\n\n특히 '고구마', '사이다' 같은 단어는 일반 의미 + 인터넷 밈 의미를 모두 제공하세요." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // 정확하면서도 상세한 답변
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("응답이 비어있습니다.");
    
    console.log(`📖 사전 검색 결과 (${word}):`, content);
    
    const parsed = JSON.parse(content);
    
    // 검증: 각 필드가 제대로 있는지 확인
    if (!parsed.traditionalMeaning || parsed.traditionalMeaning.length < 10) {
      console.warn(`⚠️ traditionalMeaning이 너무 짧음:`, parsed);
    }
    if (!parsed.slangMeaning || parsed.slangMeaning.length < 10) {
      console.warn(`⚠️ slangMeaning이 너무 짧음:`, parsed);
    }
    
    return parsed as DictionaryEntry;
  } catch (error: any) {
    console.error("OpenAI API 오류:", error);
    if (error.status === 401) {
      throw new Error("API 키가 유효하지 않습니다. .env 파일의 VITE_OPENAI_API_KEY를 확인해주세요.");
    } else if (error.status === 429) {
      throw new Error("API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    } else if (error.message?.includes("fetch")) {
      throw new Error("네트워크 연결을 확인해주세요.");
    }
    throw new Error(`API 호출 실패: ${error.message || "알 수 없는 오류"}`);
  }
};

// ISBN으로 책 표지 이미지 가져오기
const getBookCoverByISBN = async (isbn: string): Promise<string | undefined> => {
  if (!isbn) return undefined;
  
  try {
    // Google Books API 사용
    const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`);
    const data = await response.json();
    
    if (data.items && data.items[0]?.volumeInfo?.imageLinks) {
      const imageLinks = data.items[0].volumeInfo.imageLinks;
      return imageLinks.thumbnail || imageLinks.smallThumbnail;
    }
  } catch (error) {
    console.warn("Google Books API 호출 실패:", error);
  }
  
  // 실패 시 Open Library 시도
  try {
    const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`;
  } catch (error) {
    console.warn("Open Library 커버 가져오기 실패:", error);
  }
  
  return undefined;
};

export const recommendBooksByLevel = async (level: string): Promise<Book[]> => {
  const prompt = `당신은 한국어 학습자를 위한 도서 추천 전문가입니다. 

한국어 학습 수준 '${level}'에 맞는 **실제로 존재하는** 한국어 교재 또는 학습 도서 3권을 추천해주세요.

**수준별 가이드:**
- 기초: 한글 읽기부터 시작하는 완전 초보자용
- 중급: 기본 회화가 가능하고 문법을 확장하는 단계
- 고급: 고급 문법, 비즈니스 한국어, 한국 문학 등

각 책에 대해 다음 정보를 포함한 JSON 형식으로 응답해주세요:

{
  "books": [
    {
      "title": "정확한 책 제목",
      "author": "저자명",
      "description": "이 책의 특징과 학습 내용을 2-3문장으로 설명",
      "isbn": "13자리 ISBN-13 번호 (하이픈 포함)"
    }
  ]
}

**중요:**
- 실제로 출판된 유명한 한국어 교재를 추천해주세요
- 정확한 ISBN-13 번호를 포함해주세요 (예: 978-89-277-3165-4)
- 교보문고, 알라딘, 예스24 등에서 판매되는 책이어야 합니다
- 예시: "서울대 한국어", "연세 한국어", "이화 한국어", "Korean Grammar in Use" 등
- 다른 텍스트는 포함하지 말고 JSON만 반환하세요`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: "당신은 한국어 교육 전문가입니다. 실제로 존재하는 인기있는 한국어 학습 교재만 추천하세요. 정확한 ISBN 번호를 포함하세요. JSON 형식으로만 답변하세요." 
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("응답이 비어있습니다.");
  
  const parsed = JSON.parse(content);
  const books = Array.isArray(parsed) ? parsed : (parsed.books || []);
  
  // ISBN으로 실제 책 표지 가져오기
  const booksWithCovers = await Promise.all(
    books.map(async (book: any) => {
      let coverUrl = undefined;
      
      if (book.isbn) {
        coverUrl = await getBookCoverByISBN(book.isbn);
      }
      
      // 표지를 찾지 못한 경우 더 나은 placeholder 사용
      if (!coverUrl) {
        const encodedTitle = encodeURIComponent(book.title || 'Korean Book');
        coverUrl = `https://via.placeholder.com/200x280/5D7052/FFFFFF?text=${encodedTitle}`;
      }
      
      return {
        ...book,
        coverImageUrl: coverUrl
      };
    })
  );
  
  return booksWithCovers as Book[];
};

export const recommendBooksByPreference = async (genres: string[]): Promise<Book[]> => {
  const prompt = `당신은 한국 도서 추천 전문가입니다. 

다음 장르에서 **실제로 존재하는** 베스트셀러 또는 유명한 한국 도서 3권을 추천해주세요: ${genres.join(', ')}

각 책에 대해 다음 정보를 포함한 JSON 형식으로 응답해주세요:

{
  "books": [
    {
      "title": "정확한 책 제목",
      "author": "저자명",
      "description": "이 책의 주요 내용과 특징을 2-3문장으로 설명",
      "isbn": "13자리 ISBN-13 번호 (하이픈 포함)",
      "isTranslation": false,
      "originalInfo": {
        "title": "원서 제목 (번역서인 경우)",
        "author": "원저자명 (번역서인 경우)"
      }
    }
  ]
}

**중요:**
- 교보문고, 알라딘, 예스24 등에서 실제로 판매되는 유명한 책을 추천해주세요
- 최근 베스트셀러나 스테디셀러 위주로 추천해주세요 (2020년 이후 출판 우선)
- 정확한 ISBN-13 번호를 포함해주세요
- 번역서인 경우에만 isTranslation을 true로, originalInfo를 포함하세요
- JSON 형식으로만 답변하세요`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: "당신은 한국 도서 시장 전문가입니다. 실제로 존재하는 인기있는 책만 추천하세요. 정확한 ISBN 번호를 포함하세요. JSON 형식으로만 답변하세요." 
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("응답이 비어있습니다.");
  
  const parsed = JSON.parse(content);
  const books = Array.isArray(parsed) ? parsed : (parsed.books || []);
  
  // ISBN으로 실제 책 표지 가져오기
  const booksWithCovers = await Promise.all(
    books.map(async (book: any) => {
      let coverUrl = undefined;
      
      if (book.isbn) {
        coverUrl = await getBookCoverByISBN(book.isbn);
      }
      
      // 표지를 찾지 못한 경우 더 나은 placeholder 사용
      if (!coverUrl) {
        const encodedTitle = encodeURIComponent(book.title || 'Book');
        coverUrl = `https://via.placeholder.com/200x280/D72638/FFFFFF?text=${encodedTitle}`;
      }
      
      return {
        ...book,
        coverImageUrl: coverUrl
      };
    })
  );
  
  return booksWithCovers as Book[];
};

export const generateMinigameQuestions = async (
  count: number, 
  quizTypes: ('mcq' | 'sentence')[] = ['mcq', 'sentence']
): Promise<QuizQuestion[]> => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'long' });
  
  const prompt = `당신은 한국의 최신 인터넷 트렌드와 신조어를 잘 아는 전문가입니다.

**현재 시점**: ${currentMonth}

**미션**: 2023년 ~ ${currentYear}년에 **실제로 한국 인터넷에서 유행한** 신조어, 밈, 초성어로 다양한 유형의 퀴즈 ${count}개를 만드세요.

**✅ 반드시 포함해야 할 카테고리별 단어 (실제 사용 중인 것만)**:

1. **초성/줄임말**:
   - ㄱㅇㄷ (개이득), ㅇㅈ (인정), ㄹㅇ (리얼), ㅈㅂ (좀 봐), ㅇㄴ (어떤)
   - ㅈㄴ (진짜), ㄱㅅ (감사), ㄷㄷ (덜덜), ㅂㅂ (바이바이), ㅊㅋ (축하)

2. **감정/반응 표현**:
   - 찐텐 (진짜 tension, 진짜 긴장), 갓생 (god+생활, 완벽한 하루), 존버 (존나 버티기)
   - 억텐 (억지 텐션), 억까 (억지로 까기), 띵작 (띵+작품, 명작), 레게노 (레전드)
   - 킹받다 (엄청 화남), 열받다, 빡치다, 실화냐 (진짜야?)

3. **MZ세대 표현**:
   - 오운완 (오늘 운동 완료), 취존 (취향 존중), 문찐 (문화생활 하는 찐따)
   - N잡러 (여러 직업), 가심비 (가격 대비 심리적 만족), 가성비
   - 점메추 (점심 메뉴 추천), 저메추 (저녁 메뉴 추천), 일코 (일상 코스프레, 평범하게 지내기)

4. **최신 유행어** (2023-2024):
   - 사바사 (사람 by 사람), 별다줄 (별걸 다 줄인다), ~당함
   - 웅니/웅오빠 (오빠/언니의 애교 표현), 즐겁게 놀았어요
   - 실화냐, 지금 뭐라는 거야, 띵곡 (명곡)

**퀴즈 유형** (객관식과 문장 빈칸만):

1. **객관식 (mcq)** - 50%: 

예시 1:
{
  "type": "mcq",
  "definition": "진짜, 정말을 뜻하는 초성 표현. 리얼의 줄임말로 something이 사실임을 강조할 때 쓰는 말. 예: ㄹㅇ? 하면 진짜야? 라는 의미",
  "options": ["ㄹㅇ", "ㅇㅈ", "ㄱㅅ", "ㄷㄷ"],
  "correctAnswer": "ㄹㅇ"
}

예시 2:
{
  "type": "mcq",
  "definition": "엄청난 이득을 봤을 때 쓰는 초성 표현. 개이득의 줄임말로 대박 이득이라는 뜻. 예상치 못한 좋은 일이 생겼을 때 주로 사용",
  "options": ["ㄱㅇㄷ", "ㅈㅂ", "ㅇㅈ", "ㄹㅇ"],
  "correctAnswer": "ㄱㅇㄷ"
}

**🚨 필수**: definition은 반드시 **30자 이상** 상세하게 작성하세요!

2. **문장 빈칸 (sentence_blank)** - 50%:
{
  "type": "sentence_blank",
  "sentence": "빈칸이 있는 자연스러운 문장 (예: '오늘 정말 ___살았다!')",
  "options": ["갓", "개", "존", "짱"],
  "correctAnswer": "갓",
  "hint": "god를 뜻하는 말"
}

**출력 형식**:
{
  "questions": [
    // 객관식(mcq)과 문장 빈칸(sentence_blank) 2가지 유형을 골고루 섞은 ${count}개의 퀴즈
  ]
}

**규칙**:
1. **정답**: 위에 나열된 실제 신조어만 사용
2. **다양성**: 2가지 유형을 골고루 섞어서 출제 (mcq 50%, sentence_blank 50%)
3. **객관식 (mcq)**: 
   - definition에 **20자 이상** 상세한 의미 설명 필수
   - 단어의 뜻 + 유래 + 사용법 모두 포함
   - options/correctAnswer에 단어
4. **문장 빈칸 (sentence_blank)**: 20대가 실제로 쓸 법한 자연스러운 문장

**❌ 절대 하지 말 것**:
- 2020년 이전 오래된 유행어
- 존재하지 않는 신조어 만들기
- 너무 어려운 단어
- **definition을 비워두거나 짧게 쓰기 (20자 미만)**

이제 정확히 ${count}개의 다양한 퀴즈를 만들어주세요.`;

  try {
    console.log("🔥 최신 유행 단어 퀴즈 생성 중...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "당신은 한국 인터넷 문화와 신조어를 잘 아는 20대 한국인입니다. 2023-2025년에 실제로 사용되는 신조어만 사용하세요. 절대 없는 단어를 만들지 마세요.\n\n**필수 규칙**:\n1. 객관식(mcq)과 문장 빈칸(sentence_blank)만 생성\n2. 주관식(fill)은 절대 제외\n3. **객관식의 definition은 반드시 20자 이상 상세하게 작성**\n4. definition에 단어의 의미, 유래, 사용법을 모두 포함\n5. 비어있거나 짧은 definition은 절대 금지\n\n객관식과 문장 빈칸 유형을 50:50 비율로 골고루 섞어주세요. JSON 형식으로만 답변하세요." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    
    console.log("✅ API 응답 받음");
    
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("❌ 응답 내용이 비어있음");
      throw new Error("응답이 비어있습니다.");
    }
    
    console.log("📝 응답 내용:", content.substring(0, 500));
    
    const parsed = JSON.parse(content);
    const questions = parsed.questions || [];
    
    console.log("✅ 파싱 완료, 퀴즈 개수:", questions.length);
    console.log("📊 원본 퀴즈 데이터:", JSON.stringify(questions, null, 2));
    
    if (questions.length === 0) {
      console.error("❌ 생성된 퀴즈가 없음");
      console.error("파싱된 데이터:", parsed);
      throw new Error("퀴즈 생성에 실패했습니다.");
    }
    
    // 주관식(fill) 문제 완전히 제거 - 최신 유행 단어는 객관식과 문장 빈칸만!
    const filteredQuestions = questions.filter((q: any) => {
      if (q.type === 'fill') {
        console.warn(`⚠️ 주관식 문제 제거됨:`, q);
        return false; // 주관식은 제외!
      }
      return true; // mcq와 sentence_blank만 포함
    });
    
    // definition 검증 및 보완 (객관식의 경우)
    const validatedQuestions = filteredQuestions.map((q: any, index: number) => {
      if (q.type === 'mcq') {
        // definition이 비어있거나 너무 짧으면 correctAnswer로 기본 설명 생성
        if (!q.definition || q.definition.trim() === '' || q.definition.length < 20) {
          console.error(`❌ MCQ #${index + 1} definition 부족 (${q.definition?.length || 0}자):`, q);
          const answer = q.correctAnswer || '신조어';
          return {
            ...q,
            definition: `'${answer}'는 최근 한국 인터넷에서 유행하는 신조어입니다. 주로 온라인 커뮤니티와 SNS에서 MZ세대들이 많이 사용하는 표현으로, 특정 상황이나 감정을 나타낼 때 사용됩니다.`
          };
        }
      }
      return q;
    });
    
    console.log(`✅ 필터링 완료: ${questions.length}개 → ${validatedQuestions.length}개 (주관식 ${questions.length - filteredQuestions.length}개 제거)`);
    
    // 최종 검증 로그
    validatedQuestions.forEach((q: any, i: number) => {
      console.log(`📝 문제 #${i + 1} [${q.type}]:`, {
        definition: q.definition?.substring(0, 40) + '...',
        answer: q.correctAnswer
      });
    });
    
    console.log("🎉 퀴즈 생성 성공! (객관식 + 문장 빈칸만)");
    
    return validatedQuestions as QuizQuestion[];
    
  } catch (error: any) {
    console.error("❌ 최신 유행 단어 퀴즈 생성 오류:", error);
    throw new Error(`퀴즈 생성 실패: ${error.message || "알 수 없는 오류"}`);
  }
};

// 단어장 단어로 퀴즈 생성 (다양한 타입)
export const generateQuizFromVocabulary = async (
  words: VocabWord[], 
  count: number,
  quizTypes: ('mcq' | 'fill' | 'sentence')[] = ['mcq', 'fill', 'sentence']
): Promise<QuizQuestion[]> => {
  
  console.log("🎮 단어장 퀴즈 생성 시작...");
  console.log("단어 개수:", words.length);
  console.log("요청 퀴즈 개수:", count);
  
  if (words.length === 0) {
    throw new Error("퀴즈를 만들 단어가 없습니다. 단어장에 단어를 추가해주세요.");
  }

  // 단어 샘플링 (count보다 많으면 랜덤 선택)
  const selectedWords = words.length > count 
    ? words.sort(() => 0.5 - Math.random()).slice(0, count)
    : words;

  const wordsInfo = selectedWords.map(w => ({
    word: w.word,
    meaning: w.slangMeaning || w.traditionalMeaning,
    example: w.exampleSentence
  }));

  console.log("선택된 단어:", wordsInfo);

  const prompt = `다음 단어들로 다양한 유형의 한국어 퀴즈 ${count}개를 만들어주세요.

단어 목록:
${wordsInfo.map((w, i) => `${i + 1}. ${w.word}: ${w.meaning}`).join('\n')}

퀴즈 타입:
1. "mcq" (객관식): 단어 뜻 설명을 주고 4개 선택지 중 정답 고르기
2. "fill" (주관식): 단어 뜻을 주고 직접 답 입력하기  
3. "sentence" (문장 빈칸): 예문의 빈칸에 들어갈 단어 고르기 (객관식 4개 선택지)

각 퀴즈는 다음 타입 중 하나여야 합니다: ${quizTypes.join(', ')}

JSON 형식:
{
  "questions": [
    {
      "type": "mcq",
      "definition": "단어의 뜻 설명",
      "options": ["정답", "오답1", "오답2", "오답3"],
      "correctAnswer": "정답"
    },
    {
      "type": "fill",
      "definition": "단어의 뜻 설명",
      "correctAnswer": "정답 단어"
    },
    {
      "type": "sentence",
      "sentence": "빈칸이 있는 문장 (___로 표시)",
      "options": ["정답", "오답1", "오답2", "오답3"],
      "correctAnswer": "정답",
      "hint": "힌트 (선택사항)"
    }
  ]
}

**중요**: 
- 퀴즈는 ${count}개여야 합니다
- 다양한 타입을 섞어서 만들어주세요
- 오답은 그럴듯하게 만들어주세요
- sentence 타입은 실제 예문을 활용하거나 자연스러운 문장으로 만들어주세요`;

  try {
    console.log("📡 OpenAI API 호출 중...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "당신은 한국어 학습 퀴즈 전문가입니다. 다양하고 재미있는 퀴즈를 만들어주세요.\n\n**필수 규칙 - 주관식(fill) 타입**:\n- definition: 반드시 의미 설명을 30자 이상 작성 (빈 문자열 절대 금지!)\n- correctAnswer: 단어 자체를 입력\n\nJSON 형식으로만 답변하세요." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });
    
    console.log("✅ API 응답 받음");
    
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("❌ 응답 내용이 비어있음");
      throw new Error("응답이 비어있습니다.");
    }
    
    console.log("📝 응답 내용:", content.substring(0, 500));
    
    const parsed = JSON.parse(content);
    const questions = parsed.questions || [];
    
    console.log("✅ 파싱 완료, 퀴즈 개수:", questions.length);
    console.log("📊 원본 퀴즈 데이터:", JSON.stringify(questions, null, 2));
    
    if (questions.length === 0) {
      console.error("❌ 생성된 퀴즈가 없음");
      throw new Error("퀴즈 생성에 실패했습니다.");
    }
    
    // definition이 비어있거나 너무 짧은 주관식 문제 필터링 및 검증
    const validatedQuestions = questions.map((q: any, index: number) => {
      if (q.type === 'fill') {
        if (!q.definition || q.definition.trim() === '' || q.definition.length < 10) {
          console.error(`❌ 문제 #${index + 1}: definition이 비어있거나 너무 짧음`, q);
          // correctAnswer를 사용해 기본 definition 생성
          const word = wordsInfo.find(w => w.word === q.correctAnswer);
          return {
            ...q,
            definition: word?.meaning || `이 한국어 단어의 의미를 맞춰보세요. ${q.correctAnswer?.length || 2}글자로 구성된 단어입니다.`
          };
        }
      }
      return q;
    });
    
    // 최종 검증
    validatedQuestions.forEach((q: any, i: number) => {
      if (q.type === 'fill') {
        console.log(`✅ 주관식 문제 #${i + 1}:`, {
          definition: q.definition?.substring(0, 50) + '...',
          definitionLength: q.definition?.length,
          answer: q.correctAnswer
        });
      }
    });
    
    console.log("🎉 퀴즈 생성 성공!");
    return validatedQuestions as QuizQuestion[];
    
  } catch (error: any) {
    console.error("❌ 단어장 퀴즈 생성 오류:", error);
    
    if (error.status === 401) {
      throw new Error("API 키가 유효하지 않습니다. .env 파일을 확인해주세요.");
    } else if (error.status === 429) {
      throw new Error("API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    } else if (error.message?.includes('JSON')) {
      throw new Error("퀴즈 형식 오류. 다시 시도해주세요.");
    }
    
    throw new Error(`퀴즈 생성 실패: ${error.message || "알 수 없는 오류"}`);
  }
};

// TrOCR 백엔드 서버를 통한 손글씨 인식
export const recognizeHandwritingWithTrOCR = async (base64ImageData: string): Promise<string> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    console.log("TrOCR 백엔드 서버 사용 중...");
    
    // Base64 이미지 전송
    const response = await fetch(`${BACKEND_URL}/recognize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: `data:image/png;base64,${base64ImageData}`
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("TrOCR 백엔드 오류:", errorData);
      throw new Error(errorData.error || '손글씨 인식 실패');
    }

    const data = await response.json();
    console.log("TrOCR 인식 결과:", data);
    
    return data.text || "";
    
  } catch (error: any) {
    console.error("TrOCR 백엔드 오류:", error);
    
    // 백엔드 서버가 실행 중이 아닌 경우
    if (error.message?.includes('fetch')) {
      console.warn("⚠️ TrOCR 백엔드 서버가 실행 중이 아닙니다. OpenAI로 대체합니다.");
      console.warn("백엔드 서버 실행: backend 폴더에서 'python app.py'");
    }
    
    // 오류 시 OpenAI로 폴백
    return recognizeHandwritingWithOpenAI(base64ImageData);
  }
};

// OpenAI 손글씨 인식 (백업용)
export const recognizeHandwritingWithOpenAI = async (base64ImageData: string): Promise<string> => {
  const prompt = `이 이미지에 손으로 쓴 한글을 분석하세요.

**분석 대상**:
- 한글 자음 (ㄱ, ㄴ, ㄷ, ㄹ 등)
- 한글 모음 (ㅏ, ㅓ, ㅗ, ㅜ 등)
- 완성된 한글 글자 (가, 나, 다 등)
- 한국어 단어 (갓생, 찐텐 등)

**중요한 규칙**:
1. 인식된 **한글 텍스트만** 반환하세요
2. 설명이나 부가 문구는 절대 포함하지 마세요
3. 마크다운 형식이나 줄바꿈 없이 순수 텍스트만
4. 확실하지 않으면 가장 유사한 한글 문자를 반환
5. 빈 이미지나 인식 불가능하면 빈 문자열 반환

**예시**:
- 이미지: ㄱ → 출력: ㄱ
- 이미지: 가 → 출력: 가
- 이미지: 갓생 → 출력: 갓생`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // gpt-4o가 vision 인식이 더 정확함
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64ImageData}`,
              detail: "high" // 고해상도 분석
            },
          },
        ],
      },
    ],
    max_tokens: 50,
    temperature: 0.1, // 더 정확한 답변
  });

  const result = response.choices[0].message.content?.trim() || "";
  
  // 한글만 추출 (특수문자 제거)
  const koreanOnly = result.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g)?.join('') || '';
  
  return koreanOnly;
};

// 기본 함수 (TrOCR 우선, 실패 시 OpenAI)
export const recognizeHandwriting = recognizeHandwritingWithTrOCR;

export const generatePronunciationAudio = async (text: string): Promise<string> => {
  if (!text) throw new Error("Text is required for audio generation");
  
  const mp3Response = await openai.audio.speech.create({
    model: "tts-1-hd", // 고품질 모델 사용
    voice: "alloy", // alloy가 한국어 발음이 가장 명확함
    input: text,
    response_format: "mp3",
    speed: 0.9, // 조금 천천히 (0.25 ~ 4.0, 기본값 1.0)
  });

  // ArrayBuffer를 Base64로 변환
  const buffer = await mp3Response.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64Audio = btoa(binary);
  
  return base64Audio;
};

// 로컬 Whisper 백엔드를 사용한 음성 인식
export const transcribeAudioWithLocalWhisper = async (audioBlob: Blob): Promise<string> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    console.log("🎤 로컬 Whisper 백엔드로 음성 인식 시작...");
    console.log("Audio Blob:", audioBlob.type, audioBlob.size, "bytes");

    // FormData 생성
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    // 로컬 Whisper 백엔드 호출
    const response = await fetch(`${BACKEND_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("로컬 Whisper 백엔드 오류:", errorData);
      throw new Error(errorData.error || '음성 인식 실패');
    }

    const data = await response.json();
    console.log("✅ 로컬 Whisper 인식 결과:", data);
    
    return data.text.trim();
    
  } catch (error: any) {
    console.error("로컬 Whisper 백엔드 오류:", error);
    
    // 백엔드 서버가 실행 중이 아닌 경우
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      console.warn("⚠️ 로컬 Whisper 백엔드가 실행 중이 아닙니다. OpenAI API로 대체합니다.");
      console.warn("백엔드 서버 실행: backend 폴더에서 'python app.py'");
    }
    
    throw error;
  }
};

// OpenAI Whisper API를 사용한 음성 인식
export const transcribeAudioWithOpenAI = async (audioBlob: Blob, context?: string): Promise<string> => {
  try {
    console.log("☁️ OpenAI Whisper API로 음성 인식 시작...");
    console.log("Audio Blob:", audioBlob.type, audioBlob.size, "bytes");
    if (context) console.log("Context:", context);

    // FormData 생성
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko'); // 한국어로 명시
    formData.append('response_format', 'text');
    formData.append('temperature', '0'); // 더 정확한 인식 (0~1, 낮을수록 정확)
    
    // 프롬프트로 컨텍스트 제공 (인식 정확도 향상)
    if (context) {
      formData.append('prompt', `한국어 발음 연습입니다. 사용자가 "${context}"를 말하고 있습니다.`);
    } else {
      formData.append('prompt', '한국어 발음 연습입니다. 한글 자음, 모음, 또는 단어를 명확하게 인식하세요.');
    }

    // Whisper API 호출
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI Whisper API 오류:", errorData);
      throw new Error(errorData.error?.message || '음성 인식 실패');
    }

    const transcription = await response.text();
    console.log("✅ OpenAI Whisper API 인식 결과:", transcription);
    
    return transcription.trim();
    
  } catch (error: any) {
    console.error("OpenAI Whisper API 오류:", error);
    
    if (error.status === 401) {
      throw new Error("API 키가 유효하지 않습니다.");
    } else if (error.status === 429) {
      throw new Error("API 사용량 한도를 초과했습니다.");
    } else if (error.message?.includes('fetch')) {
      throw new Error("네트워크 연결을 확인해주세요.");
    }
    
    throw new Error(`음성 인식 실패: ${error.message || "알 수 없는 오류"}`);
  }
};

// 하이브리드 음성 인식: 로컬 Whisper 우선, 실패 시 OpenAI API
export const transcribeAudio = async (audioBlob: Blob, context?: string): Promise<string> => {
  try {
    // 먼저 로컬 Whisper 시도
    return await transcribeAudioWithLocalWhisper(audioBlob);
  } catch (error: any) {
    console.warn("⚠️ 로컬 Whisper 실패, OpenAI API로 전환합니다...");
    
    // 로컬 Whisper 실패 시 OpenAI API로 폴백
    return await transcribeAudioWithOpenAI(audioBlob, context);
  }
};

// KoBERT 유사도 계산 (주관식 답변 채점용)
export const calculateSimilarity = async (text1: string, text2: string): Promise<{ similarity: number; is_similar: boolean }> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    console.log(`🔍 유사도 계산: "${text1}" vs "${text2}"`);
    
    const response = await fetch(`${BACKEND_URL}/similarity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text1, text2 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("유사도 계산 오류:", errorData);
      throw new Error(errorData.error || '유사도 계산 실패');
    }

    const data = await response.json();
    console.log(`✅ 유사도: ${data.similarity.toFixed(2)}%`);
    
    return {
      similarity: data.similarity,
      is_similar: data.is_similar
    };
    
  } catch (error: any) {
    console.error("KoBERT 유사도 계산 오류:", error);
    
    // 백엔드 서버가 실행 중이 아닌 경우 간단한 문자열 비교로 폴백
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      console.warn("⚠️ KoBERT 백엔드 서버가 실행 중이 아닙니다. 기본 비교로 대체합니다.");
      
      // 간단한 문자열 유사도 (Levenshtein 거리 기반)
      const similarity = simpleStringSimilarity(text1.toLowerCase(), text2.toLowerCase());
      return {
        similarity: similarity * 100,
        is_similar: similarity >= 0.7
      };
    }
    
    throw error;
  }
};

// 간단한 문자열 유사도 계산 (폴백용)
function simpleStringSimilarity(s1: string, s2: string): number {
  // 포함 관계 체크
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Levenshtein 거리 기반 유사도
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

