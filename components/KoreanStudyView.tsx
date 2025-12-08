
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GraduationCapIcon, ArrowLeftIcon, MicIcon, PlayIcon } from './shared/Icons';
import { recognizeHandwriting, transcribeAudio } from '../services/geminiService';
import Loader from './shared/Loader';

// Lesson Groups Data
const lessonGroups = [
    {
        id: 'consonants',
        title: '1단계: 자음 (Consonants)',
        description: '기본 자음 14자와 된소리 5개를 배워보세요.',
    },
    {
        id: 'vowels',
        title: '2단계: 모음 (Vowels)',
        description: '기본 모음 10개와 이중 모음 11개를 익혀보세요.',
    },
    {
        id: 'words',
        title: '3단계: 단어 (Words)',
        description: '필수적인 첫 단어들로 어휘력을 길러보세요.',
    }
];

// Expanded Lesson Data - Full Set
const lessons = [
    // --- Consonants (19) ---
    { char: 'ㄱ', name: '기역', roman: 'g/k', audioText: '기역', quizOptions: ['ㄱ', 'ㄴ', 'ㄷ', 'ㅏ'], group: 'consonants' },
    { char: 'ㄴ', name: '니은', roman: 'n', audioText: '니은', quizOptions: ['ㄴ', 'ㄷ', 'ㄹ', 'ㅓ'], group: 'consonants' },
    { char: 'ㄷ', name: '디귿', roman: 'd/t', audioText: '디귿', quizOptions: ['ㄷ', 'ㄹ', 'ㅁ', 'ㅗ'], group: 'consonants' },
    { char: 'ㄹ', name: '리을', roman: 'r/l', audioText: '리을', quizOptions: ['ㄹ', 'ㅁ', 'ㅂ', 'ㅜ'], group: 'consonants' },
    { char: 'ㅁ', name: '미음', roman: 'm', audioText: '미음', quizOptions: ['ㅁ', 'ㅂ', 'ㅅ', 'ㅡ'], group: 'consonants' },
    { char: 'ㅂ', name: '비읍', roman: 'b/p', audioText: '비읍', quizOptions: ['ㅂ', 'ㅅ', 'ㅇ', 'ㅣ'], group: 'consonants' },
    { char: 'ㅅ', name: '시옷', roman: 's', audioText: '시옷', quizOptions: ['ㅅ', 'ㅇ', 'ㅈ', 'ㅐ'], group: 'consonants' },
    { char: 'ㅇ', name: '이응', roman: 'ng', audioText: '이응', quizOptions: ['ㅇ', 'ㅈ', 'ㅊ', 'ㅔ'], group: 'consonants' },
    { char: 'ㅈ', name: '지읒', roman: 'j', audioText: '지읒', quizOptions: ['ㅈ', 'ㅊ', 'ㅋ', 'ㅚ'], group: 'consonants' },
    { char: 'ㅊ', name: '치읓', roman: 'ch', audioText: '치읓', quizOptions: ['ㅊ', 'ㅋ', 'ㅌ', 'ㅟ'], group: 'consonants' },
    { char: 'ㅋ', name: '키읔', roman: 'k', audioText: '키읔', quizOptions: ['ㅋ', 'ㅌ', 'ㅍ', 'ㅑ'], group: 'consonants' },
    { char: 'ㅌ', name: '티읕', roman: 't', audioText: '티읕', quizOptions: ['ㅌ', 'ㅍ', 'ㅎ', 'ㅕ'], group: 'consonants' },
    { char: 'ㅍ', name: '피읖', roman: 'p', audioText: '피읖', quizOptions: ['ㅍ', 'ㅎ', 'ㄱ', 'ㅛ'], group: 'consonants' },
    { char: 'ㅎ', name: '히읗', roman: 'h', audioText: '히읗', quizOptions: ['ㅎ', 'ㄱ', 'ㄴ', 'ㅠ'], group: 'consonants' },
    { char: 'ㄲ', name: '쌍기역', roman: 'kk', audioText: '쌍기역', quizOptions: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ'], group: 'consonants' },
    { char: 'ㄸ', name: '쌍디귿', roman: 'tt', audioText: '쌍디귿', quizOptions: ['ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'], group: 'consonants' },
    { char: 'ㅃ', name: '쌍비읍', roman: 'pp', audioText: '쌍비읍', quizOptions: ['ㅃ', 'ㅆ', 'ㅉ', 'ㄲ'], group: 'consonants' },
    { char: 'ㅆ', name: '쌍시옷', roman: 'ss', audioText: '쌍시옷', quizOptions: ['ㅆ', 'ㅉ', 'ㄲ', 'ㄸ'], group: 'consonants' },
    { char: 'ㅉ', name: '쌍지읒', roman: 'jj', audioText: '쌍지읒', quizOptions: ['ㅉ', 'ㄲ', 'ㄸ', 'ㅃ'], group: 'consonants' },

    // --- Vowels (21) ---
    { char: 'ㅏ', name: '아', roman: 'a', audioText: '아', quizOptions: ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ'], group: 'vowels' },
    { char: 'ㅑ', name: '야', roman: 'ya', audioText: '야', quizOptions: ['ㅑ', 'ㅓ', 'ㅕ', 'ㅗ'], group: 'vowels' },
    { char: 'ㅓ', name: '어', roman: 'eo', audioText: '어', quizOptions: ['ㅓ', 'ㅕ', 'ㅗ', 'ㅛ'], group: 'vowels' },
    { char: 'ㅕ', name: '여', roman: 'yeo', audioText: '여', quizOptions: ['ㅕ', 'ㅗ', 'ㅛ', 'ㅜ'], group: 'vowels' },
    { char: 'ㅗ', name: '오', roman: 'o', audioText: '오', quizOptions: ['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ'], group: 'vowels' },
    { char: 'ㅛ', name: '요', roman: 'yo', audioText: '요', quizOptions: ['ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'], group: 'vowels' },
    { char: 'ㅜ', name: '우', roman: 'u', audioText: '우', quizOptions: ['ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'], group: 'vowels' },
    { char: 'ㅠ', name: '유', roman: 'yu', audioText: '유', quizOptions: ['ㅠ', 'ㅡ', 'ㅣ', 'ㅐ'], group: 'vowels' },
    { char: 'ㅡ', name: '으', roman: 'eu', audioText: '으', quizOptions: ['ㅡ', 'ㅣ', 'ㅐ', 'ㅔ'], group: 'vowels' },
    { char: 'ㅣ', name: '이', roman: 'i', audioText: '이', quizOptions: ['ㅣ', 'ㅐ', 'ㅔ', 'ㅏ'], group: 'vowels' },
    { char: 'ㅐ', name: '애', roman: 'ae', audioText: '애', quizOptions: ['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'], group: 'vowels' },
    { char: 'ㅒ', name: '얘', roman: 'yae', audioText: '얘', quizOptions: ['ㅒ', 'ㅖ', 'ㅐ', 'ㅔ'], group: 'vowels' },
    { char: 'ㅔ', name: '에', roman: 'e', audioText: '에', quizOptions: ['ㅔ', 'ㅐ', 'ㅖ', 'ㅒ'], group: 'vowels' },
    { char: 'ㅖ', name: '예', roman: 'ye', audioText: '예', quizOptions: ['ㅖ', 'ㅒ', 'ㅔ', 'ㅐ'], group: 'vowels' },
    { char: 'ㅘ', name: '와', roman: 'wa', audioText: '와', quizOptions: ['ㅘ', 'ㅙ', 'ㅝ', 'ㅞ'], group: 'vowels' },
    { char: 'ㅙ', name: '왜', roman: 'wae', audioText: '왜', quizOptions: ['ㅙ', 'ㅚ', 'ㅘ', 'ㅟ'], group: 'vowels' },
    { char: 'ㅚ', name: '외', roman: 'oe', audioText: '외', quizOptions: ['ㅚ', 'ㅟ', 'ㅙ', 'ㅝ'], group: 'vowels' },
    { char: 'ㅝ', name: '워', roman: 'wo', audioText: '워', quizOptions: ['ㅝ', 'ㅞ', 'ㅘ', 'ㅢ'], group: 'vowels' },
    { char: 'ㅞ', name: '웨', roman: 'we', audioText: '웨', quizOptions: ['ㅞ', 'ㅝ', 'ㅟ', 'ㅚ'], group: 'vowels' },
    { char: 'ㅟ', name: '위', roman: 'wi', audioText: '위', quizOptions: ['ㅟ', 'ㅢ', 'ㅚ', 'ㅙ'], group: 'vowels' },
    { char: 'ㅢ', name: '의', roman: 'ui', audioText: '의', quizOptions: ['ㅢ', 'ㅟ', 'ㅣ', 'ㅡ'], group: 'vowels' },

    // --- Words (10) ---
    { char: '가구', name: 'Furniture', roman: 'gagu', audioText: '가구', quizOptions: ['가구', '구두', '고기', '아기'], group: 'words' },
    { char: '나비', name: 'Butterfly', roman: 'nabi', audioText: '나비', quizOptions: ['나비', '나이', '다리', '머리'], group: 'words' },
    { char: '다리', name: 'Leg/Bridge', roman: 'dari', audioText: '다리', quizOptions: ['다리', '라디오', '오리', '우리'], group: 'words' },
    { char: '라디오', name: 'Radio', roman: 'radio', audioText: '라디오', quizOptions: ['라디오', '피아노', '비디오', '오디오'], group: 'words' },
    { char: '모자', name: 'Hat', roman: 'moja', audioText: '모자', quizOptions: ['모자', '바지', '사자', '의자'], group: 'words' },
    { char: '바나나', name: 'Banana', roman: 'banana', audioText: '바나나', quizOptions: ['바나나', '피아노', '어머니', '아버지'], group: 'words' },
    { char: '사자', name: 'Lion', roman: 'saja', audioText: '사자', quizOptions: ['사자', '새우', '치즈', '바지'], group: 'words' },
    { char: '아기', name: 'Baby', roman: 'agi', audioText: '아기', quizOptions: ['아기', '야구', '여우', '우유'], group: 'words' },
    { char: '지도', name: 'Map', roman: 'jido', audioText: '지도', quizOptions: ['지도', '지우개', '구두', '포도'], group: 'words' },
    { char: '토마토', name: 'Tomato', roman: 'tomato', audioText: '토마토', quizOptions: ['토마토', '포도', '코', '타조'], group: 'words' },
];

const StrokeAnimation: React.FC<{ char: string }> = ({ char }) => {
    // Basic strokes for animation.
    const paths: Record<string, string[]> = {
        'ㄱ': ["M 25 25 L 75 25 L 75 75"],
        'ㄴ': ["M 25 25 L 25 75 L 75 75"],
        'ㄷ': ["M 25 25 L 75 25", "M 25 25 L 25 75", "M 25 75 L 75 75"],
        'ㄹ': ["M 25 25 L 75 25", "M 25 50 L 75 50", "M 25 75 L 75 75", "M 25 25 L 25 50", "M 75 50 L 75 75"],
        'ㅁ': ["M 25 25 L 25 75", "M 25 25 L 75 25", "M 75 25 L 75 75", "M 25 75 L 75 75"],
        'ㅂ': ["M 25 25 L 25 75", "M 75 25 L 75 75", "M 25 50 L 75 50", "M 25 75 L 75 75"],
        'ㅅ': ["M 50 25 L 25 75", "M 50 25 L 75 75"],
        'ㅇ': ["M 50 25 A 25 25 0 1 0 50 75 A 25 25 0 1 0 50 25"],
        'ㅈ': ["M 25 25 L 75 25", "M 50 25 L 25 75", "M 50 25 L 75 75"],
        'ㅊ': ["M 25 20 L 75 20", "M 25 35 L 75 35", "M 50 35 L 25 80", "M 50 35 L 75 80"],
        'ㅋ': ["M 25 25 L 75 25 L 75 75", "M 25 50 L 75 50"],
        'ㅌ': ["M 25 25 L 75 25", "M 25 50 L 75 50", "M 25 25 L 25 75", "M 25 75 L 75 75"],
        'ㅍ': ["M 25 25 L 75 25", "M 25 75 L 75 75", "M 35 25 L 35 75", "M 65 25 L 65 75"],
        'ㅎ': ["M 25 20 L 75 20", "M 25 35 L 75 35", "M 50 50 A 15 15 0 1 0 50 80 A 15 15 0 1 0 50 50"],
        'ㅏ': ["M 50 20 L 50 80", "M 50 50 L 80 50"],
        'ㅑ': ["M 40 20 L 40 80", "M 40 40 L 80 40", "M 40 60 L 80 60"],
        'ㅓ': ["M 50 20 L 50 80", "M 20 50 L 50 50"],
        'ㅕ': ["M 60 20 L 60 80", "M 20 40 L 60 40", "M 20 60 L 60 60"],
        'ㅗ': ["M 50 20 L 50 50", "M 20 50 L 80 50"],
        'ㅛ': ["M 40 20 L 40 50", "M 60 20 L 60 50", "M 20 50 L 80 50"],
        'ㅜ': ["M 20 50 L 80 50", "M 50 50 L 50 80"],
        'ㅠ': ["M 20 40 L 80 40", "M 40 40 L 40 80", "M 60 40 L 60 80"],
        'ㅡ': ["M 20 50 L 80 50"],
        'ㅣ': ["M 50 20 L 50 80"],
    };

    // Generic fallback path for characters without specific animations
    const defaultPath = ["M 20 20 L 80 20 L 80 80 L 20 80 Z"];
    
    const strokeData = paths[char] || defaultPath;
    
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <g fill="none" stroke="#D7263840" strokeWidth="4">
                {strokeData.map((d, i) => <path key={`guide-${i}`} d={d} />)}
            </g>
            <g fill="none" stroke="#D72638" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {strokeData.map((d, i) => (
                    <path key={`stroke-${i}`} d={d} className="stroke-draw" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
            </g>
            <style>{`
                .stroke-draw {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: draw 1.5s ease-in-out forwards;
                }
                @keyframes draw {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </svg>
    );
};

const WritingCanvas: React.FC<{ char: string; onCorrect: () => void; }> = ({ char, onCorrect }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const { t } = useLanguage();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };
    
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        setHasDrawn(false);
        lastPointRef.current = null;
        console.log("Canvas cleared");
    }, []);

    const checkWriting = useCallback(async () => {
        if (!hasDrawn || isChecking) {
            console.log("Cannot check:", { hasDrawn, isChecking });
            return;
        }
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsChecking(true);
        
        try {
            const base64Image = canvas.toDataURL('image/png').split(',')[1];
            const recognizedChar = await recognizeHandwriting(base64Image);
            
            console.log(`예상: "${char}", 인식: "${recognizedChar}"`);
            
            // 한글만 추출 (자음, 모음, 완성형 한글)
            const koreanOnly = recognizedChar.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g)?.join('') || '';
            
            console.log(`한글 추출: "${koreanOnly}"`);
            
            const normalized = koreanOnly.trim();
            const expected = char.trim();
            
            if (normalized === expected || normalized.includes(expected) || expected.includes(normalized)) {
                showToast(t('koreanStudy.writingSuccess'), 'success');
                setTimeout(() => {
                    onCorrect();
                    clearCanvas();
                }, 1500);
            } else {
                showToast(`${t('koreanStudy.writingFailure')} (인식: ${koreanOnly || recognizedChar})`, 'error');
            }
        } catch (err) {
            console.error("Handwriting recognition failed", err);
            showToast(t('dictionary.handwritingError'), 'error');
        } finally {
            setIsChecking(false);
        }
    }, [hasDrawn, isChecking, char, t, onCorrect, clearCanvas]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement?.getBoundingClientRect();
        
        if (rect) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                // 초기 배경 설정
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, rect.width, rect.height);
            }
        }

        const getPointerPosition = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        };

        const handlePointerDown = (event: PointerEvent) => {
            event.preventDefault();
            canvas.setPointerCapture(event.pointerId);

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const { x, y } = getPointerPosition(event);
            
            lastPointRef.current = { x, y };
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            isDrawingRef.current = true;
            setHasDrawn(true);
            console.log("Drawing started, hasDrawn set to true");
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!isDrawingRef.current) return;
            event.preventDefault();
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const { x, y } = getPointerPosition(event);
            
            if (lastPointRef.current) {
                const midX = (lastPointRef.current.x + x) / 2;
                const midY = (lastPointRef.current.y + y) / 2;
                ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(midX, midY);
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            
            lastPointRef.current = { x, y };
        };

        const handlePointerUp = () => {
            isDrawingRef.current = false;
            lastPointRef.current = null;
            console.log("Drawing stopped");
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerUp);
        };
    }, []);

    return (
        <div className="relative w-full h-48 bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-8xl text-gray-200 pointer-events-none select-none font-bold opacity-30 z-0">{char}</div>
            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none relative z-10" style={{ touchAction: 'none' }} />
            <div className="absolute bottom-2 right-2 flex gap-2 z-20 pointer-events-auto">
                <button 
                    onClick={clearCanvas} 
                    className="bg-gray-500 text-white px-4 py-2 rounded-md shadow text-sm font-semibold hover:bg-gray-600 transition"
                >
                    {t('koreanStudy.clear')}
                </button>
                <button 
                    onClick={checkWriting} 
                    disabled={!hasDrawn || isChecking}
                    className="bg-[#D72638] text-white px-4 py-2 rounded-md shadow text-sm font-semibold hover:bg-[#b8202f] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {isChecking ? '확인 중...' : '확인하기'}
                </button>
            </div>
            <div className="absolute top-2 left-2 text-xs text-gray-500 z-20 pointer-events-none">
                {hasDrawn ? '✓ 그리기 완료' : '글자를 그려주세요'}
            </div>
            {toast && (
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-bold shadow-xl text-base z-10 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}


const LessonDetailView: React.FC<{ lesson: typeof lessons[0]; onComplete: () => void; onBack: () => void; }> = ({ lesson, onComplete, onBack }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('reading');
    const [progress, setProgress] = useState({ reading: false, writing: false, speaking: false });
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => {
            audioContextRef.current?.close();
        }
    }, []);
    
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setProgress(prev => ({ ...prev, [tab]: true }));
    };

    const playAudio = async () => {
        setIsLoadingAudio(true);
        try {
            // Web Speech API를 직접 사용 (더 안정적!)
            const utterance = new SpeechSynthesisUtterance(lesson.audioText);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            utterance.onend = () => {
                setIsLoadingAudio(false);
                setProgress(prev => ({ ...prev, reading: true }));
            };
            
            utterance.onerror = (error) => {
                console.error("TTS error:", error);
                setIsLoadingAudio(false);
                alert("음성 재생에 실패했습니다. 브라우저가 음성 합성을 지원하는지 확인해주세요.");
            };
            
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Audio generation failed:", error);
            setIsLoadingAudio(false);
            alert("음성 생성에 실패했습니다. 브라우저가 Web Speech API를 지원하지 않을 수 있습니다.");
        }
    };
    
    const testMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            alert('✅ 마이크 권한이 허용되었습니다! 이제 말하기 버튼을 사용할 수 있습니다.');
        } catch (err: any) {
            console.error('마이크 권한 오류:', err);
            if (err.name === 'NotAllowedError') {
                alert('❌ 마이크 권한이 거부되었습니다.\n\n브라우저 주소창 왼쪽의 🔒 아이콘을 클릭하여\n마이크 권한을 "허용"으로 변경해주세요.');
            } else if (err.name === 'NotFoundError') {
                alert('❌ 마이크를 찾을 수 없습니다.\n마이크가 연결되어 있는지 확인해주세요.');
            } else {
                alert('❌ 마이크 접근 오류:\n' + err.message);
            }
        }
    };

    const handlePronunciation = async () => {
        // 이미 녹음 중이면 중지
        if (isListening) {
            mediaRecorderRef.current?.stop();
            return;
        }

        try {
            // 마이크 권한 요청
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // MediaRecorder 생성
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });
            
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('녹음 중지, Whisper API로 전송 중...');
                setFeedback('🔄 음성 인식 중...');
                
                try {
                    // Blob 생성
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    console.log('Audio Blob:', audioBlob.size, 'bytes');

                    // Whisper API 호출 (context 제공으로 인식 정확도 향상)
                    const context = `${lesson.char} (${lesson.name}, ${lesson.audioText})`;
                    const transcription = await transcribeAudio(audioBlob, context);
                    console.log(`음성 인식 결과: "${transcription}"`);
                    console.log(`기대값: char="${lesson.char}", name="${lesson.name}", audioText="${lesson.audioText}"`);
                    
                    // 결과 비교 (더 유연하게)
                    const normalizedTranscription = transcription.trim().toLowerCase();
                    const targets = [
                        lesson.char.toLowerCase(),
                        lesson.name.toLowerCase(),
                        lesson.audioText.toLowerCase()
                    ];
                    
                    const isMatch = targets.some(target => 
                        normalizedTranscription.includes(target) || 
                        target.includes(normalizedTranscription)
                    );
                    
                    if (isMatch) {
                        setFeedback(`${t('koreanStudy.goodJob')} ✨ (인식: ${transcription})`);
                        setProgress(p => ({...p, speaking: true}));
                    } else {
                        setFeedback(`${t('koreanStudy.tryAgain')} 🤔 (인식: ${transcription})`);
                    }
                } catch (error: any) {
                    console.error('Whisper API 오류:', error);
                    setFeedback(`❌ 음성 인식 실패: ${error.message}`);
                } finally {
                    setIsListening(false);
                    // 스트림 정리
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            // 녹음 시작
            mediaRecorder.start();
            setIsListening(true);
            setFeedback('🎤 ' + t('koreanStudy.speakNow'));
            console.log('녹음 시작...');

            // 3초 후 자동 중지
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, 3000);

        } catch (error: any) {
            console.error('마이크 권한 오류:', error);
            
            let errorMessage = '마이크 권한이 필요합니다.';
            if (error.name === 'NotAllowedError') {
                errorMessage = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '마이크를 찾을 수 없습니다. 마이크 연결을 확인해주세요.';
            }
            
            setFeedback(errorMessage);
            setIsListening(false);
        }
    };

    const handleQuizAnswer = (option: string) => {
        if (option === lesson.char) {
            alert(t('koreanStudy.quizComplete'));
            onComplete();
        } else {
            alert(t('koreanStudy.quizIncorrect'));
        }
    };
    
    const handleWritingCorrect = useCallback(() => {
        setProgress(prev => ({...prev, writing: true}));
    }, []);

    return (
        <div className="animate-fade-in-up bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
            <button onClick={onBack} className="flex items-center gap-2 text-[#D72638] font-semibold mb-4 hover:text-[#b8202f] transition"><ArrowLeftIcon /> {t('koreanStudy.backToList')}</button>
            <div className="text-center mb-6">
                <h2 className="text-6xl font-bold mb-2 text-[#D72638]">{lesson.char}</h2>
                <p className="text-xl text-gray-600 font-medium">{lesson.name} <span className="text-gray-400">|</span> {lesson.roman}</p>
            </div>
            
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('reading')} className={`flex-1 py-3 font-semibold transition ${activeTab === 'reading' ? 'border-b-4 border-[#D72638] text-[#D72638]' : 'text-gray-500 hover:text-gray-800'}`}>{t('koreanStudy.reading')}</button>
                <button onClick={() => setActiveTab('writing')} className={`flex-1 py-3 font-semibold transition ${activeTab === 'writing' ? 'border-b-4 border-[#D72638] text-[#D72638]' : 'text-gray-500 hover:text-gray-800'}`}>{t('koreanStudy.writing')}</button>
                <button onClick={() => setActiveTab('speaking')} className={`flex-1 py-3 font-semibold transition ${activeTab === 'speaking' ? 'border-b-4 border-[#D72638] text-[#D72638]' : 'text-gray-500 hover:text-gray-800'}`}>{t('koreanStudy.speaking')}</button>
                {progress.reading && progress.writing && progress.speaking &&
                    <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 font-semibold transition ${activeTab === 'quiz' ? 'border-b-4 border-[#D72638] text-[#D72638]' : 'text-gray-500 hover:text-gray-800'}`}>{t('koreanStudy.quiz')}</button>
                }
            </div>

            {activeTab === 'reading' && <div className="text-center p-8 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-xl mb-4">{t('koreanStudy.readingTitle', { char: lesson.char })}</h3>
                <p className="mb-8 text-gray-600">{t('koreanStudy.readingDescription')}</p>
                <button onClick={playAudio} disabled={isLoadingAudio} className="w-20 h-20 bg-[#D72638] text-white rounded-full shadow-sm hover:bg-[#b8202f] hover:scale-105 transition flex items-center justify-center mx-auto disabled:bg-[#d72638]/50">
                    {isLoadingAudio ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <PlayIcon />}
                </button>
            </div>}

            {activeTab === 'writing' && <div className="p-4">
                <h3 className="font-bold text-xl mb-4 text-center">{t('koreanStudy.writingTitle', { char: lesson.char })}</h3>
                <p className="mb-6 text-center text-gray-600">{t('koreanStudy.writingDescription')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="w-full h-48 bg-white rounded-xl shadow-sm border p-4"><StrokeAnimation char={lesson.char} /></div>
                    <WritingCanvas char={lesson.char} onCorrect={handleWritingCorrect} />
                </div>
            </div>}

            {activeTab === 'speaking' && <div className="text-center p-8 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-xl mb-4">{t('koreanStudy.speakingTitle', { char: lesson.char })}</h3>
                <p className="mb-8 text-gray-600">{t('koreanStudy.speakingDescription')}</p>
                
                {/* 마이크 권한 안내 */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <p className="font-semibold text-blue-900 mb-2">🎤 마이크 권한 필요</p>
                    <p className="text-blue-800 mb-3">음성 인식을 위해 마이크 권한이 필요합니다.</p>
                    
                    <button 
                        onClick={testMicrophone}
                        className="mb-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                    >
                        🔧 마이크 권한 테스트
                    </button>
                    
                    <details className="text-left text-blue-700">
                        <summary className="cursor-pointer font-medium mb-2">권한 설정 방법 보기</summary>
                        <div className="pl-4 space-y-2 text-xs">
                            <p><strong>Chrome:</strong></p>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>주소창 왼쪽의 🔒 (자물쇠) 아이콘 클릭</li>
                                <li>"마이크" 항목을 "허용"으로 변경</li>
                                <li>페이지 새로고침</li>
                            </ol>
                            <p className="mt-2"><strong>또는:</strong></p>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>chrome://settings/content/microphone 접속</li>
                                <li>이 사이트를 허용 목록에 추가</li>
                            </ol>
                        </div>
                    </details>
                </div>

                <button onClick={handlePronunciation} className={`w-20 h-20 rounded-full shadow-sm transition flex items-center justify-center mx-auto ${isListening ? 'bg-[#D72638] text-white animate-pulse' : 'bg-[#D72638] text-white hover:bg-[#b8202f] hover:scale-105'}`}>
                    <MicIcon/>
                </button>
                <p className="mt-4 text-sm text-gray-600 font-semibold">
                    {isListening ? '🎤 녹음 중... (3초 후 자동 중지)' : '🎙️ 마이크 버튼을 클릭하고 발음해주세요'}
                </p>
                {isListening && <p className="mt-2 text-xs text-gray-500">또는 버튼을 다시 클릭하면 즉시 중지됩니다</p>}
                {feedback && <p className="mt-6 font-bold text-lg text-[#D72638] animate-fade-in">{feedback}</p>}
            </div>}
            
            {activeTab === 'quiz' && <div className="text-center p-8">
                <h3 className="font-bold text-xl mb-6">{t('koreanStudy.quizTitle', { char: lesson.char })}</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {lesson.quizOptions.map(opt => (
                        <button key={opt} onClick={() => handleQuizAnswer(opt)} className="p-6 bg-white border-2 border-red-100 rounded-xl text-3xl font-bold hover:bg-red-50 hover:border-[#D72638] transition shadow-sm text-gray-700">
                            {opt}
                        </button>
                    ))}
                </div>
            </div>}
        </div>
    );
};


const KoreanStudyView: React.FC = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const { t } = useLanguage();
    const [selectedLesson, setSelectedLesson] = useState<typeof lessons[0] | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    const progress = currentUser?.hangulProgress ?? { 'ㄱ': 'unlocked' };

    const getGroupProgress = (groupId: string) => {
        const groupLessons = lessons.filter(l => l.group === groupId);
        if (groupLessons.length === 0) return 0;
        const completedCount = groupLessons.filter(l => progress[l.char] === 'completed').length;
        return Math.round((completedCount / groupLessons.length) * 100);
    };

    const handleGroupSelect = (groupId: string) => {
        setSelectedGroup(groupId);
    };

    const handleLessonSelect = (lesson: typeof lessons[0]) => {
        setSelectedLesson(lesson);
    };

    const handleLessonComplete = () => {
        if (!selectedLesson || !currentUser) return;
        const newProgress = { ...progress, [selectedLesson.char]: 'completed' as const };
        setCurrentUser({ ...currentUser, hangulProgress: newProgress });
        setSelectedLesson(null);
    };
    
    if (!currentUser) return <Loader />;

    if (selectedLesson) {
        return <LessonDetailView lesson={selectedLesson} onComplete={handleLessonComplete} onBack={() => setSelectedLesson(null)} />;
    }

    if (selectedGroup) {
        const groupLessons = lessons.filter(l => l.group === selectedGroup);
        const currentProgress = getGroupProgress(selectedGroup);
        return (
            <div className="animate-fade-in-up">
                 <button onClick={() => setSelectedGroup(null)} className="flex items-center gap-2 text-[#D72638] font-semibold mb-6 hover:underline">
                    <ArrowLeftIcon /> {t('koreanStudy.backToList')}
                </button>
                <div className="flex justify-between items-end mb-6 border-b-2 border-red-200 pb-4">
                     <h2 className="text-3xl font-bold text-[#D72638]">
                        {lessonGroups.find(g => g.id === selectedGroup)?.title}
                    </h2>
                    <span className="text-lg font-bold text-[#D72638]">{currentProgress}% 완료</span>
                </div>
               
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {groupLessons.map((lesson, idx) => {
                        const status = progress[lesson.char] === 'completed' ? 'completed' : 'unlocked';
                        const pastelColors = [
                          { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
                          { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
                          { bg: 'bg-yellow-50', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
                          { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
                          { bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:bg-green-100' },
                          { bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
                          { bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' }
                        ];
                        const color = pastelColors[idx % pastelColors.length];
                        return (
                            <button key={lesson.char} onClick={() => handleLessonSelect(lesson)}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition shadow-sm border-2 hover:scale-105 hover:shadow-md relative group ${status === 'completed' ? `${color.bg} border-[#D72638]` : `bg-white ${color.border} ${color.hover}`}`}
                            >
                                <span className="text-4xl font-bold text-[#D72638] mb-1">{lesson.char}</span>
                                <span className="text-xs text-gray-500 group-hover:text-[#D72638]">{lesson.name}</span>
                                {status === 'completed' && (
                                    <div className="absolute top-2 right-2 bg-[#D72638] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">✓</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        )
    }

    // 전체 진행률 계산
    const totalLessons = lessons.length;
    const completedLessons = Object.values(progress).filter(s => s === 'completed').length;
    const overallProgress = Math.round((completedLessons / totalLessons) * 100);

    const handleResetProgress = () => {
        if (!currentUser) return;
        
        if (confirm(t('settings.resetProgressConfirm'))) {
            const resetProgress = {
                'ㄱ': 'unlocked' as const,
                'ㄴ': 'locked' as const,
                'ㄷ': 'locked' as const,
                'ㄹ': 'locked' as const,
                'ㅁ': 'locked' as const,
                'ㅂ': 'locked' as const,
                'ㅅ': 'locked' as const,
                'ㅇ': 'locked' as const,
                'ㅈ': 'locked' as const,
                'ㅊ': 'locked' as const,
                'ㅋ': 'locked' as const,
                'ㅌ': 'locked' as const,
                'ㅍ': 'locked' as const,
                'ㅎ': 'locked' as const
            };
            setCurrentUser({ ...currentUser, hangulProgress: resetProgress });
            setSelectedGroup(null);
            alert(t('settings.resetProgressSuccess'));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="max-w-6xl w-full">
                <div className="text-center mb-8">
                     <h1 className="text-4xl font-bold text-[#D72638] mb-3">{t('koreanStudy.startTitle')}</h1>
                     <p className="text-gray-600 mb-4">{t('koreanStudy.startDescription')}</p>
                     
                     {/* 전체 진행률 카드 */}
                     <div className="max-w-md mx-auto bg-gradient-to-r from-[#D72638] to-[#FF6B6B] text-white rounded-2xl p-6 shadow-sm border-2 border-red-100 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold">{t('koreanStudy.overallProgress')}</h3>
                            <button
                                onClick={handleResetProgress}
                                className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-xl transition font-medium"
                                title={t('koreanStudy.resetProgressTitle')}
                            >
                                🔄 {t('settings.resetProgress')}
                            </button>
                        </div>
                        <div className="text-4xl font-bold mb-2">{overallProgress}%</div>
                        <div className="text-sm opacity-95">{completedLessons} / {totalLessons} {t('koreanStudy.lessonsCompleted')}</div>
                        <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-1000" 
                                style={{ width: `${overallProgress}%` }}
                            ></div>
                        </div>
                     </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {lessonGroups.map((group, idx) => {
                        const currentProgress = getGroupProgress(group.id);
                        const pastelColors = [
                          { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100', progressBg: 'bg-blue-100' },
                          { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100', progressBg: 'bg-pink-100' },
                          { bg: 'bg-yellow-50', border: 'border-yellow-200', hover: 'hover:bg-yellow-100', progressBg: 'bg-yellow-100' }
                        ];
                        const color = pastelColors[idx % pastelColors.length];
                        return (
                            <div 
                                key={group.id} 
                                onClick={() => handleGroupSelect(group.id)}
                                className={`${color.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-2 ${color.border} ${color.hover} overflow-hidden flex flex-col md:flex-row items-center p-6 gap-6 group`}
                            >
                                <div className="flex-grow text-center md:text-left w-full">
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                                        <h3 className="text-2xl font-bold text-[#D72638] group-hover:text-[#b8202f] transition-colors">{group.title}</h3>
                                        <span className="text-sm font-bold bg-white border-2 border-[#D72638] px-3 py-1 rounded-full text-[#D72638] mt-2 md:mt-0">{currentProgress}% 완료</span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{group.description}</p>
                                    
                                    <div className={`w-full ${color.progressBg} rounded-full h-3 overflow-hidden`}>
                                        <div 
                                            className="h-full bg-[#D72638] transition-all duration-1000 ease-out" 
                                            style={{ width: `${currentProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="text-gray-400 group-hover:text-[#D72638] transition-colors">
                                    <ArrowLeftIcon />
                                    <style>{` .group:hover svg { transform: rotate(180deg); transition: transform 0.3s; } `}</style>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default KoreanStudyView;
