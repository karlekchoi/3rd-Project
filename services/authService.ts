
import { User, VocabFolder } from '../types';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';

const USERS_KEY = 'hangul_garden_users';
const CURRENT_USER_KEY = 'hangul_garden_currentUserEmail';

// Helper function to get all users from localStorage
const getUsers = (): Record<string, User> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    return {};
  }
};

// Helper function to save all users to localStorage
const saveUsers = (users: Record<string, User>) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage", error);
  }
};

type SignupDetails = Omit<User, 'folders' | 'hangulProgress'>;

export const authService = {
  signup: (details: SignupDetails): Promise<User> => {
    return new Promise((resolve, reject) => {
      const users = getUsers();
      if (users[details.email]) {
        return reject(new Error('User already exists'));
      }
      const newUser: User = {
        ...details,
        folders: [{ id: Date.now().toString(), name: '기본 화단', words: [] }],
        hangulProgress: { 
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
        },
      };
      users[details.email] = newUser;
      saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, details.email);
      resolve(newUser);
    });
  },

  login: (email: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      const users = getUsers();
      const user = users[email];
      
      if (user) {
        // If password is provided, it's an email/password login
        if(password) {
            if (user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, email);
                resolve(user);
            } else {
                reject(new Error('Invalid password'));
            }
        } else { // Otherwise, it's a social login (e.g., Google)
            localStorage.setItem(CURRENT_USER_KEY, email);
            resolve(user);
        }
      } else {
        reject(new Error('User not found'));
      }
    });
  },

  loginWithGoogle: async (): Promise<User> => {
    try {
      if (!auth || !googleProvider) {
        throw new Error("Firebase가 초기화되지 않았습니다. .env 파일의 Firebase 설정을 확인해주세요.");
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const email = firebaseUser.email!;
      const displayName = firebaseUser.displayName || email.split('@')[0];
      const photoURL = firebaseUser.photoURL || undefined;

      const users = getUsers();
      const user = users[email];

      if (!user) {
        throw new Error('가입되지 않은 계정입니다. 먼저 회원가입을 해주세요.');
      }

      // 기존 사용자 정보 업데이트 (프로필 이미지 등)
      if (photoURL && !user.profileImage) {
        user.profileImage = photoURL;
        users[email] = user;
        saveUsers(users);
      }

      localStorage.setItem(CURRENT_USER_KEY, email);
      return user;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('로그인 팝업이 닫혔습니다.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('로그인이 취소되었습니다.');
      } else if (error.message?.includes('Firebase')) {
        throw new Error('Firebase 설정이 필요합니다. FIREBASE_SETUP.md를 참고하세요.');
      }
      throw error;
    }
  },

  signupWithGoogle: async (): Promise<User> => {
    try {
      if (!auth || !googleProvider) {
        throw new Error("Firebase가 초기화되지 않았습니다. .env 파일의 Firebase 설정을 확인해주세요.");
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const email = firebaseUser.email!;
      const displayName = firebaseUser.displayName || email.split('@')[0];
      const photoURL = firebaseUser.photoURL || undefined;

      const users = getUsers();
      
      // 이미 가입된 사용자라도 새로 가입 가능 (기존 계정 덮어쓰기)
      const user: User = {
        email,
        fullName: displayName,
        nickname: displayName,
        profileImage: photoURL,
        folders: [{ id: Date.now().toString(), name: '기본 화단', words: [] }],
        hangulProgress: { 
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
        },
      };
      
      users[email] = user;
      saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, email);
      
      return user;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('회원가입 팝업이 닫혔습니다.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('회원가입이 취소되었습니다.');
      } else if (error.message?.includes('Firebase')) {
        throw new Error('Firebase 설정이 필요합니다. FIREBASE_SETUP.md를 참고하세요.');
      }
      throw new Error(`Google 회원가입 실패: ${error.message || "알 수 없는 오류"}`);
    }
  },

  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(CURRENT_USER_KEY);
      resolve();
    });
  },

  getCurrentUser: (): Promise<User | null> => {
    return new Promise((resolve) => {
      const email = localStorage.getItem(CURRENT_USER_KEY);
      if (email) {
        const users = getUsers();
        resolve(users[email] || null);
      } else {
        resolve(null);
      }
    });
  },

  updateUser: (user: User): Promise<void> => {
    return new Promise((resolve, reject) => {
        const users = getUsers();
        if(users[user.email]) {
            users[user.email] = user;
            saveUsers(users);
            resolve();
        } else {
            reject(new Error('User not found'));
        }
    });
  }
};