import React, { useState, useEffect } from 'react';
import { 
  initGame, 
  startGame, 
  submitAnswer, 
  getNextQuestion, 
  stopGame
} from '../services/minigameService';
import { GlossaryData, FavoritesData, GameQuestion, AnswerFeedback, WordbookComplete, QuizComplete, DictionaryEntry, VocabWord, VocabFolder } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const MinigameView: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'newSlang' | 'vocabulary'>('newSlang');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [gameComplete, setGameComplete] = useState<WordbookComplete | QuizComplete | null>(null);
  const [glossary, setGlossary] = useState<GlossaryData | null>(null);
  const [favorites, setFavorites] = useState<FavoritesData | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextRoundMessage, setNextRoundMessage] = useState<string | null>(null);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [wrongWordToAdd, setWrongWordToAdd] = useState<DictionaryEntry | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // JSON 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/glossary.json');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: GlossaryData = await response.json();
        
        if (!data.entries || data.entries.length === 0) {
          throw new Error('JSON 파일에 entries 배열이 없거나 비어있습니다.');
        }
        
        setGlossary(data);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error('데이터 로드 실패:', errorMessage);
        alert(`${t('minigame.noGlossary')}: ${errorMessage}`);
      }
    };
    loadData();
  }, []);

  // 즐겨찾기 로드 (단어장에서 사용)
  useEffect(() => {
    if (activeTab === 'vocabulary' && currentUser) {
      const loadFavorites = () => {
        // 단어장에서 즐겨찾기 단어 가져오기
        const allWords = currentUser.folders.flatMap(folder => folder.words);
        const favoritesData: FavoritesData = {
          favorites: allWords.map(word => ({
            slang: word.word,
            meaning: word.slangMeaning || word.traditionalMeaning,
            example: word.exampleSentence
          }))
        };
        setFavorites(favoritesData);
      };
      loadFavorites();
    }
  }, [activeTab, currentUser]);

  const handleStartGame = async () => {
    if (activeTab === 'newSlang' && !glossary) {
      alert(t('minigame.noGlossary'));
      return;
    }
    
    if (activeTab === 'vocabulary' && (!favorites || favorites.favorites.length === 0)) {
      alert(t('minigame.noVocabulary'));
      return;
    }

    setIsLoading(true);
    try {
      const result = initGame(
        activeTab === 'newSlang' ? '신조어' : '단어장',
        glossary || undefined,
        favorites || undefined,
        { shuffleQuestions: true, language }
      );

      if (!result.success) {
        alert(result.message);
        setIsLoading(false);
        return;
      }

      const question = await startGame();
      
      if ('error' in question) {
        alert(question.message);
        setIsLoading(false);
        return;
      }

      setCurrentQuestion(question);
      setGameStarted(true);
      setFeedback(null);
      setGameComplete(null);
      setHintShown(false);
      setNextRoundMessage(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('게임 시작 중 오류:', errorMessage);
      alert(`게임 시작 실패: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return;

    const result = submitAnswer(answer);
    if ('phase' in result && result.phase === 'invalid_input') {
      alert(result.message);
      return;
    }

    const feedbackResult = result as AnswerFeedback;
    setFeedback(feedbackResult);

    // 오답인 경우 단어장에 추가할 수 있도록 모달 표시
    if (!feedbackResult.isCorrect && currentQuestion) {
      // 정답 단어 정보 가져오기
      const correctWord = glossary?.entries.find(e => e.slang === feedbackResult.correct.text) ||
                         favorites?.favorites.find(e => e.slang === feedbackResult.correct.text);
      
      if (correctWord) {
        const wordEntry: DictionaryEntry = {
          word: correctWord.slang,
          traditionalMeaning: '신조어로, 표준 사전에는 등재되지 않았습니다.',
          slangMeaning: correctWord.meaning,
          exampleSentence: correctWord.example
        };
        setWrongWordToAdd(wordEntry);
        setShowFolderSelect(true);
        // 모달이 닫힐 때까지 다음 문제로 넘어가지 않도록 return
        return;
      }
    }

    // 정답이거나 단어 정보를 찾을 수 없는 경우, 2초 후 다음 문제로
    setTimeout(() => {
      proceedToNextQuestion();
    }, 2000);
  };

  const handleStopGame = () => {
    try {
      const status = stopGame();
      alert(`게임 중단\n점수: ${status.score}/${status.totalQuestionsEver || status.remaining + status.score}\n남은 문제: ${status.remaining}개`);
      setGameStarted(false);
      setCurrentQuestion(null);
      setFeedback(null);
    } catch (error: any) {
      alert(`게임 중단 실패: ${error.message}`);
    }
  };

  const handleShowHint = () => {
    if (currentQuestion && !hintShown) {
      setHintShown(true);
    }
  };

  const handleTabChange = (tab: 'newSlang' | 'vocabulary') => {
    if (gameStarted) {
      if (!confirm(t('minigame.gameInProgress'))) {
        return;
      }
      handleStopGame();
    }
    setActiveTab(tab);
    setGameStarted(false);
    setCurrentQuestion(null);
    setFeedback(null);
    setGameComplete(null);
    setHintShown(false);
    setNextRoundMessage(null);
  };

  const handleAddToVocabulary = (folderId: string) => {
    if (!wrongWordToAdd || !setCurrentUser || !currentUser) return;

    const folderToUpdate = currentUser.folders.find(f => f.id === folderId);
    if (!folderToUpdate) return;
    
    if (folderToUpdate.words.some(w => w.word === wrongWordToAdd.word)) {
      alert(t('minigame.wordExists'));
      setShowFolderSelect(false);
      setWrongWordToAdd(null);
      proceedToNextQuestion();
      return;
    }

    const newWord: VocabWord = { ...wrongWordToAdd, id: Date.now().toString() };
    
    const updatedFolders = currentUser.folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, words: [...folder.words, newWord] };
      }
      return folder;
    });
    
    setCurrentUser({ ...currentUser, folders: updatedFolders });
    alert(t('minigame.wordAdded', { word: wrongWordToAdd.word, folder: folderToUpdate.name }));
    setShowFolderSelect(false);
    setWrongWordToAdd(null);
    // 모달 닫은 후 다음 문제로
    proceedToNextQuestion();
  };

  const handleCreateNewFolder = () => {
    if (!wrongWordToAdd || !setCurrentUser || !currentUser) return;
    
    if (!newFolderName.trim()) {
      alert(t('minigame.newFolderName'));
      return;
    }

    if (currentUser.folders.some(f => f.name === newFolderName.trim())) {
      alert(t('vocabulary.wordExistsInDest'));
      return;
    }

    const newWord: VocabWord = { ...wrongWordToAdd, id: Date.now().toString() };
    const newFolder: VocabFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      words: [newWord]
    };

    setCurrentUser({ 
      ...currentUser, 
      folders: [...currentUser.folders, newFolder] 
    });

    alert(t('minigame.wordAdded', { word: wrongWordToAdd.word, folder: newFolder.name }));
    setShowFolderSelect(false);
    setShowNewFolderInput(false);
    setNewFolderName('');
    setWrongWordToAdd(null);
    // 모달 닫은 후 다음 문제로
    proceedToNextQuestion();
  };

  const proceedToNextQuestion = () => {
    // 1초 후 다음 문제로
    setTimeout(async () => {
      try {
        const next = await getNextQuestion();
        
        if ('phase' in next) {
          if (next.phase === 'next_round') {
            setNextRoundMessage(next.message);
            setTimeout(async () => {
              setNextRoundMessage(null);
              // next_round는 GameQuestion이 아니므로 다시 getNextQuestion 호출
              try {
                const nextQuestion = await getNextQuestion();
                if ('questionIndex' in nextQuestion) {
                  setCurrentQuestion(nextQuestion as GameQuestion);
                }
              } catch (error: unknown) {
                console.error('다음 라운드 문제 로드 실패:', error);
              }
              setFeedback(null);
              setHintShown(false);
            }, 2000);
            return;
          } else if (next.phase === 'wordbook_complete' || next.phase === 'quiz_complete') {
            setGameComplete(next as WordbookComplete | QuizComplete);
            setGameStarted(false);
            setCurrentQuestion(null);
            setFeedback(null);
            return;
          }
        }

        setCurrentQuestion(next as GameQuestion);
        setFeedback(null);
        setHintShown(false);
      } catch (error: unknown) {
        console.error('다음 문제 로드 실패:', error);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#D72638] mb-2 flex items-center gap-3">
          🎮 {t('nav.games')}
        </h1>
        <p className="text-gray-600 mb-6">{t('minigame.description')}</p>

        {/* 탭 */}
        <div className="flex gap-4 mb-6 border-b-2 border-red-100">
          <button
            onClick={() => handleTabChange('newSlang')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'newSlang'
                ? 'text-[#D72638] border-b-2 border-[#D72638]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('minigame.newSlang')}
          </button>
          <button
            onClick={() => handleTabChange('vocabulary')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'vocabulary'
                ? 'text-[#D72638] border-b-2 border-[#D72638]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('minigame.vocabulary')}
          </button>
        </div>

        {/* 다음 라운드 메시지 */}
        {nextRoundMessage && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
            <p className="text-[#D72638] font-semibold text-lg">{nextRoundMessage}</p>
          </div>
        )}

        {/* 게임 완료 메시지 */}
        {gameComplete && (
          <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
            <h2 className="text-2xl font-bold text-[#D72638] mb-4">🎉 {t('minigame.gameComplete')}</h2>
            {gameComplete.phase === 'wordbook_complete' ? (
              <div>
                <p className="text-gray-700 mb-2">{t('minigame.rounds')}: {gameComplete.rounds}</p>
                <p className="text-gray-700 mb-2">{t('minigame.totalQuestions')}: {gameComplete.totalQuestionsEver}</p>
                <p className="text-gray-700 mb-2">{t('minigame.accuracy')}: {Math.round((gameComplete.totalCorrect / gameComplete.totalQuestionsEver) * 100)}%</p>
                <div className="mt-4">
                  <h3 className="font-semibold text-[#D72638] mb-2">{t('minigame.roundHistory')}:</h3>
                  {gameComplete.history.map((h, idx: number) => (
                    <div key={idx} className="text-sm text-gray-700 mb-1">
                      {t('minigame.rounds')} {h.round}: {h.correct}/{h.asked} {t('minigame.correct')}
                    </div>
                  ))}
                </div>
              </div>
            ) : gameComplete.phase === 'quiz_complete' ? (
              <div>
                <p className="text-gray-700 mb-2">{t('minigame.totalQuestions')}: {gameComplete.totalQuestions}</p>
                <p className="text-gray-700 mb-2">{t('minigame.correctAnswers')}: {gameComplete.correctAnswers}</p>
                <p className="text-gray-700 mb-2">{t('minigame.accuracy')}: {gameComplete.percentage}%</p>
              </div>
            ) : null}
            <button
              onClick={() => {
                setGameComplete(null);
                setGameStarted(false);
              }}
              className="mt-4 px-6 py-2 bg-[#D72638] text-white rounded-xl hover:bg-[#b8202f] shadow-sm"
            >
              {t('minigame.restart')}
            </button>
          </div>
        )}

        {/* 게임 시작 전 */}
        {!gameStarted && !gameComplete && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-red-100 text-center">
            <h2 className="text-2xl font-bold text-[#D72638] mb-4">
              {activeTab === 'newSlang' ? t('minigame.newSlang') : t('minigame.vocabulary')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('minigame.description')}
            </p>
            <button
              onClick={handleStartGame}
              disabled={isLoading}
              className="px-8 py-4 bg-[#D72638] text-white font-bold rounded-xl hover:bg-[#b8202f] transition disabled:opacity-50 text-lg shadow-sm"
            >
              {isLoading ? t('books.loading') : t('minigame.startGame')}
            </button>
          </div>
        )}

        {/* 게임 진행 중 */}
        {gameStarted && currentQuestion && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            {/* 진행 상황 */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <span className="text-gray-600">{t('minigame.totalQuestions')} {currentQuestion.questionIndex}/{currentQuestion.totalQuestions}</span>
                {feedback && (
                  <span className={`ml-4 font-semibold ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {t('minigame.score')}: {feedback.currentScore}
                  </span>
                )}
              </div>
              <button
                onClick={handleStopGame}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                {t('minigame.stopGame')}
              </button>
            </div>

            {/* 문제 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#293241] mb-4">
              </h2>
              <p className="text-xl text-gray-700 mb-4">{currentQuestion.questionText}</p>
              
              {hintShown && currentQuestion && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 {t('minigame.hint')}: {glossary?.entries.find(e => e.slang === currentQuestion.correctAnswer)?.example || 
                              favorites?.favorites.find(e => e.slang === currentQuestion.correctAnswer)?.example || 
                              t('dictionary.error')}
                  </p>
                </div>
              )}

              {currentQuestion.canHint && !hintShown && (
                <button
                  onClick={handleShowHint}
                  className="mb-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  💡 {t('minigame.showHint')}
                </button>
              )}
            </div>

            {/* 보기 */}
            {!feedback && (
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const pastelColors = [
                    { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100', hoverBorder: 'hover:border-blue-300' },
                    { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100', hoverBorder: 'hover:border-pink-300' },
                    { bg: 'bg-yellow-50', border: 'border-yellow-200', hover: 'hover:bg-yellow-100', hoverBorder: 'hover:border-yellow-300' },
                    { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100', hoverBorder: 'hover:border-purple-300' }
                  ];
                  const color = pastelColors[index % pastelColors.length];
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.label)}
                      className={`p-6 ${color.bg} rounded-xl shadow-sm hover:shadow-md ${color.hover} border-2 ${color.border} ${color.hoverBorder} transition-all font-semibold text-lg text-gray-700`}
                    >
                      <span className="text-[#D72638] mr-2 font-bold">{option.label}.</span>
                      {option.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 피드백 */}
            {feedback && (
              <div className={`p-6 rounded-xl border-2 ${
                feedback.isCorrect 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <p className={`text-lg font-semibold mb-2 ${
                  feedback.isCorrect ? 'text-[#D72638]' : 'text-red-700'
                }`}>
                  {feedback.isCorrect ? `✅ ${t('minigame.correct')}` : `❌ ${t('minigame.incorrect')}`}
                </p>
                <p className="text-gray-700 mb-2">{feedback.explanation}</p>
                <p className="text-sm text-gray-600">
                  {t('minigame.selected')}: {feedback.selected.text} | {t('minigame.correct')}: {feedback.correct.text}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {t('minigame.remaining')}: {feedback.remaining}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 단어장 추가 모달 */}
        {showFolderSelect && wrongWordToAdd && currentUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-100 w-full max-w-sm">
              <h3 className="font-bold text-lg mb-2">{t('minigame.addToVocabulary')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('minigame.incorrect')} "<span className="font-semibold text-[#D72638]">{wrongWordToAdd.word}</span>" {t('minigame.selectFolder')}?
              </p>
              
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {currentUser.folders.map(folder => (
                  <button 
                    key={folder.id} 
                    onClick={() => handleAddToVocabulary(folder.id)} 
                    className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-xl border-2 border-red-100 hover:border-[#D72638] transition"
                  >
                    {folder.name} ({folder.words.length}개)
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                {!showNewFolderInput ? (
                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                  >
                    + {t('minigame.createNewFolder')}
                  </button>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">{t('minigame.createNewFolder')}</h4>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder={t('minigame.newFolderName')}
                      className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateNewFolder();
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCreateNewFolder} 
                        disabled={!newFolderName.trim()} 
                        className="flex-1 p-2 bg-[#D72638] text-white font-bold rounded-md hover:bg-[#b8202f] transition disabled:opacity-50 text-sm"
                      >
                        {t('minigame.create')}
                      </button>
                      <button 
                        onClick={() => {
                          setShowNewFolderInput(false);
                          setNewFolderName('');
                        }} 
                        className="flex-1 p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setShowFolderSelect(false);
                  setWrongWordToAdd(null);
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                  proceedToNextQuestion();
                }} 
                className="mt-4 w-full p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                {t('minigame.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinigameView;

