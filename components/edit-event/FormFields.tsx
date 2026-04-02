import React from 'react';
import { 
  CalendarIcon, 
  TagIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon 
} from "@heroicons/react/24/outline";
import { EventType } from "@/types";

interface FormFieldsProps {
  amount: number;
  onAmountChange: (val: number) => void;
  date: string;
  onDateChange: (val: string) => void;
  type: EventType;
  onTypeChange: (val: EventType) => void;
  memo: string;
  onMemoChange: (val: string) => void;
}

const FormFields = ({ 
  amount, onAmountChange, date, onDateChange, type, onTypeChange, memo, onMemoChange 
}: FormFieldsProps) => (
  <div className="p-8 space-y-8 animate-up">
    {/* 금액 입력 */}
    <div>
      <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
        <CurrencyDollarIcon className="w-4 h-4" /> 금액 (원)
      </label>
      <div className="flex items-center gap-3 relative">
        <input 
          type="number" 
          className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-black text-3xl text-white transition-all tabular-nums"
          value={amount || ""}
          onChange={(e) => onAmountChange(Number(e.target.value))}
          inputMode="numeric"
        />
        <span className="absolute right-6 font-black text-slate-600">원</span>
      </div>
    </div>

    {/* 날짜 */}
    <div>
      <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
        <CalendarIcon className="w-4 h-4" /> 날짜
      </label>
      <input 
        type="date" 
        className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-bold text-white text-lg transition-all"
        style={{ colorScheme: 'dark' }}
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
      />
    </div>

    {/* 카테고리 선택 */}
    <div>
      <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
        <TagIcon className="w-4 h-4" /> 카테고리
      </label>
      <div className="grid grid-cols-4 gap-2">
        {(["결혼식", "장례식", "돌잔치", "기타"] as EventType[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onTypeChange(cat)}
            className={`py-4 rounded-xl font-black text-sm transition-all active:scale-95 border-2 ${
              type === cat 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                : 'bg-white/5 border-transparent text-slate-500 hover:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {/* 메모 */}
    <div>
      <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest flex items-center gap-2">
        <DocumentTextIcon className="w-4 h-4" /> 메모
      </label>
      <textarea 
        placeholder="추가 내용을 입력하세요"
        className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-bold text-white text-lg min-h-[100px] transition-all"
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
      />
    </div>
  </div>
);

export default FormFields;
