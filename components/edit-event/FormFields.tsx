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
      <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block tracking-widest flex items-center gap-2">
        <CurrencyDollarIcon className="w-4 h-4" /> 금액 (원)
      </label>
      <div className="flex items-center gap-3 relative">
        <input 
          type="number" 
          className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-black text-2xl text-white transition-all tabular-nums"
          value={amount}
          onChange={(e) => onAmountChange(Number(e.target.value))}
        />
        <span className="absolute right-5 font-black text-slate-600">원</span>
      </div>
    </div>

    {/* 날짜 및 유형 */}
    <div className="grid grid-cols-2 gap-5">
      <div>
        <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block tracking-widest flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> 날짜
        </label>
        <input 
          type="date" 
          className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-bold text-white text-sm transition-all"
          style={{ colorScheme: 'dark' }}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div>
        <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block tracking-widest flex items-center gap-2">
          <TagIcon className="w-4 h-4" /> 카테고리
        </label>
        <select 
          className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-bold text-white text-sm appearance-none cursor-pointer transition-all"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as EventType)}
        >
          <option value="결혼식">결혼식</option>
          <option value="장례식">장례식</option>
          <option value="돌잔치">돌잔치</option>
          <option value="기타">기타</option>
        </select>
      </div>
    </div>

    {/* 메모 */}
    <div>
      <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block tracking-widest flex items-center gap-2">
        <DocumentTextIcon className="w-4 h-4" /> 메모
      </label>
      <input 
        type="text" 
        placeholder="추가 내용을 입력하세요"
        className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-bold text-white text-sm transition-all"
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
      />
    </div>
  </div>
);

export default FormFields;
