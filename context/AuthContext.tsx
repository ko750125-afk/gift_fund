"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithRedirect,
  getRedirectResult,
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
    // 1. 리다이렉트 로그인 결과 처리
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          router.push("/");
        }
      } catch (error: any) {
        console.error("리다이렉트 로그인 에러:", error);
        alert(`로그인 중 오류가 발생했습니다: ${error.code || "알 수 없음"}`);
      }
    };
    handleRedirectResult();

    // 2. 로그인 상태 실시간 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // 팝업 대신 리다이렉트 방식을 사용하여 안정성을 높입니다.
      // 클릭 시 브라우저가 차단하지 않도록 알림을 먼저 보여줍니다.
      alert("로그인 페이지로 이동합니다. 잠시만 기다려 주세요.");
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("로그인 중 에러 발생:", error);
      const errorCode = error.code || "알 수 없는 에러";
      alert(`로그인 시도가 실패했습니다. (에러 코드: ${errorCode})`);
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
