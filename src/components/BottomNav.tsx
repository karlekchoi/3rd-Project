
import React from 'react';
import { View } from '../types';
import { BookOpenIcon, HomeIcon, Gamepad2Icon, NotebookIcon, GraduationCapIcon, SettingsIcon } from './shared/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  label: string;
  children: React.ReactNode;
}> = ({ view, currentView, setCurrentView, label, children }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center flex-1 pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-[#D72638]' : 'text-gray-500 hover:text-[#D72638]'
      }`}
    >
      {children}
      <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-red-100 flex justify-around items-center z-20 shadow-lg">
      <NavItem view={View.Dictionary} currentView={currentView} setCurrentView={setCurrentView} label={t('nav.dictionary')}>
        <HomeIcon />
      </NavItem>
      <NavItem view={View.KoreanStudy} currentView={currentView} setCurrentView={setCurrentView} label={t('nav.koreanStudy')}>
        <GraduationCapIcon />
      </NavItem>
      <NavItem view={View.Games} currentView={currentView} setCurrentView={setCurrentView} label={t('nav.games')}>
        <Gamepad2Icon />
      </NavItem>
      <NavItem view={View.Books} currentView={currentView} setCurrentView={setCurrentView} label={t('nav.books')}>
        <BookOpenIcon />
      </NavItem>
      <NavItem view={View.Vocabulary} currentView={currentView} setCurrentView={setCurrentView} label={t('nav.vocabulary')}>
        <NotebookIcon />
      </NavItem>
      <NavItem view={View.Settings} currentView={currentView} setCurrentView={setCurrentView} label={t('nav.settings')}>
        <SettingsIcon />
      </NavItem>
    </nav>
  );
};

export default BottomNav;
