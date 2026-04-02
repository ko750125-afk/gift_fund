"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
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
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("리다이렉트 로그인 성공:", result.user.displayName);
          router.push("/");
        }
      })
      .catch((error) => {
        console.error("리다이렉트 결과 처리 중 에러:", error);
      });

    // 2. 로그인 상태 실시간 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // 로그인 성공 시 메인으로 이동 (로그인 페이지에 있을 때만)
      if (user && window.location.pathname === "/login") {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setLoading(true);
    
    // 모바일 여부 판단 (Regex)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        // 모바일은 팝업 차단이 많으므로 리다이렉트 방식을 사용합니다.
        await signInWithRedirect(auth, provider);
      } else {
        // 데스크톱은 팝업 방식이 직관적입니다.
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          console.log("팝업 로그인 성공:", result.user.displayName);
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("로그인 중 에러 발생:", error);
      
      // 에러 상황별 상세 안내
      if (error.code === "auth/popup-blocked") {
        alert("브라우저에서 팝업이 차단되었습니다. 주소창 옆의 팝업 차단 아이콘을 눌러 허용해 주세요.");
      } else if (error.code === "auth/unauthorized-domain") {
        alert("현재 도메인이 승인되지 않았습니다. Firebase 콘솔 설정을 다시 확인해 주세요.");
      } else if (error.code === "auth/internal-error" && error.message.includes("403")) {
        alert("현재 브라우저에서는 구글 로그인이 불가능합니다. 외부 브라우저(크롬, 사파리)로 접속해 주세요.");
      } else if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
        alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
