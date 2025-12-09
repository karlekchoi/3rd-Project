
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // 로그인 성공 시 AuthContext가 자동으로 currentUser 업데이트
    } catch (err: any) {
      console.error("Google 로그인 오류:", err);
      
      // Firebase 미설정 오류
      if (err.message?.includes('Firebase')) {
        setError(
          '🔐 Google 로그인을 사용하려면 Firebase 설정이 필요합니다.\n\n' +
          '📖 설정 방법은 ENV_SETUP_GUIDE.md 파일을 참고하세요!\n\n' +
          '💡 또는 이메일/비밀번호로 로그인하실 수 있습니다.'
        );
      } else {
        setError(err.message || 'Google 로그인에 실패했습니다.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full border-2 border-red-100">
      <h1 className="text-3xl font-bold text-center text-[#D72638] mb-2 flex items-center justify-center gap-2">
        <span>🌱</span>
        <span>{t('appTitle')}</span>
      </h1>
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">{t('auth.loginTitle')}</h2>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
          <p className="text-[#D72638] text-sm whitespace-pre-line">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border-2 border-red-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#D72638] sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border-2 border-red-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#D72638] sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#D72638] hover:bg-[#b8202f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D72638] disabled:bg-[#d72638]/50"
        >
          {isLoading ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t('auth.or')}</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.googleLogin')}
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t('auth.noAccount')}{' '}
        <button onClick={onSwitchToSignup} className="font-medium text-[#D72638] hover:text-[#b8202f]">
          {t('auth.signupNow')}
        </button>
      </p>
    </div>
  );
};

export default LoginView;
