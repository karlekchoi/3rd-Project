
import React, { useState, useEffect } from 'react';
import { VocabWord } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, RefreshCwIcon } from './shared/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface FlashcardModalProps {
  words: VocabWord[];
  onClose: () => void;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ words, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
  }, [words]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledWords.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length);
  };

  if (shuffledWords.length === 0) return null;

  const currentWord = shuffledWords[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        <div 
            className="w-full h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute w-full h-full backface-hidden flex items-center justify-center">
                    <p className="text-4xl font-bold text-[#D72638]">{currentWord.word}</p>
                </div>
                 <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center text-center">
                    <p className="text-xl">{currentWord.slangMeaning}</p>
                </div>
            </div>
        </div>
        
        <p className="text-center text-gray-500 mt-4">{currentIndex + 1} / {shuffledWords.length}</p>
        
        <div className="flex justify-between items-center mt-4">
          <button onClick={handlePrev} className="p-3 bg-gray-200 rounded-full hover:bg-gray-300"><ArrowLeftIcon /></button>
          <button onClick={() => { setIsFlipped(false); }} className="p-3 text-[#D72638] hover:bg-red-100 rounded-full"><RefreshCwIcon /></button>
          <button onClick={handleNext} className="p-3 bg-gray-200 rounded-full hover:bg-gray-300"><ArrowRightIcon /></button>
        </div>
      </div>
       <style>{`
            .perspective-1000 { perspective: 1000px; }
            .preserve-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>
    </div>
  );
};

export default FlashcardModal;
