import React from 'react';
import { MicrophoneIcon } from "@heroicons/react/24/outline";

interface SingleInputProps {
  context: string;
  onContextChange: (val: string) => void;
  amount: number;
  onAmountChange: (val: number) => void;
  onRecord: (field: "context" | "amount") => void;
  isRecording: boolean;
  focusedField: string;
}

/**
 * 지인 경조사 알림 (돈 보낼 때) 입력 컴포넌트
 * 초심플 & 고가독성 버전
 */
const SingleInput = ({ 
  context, 
  onContextChange, 
  amount, 
  onAmountChange, 
  onRecord, 
  isRecording,
  focusedField
}: SingleInputProps) => (
  <div className="space-y-12 animate-up">
    {/* 1. 어떤 행사인가요? (이름+내용) */}
    <section>
      <label className="text-sm font-black text-slate-400 uppercase mb-4 block tracking-widest px-1">누구의 어떤 행사인가요?</label>
      <div className="relative">
        <input 
          type="text" 
          placeholder="예: 김철수 결혼식" 
          className="w-full !p-8 bg-[#111] border-2 border-[#333] rounded-2xl outline-none focus:border-blue-600 text-2xl font-bold text-white placeholder:text-slate-700 transition-all shadow-inner" 
          value={context} 
          onChange={(e) => onContextChange(e.target.value)} 
        />
        <button 
          type="button" 
          onClick={() => onRecord("context")} 
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isRecording && focusedField === "context" ? 'bg-blue-600 text-white animate-pulse' : 'bg-[#222] text-slate-400 hover:text-white'}`}
        >
          <MicrophoneIcon className="w-8 h-8" />
        </button>
      </div>
    </section>

    {/* 2. 금액 입력 */}
    <section>
      <label className="text-sm font-black text-rose-500 uppercase mb-4 block tracking-widest px-1">보낸 금액 (원)</label>
      <div className="relative group">
        <input 
          type="number" 
          className="w-full !p-10 bg-[#111] border-2 border-[#333] rounded-2xl outline-none focus:border-rose-600 text-5xl font-black text-center text-white placeholder:text-slate-800 tabular-nums shadow-2xl transition-all" 
          placeholder="0" 
          value={amount || ""} 
          onChange={(e) => onAmountChange(Number(e.target.value))} 
        />
        <button 
          type="button" 
          onClick={() => onRecord("amount")} 
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isRecording && focusedField === "amount" ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#222] text-slate-400 hover:text-rose-500'}`}
        >
          <MicrophoneIcon className="w-8 h-8" />
        </button>
      </div>
      
      {/* 빠른 입력 버튼 (더 크게) */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {[30000, 50000, 100000, 200000].map(v => (
          <button 
            key={v} 
            type="button" 
            onClick={() => onAmountChange((amount || 0) + v)} 
            className="py-6 bg-[#222] text-white font-black rounded-2xl border-2 border-[#333] text-xl hover:bg-rose-600 hover:border-rose-600 transition-all active:scale-95"
          >
            +{ (v/10000).toLocaleString() }만원
          </button>
        ))}
        <button 
            type="button" 
            onClick={() => onAmountChange(0)} 
            className="col-span-2 py-5 bg-transparent text-slate-600 font-bold rounded-2xl border border-slate-800 text-sm mt-2"
          >
            금액 초기화
          </button>
      </div>
    </section>
  </div>
);

export default SingleInput;
