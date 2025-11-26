
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSlangDefinition } from '../services/openaiService';
import { DictionaryEntry, VocabWord, VocabFolder } from '../types';
import { MugunghwaIcon, MicIcon } from './shared/Icons';
import Loader from './shared/Loader';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}


const DictionaryView: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const folders = currentUser?.folders;
  const { t, language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [trendingWords, setTrendingWords] = useState<string[]>([]);

  // Load trending words from glossary.json
  useEffect(() => {
    const loadTrendingWords = async () => {
      try {
        const response = await fetch('/data/glossary.json');
        if (!response.ok) {
          throw new Error('데이터셋을 불러올 수 없습니다.');
        }
        const data = await response.json();
        const allWords = data.entries.map((entry: any) => entry.slang);
        
        // Remove duplicates and filter out special characters
        const uniqueWords = Array.from(new Set(allWords))
          .filter((word: string) => word && word.trim() !== '' && !word.includes('(') && !word.includes('GMG'));
        
        // Randomly select 7 words
        const shuffled = [...uniqueWords].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 7);
        
        setTrendingWords(selected);
      } catch (error) {
        console.error('추천 단어 로드 실패:', error);
        // Fallback to default words
        setTrendingWords(['갓생', '소확행', '복세편살', '얼죽아', '알잘딱깔센', '워라밸', '꾸안꾸']);
      }
    };

    loadTrendingWords();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // Load recent searches from local storage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
        try {
            setRecentSearches(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse recent searches", e);
        }
    }
  }, []);

  const saveToHistory = (term: string) => {
      setRecentSearches(prev => {
          const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, 10);
          localStorage.setItem('recentSearches', JSON.stringify(newHistory));
          return newHistory;
      });
  };

  const deleteFromHistory = (term: string, e: React.MouseEvent) => {
      e.stopPropagation(); // 클릭 이벤트 전파 방지
      setRecentSearches(prev => {
          const newHistory = prev.filter(t => t !== term);
          localStorage.setItem('recentSearches', JSON.stringify(newHistory));
          return newHistory;
      });
  };

  useEffect(() => {
    if (result && folders) {
      const alreadyExists = folders.some(folder =>
        folder.words.some(word => word.word === result.word)
      );
      setIsBookmarked(alreadyExists);
    } else {
      setIsBookmarked(false);
    }
  }, [result, folders]);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getSlangDefinition(term.trim(), language);
      setResult(data);
      setSearchTerm(term.trim());
      saveToHistory(term.trim());
    } catch (err) {
      setError(t('dictionary.error'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t, language]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };
  
  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    performSearch(tag);
  };

  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('dictionary.voiceNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setError(null);

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchTerm(speechResult);
      performSearch(speechResult);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(t('dictionary.voiceError'));
      setIsListening(false);
    };
    
    recognition.start();
  }, [language, performSearch, t]);
  

  const handleAddToVocabulary = (folderId: string) => {
    if (!result || !setCurrentUser || !currentUser) return;

    const folderToUpdate = currentUser.folders.find(f => f.id === folderId);
    if (!folderToUpdate) return;
    
    if (folderToUpdate.words.some(w => w.word === result.word)) {
        alert(t('dictionary.alreadyExists'));
        setShowFolderSelect(false);
        return;
    }

    const newWord: VocabWord = { ...result, id: Date.now().toString() };
    
    const updatedFolders = currentUser.folders.map(folder => {
        if (folder.id === folderId) {
            return { ...folder, words: [...folder.words, newWord] };
        }
        return folder;
    });
    
    setCurrentUser({ ...currentUser, folders: updatedFolders });

    setIsBookmarked(true);
    alert(t('dictionary.addSuccess', { word: result.word }));
    setShowFolderSelect(false);
  };

  const handleCreateNewFolder = () => {
    if (!result || !setCurrentUser || !currentUser) return;
    
    if (!newFolderName.trim()) {
      alert('화단 이름을 입력해주세요.');
      return;
    }

    // 중복 체크
    if (currentUser.folders.some(f => f.name === newFolderName.trim())) {
      alert('이미 같은 이름의 화단이 있습니다.');
      return;
    }

    const newWord: VocabWord = { ...result, id: Date.now().toString() };
    const newFolder: VocabFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      words: [newWord]
    };

    setCurrentUser({ 
      ...currentUser, 
      folders: [...currentUser.folders, newFolder] 
    });

    setIsBookmarked(true);
    alert(`"${result.word}"을(를) 새 화단 "${newFolder.name}"에 추가했습니다! 🌱`);
    setShowFolderSelect(false);
    setShowNewFolderInput(false);
    setNewFolderName('');
  };

  return (
    <div className="flex flex-col gap-8">
       {/* Dictionary Banner */}
       <div className="w-full bg-gradient-to-r from-[#D72638] to-[#FF6B6B] rounded-2xl relative overflow-hidden p-8 text-center text-white shadow-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/korean-pattern.png')]"></div>
            <h2 className="text-4xl font-bold mb-2 relative z-10 flex items-center justify-center gap-3">
              <span>📖</span>
              <span>{t('common.appTitle')} {t('nav.dictionary')}</span>
            </h2>
            <p className="text-lg opacity-95 relative z-10">{t('dictionary.placeholder')}</p>
            {/* Decorative corners - Modern flower design */}
            <div className="absolute top-3 left-3 text-2xl opacity-60">🌸</div>
            <div className="absolute top-3 right-3 text-2xl opacity-60">🌷</div>
            <div className="absolute bottom-3 left-3 text-2xl opacity-60">🌺</div>
            <div className="absolute bottom-3 right-3 text-2xl opacity-60">🌻</div>
       </div>

       {/* Hashtag Menu */}
       <div className="flex flex-col items-center justify-center gap-2 mb-4">
           <p className="text-sm text-gray-500 font-bold mb-1">🔥 {t('dictionary.suggested')}</p>
           <div className="flex flex-wrap justify-center gap-3">
               {trendingWords.map((word, idx) => {
                   const pastelColors = [
                       { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', hover: 'hover:bg-blue-200' },
                       { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', hover: 'hover:bg-pink-200' },
                       { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', hover: 'hover:bg-yellow-200' },
                       { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', hover: 'hover:bg-purple-200' },
                       { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', hover: 'hover:bg-green-200' },
                       { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', hover: 'hover:bg-orange-200' },
                       { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', hover: 'hover:bg-cyan-200' }
                   ];
                   const color = pastelColors[idx % pastelColors.length];
                   return (
                       <button 
                        key={idx} 
                        onClick={() => handleTagClick(word)}
                        className={`px-4 py-2 rounded-full border-2 ${color.border} ${color.bg} ${color.text} font-semibold text-sm shadow-sm ${color.hover} transition transform hover:-translate-y-1 hover:shadow-md`}
                       >
                           #{word}
                       </button>
                   );
               })}
           </div>
       </div>

       <div className="flex flex-col md:flex-row gap-8">
           {/* Main Content Area */}
           <div className="flex-grow">
                {/* Search Result Header */}
                {searchTerm && (
                  <div className="mb-4">
                    <span className="text-xl font-bold text-[#293241]">{t('dictionary.search')}: </span>
                    <span className="text-xl font-bold text-[#D72638]">{searchTerm}</span>
                  </div>
                )}

                {/* Input Area */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border-2 border-red-100">
                    <form onSubmit={handleSearch} className="flex gap-2">
                         <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('dictionary.placeholder')}
                                className="w-full p-3 pr-12 bg-white border-2 border-red-200 rounded-xl focus:outline-none focus:border-[#D72638] focus:ring-2 focus:ring-red-100 transition text-lg"
                            />
                            <button type="button" onClick={handleVoiceSearch} disabled={isListening} className={`absolute inset-y-0 right-0 flex items-center pr-3  hover:text-[#D72638] disabled:text-gray-300 ${isListening ? 'text-[#D72638] animate-pulse' : 'text-gray-500'}`}>
                                <MicIcon />
                            </button>
                        </div>
                        <button type="submit" className="px-6 py-3 bg-[#D72638] text-white font-bold rounded-lg hover:bg-[#b8202f] transition shadow-sm" disabled={isLoading}>
                            {isLoading ? t('dictionary.searching') : t('dictionary.searchButton')}
                        </button>
                    </form>
                </div>

                {isLoading && <Loader />}
                {error && <p className="text-red-500 text-center">{error}</p>}
                
                {/* Result Card */}
                {result && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        {/* Word Header with Bookmark */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-5xl font-bold text-[#D72638]">{result.word}</h2>
                            <button 
                                onClick={() => setShowFolderSelect(true)} 
                                className="hover:scale-110 transition-transform"
                                aria-label="Add to vocabulary"
                            >
                                <MugunghwaIcon isBookmarked={isBookmarked} />
                            </button>
                        </div>

                        {/* 사전적 의미 */}
                        <div className="mb-8 pb-6 border-b-2 border-red-50">
                            <h3 className="text-2xl font-bold text-[#D72638] mb-4">{t('dictionary.traditionalMeaning')}</h3>
                            <p className="text-lg text-gray-700 leading-relaxed">{result.traditionalMeaning}</p>
                        </div>

                        {/* 새로운 의미 ✨ */}
                        <div className="mb-8 pb-6 border-b-2 border-red-50">
                            <h3 className="text-2xl font-bold text-[#D72638] mb-4">
                                {t('dictionary.slangMeaning')} <span className="text-xl">✨</span>
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">{result.slangMeaning}</p>
                        </div>

                        {/* 예문 */}
                        <div>
                            <h3 className="text-2xl font-bold text-[#D72638] mb-4">{t('dictionary.example')}</h3>
                            <p className="text-lg text-gray-700 leading-relaxed italic bg-red-50 p-4 rounded-xl border-l-4 border-[#D72638]">
                                "{result.exampleSentence}"
                            </p>
                        </div>
                    </div>
                )}
           </div>

           {/* Sidebar - Recent History */}
           <div className="w-full md:w-64 flex-shrink-0">
               <div className="bg-white rounded-2xl p-1 pb-4 shadow-lg overflow-hidden border-2 border-red-100">
                   <div className="bg-red-50 rounded-xl p-4 h-full border-2 border-red-200 m-1 min-h-[300px]">
                        <h3 className="font-bold text-lg mb-4 text-center border-b-2 border-[#D72638] pb-2 text-[#D72638]">{t('dictionary.recentSearches')}</h3>
                        {recentSearches.length > 0 ? (
                            <ul className="space-y-2">
                                {recentSearches.map((term, idx) => (
                                    <li 
                                        key={idx} 
                                        className="flex items-center justify-between text-gray-700 hover:bg-white rounded-lg transition border-b border-red-100 last:border-0 group"
                                    >
                                        <div 
                                            onClick={() => handleTagClick(term)}
                                            className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer py-2"
                                        >
                                            <span className="text-[#D72638] font-bold text-xs bg-white border-2 border-red-200 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">{idx + 1}</span>
                                            <span className="truncate">{term}</span>
                                        </div>
                                        <button
                                            onClick={(e) => deleteFromHistory(term, e)}
                                            className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                                            title={t('dictionary.delete')}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-gray-400 py-8 text-sm">
                                <p>{t('dictionary.noRecentSearches')}</p>
                            </div>
                        )}
                   </div>
               </div>
           </div>
       </div>

      
      {showFolderSelect && result && folders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-11/12 max-w-sm">
            <h3 className="font-bold text-lg mb-4">{t('dictionary.selectFolder')}</h3>
            
            {/* 기존 화단 목록 */}
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleAddToVocabulary(folder.id)}
                  className="w-full text-left p-3 bg-gray-100 hover:bg-red-100 rounded-md transition"
                >
                  {folder.name}
                </button>
              ))}
            </div>

            {/* 새 화단 생성 */}
            {showNewFolderInput ? (
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={t('dictionary.newFolderName')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateNewFolder}
                    className="flex-1 p-2 bg-[#D72638] text-white rounded-md hover:bg-[#b8202f] transition"
                  >
                    {t('dictionary.create')}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }}
                    className="flex-1 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                  >
                    {t('dictionary.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="w-full p-2 mb-4 bg-[#3D5A80] text-white rounded-md hover:bg-[#2f4661] transition"
              >
                {t('dictionary.createNewFolder')}
              </button>
            )}

            <button
              onClick={() => {
                setShowFolderSelect(false);
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              {t('dictionary.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryView;
