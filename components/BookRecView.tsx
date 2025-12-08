
import React, { useState, useEffect } from 'react';
import { recommendBooksByLevel, recommendBooksByMood } from '../services/geminiService';
import { Book } from '../types';
import Loader from './shared/Loader';
import { useLanguage } from '../contexts/LanguageContext';
import { Bookmark } from 'lucide-react';

type RecType = 'level' | 'mood';

const BookCard: React.FC<{ book: Book; isBookmarked?: boolean; onToggleBookmark?: (book: Book) => void }> = ({ book, isBookmarked = false, onToggleBookmark }) => {
    const { t } = useLanguage();
    
    // SVG placeholder 생성 (외부 서비스 의존 제거)
    const createPlaceholderSVG = (text: string, bgColor: string = '#5D7052', textColor: string = '#ffffff') => {
        const svg = `
            <svg width="150" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="150" height="200" fill="${bgColor}"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
                      fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
            </svg>
        `.trim();
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    };
    
    // 썸네일 URL 생성
    const getThumbnailUrl = () => {
        // 네이버에서 가져온 이미지 URL 사용
        if (book.coverImageUrl && book.coverImageUrl.startsWith('http')) {
            return book.coverImageUrl;
        }
        // SVG placeholder 생성 (책 제목 첫 글자 포함)
        const firstChar = book.title.charAt(0) || '📖';
        return createPlaceholderSVG(firstChar, '#5D7052', '#ffffff');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow border border-gray-200">
            <div className="flex flex-col md:flex-row items-start gap-4 p-6">
                <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
                    <img 
                        src={getThumbnailUrl()} 
                        alt={book.title} 
                        className="w-32 h-48 object-cover rounded-lg shadow-md border-2 border-gray-100"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            // 네이버 이미지 로드 실패 시 SVG placeholder 사용
                            const firstChar = book.title.charAt(0) || '📖';
                            target.src = createPlaceholderSVG(firstChar, '#D72638', '#ffffff');
                        }}
                    />
                </div>
                <div className="flex-grow text-center md:text-left relative">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-[#293241] flex-1">{book.title}</h3>
                        {onToggleBookmark && (
                            <button
                                onClick={() => onToggleBookmark(book)}
                                className={`ml-2 p-2 rounded-full transition-all hover:scale-110 ${
                                    isBookmarked 
                                        ? 'text-[#D72638]' 
                                        : 'text-gray-400 hover:text-[#D72638]'
                                }`}
                                aria-label={isBookmarked ? t('books.removeBookmark') : t('books.addBookmark')}
                            >
                                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-[#5D4037] font-medium mb-2">✍️ {book.author}</p>
                    {book.publisher && (
                        <p className="text-xs text-gray-500 mb-2">📖 {book.publisher} {book.pubdate ? `(${book.pubdate.substring(0, 4)})` : ''}</p>
                    )}
                    {book.isbn && (
                        <p className="text-xs text-gray-500 mb-2">📚 ISBN: {book.isbn}</p>
                    )}
                    {book.price && (
                        <p className="text-sm font-bold text-[#D72638] mb-3">💰 {book.price}{t('books.won')}</p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{book.description}</p>
                    {book.link && (
                        <a 
                            href={book.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-[#D72638] text-white font-bold rounded-lg hover:bg-[#b8202f] transition shadow-sm text-center"
                        >
                            {t('books.searchOnNaver')}
                        </a>
                    )}
                </div>
            </div>
            {book.isTranslation && book.originalInfo && (
                <div className="bg-blue-50 px-6 py-4 border-t border-blue-100">
                    <h4 className="font-semibold text-sm text-blue-800 mb-2">🌍 {t('books.originalInfo')}</h4>
                    <div>
                        <p className="text-sm font-bold text-blue-900">{book.originalInfo.title}</p>
                        <p className="text-xs text-blue-700">by {book.originalInfo.author}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const BookRecView: React.FC = () => {
    const { t } = useLanguage();
    const [recType, setRecType] = useState<RecType>('mood');
    const [level, setLevel] = useState('초급');
    const [results, setResults] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // 기분 기반 추천 상태
    const [mood, setMood] = useState('');
    const [situation, setSituation] = useState('');
    const [moodLevel, setMoodLevel] = useState('');
    
    // 북마크 상태
    const [savedBooks, setSavedBooks] = useState<Book[]>(() => {
        try {
            const saved = localStorage.getItem('savedBooks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    
    // 북마크 저장
    useEffect(() => {
        localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
    }, [savedBooks]);
    
    const handleToggleBookmark = (book: Book) => {
        const bookId = book.id || `${book.title}-${book.author}`;
        setSavedBooks(prev => {
            const isSaved = prev.some(b => (b.id || `${b.title}-${b.author}`) === bookId);
            if (isSaved) {
                return prev.filter(b => (b.id || `${b.title}-${b.author}`) !== bookId);
            } else {
                return [...prev, { ...book, id: bookId }];
            }
        });
    };
    
    const isBookmarked = (book: Book): boolean => {
        const bookId = book.id || `${book.title}-${book.author}`;
        return savedBooks.some(b => (b.id || `${b.title}-${b.author}`) === bookId);
    };

    const handleLevelSubmit = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            // AI로 책 추천 → 네이버에서 정보 가져오기
            const data = await recommendBooksByLevel(level);
            console.log('AI 추천 + 네이버 검색 결과:', data);
            if (!data || data.length === 0) {
                throw new Error(t('books.noBooksFound'));
            }
            setResults(data);
        } catch (err: any) {
            console.error('도서 추천 오류:', err);
            setError(err.message || t('books.error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRecTypeChange = (type: RecType) => {
        setRecType(type);
        setResults([]);
        setError(null);
        setMood('');
        setSituation('');
        setMoodLevel('');
    };
    
    const handleMoodSubmit = async () => {
        if (!mood) {
            setError(t('books.moodRequired'));
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResults([]);
        
        try {
            const data = await recommendBooksByMood(
                mood,
                situation || undefined,
                undefined,
                undefined,
                moodLevel || undefined
            );
            console.log('기분 기반 추천 결과:', data);
            if (!data || data.length === 0) {
                throw new Error(t('books.noBooksFound'));
            }
            setResults(data);
        } catch (err: any) {
            console.error('기분 기반 도서 추천 오류:', err);
            setError(err.message || t('books.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-center">{t('books.title')}</h2>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                <button onClick={() => handleRecTypeChange('mood')} className={`flex-1 p-2 rounded-md font-semibold transition text-sm ${recType === 'mood' ? 'bg-white text-[#D72638] shadow' : 'text-gray-600'}`}>{t('books.recByMood')}</button>
                <button onClick={() => handleRecTypeChange('level')} className={`flex-1 p-2 rounded-md font-semibold transition text-sm ${recType === 'level' ? 'bg-white text-[#D72638] shadow' : 'text-gray-600'}`}>{t('books.recByLevel')}</button>
            </div>

            {recType === 'mood' && (
                <div className="flex flex-col space-y-6">
                    {/* 기분 선택 */}
                    <div>
                        <label className="block text-xl font-semibold mb-4 text-[#293241]">
                            {t('books.moodQuestion')} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {[
                                { emoji: '😋', label: '기쁨', value: '기쁨' },
                                { emoji: '😵', label: '피곤', value: '피곤' },
                                { emoji: '💗', label: '행복', value: '행복' },
                                { emoji: '🧐', label: '몰입', value: '몰입' },
                                { emoji: '🌧️', label: '불안', value: '불안' },
                                { emoji: '🍠', label: '답답', value: '답답' },
                                { emoji: '🎁', label: '감사', value: '감사' },
                                { emoji: '💫', label: '설렘', value: '설렘' },
                                { emoji: '🌿', label: '평온', value: '평온' },
                                { emoji: '🔥', label: '불안', value: '불안' },
                                { emoji: '☁️', label: '여유', value: '여유' },
                                { emoji: '🌙', label: '외로움', value: '외로움' }
                            ].map(moodOption => (
                                <button
                                    key={moodOption.value}
                                    type="button"
                                    onClick={() => setMood(moodOption.value)}
                                    className={`p-4 flex flex-col items-center justify-center rounded-xl border-2 transition-all hover:scale-105 min-h-[90px] ${
                                        mood === moodOption.value
                                            ? 'bg-[#D72638]/10 border-[#D72638] text-[#D72638] shadow-md'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-[#D72638]/50'
                                    }`}
                                >
                                    <span className="text-3xl mb-2">{moodOption.emoji}</span>
                                    <span className="text-sm font-semibold text-center">{moodOption.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* 상황 입력 */}
                    <div>
                        <label className="block text-xl font-semibold mb-3 text-[#293241]">
                            {t('books.situationLabel')}
                        </label>
                        <textarea
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder={t('books.situationPlaceholder')}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[#D72638] focus:outline-none resize-none min-h-[120px] text-gray-700"
                            rows={4}
                        />
                    </div>
                    
                    {/* 수준 선택 (선택사항) */}
                    <div>
                        <label className="block text-xl font-semibold mb-3 text-[#293241]">
                            {t('books.moodLevelLabel')}
                        </label>
                        <select
                            value={moodLevel}
                            onChange={(e) => setMoodLevel(e.target.value)}
                            className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-[#D72638] focus:outline-none text-gray-700"
                        >
                            <option value="">{t('books.noSelection')}</option>
                            <option value="초급">{t('books.levels.beginner')}</option>
                            <option value="중급">{t('books.levels.intermediate')}</option>
                            <option value="고급">{t('books.levels.advanced')}</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={handleMoodSubmit}
                        disabled={isLoading || !mood}
                        className="w-full p-4 bg-[#D72638] text-white font-bold rounded-lg hover:bg-[#b8202f] transition shadow-sm disabled:bg-[#d72638]/50 text-lg"
                    >
                        {isLoading ? t('books.loading') : t('books.getMoodRecommendation')}
                    </button>
                </div>
            )}

            {recType === 'level' && (
                <>
                    <div className="flex flex-col space-y-4">
                        <label htmlFor="level-select" className="font-semibold">{t('books.selectLevel')}:</label>
                        <select id="level-select" value={level} onChange={(e) => setLevel(e.target.value)} className="p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D72638]">
                            <option value="초급">{t('books.levels.beginner')}</option>
                            <option value="중급">{t('books.levels.intermediate')}</option>
                            <option value="고급">{t('books.levels.advanced')}</option>
                        </select>
                    </div>
                    <button onClick={handleLevelSubmit} disabled={isLoading} className="w-full p-3 bg-[#D72638] text-white font-bold rounded-lg hover:bg-[#b8202f] transition shadow-sm disabled:bg-[#d72638]/50">
                        {isLoading ? t('books.loading') : t('books.getRecommendation')}
                    </button>
                </>
            )}
            
            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {results.length > 0 && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-center flex-1">{t('books.resultsTitle')}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bookmark className="w-4 h-4" />
                            <span>{t('books.savedBooksCountWithNumber', { count: savedBooks.length })}</span>
                        </div>
                    </div>
                    {results.map((book, index) => (
                        <BookCard 
                            key={book.id || index} 
                            book={book} 
                            isBookmarked={isBookmarked(book)}
                            onToggleBookmark={handleToggleBookmark}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookRecView;
