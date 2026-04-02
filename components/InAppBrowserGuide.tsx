"use client";

import { useEffect, useState } from "react";
import { ArrowTopRightOnSquareIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

/**
 * 인-앱 브라우저(카카오톡, 라인 등) 감지 및 외부 브라우저 유도 가이드 컴포넌트
 */
export default function InAppBrowserGuide() {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const inAppBrowsers = [
      "kakaotalk",
      "line",
      "fbav", // Facebook app for iOS
      "fban", // Facebook app for iOS
      "instagram",
      "naver",
      "slack",
    ];

    const isMatched = inAppBrowsers.some((browser) => userAgent.includes(browser));
    setIsInApp(isMatched);
  }, []);

  if (!isInApp) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-full max-w-sm">
        {/* 아이콘 섹션 */}
        <div className="mb-8 relative inline-block">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-slow">
            <DevicePhoneMobileIcon className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-4 border-black text-white font-bold">
            !
          </div>
        </div>

        {/* 텍스트 섹션 */}
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
          잠깐만요, 대표님!<br />
          외부 브라우저가 필요해요.
        </h2>
        
        <p className="text-slate-400 text-lg font-bold mb-10 leading-relaxed">
          카카오톡이나 인스타그램 앱 안에서는<br />
          <span className="text-blue-500 underline underline-offset-4">구글 로그인이 안전하게 제한되곤 합니다.</span>
        </p>

        {/* 안내 박스 */}
        <div className="bg-[#111] border-2 border-blue-600/30 rounded-3xl p-6 text-left mb-10">
          <h3 className="text-blue-400 font-black mb-3 flex items-center gap-2">
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            해결 방법:
          </h3>
          <ol className="space-y-4 text-slate-300 font-bold">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">1</span>
              <span>오른쪽 상단의 <span className="text-white">더보기(점 세개 ⋮)</span> 또는 <span className="text-white">공유 버튼</span>을 클릭하세요.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">2</span>
              <span><span className="text-blue-400">'다른 브라우저로 열기'</span> 또는 <span className="text-white">'크롬/사파리로 열기'</span>를 눌러주세요.</span>
            </li>
          </ol>
        </div>

        {/* 데코레이션 문구 */}
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
          More Secure Authentication Required
        </p>
      </div>
    </div>
  );
}
