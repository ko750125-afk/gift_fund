"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E14]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-[#0B0E14] relative overflow-hidden">
      {/* 프리미엄 배경 블러 효과 */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-sm text-center relative z-10">
        {/* 앱 로고 아이콘 - 럭셔리 스타일 */}
        <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo-600 to-indigo-400 shadow-2xl shadow-indigo-500/20 animate-up">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight animate-up stagger-1">경조사 관리 매니저</h1>
        <p className="text-slate-500 font-bold mb-14 leading-relaxed animate-up stagger-2">
          복잡한 인맥과 경조사비 지출,<br />
          이제 스마트하게 한 눈에 관리하세요.
        </p>

        <button
          onClick={login}
          className="group relative flex items-center justify-center w-full bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 py-5 px-6 rounded-[24px] shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 active:scale-95 animate-up stagger-3"
        >
          <div className="absolute left-6 bg-white p-1 rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083 43.595 20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
          </div>
          <span className="text-white font-black text-lg ml-4">Google로 입장하기</span>
        </button>
      </div>

      <div className="absolute bottom-10 text-center animate-fade-in delay-1000">
        <p className="text-[10px] text-slate-700 font-bold tracking-[0.3em] uppercase opacity-40">
          Smart Contact & Gift Management Service
        </p>
      </div>
    </div>
  );
}
