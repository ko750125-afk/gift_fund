import React from 'react';
import { MicrophoneIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface BulkInputProps {
  value: string;
  onChange: (val: string) => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  isRecording: boolean;
  parsedEntries: Array<{
    name: string;
    amount: number;
    isValid: boolean;
  }>;
  totalCount: number;
  totalAmount: number;
}

/**
 * 나의 경조사 (돈 받을 때) 대량 입력 컴포넌트
 * 초심플 & 고가독성 버전
 */
const BulkInput = ({ 
  value, 
  onChange, 
  onStartRecord,
  onStopRecord, 
  isRecording, 
  parsedEntries, 
  totalCount, 
  totalAmount 
}: BulkInputProps) => (
  <div className="space-y-8 animate-up">
    {/* 입력 가이드 */}
    <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-start gap-3">
      <QuestionMarkCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-black text-blue-400">어떻게 적나요?</h4>
        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
          이름과 금액을 띄워서 적어주세요. (여러 명 가능)<br/>
          예: 홍길동 10만, 임꺽정 50000
        </p>
      </div>
    </div>

    {/* 대형 텍스트 입력창 */}
    <div className="relative">
      <textarea 
        className="w-full h-64 !p-8 bg-[#111] border-2 border-[#333] rounded-2xl outline-none focus:border-blue-600 text-2xl font-bold text-white placeholder:text-slate-800 transition-all shadow-inner resize-none" 
        placeholder="이름과 금액을 입력하세요... (음성을 계속 켜고 입력 가능)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
      
      {isRecording && (
        <div className="absolute left-8 bottom-6 flex items-center gap-2 text-rose-500 font-black text-sm animate-pulse">
          <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
          <span>음성 인식 중... (여러 명 연속 입력 가능)</span>
        </div>
      )}

      <div className="absolute right-4 bottom-4 flex gap-2">
        <button 
          type="button" 
          onClick={onStartRecord} 
          disabled={isRecording}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-slate-800 text-slate-600 scale-90' : 'bg-rose-600 text-white hover:bg-rose-500 active:scale-95 shadow-rose-900/40'}`}
        >
          <MicrophoneIcon className="w-6 h-6" />
          <span className="text-[8px] font-black mt-1">켜기</span>
        </button>
        <button 
          type="button" 
          onClick={onStopRecord} 
          disabled={!isRecording}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-xl transition-all ${!isRecording ? 'bg-slate-800 text-slate-600 scale-90' : 'bg-[#333] text-white hover:bg-[#444] active:scale-95 shadow-black/40 border border-white/10'}`}
        >
          <div className="w-4 h-4 bg-current rounded-sm mb-1"></div>
          <span className="text-[8px] font-black">끄기</span>
        </button>
      </div>
    </div>

    {/* 실시간 파싱 결과 미리보기 (크게) */}
    {parsedEntries.length > 0 && (
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xl font-black text-blue-500">인식 결과 (총 {totalCount}명)</span>
          <span className="text-2xl font-black text-white">{totalAmount.toLocaleString()}원</span>
        </div>
        
        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
          {parsedEntries.map((entry, i) => (
            <div key={i} className={`flex justify-between p-4 rounded-xl border ${entry.isValid ? 'bg-[#222] border-white/5' : 'bg-red-900/10 border-red-500/20 opacity-50'}`}>
              <span className="text-xl font-bold text-white">{entry.name || "미인식"}</span>
              <span className={`text-xl font-black ${entry.isValid ? 'text-blue-400' : 'text-slate-500'}`}>
                {entry.amount.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default BulkInput;
