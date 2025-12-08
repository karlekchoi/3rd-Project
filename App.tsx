
import React, { useState, useCallback } from 'react';
import { View } from './types';
import HomeView from './components/HomeView';
import DictionaryView from './components/DictionaryView';
import BookRecView from './components/BookRecView';
import VocabularyView from './components/VocabularyView';
import MinigameView from './components/MinigameView';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import LoginView from './components/auth/LoginView';
import SignupView from './components/auth/SignupView';
import KoreanStudyView from './components/KoreanStudyView';
import BottomNav from './components/BottomNav';

// 언어 선택 컴포넌트
const LanguageSelector: React.FC<{ language: string; setLanguage: (lang: 'ko' | 'en' | 'ja' | 'zh' | 'vi' | 'fr' | 'sv') => void }> = ({ language, setLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const langNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    vi: 'Tiếng Việt',
    fr: 'Français',
    sv: 'Svenska'
  };
  const langFlags: Record<string, string> = {
    ko: '🇰🇷',
    en: '🇺🇸',
    ja: '🇯🇵',
    zh: '🇨🇳',
    vi: '🇻🇳',
    fr: '🇫🇷',
    sv: '🇸🇪'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 rounded-full border-2 border-red-200 hover:border-[#D72638] transition-all bg-white shadow-sm"
        title="언어 선택"
      >
        <span className="text-base md:text-lg">{langFlags[language] || '🌐'}</span>
        <span className="text-xs md:text-sm font-medium text-gray-700 hidden lg:inline">{langNames[language]}</span>
        <svg className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-red-100 z-20 overflow-hidden">
            {(['ko', 'en', 'ja', 'zh', 'vi', 'fr', 'sv'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition ${
                  language === lang ? 'bg-[#D72638] text-white' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{langFlags[lang]}</span>
                <span className="font-medium">{langNames[lang]}</span>
                {language === lang && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SettingsView: React.FC = () => {
  const { logout, currentUser, setCurrentUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('settings.fileSizeError'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert(t('settings.imageOnly'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCurrentUser({ ...currentUser, profileImage: base64String });
      alert(t('settings.profileImageChanged'));
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pt-10 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#293241] mb-2">{t('settings.myPage')}</h2>
        <p className="text-gray-600">{t('settings.manageProfile')}</p>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-200 via-pink-200 to-red-200 h-32"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col items-center -mt-16">
            {/* 프로필 이미지 */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white cursor-pointer" onClick={handleImageClick}>
                {currentUser.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt={currentUser.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D72638] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-5xl">
                    {currentUser.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs font-semibold">{t('settings.changePhoto')}</p>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-[#293241]">{currentUser.nickname}</h3>
            <p className="text-gray-600 text-sm">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* 계정 정보 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
        <h3 className="text-xl font-bold text-[#D72638] mb-4 flex items-center gap-2">
          <span>👤</span> {t('settings.account')}
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">{t('settings.name')}</span>
            <span className="font-semibold text-[#293241]">{currentUser.fullName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">{t('settings.nickname')}</span>
            <span className="font-semibold text-[#293241]">{currentUser.nickname}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">{t('settings.email')}</span>
            <span className="font-semibold text-[#293241]">{currentUser.email}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600 font-medium">{t('settings.savedWords')}</span>
            <span className="font-semibold text-[#D72638]">
              {currentUser.folders.reduce((total, folder) => total + folder.words.length, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 학습 통계 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
        <h3 className="text-xl font-bold text-[#D72638] mb-4 flex items-center gap-2">
          <span>📊</span> {t('settings.studyStatus')}
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 p-4 rounded-xl text-center border-2 border-red-100">
            <p className="text-[#D72638] font-bold text-2xl">
              {Object.values(currentUser.hangulProgress || {}).filter(s => s === 'completed').length}
            </p>
            <p className="text-gray-600 text-sm mt-1">{t('settings.completedLessons')}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-xl text-center border-2 border-pink-100">
            <p className="text-[#D72638] font-bold text-2xl">{currentUser.folders.length}</p>
            <p className="text-gray-600 text-sm mt-1">{t('settings.folderCount')}</p>
          </div>
        </div>
        
        {/* 학습 진행상황 초기화 버튼 */}
        <button
          onClick={() => {
            if (confirm(t('settings.resetProgressConfirm'))) {
              const resetProgress: Record<string, 'completed' | 'unlocked' | 'locked'> = {
                'ㄱ': 'unlocked',
                'ㄴ': 'locked',
                'ㄷ': 'locked',
                'ㄹ': 'locked',
                'ㅁ': 'locked',
                'ㅂ': 'locked',
                'ㅅ': 'locked',
                'ㅇ': 'locked',
                'ㅈ': 'locked',
                'ㅊ': 'locked',
                'ㅋ': 'locked',
                'ㅌ': 'locked',
                'ㅍ': 'locked',
                'ㅎ': 'locked'
              };
              setCurrentUser({ 
                ...currentUser, 
                hangulProgress: resetProgress 
              });
              alert(t('settings.resetProgressSuccess'));
            }
          }}
          className="w-full px-4 py-2 bg-orange-50 text-orange-600 font-medium rounded-lg hover:bg-orange-100 transition border border-orange-200"
        >
          🔄 {t('settings.resetProgress')}
        </button>
      </div>

      {/* 언어 설정 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
        <h3 className="text-xl font-bold text-[#D72638] mb-4 flex items-center gap-2">
          <span>🌐</span> {t('settings.language')}
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">{t('settings.selectLanguage')}</p>
          <div className="grid grid-cols-2 gap-2">
            {(['ko', 'en', 'ja', 'zh', 'vi', 'fr', 'sv'] as const).map((lang) => {
              const langNames: Record<string, string> = {
                ko: '한국어',
                en: 'English',
                ja: '日本語',
                zh: '中文',
                vi: 'Tiếng Việt',
                fr: 'Français',
                sv: 'Svenska'
              };
              return (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    language === lang
                      ? 'bg-[#D72638] text-white border-[#D72638]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#D72638]'
                  }`}
                >
                  {langNames[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 프로필 수정 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
        <h3 className="text-xl font-bold text-[#D72638] mb-4 flex items-center gap-2">
          <span>✏️</span> {t('settings.editProfile')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.nickname')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentUser.nickname}
                onChange={(e) => setCurrentUser({ ...currentUser, nickname: e.target.value })}
                className="flex-1 px-4 py-2 border-2 border-red-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D72638] focus:border-[#D72638] bg-white"
                placeholder={t('settings.enterNickname')}
                maxLength={20}
              />
              <button
                onClick={() => {
                  if (currentUser.nickname.trim().length < 2) {
                    alert(t('auth.nicknameLengthError'));
                    return;
                  }
                  alert(t('settings.nicknameSaved'));
                }}
                className="px-6 py-2 bg-[#D72638] text-white font-medium rounded-xl hover:bg-[#b8202f] transition shadow-sm"
              >
                {t('settings.save')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('settings.nicknameLength')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.email')}</label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{t('settings.emailCannotChange')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.name')}</label>
            <input
              type="text"
              value={currentUser.fullName}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{t('settings.fullNameCannotChange')}</p>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="space-y-3">
        <button
          onClick={logout}
          className="w-full px-6 py-4 bg-[#D72638] text-white font-bold rounded-xl hover:bg-[#b8202f] transition shadow-sm text-lg"
        >
          🚪 {t('common.logout')}
        </button>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dictionary);
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, logout, setCurrentUser } = useAuth();

  // 🔧 사용자 데이터 검증 및 자동 수정
  React.useEffect(() => {
    if (currentUser) {
      let needsUpdate = false;
      const updatedUser = { ...currentUser };

      // hangulProgress 검증
      if (!updatedUser.hangulProgress || Object.keys(updatedUser.hangulProgress).length < 4) {
        console.log("🔧 사용자 데이터 수정 중: hangulProgress 초기화");
        updatedUser.hangulProgress = {
          'ㄱ': updatedUser.hangulProgress?.['ㄱ'] || 'unlocked',
          'ㄴ': updatedUser.hangulProgress?.['ㄴ'] || 'locked',
          'ㄷ': updatedUser.hangulProgress?.['ㄷ'] || 'locked',
          'ㄹ': updatedUser.hangulProgress?.['ㄹ'] || 'locked',
          'ㅁ': updatedUser.hangulProgress?.['ㅁ'] || 'locked',
          'ㅂ': updatedUser.hangulProgress?.['ㅂ'] || 'locked',
          'ㅅ': updatedUser.hangulProgress?.['ㅅ'] || 'locked',
          'ㅇ': updatedUser.hangulProgress?.['ㅇ'] || 'locked',
          'ㅈ': updatedUser.hangulProgress?.['ㅈ'] || 'locked',
          'ㅊ': updatedUser.hangulProgress?.['ㅊ'] || 'locked',
          'ㅋ': updatedUser.hangulProgress?.['ㅋ'] || 'locked',
          'ㅌ': updatedUser.hangulProgress?.['ㅌ'] || 'locked',
          'ㅍ': updatedUser.hangulProgress?.['ㅍ'] || 'locked',
          'ㅎ': updatedUser.hangulProgress?.['ㅎ'] || 'locked'
        };
        needsUpdate = true;
      }

      // folders 검증
      if (!updatedUser.folders || updatedUser.folders.length === 0) {
        console.log("🔧 사용자 데이터 수정 중: 기본 화단 생성");
        updatedUser.folders = [{ id: Date.now().toString(), name: '기본 화단', words: [] }];
        needsUpdate = true;
      }

      // 변경사항이 있으면 업데이트
      if (needsUpdate) {
        console.log("✅ 사용자 데이터가 자동으로 수정되었습니다!");
        setCurrentUser(updatedUser);
      }
    }
  }, [currentUser?.email]); // email이 변경될 때만 실행

  const renderView = useCallback(() => {
    switch (currentView) {
      case View.Home:
        return <HomeView setCurrentView={setCurrentView} />;
      case View.Dictionary:
        return <DictionaryView />;
      case View.KoreanStudy:
        return <KoreanStudyView />;
      case View.Books:
        return <BookRecView />;
      case View.Games:
        return <MinigameView />;
      case View.Vocabulary:
        return <VocabularyView />;
       case View.Settings:
        return <SettingsView />;
      default:
        return <HomeView setCurrentView={setCurrentView} />;
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Gowun_Dodum']">
        {/* Header */}
        <header className="bg-white shadow-sm border-b-2 border-red-100 relative z-10">
            <div className="container mx-auto px-2 md:px-4 lg:px-6 h-14 md:h-16">
                {/* 웹 레이아웃: 네비게이션 가운데, 버튼 오른쪽 */}
                <div className="hidden md:flex items-center h-full relative">
                    {/* 왼쪽 빈 공간 (균형을 위해) */}
                    <div className="flex-1 min-w-[60px] md:min-w-[80px] lg:min-w-[120px]"></div>
                    
                    {/* 웹 네비게이션 (가운데) */}
                    <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center text-[#293241] gap-2 md:gap-3 lg:gap-4 xl:gap-5 max-w-[calc(100%-200px)] md:max-w-[calc(100%-240px)] lg:max-w-[calc(100%-280px)]">
                        <button onClick={() => setCurrentView(View.Dictionary)} className={`hover:text-[#D72638] transition whitespace-nowrap px-2 md:px-2.5 lg:px-3 text-sm md:text-base lg:text-lg font-semibold flex-shrink-0 tracking-wide ${currentView === View.Dictionary ? 'text-[#D72638]' : ''}`}>{t('nav.dictionary')}</button>
                        <button onClick={() => setCurrentView(View.KoreanStudy)} className={`hover:text-[#D72638] transition whitespace-nowrap px-2 md:px-2.5 lg:px-3 text-sm md:text-base lg:text-lg font-semibold flex-shrink-0 tracking-wide ${currentView === View.KoreanStudy ? 'text-[#D72638]' : ''}`}>
                            <span className="hidden lg:inline">{t('nav.koreanStudy')}</span>
                            <span className="lg:hidden">한국어</span>
                        </button>
                        <button onClick={() => setCurrentView(View.Games)} className={`hover:text-[#D72638] transition whitespace-nowrap px-2 md:px-2.5 lg:px-3 text-sm md:text-base lg:text-lg font-semibold flex-shrink-0 tracking-wide ${currentView === View.Games ? 'text-[#D72638]' : ''}`}>{t('nav.games')}</button>
                        <button onClick={() => setCurrentView(View.Books)} className={`hover:text-[#D72638] transition whitespace-nowrap px-2 md:px-2.5 lg:px-3 text-sm md:text-base lg:text-lg font-semibold flex-shrink-0 tracking-wide ${currentView === View.Books ? 'text-[#D72638]' : ''}`}>{t('nav.books')}</button>
                        <button onClick={() => setCurrentView(View.Vocabulary)} className={`hover:text-[#D72638] transition whitespace-nowrap px-2 md:px-2.5 lg:px-3 text-sm md:text-base lg:text-lg font-semibold flex-shrink-0 tracking-wide ${currentView === View.Vocabulary ? 'text-[#D72638]' : ''}`}>
                            <span className="hidden xl:inline">{t('nav.vocabulary')}</span>
                            <span className="xl:hidden hidden lg:inline">나의 정원</span>
                            <span className="lg:hidden">정원</span>
                        </button>
                    </nav>

                    {/* 오른쪽 버튼들 */}
                    <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 ml-auto flex-shrink-0 min-w-[100px] md:min-w-[120px] lg:min-w-[140px]">
                        {currentUser ? (
                          <>
                            {/* 언어 선택 드롭다운 */}
                            <LanguageSelector language={language} setLanguage={setLanguage} />
                            
                            <span className="text-xs md:text-sm text-[#5D4037] font-medium hidden xl:inline">
                              {currentUser.nickname}{t('common.nicknameSuffix')}
                            </span>
                            <button 
                              onClick={() => setCurrentView(View.Settings)}
                              className="relative w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-red-200 hover:border-[#D72638] transition-all hover:scale-110 shadow-md flex-shrink-0"
                              title={t('settings.myPage')}
                            >
                              {currentUser.profileImage ? (
                                <img 
                                  src={currentUser.profileImage} 
                                  alt={currentUser.nickname}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#D72638] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-sm md:text-base lg:text-lg">
                                  {currentUser.nickname.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setCurrentView(View.Settings)}
                            className="px-3 md:px-4 lg:px-5 py-1.5 md:py-2 bg-[#D72638] text-white rounded-full text-xs md:text-sm lg:text-base font-bold hover:bg-[#b8202f] transition shadow-md whitespace-nowrap"
                          >
                            {t('common.login')}
                          </button>
                        )}
                    </div>
                </div>

                {/* 모바일 레이아웃: 제목 가운데, 버튼 오른쪽 */}
                <div className="md:hidden flex items-center justify-between h-full">
                    {/* 왼쪽 빈 공간 (균형을 위해) */}
                    <div className="flex-1"></div>
                    
                    {/* 가운데 제목 */}
                    <h1 className="text-xl font-bold text-[#D72638] absolute left-1/2 transform -translate-x-1/2">
                        {t('common.appTitle')}
                    </h1>
                    
                    {/* 오른쪽 버튼들 */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        {currentUser ? (
                          <>
                            {/* 언어 선택 드롭다운 */}
                            <LanguageSelector language={language} setLanguage={setLanguage} />
                            
                            <button 
                              onClick={() => setCurrentView(View.Settings)}
                              className="relative w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-red-200 hover:border-[#D72638] transition-all hover:scale-110 shadow-md flex-shrink-0"
                              title={t('settings.myPage')}
                            >
                              {currentUser.profileImage ? (
                                <img 
                                  src={currentUser.profileImage} 
                                  alt={currentUser.nickname}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#D72638] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-sm md:text-base lg:text-lg">
                                  {currentUser.nickname.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setCurrentView(View.Settings)}
                            className="px-5 py-2 bg-[#D72638] text-white rounded-full font-bold hover:bg-[#b8202f] transition shadow-md text-sm"
                          >
                            {t('common.login')}
                          </button>
                        )}
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-7xl">
          {renderView()}
        </main>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden">
          <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t-2 border-red-100 mt-auto">
            <div className="container mx-auto px-6 py-8">
                <div className="text-center">
                    <p className="text-sm text-[#D72638] font-medium">
                        © 2025 Hangeul Garden. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    </div>
  );
}


const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="container mx-auto max-w-md">
          {isLoginView ? (
            <LoginView onSwitchToSignup={() => setIsLoginView(false)} />
          ) : (
            <SignupView onSwitchToLogin={() => setIsLoginView(true)} />
          )}
        </div>
      </div>
    );
  }

  return <MainApp />;
};

export default App;
