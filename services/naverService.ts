
import { Book } from '../types';

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.warn("네이버 API 키가 설정되지 않았습니다. VITE_NAVER_CLIENT_ID와 VITE_NAVER_CLIENT_SECRET을 .env 파일에 추가하세요.");
}

interface NaverBookItem {
  title: string;
  link: string;
  image: string;
  author: string;
  discount: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
}

interface NaverBookResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBookItem[];
}

/**
 * 네이버 검색 API를 통해 책을 검색합니다.
 * 백엔드를 통해서만 호출합니다 (CORS 문제 방지).
 * @param query 검색어
 * @param display 반환할 결과 수 (최대 100)
 * @returns Book 배열
 */
export const searchBooksFromNaver = async (query: string, display: number = 10): Promise<Book[]> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    const response = await fetch(`${BACKEND_URL}/naver/search/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        display: Math.min(display, 100), // 최대 100개
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`백엔드 응답 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    return convertNaverBooksToBooks(data.items);
  } catch (error: any) {
    console.error('백엔드를 통한 네이버 검색 실패:', error);
    
    // 네트워크 오류인 경우 백엔드 연결 문제 안내
    if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_FAILED')) {
      throw new Error('백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요. (http://localhost:5001)');
    }
    
    throw new Error(`책 검색 실패: ${error.message || '알 수 없는 오류'}`);
  }
};

/**
 * 네이버 책 데이터를 Book 타입으로 변환
 */
const convertNaverBooksToBooks = (items: NaverBookItem[]): Book[] => {
  return items.map((item) => {
    // HTML 태그 제거
    const cleanTitle = item.title.replace(/<[^>]*>/g, '');
    const cleanAuthor = item.author.replace(/<[^>]*>/g, '');
    const cleanDescription = item.description.replace(/<[^>]*>/g, '');

    // ISBN 추출 (13자리 우선, 없으면 10자리)
    const isbn13 = item.isbn.split(' ').find((isbn) => isbn.length === 13) || '';
    const isbn10 = item.isbn.split(' ').find((isbn) => isbn.length === 10) || '';
    const isbn = isbn13 || isbn10 || '';

    // 네이버 검색 결과 페이지 링크 생성
    const searchQuery = `${cleanTitle} ${cleanAuthor}`;
    const naverSearchLink = `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=${encodeURIComponent(searchQuery)}`;

    // 이미지 URL 처리
    let imageUrl = item.image;
    if (imageUrl) {
      // HTML 태그 제거
      imageUrl = imageUrl.replace(/<[^>]*>/g, '');
      // http로 시작하지 않으면 https:// 추가
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `https://${imageUrl}`;
      }
    }

    return {
      title: cleanTitle,
      author: cleanAuthor,
      description: cleanDescription || '설명이 제공되지 않았습니다.',
      coverImageUrl: imageUrl || undefined,
      isbn: isbn,
      link: naverSearchLink, // 네이버 검색 결과 페이지 링크
      price: item.discount || undefined,
      publisher: item.publisher || undefined,
      pubdate: item.pubdate || undefined,
    };
  });
};

/**
 * 레벨에 따른 검색어 생성
 */
export const getSearchQueryByLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    '초급': '한국어 초급 학습책',
    '중급': '한국어 중급 학습책',
    '고급': '한국어 고급 학습책',
  };
  return levelMap[level] || '한국어 학습책';
};

/**
 * 장르에 따른 검색어 생성
 */
export const getSearchQueryByGenre = (genre: string): string => {
  return `한국어 ${genre} 책`;
};

/**
 * 책 제목과 저자로 네이버에서 책 정보 검색
 * @param title 책 제목
 * @param author 저자 (선택)
 * @returns Book 정보 (네이버 검색 결과)
 */
export const searchBookByTitleAndAuthor = async (title: string, author?: string): Promise<Book | null> => {
  try {
    // 검색어 생성: 제목 + 저자 (있는 경우)
    const query = author ? `${title} ${author}` : title;
    
    // 백엔드를 통해 검색
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    
    const response = await fetch(`${BACKEND_URL}/naver/search/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        display: 1, // 첫 번째 결과만
      }),
    });

    if (!response.ok) {
      console.warn('백엔드를 통한 책 검색 실패');
      return null;
    }

    const data = await response.json();
    const items = data.items || [];
    
    if (items.length === 0) {
      return null;
    }

    // 첫 번째 결과를 Book 타입으로 변환
    const item = items[0];
    const cleanTitle = item.title.replace(/<[^>]*>/g, '');
    const cleanAuthor = item.author.replace(/<[^>]*>/g, '');
    const cleanDescription = item.description.replace(/<[^>]*>/g, '');
    
    // ISBN 추출
    const isbn13 = item.isbn.split(' ').find((isbn: string) => isbn.length === 13) || '';
    const isbn10 = item.isbn.split(' ').find((isbn: string) => isbn.length === 10) || '';
    const isbn = isbn13 || isbn10 || '';

    // 네이버 검색 결과 페이지 링크 생성 (책 제목 + 저자로 검색)
    const searchQuery = author ? `${title} ${author}` : title;
    const naverSearchLink = `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=${encodeURIComponent(searchQuery)}`;

    // 이미지 URL 처리 (네이버 API에서 반환하는 이미지 URL 사용)
    let imageUrl = item.image;
    if (imageUrl) {
      // HTML 태그 제거
      imageUrl = imageUrl.replace(/<[^>]*>/g, '');
      // http로 시작하지 않으면 https:// 추가
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `https://${imageUrl}`;
      }
    }

    return {
      title: cleanTitle,
      author: cleanAuthor,
      description: cleanDescription || '설명이 제공되지 않았습니다.',
      coverImageUrl: imageUrl || undefined,
      isbn: isbn,
      link: naverSearchLink, // 네이버 검색 결과 페이지 링크
      price: item.discount || undefined,
      publisher: item.publisher || undefined,
      pubdate: item.pubdate || undefined,
    };
  } catch (error: any) {
    console.error('책 검색 오류:', error);
    return null;
  }
};

