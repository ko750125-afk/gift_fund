"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { 
  PencilSquareIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { 
  addEvent, 
  getOrCreatePerson,
  addEventsBatch
} from "@/lib/db";
import { EventType, EventDirection } from "@/types";

// --- 리팩토링된 서브 컴포넌트들 ---
import Header from "./record/Header";
import SingleInput from "./record/SingleInput";
import BulkInput from "./record/BulkInput";

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

/**
 * 🎨 대표님의 피드백을 반영한 전면 개편 경조사 기록 모달
 * - 보냄/받음 버튼을 없애고 직관적인 위아래 배치로 변경
 * - '낼 때'는 위쪽 간단 입력, '받을 때(나의 경조사)'는 아래쪽 단체 입력 버튼으로 구성
 */
export default function RecordModal({ isOpen, onClose, userId }: RecordModalProps) {
  // 1. 상태 관리
  // 대표님 지침: 나가는 돈(give)은 기본 단일 입력, 들어오는 돈(receive)은 나의 경조사(Bulk) 모드
  const [direction, setDirection] = useState<EventDirection>("give");
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [context, setContext] = useState(""); // 이름 + 행사 내용 (예: 종화 결혼식)
  const [amount, setAmount] = useState<number>(0);
  const [bulkText, setBulkText] = useState("");
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<"context" | "amount" | "bulk">("context");
  
  const recognitionRef = useRef<any>(null);

  // 2. 모드 전환 핸들러 (나의 경조사 버튼 클릭 시)
  const toggleMyEvent = () => {
    setIsBulkMode(true);
    setDirection("receive");
  };

  const backToSingleMode = () => {
    setIsBulkMode(false);
    setDirection("give");
  };

  // 3. 음성 인식 설정 (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        if (focusedField === "context") {
          // 이름과 행사 내용 (예: "종화 결혼식")
          setContext(transcript);
        } else if (focusedField === "amount") {
          // 금액 파싱 (예: "오만" -> 50000)
          const parsed = parseAmountFromSpeech(transcript);
          if (parsed > 0) setAmount(parsed);
        } else if (focusedField === "bulk") {
          setBulkText(prev => prev ? `${prev}\n${transcript}` : transcript);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [focusedField]);

  // 음성 금액 파싱 헬퍼
  const parseAmountFromSpeech = (text: string): number => {
    const cleaned = text.replace(/,/g, "").replace(/\s/g, "");
    let amnt = 0;
    
    // "오만", "십만", "오만원" 등 처리
    const numericPart = cleaned.match(/\d+/) ? parseInt(cleaned.match(/\d+/)![0]) : 0;
    
    if (cleaned.includes("만")) {
      amnt = (numericPart || 1) * 10000;
      if (cleaned.startsWith("오만")) amnt = 50000;
      else if (cleaned.startsWith("십만")) amnt = 100000;
       // 간단한 한글 숫자 처리
       const koreanNumbers: Record<string, number> = { "일": 1, "이": 2, "삼": 3, "사": 4, "오": 5, "육": 6, "칠": 7, "팔": 8, "구": 9, "십": 10 };
       for (const [key, val] of Object.entries(koreanNumbers)) {
         if (cleaned.startsWith(key + "만")) amnt = val * 10000;
       }
    } else if (cleaned.includes("천")) {
      amnt = (numericPart || 1) * 1000;
    } else {
      amnt = numericPart;
    }
    return amnt;
  };

  const toggleRecording = (field: "context" | "amount" | "bulk") => {
    setFocusedField(field);
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTimeout(() => recognitionRef.current?.start(), 100);
    }
  };

  // 4. 스마트 파싱 로직 (벌크 모드)
  const parsedEntries = useMemo(() => {
    const regex = /([^\d\s\n\(\)][^\d\n\(\)]*?)\s*([\d,]+(?:만|천)?)/g;
    const matches = Array.from(bulkText.matchAll(regex));
    
    return matches.map(match => {
      const name = match[1].trim();
      let amnt = 0;
      let amountStr = match[2].replace(/,/g, "");
      
      if (amountStr.endsWith("만")) amnt = parseInt(amountStr.replace("만", "")) * 10000;
      else if (amountStr.endsWith("천")) amnt = parseInt(amountStr.replace("천", "")) * 1000;
      else amnt = parseInt(amountStr);

      return { raw: match[0], name, amount: amnt, isValid: name !== "" && amnt > 0 };
    });
  }, [bulkText]);

  const totalAmount = useMemo(() => parsedEntries.reduce((sum, e) => sum + e.amount, 0), [parsedEntries]);
  const totalCount = useMemo(() => parsedEntries.filter(e => e.isValid).length, [parsedEntries]);

  // 5. 자동 분류
  const getAutoCategory = (text: string): EventType => {
    const t = text.toLowerCase();
    if (t.includes("결혼") || t.includes("웨딩")) return "결혼식";
    if (t.includes("장례") || t.includes("상") || t.includes("조의")) return "장례식";
    if (t.includes("돌") || t.includes("백일")) return "돌잔치";
    return "기타";
  };

  // 6. 데이터 저장
  const handleSubmit = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    
    try {
      if (isBulkMode) {
        const validEntries = parsedEntries.filter(e => e.isValid);
        if (validEntries.length === 0) throw new Error("유효한 입력이 없습니다.");
        
        const batchData = validEntries.map(entry => ({
          personName: entry.name,
          type: "기타", // 대량 입력은 기본 기타 (메모에 상황 적힘)
          amount: entry.amount,
          direction,
          date,
          memo: "" 
        }));
        await addEventsBatch(userId, batchData);
      } else {
        if (!context.trim() || amount <= 0) throw new Error("내용과 금액을 확인해 주세요.");
        
        // 이름과 상황을 분리해주는 스마트 로직
        // 예: "종화 결혼식" -> 이름: 종화, 상황: 결혼식
        const parts = context.split(" ");
        const pName = parts[0];
        const eventType = getAutoCategory(context);
        
        const personId = await getOrCreatePerson(userId, pName);
        await addEvent({
          userId, personId, type: eventType,
          amount, direction, date, memo: context
        });
      }
      
      onClose();
      setContext(""); setAmount(0); setBulkText(""); backToSingleMode();
    } catch (error: any) {
      alert(error.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0B0E14] animate-fade-in">
      <Header onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-6 space-y-12 custom-scroll">
        
        {/* === 상단: 보낼 때 (Single Mode) === */}
        <div className={`transition-all duration-500 ${isBulkMode ? 'opacity-20 scale-95 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-5 bg-rose-500 rounded-full"></div>
            <h3 className="text-lg font-black text-white italic">다른 사람 경조사 챙길 때</h3>
          </div>
          
          <SingleInput 
            context={context} onContextChange={setContext}
            amount={amount} onAmountChange={setAmount}
            onRecord={toggleRecording}
            isRecording={isRecording && (focusedField === "context" || focusedField === "amount")}
            focusedField={focusedField}
          />
        </div>

        {/* 중첩 레이아웃을 위한 구분선 */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-white/5 flex-1"></div>
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">OR</span>
          <div className="h-px bg-white/5 flex-1"></div>
        </div>

        {/* === 하단: 나의 경조사 (Bulk Mode) === */}
        <section>
          {!isBulkMode ? (
            <button 
              onClick={toggleMyEvent}
              className="w-full py-10 rounded-[35px] bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-indigo-500/20 shadow-2xl flex flex-col items-center justify-center gap-4 group hover:border-indigo-500/40 transition-all active:scale-95"
            >
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                <SparklesIcon className="w-10 h-10" />
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-white tracking-widest">나의 경조사</span>
                <p className="text-[10px] text-indigo-400/60 font-bold uppercase mt-1">단번에 여러 명 기록하기 (받은 돈)</p>
              </div>
            </button>
          ) : (
            <div className="animate-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-lg font-black text-white italic">나의 경조사 (들어온 돈)</h3>
                </div>
                <button onClick={backToSingleMode} className="text-[10px] font-bold text-slate-600 underline">처음으로 돌아가기</button>
              </div>
              
              <BulkInput 
                value={bulkText} onChange={setBulkText}
                onRecord={() => toggleRecording("bulk")}
                isRecording={isRecording && focusedField === "bulk"}
                parsedEntries={parsedEntries}
                totalCount={totalCount}
                totalAmount={totalAmount}
              />
            </div>
          )}
        </section>

        {/* 날짜 설정 */}
        <div className="flex items-center gap-4 py-4 opacity-30">
           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">기록 날짜</label>
           <input 
              type="date" 
              className="bg-transparent border-none outline-none font-black text-slate-400 text-sm" 
              style={{ colorScheme: 'dark' }}
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
           />
        </div>
      </div>

      {/* 하단 고정 저장 버튼 */}
      <div className="p-6 border-t border-white/5 bg-[#0B0E14] backdrop-blur-md">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-7 rounded-[30px] font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${
            isBulkMode 
              ? 'bg-indigo-600 text-white shadow-indigo-900/40 hover:bg-indigo-500' 
              : 'bg-rose-600 text-white shadow-rose-900/40 hover:bg-rose-500'
          }`}
        >
          {isSubmitting ? (
            <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <PencilSquareIcon className="w-7 h-7" />
              <span>{isBulkMode ? `${totalCount}건 합계 저장` : "기록 완료"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
