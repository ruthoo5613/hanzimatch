import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 你的 Firebase 配置 - 从 Firebase Console 获取
const firebaseConfig = {
  apiKey: "AIzaSyCMBSDO31qxfrzxle3f0x54KtzzQ6AGCX4",
  authDomain: "hanzimatch.firebaseapp.com",
  projectId: "hanzimatch",
  storageBucket: "hanzimatch.firebasestorage.app",
  messagingSenderId: "279586327177",
  appId: "1:279586327177:web:1855d15a00bf4e4ce01458"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Zustand store 管理登录状态
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      
      login: async () => {
        set({ isLoading: true });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          set({ user: result.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
    {
      name: 'hanzimatch-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// 监听 Auth 状态变化
export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(false);
  });
}

export { auth };