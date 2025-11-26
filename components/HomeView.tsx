
import React from 'react';
import { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeViewProps {
  setCurrentView: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setCurrentView }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center w-full -mt-8">
      {/* Hero Banner */}
      <div className="w-full relative mb-12">
        {/* Main Banner */}
        <div className="relative w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-3xl overflow-hidden shadow-lg border-2 border-pink-200 min-h-[300px]">
          
          {/* Flowers Decoration - Modern and clean */}
          <div className="absolute bottom-0 left-0 z-30 text-5xl opacity-50" style={{ transform: 'translate(-20px, 30px) rotate(15deg)' }}>🌸</div>
          <div className="absolute bottom-8 left-16 z-30 text-4xl opacity-50" style={{ transform: 'rotate(-10deg)' }}>🌷</div>
          
          <div className="absolute bottom-0 right-0 z-30 text-5xl opacity-50" style={{ transform: 'translate(20px, 30px) rotate(-15deg)' }}>🌻</div>
          <div className="absolute bottom-8 right-16 z-30 text-4xl opacity-50" style={{ transform: 'rotate(10deg)' }}>🌺</div>

          {/* Content */}
          <div className="relative z-40 flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm px-12 py-10 rounded-2xl shadow-lg border-2 border-pink-200 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-[#D72638] mb-4 leading-tight">
                한글정원에 오신 것을 환영합니다!
              </h1>
              <p className="text-lg md:text-xl text-gray-700 font-medium mb-8">
                아름다운 한글의 세계를 탐험하고, 당신의 한국어 실력을 꽃피워 보세요.
              </p>
              <button 
                onClick={() => setCurrentView(View.Dictionary)}
                className="px-10 py-4 bg-gradient-to-r from-[#D72638] to-[#FF6B6B] hover:from-[#b8202f] hover:to-[#D72638] text-white text-xl font-bold rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
              >
                🌱 단어의 씨앗을 심어볼까요?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 mb-16">
        
        {/* 한국어 공부 Card */}
        <button 
          onClick={() => setCurrentView(View.KoreanStudy)}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-md border-2 border-blue-300 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
            {/* Decorative Elements */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-8xl opacity-40">📚</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#D72638] mb-2">📚 한국어 공부</h3>
          <p className="text-sm text-gray-600 font-medium">한글 자음과 모음부터 차근차근 시작해요.</p>
        </button>

        {/* 미니게임 Card */}
        <button 
          onClick={() => setCurrentView(View.Games)}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-md border-2 border-pink-300 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
            {/* Decorative Elements */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-8xl opacity-40">🎮</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#D72638] mb-2">🎮 미니게임</h3>
          <p className="text-sm text-gray-600 font-medium">재미있는 퀴즈로 실력을 테스트해봐요.</p>
        </button>

        {/* 도서 추천 Card */}
        <button 
          onClick={() => setCurrentView(View.Books)}
          className="flex flex-col items-center text-center group"
        >
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-md border-2 border-yellow-300 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
            {/* Decorative Elements */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-8xl opacity-40">📖</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#D72638] mb-2">📖 도서 추천</h3>
          <p className="text-sm text-gray-600 font-medium">한국어 학습에 도움이 되는 책을 추천해요.</p>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
