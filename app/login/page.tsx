"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  // 이미 로그인이 되어 있다면 홈으로 보냅니다.
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-sm text-center">
        {/* 앱 로고 아이콘 */}
        <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary shadow-xl shadow-primary/20 animate-fade-in">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in [animation-delay:100ms]">경산방</h1>
        <p className="text-gray-500 mb-12 animate-fade-in [animation-delay:200ms]">
          대표님의 스마트한 인맥 관리,<br />
          경조사비 관리 비서가 도와드립니다.
        </p>

        <button
          onClick={login}
          className="group relative flex items-center justify-center w-full bg-white border border-gray-200 py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 animate-fade-in [animation-delay:300ms]"
        >
          <div className="absolute left-6">
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083 43.595 20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
          </div>
          <span className="text-gray-700 font-semibold ml-4">Google로 시작하기</span>
        </button>
      </div>

      <p className="mt-12 text-xs text-gray-400">
        최고의 시니어 개발 비서가 함께합니다.
      </p>
    </div>
  );
}
