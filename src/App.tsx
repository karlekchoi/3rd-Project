
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
        className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-red-200 hover:border-[#D72638] transition-all bg-white shadow-sm"
        title="언어 선택"
      >
        <span className="text-lg">{langFlags[language] || '🌐'}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{langNames[language]}</span>
        <svg className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-gradient-to-r from-[#5D7052] to-[#4A5D3F] h-32"></div>
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
                  <div className="w-full h-full bg-gradient-to-br from-[#5D7052] to-[#4A5D3F] flex items-center justify-center text-white font-bold text-5xl">
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
        <header className="bg-white shadow-sm border-b-2 border-red-100">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                <div 
                  className="flex items-center gap-2 cursor-pointer" 
                  onClick={() => setCurrentView(View.Home)}
                >
                  <span className="text-[#D72638] text-2xl">🌺</span>
                  <h1 className="text-2xl font-bold text-[#293241]">{t('common.appTitle')}</h1>
                </div>

                <nav className="hidden md:flex gap-6 items-center text-base font-semibold text-[#293241]">
                    <button onClick={() => setCurrentView(View.Dictionary)} className={`hover:text-[#D72638] transition ${currentView === View.Dictionary ? 'text-[#D72638]' : ''}`}>{t('nav.dictionary')}</button>
                    <button onClick={() => setCurrentView(View.KoreanStudy)} className={`hover:text-[#D72638] transition ${currentView === View.KoreanStudy ? 'text-[#D72638]' : ''}`}>{t('nav.koreanStudy')}</button>
                    <button onClick={() => setCurrentView(View.Games)} className={`hover:text-[#D72638] transition ${currentView === View.Games ? 'text-[#D72638]' : ''}`}>{t('nav.games')}</button>
                    <button onClick={() => setCurrentView(View.Books)} className={`hover:text-[#D72638] transition ${currentView === View.Books ? 'text-[#D72638]' : ''}`}>{t('nav.books')}</button>
                    <button onClick={() => setCurrentView(View.Vocabulary)} className={`hover:text-[#D72638] transition ${currentView === View.Vocabulary ? 'text-[#D72638]' : ''}`}>{t('nav.vocabulary')}</button>
                </nav>

                <div className="flex items-center gap-3">
                    {currentUser ? (
                      <>
                        {/* 언어 선택 드롭다운 */}
                        <LanguageSelector language={language} setLanguage={setLanguage} />
                        
                        <span className="text-sm text-[#5D4037] font-medium hidden md:inline">
                          {currentUser.nickname}{t('common.nicknameSuffix')}
                        </span>
                        <button 
                          onClick={() => setCurrentView(View.Settings)}
                          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#5D7052] hover:border-[#D72638] transition-all hover:scale-110 shadow-md"
                          title={t('settings.myPage')}
                        >
                          {currentUser.profileImage ? (
                            <img 
                              src={currentUser.profileImage} 
                              alt={currentUser.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#5D7052] to-[#4A5D3F] flex items-center justify-center text-white font-bold text-lg">
                              {currentUser.nickname.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setCurrentView(View.Settings)}
                        className="px-5 py-2 bg-[#5D7052] text-white rounded-full font-bold hover:bg-[#4A5D3F] transition shadow-md"
                      >
                        {t('common.login')}
                      </button>
                    )}
                </div>
            </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          {renderView()}
        </main>

        {/* Footer */}
        <footer className="bg-[#E8DCC8] text-[#293241] mt-auto">
             {/* Dancheong Pattern Line Top */}
             <div className="h-4 w-full bg-repeat-x" style={{
                backgroundImage: 'linear-gradient(90deg, #D72638 0%, #D72638 12.5%, #fff 12.5%, #fff 25%, #3D5A80 25%, #3D5A80 37.5%, #fff 37.5%, #fff 50%, #00916E 50%, #00916E 62.5%, #fff 62.5%, #fff 75%, #F4D35E 75%, #F4D35E 87.5%, #fff 87.5%, #fff 100%)',
                backgroundSize: '80px 100%',
                borderTop: '3px solid #3E2723',
                borderBottom: '3px solid #3E2723'
            }}></div>

            <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center">
                <div className="flex gap-10 mb-6 md:mb-0 text-sm font-semibold">
                    <a href="#" className="hover:text-[#D72638] transition">About Us</a>
                    <a href="#" className="hover:text-[#D72638] transition">Contact</a>
                    <a href="#" className="hover:text-[#D72638] transition">Privacy Policy</a>
                </div>
                
                <div className="flex gap-4">
                     {/* Social Media Icons */}
                     <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E1306C] to-[#C13584] text-white flex items-center justify-center hover:scale-110 transition shadow-md">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                     </a>
                     <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition shadow-md">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                     </a>
                     <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-md">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                     </a>
                     <a href="#" className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition shadow-md">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                     </a>
                </div>
            </div>
            <div className="text-center pb-6 text-xs text-[#5D4037] opacity-70">
                © 2024 Hangeul Garden. All rights reserved.
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
        <div className="container mx-auto max-w-sm">
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
