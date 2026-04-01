"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// 대표님, 로그인 정보를 앱 전체에서 쉽게 꺼내 쓸 수 있도록 하는 '금고' 같은 역할입니다.
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Firebase에서 로그인 상태 변화를 실시간으로 감지합니다.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // 로그인 성공 시 메인 화면으로 이동합니다.
      router.push("/");
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      alert("로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // 로그아웃 시 로그인 페이지로 이동합니다.
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 중 에러 발생:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 다른 파일에서 간편하게 사용할 수 있도록 만든 훅입니다.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
