import React from 'react';
import { EventType } from "@/types";
import { 
    UserIcon, 
    CurrencyDollarIcon, 
    TagIcon, 
    DocumentTextIcon 
} from "@heroicons/react/24/outline";

interface SingleInputProps {
  pName: string;
  onPNameChange: (val: string) => void;
  type: EventType;
  onTypeChange: (val: EventType) => void;
  amount: number;
  onAmountChange: (val: number) => void;
  memo: string;
  onMemoChange: (val: string) => void;
}

/**
 * 지인 경조사 알림 (보낼 때) 입력 컴포넌트
 * - 음성 기능 제거, 카테고리 선택형 UI 도입
 */
const SingleInput = ({ 
  pName, 
  onPNameChange, 
  type, 
  onTypeChange, 
  amount, 
  onAmountChange, 
  memo, 
  onMemoChange 
}: SingleInputProps) => {
  
  const categories: EventType[] = ["결혼식", "장례식", "돌잔치", "기타"];

  return (
    <div className="space-y-10 animate-up">
      
      {/* 1. 누구인가요? */}
      <section>
        <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
          <UserIcon className="w-4 h-4" /> 누구의 경조사인가요?
        </label>
        <input 
          type="text" 
          placeholder="성함을 입력하세요 (예: 홍길동)" 
          className="w-full !p-6 bg-[#111] border-2 border-[#222] rounded-2xl outline-none focus:border-rose-500/50 text-2xl font-bold text-white placeholder:text-slate-800 transition-all shadow-inner" 
          value={pName} 
          onChange={(e) => onPNameChange(e.target.value)} 
        />
      </section>

      {/* 2. 어떤 행사인가요? (카테고리 선택) */}
      <section>
        <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
          <TagIcon className="w-4 h-4" /> 어떤 행사인가요?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onTypeChange(cat)}
              className={`py-4 rounded-xl font-black text-sm transition-all active:scale-95 border-2 ${
                type === cat 
                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-900/20' 
                  : 'bg-[#111] border-[#222] text-slate-500 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 보낸 금액 */}
      <section>
        <label className="text-[11px] font-black text-rose-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4" /> 보낸 금액 (원)
        </label>
        <div className="relative group">
          <input 
            type="number" 
            className="w-full !p-8 bg-[#111] border-2 border-[#222] rounded-2xl outline-none focus:border-rose-600 text-4xl font-black text-center text-white placeholder:text-slate-900 tabular-nums shadow-2xl transition-all" 
            placeholder="0" 
            value={amount || ""} 
            onChange={(e) => onAmountChange(Number(e.target.value))} 
            inputMode="numeric"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-700 text-xl pointer-events-none">원</div>
        </div>
      </section>

      {/* 4. 메모 */}
      <section>
        <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4" /> 메모 (선택사항)
        </label>
        <textarea 
          placeholder="참고할 내용을 입력하세요"
          className="w-full !p-5 bg-[#111] border-2 border-[#222] rounded-2xl outline-none focus:border-rose-500/30 text-white font-bold text-lg min-h-[100px] transition-all"
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
        />
      </section>

    </div>
  );
};

export default SingleInput;
