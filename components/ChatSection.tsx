"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, subscribeMessages } from "@/lib/db";
import { ChatMessage } from "@/types";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

/**
 * 💬 실시간 채팅 섹션 컴포넌트
 * - 이미지 요구사항 반영: 소제목, 스크롤 영역, 입력창/버튼
 */
export default function ChatSection() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 실시간 메시지 구독 및 자동 스크롤
  useEffect(() => {
    const unsubscribe = subscribeMessages((newMessages) => {
      setMessages(newMessages);
      // 메시지가 올 때마다 바닥으로 스크롤
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });
    return () => unsubscribe();
  }, []);

  // 2. 메시지 전송 핸들러
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        userId: user.uid,
        userName: user.displayName || "익명",
        userPhoto: user.photoURL,
        text: inputText.trim()
      });
      setInputText("");
    } catch (error) {
      console.error("채팅 전송 실패:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-12 mb-24 animate-up bg-[#0B0E14]">
      {/* 요구사항 ①: '실시간 채팅' 소제목 */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
        <h2 className="text-base font-black text-white tracking-tight italic">실시간 채팅</h2>
        <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">LIVE</span>
      </div>

      {/* 요구사항 ②: 스크롤 가능한 메시지 영역 */}
      <div 
        ref={scrollRef}
        className="h-[350px] bg-[#000] border-2 border-[#1A1A1A] rounded-3xl overflow-y-auto p-5 space-y-5 shadow-inner relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-800">
             <p className="text-xs font-bold">아직 대화가 없습니다.</p>
             <p className="text-[9px]">첫 인사를 남겨보세요!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.userId === user?.uid;
            return (
              <div key={msg.id || idx} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 프로필 사진 (타인만 표시하여 깔끔하게) */}
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl bg-[#222] overflow-hidden flex-shrink-0 border border-white/5 relative">
                    {msg.userPhoto ? (
                      <img src={msg.userPhoto} alt={msg.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">?</div>
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[9px] font-bold text-slate-600 mb-1 ml-1">{msg.userName}</span>}
                  <div className={`px-4 py-3 rounded-2xl text-[13px] font-bold shadow-lg max-w-[200px] break-words ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-[#1A1A1A] text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-800 mt-1 font-bold">
                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 요구사항 ③: input 창과 '전송' 버튼 */}
      <form onSubmit={handleSend} className="mt-4 relative flex items-center gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="메시지 입력..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-[#111] border-2 border-[#222] rounded-2xl pl-5 pr-12 py-4 text-sm font-bold text-white placeholder:text-slate-800 focus:border-indigo-600 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
              inputText.trim() && !isSending 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 active:scale-90' 
                : 'text-slate-800'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
