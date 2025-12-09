import { Book } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * 알라딘 API로 책 검색 (백엔드 프록시 사용)
 * @param title 책 제목
 * @param author 저자명 (선택)
 * @returns Book 객체 또는 null
 */
export const searchBookByTitle = async (title: string, author?: string): Promise<Book | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/aladin/search_book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, author: author || '' })
    });
    
    if (!response.ok) {
      console.warn(`알라딘 API 오류: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.found) {
      console.warn(`알라딘에서 책을 찾지 못함: ${title}`);
      return null;
    }

    return {
      title: data.title,
      author: data.author,
      description: data.description || `${data.publisher}에서 출판한 ${data.title}`,
      coverImageUrl: data.coverImageUrl || undefined,
      isbn: data.isbn || undefined,
    };
    
  } catch (error: any) {
    console.error(`알라딘 API 호출 오류 (${title}):`, error);
    return null;
  }
};

/**
 * 여러 책을 한 번에 검색
 * @param books 제목과 저자 정보가 있는 배열
 * @returns Book 배열
 */
export const searchMultipleBooks = async (
  books: Array<{ title: string; author: string; description?: string }>
): Promise<Book[]> => {
  const results = await Promise.all(
    books.map(async (book) => {
      const aladinBook = await searchBookByTitle(book.title, book.author);
      
      if (aladinBook) {
        // 알라딘 정보 + AI 추천 설명 결합
        return {
          ...aladinBook,
          description: book.description || aladinBook.description,
        };
      }
      
      // 알라딘에서 못 찾으면 AI 정보만 반환 (표지 없음)
      return {
        title: book.title,
        author: book.author,
        description: book.description || `${book.author}의 ${book.title}`,
        coverImageUrl: undefined,
        isbn: undefined,
      };
    })
  );
  
  return results;
};
