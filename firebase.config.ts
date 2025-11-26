import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 설정
// TODO: Firebase Console에서 받은 실제 값으로 교체하세요!
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Firebase 초기화
let app: any = null;
let auth: any = null;
let googleProvider: any = null;

// Firebase 설정이 있는지 확인
const hasFirebaseConfig = firebaseConfig.apiKey && 
                          firebaseConfig.apiKey !== "YOUR_API_KEY" &&
                          !firebaseConfig.apiKey.includes('your-');

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // 한국어 설정
    auth.languageCode = 'ko';
    
    console.log("✅ Firebase 초기화 성공! Google 로그인 사용 가능 🔐");
  } catch (error) {
    console.error("❌ Firebase 초기화 실패:", error);
    console.warn("⚠️  Firebase 설정을 확인하세요.");
  }
} else {
  console.warn("⚠️  Firebase가 설정되지 않았습니다.");
  console.info("💡 Google 로그인을 사용하려면 Firebase를 설정하세요:");
  console.info("   1. https://console.firebase.google.com/ 접속");
  console.info("   2. 프로젝트 생성");
  console.info("   3. .env.local 파일에 Firebase 설정 추가");
  console.info("   4. 자세한 내용: FIREBASE_SETUP.md 참고");
}

export { auth, googleProvider };
export default app;

