"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  addEvent, 
  getOrCreatePerson,
  addEventsBatch
} from "@/lib/db";
import { EventType, EventDirection } from "@/types";
import { 
  MicrophoneIcon,
  ChevronLeftIcon,
  UserIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface ParsedEntry {
  raw: string;
  name: string;
  amount: number;
  isValid: boolean;
}

export default function AddEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [direction, setDirection] = useState<EventDirection>("give");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventDetail, setEventDetail] = useState("");
  
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  
  const [bulkText, setBulkText] = useState("");
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [focusedField, setFocusedField] = useState<"name" | "detail" | "bulk">("name");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (direction === "receive") {
      setIsBulkMode(true);
    } else {
      setIsBulkMode(false);
    }
  }, [direction]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (focusedField === "name") setPersonName(transcript);
        else if (focusedField === "detail") setEventDetail(transcript);
        else setBulkText(prev => prev ? `${prev}\n${transcript}` : transcript);
      };
      recognitionRef.current = recognition;
    }
  }, [focusedField]);

  const toggleRecording = (field: "name" | "detail" | "bulk") => {
    setFocusedField(field);
    if (isRecording) recognitionRef.current?.stop();
    else setTimeout(() => recognitionRef.current?.start(), 100);
  };

  const parsedEntries = useMemo(() => {
    const regex = /([^\d\s\n\(\)][^\d\n\(\)]*?)\s*([\d,]+(?:만|천)?)/g;
    const matches = Array.from(bulkText.matchAll(regex));
    
    return matches.map(match => {
      const name = match[1].trim();
      let amount = 0;
      let amountStr = match[2].replace(/,/g, "");
      
      if (amountStr.endsWith("만")) {
        amount = parseInt(amountStr.replace("만", "")) * 10000;
      } else if (amountStr.endsWith("천")) {
        amount = parseInt(amountStr.replace("천", "")) * 1000;
      } else {
        amount = parseInt(amountStr);
      }

      return {
        raw: match[0],
        name,
        amount,
        isValid: name !== "" && amount > 0
      };
    });
  }, [bulkText]);

  const totalAmount = parsedEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCount = parsedEntries.filter(e => e.isValid).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isBulkMode) {
      const validEntries = parsedEntries.filter(e => e.isValid);
      if (validEntries.length === 0) {
        alert("최소 한 명 이상의 유효한 내용을 적어주세요. (예: 홍길동 5만)");
        return;
      }
      setIsSubmitting(true);
      try {
        const batchData = validEntries.map(entry => ({
          personName: entry.name,
          type: getAutoCategory(eventDetail),
          amount: entry.amount,
          direction,
          date,
          memo: eventDetail
        }));
        await addEventsBatch(user.uid, batchData);
        router.push("/");
      } catch (error) {
        alert("저장에 실패했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!personName.trim() || amount <= 0) {
        alert("이름과 금액을 입력해 주세요.");
        return;
      }
      setIsSubmitting(true);
      try {
        const personId = await getOrCreatePerson(user.uid, personName);
        await addEvent({
          userId: user.uid,
          personId,
          type: getAutoCategory(eventDetail),
          amount,
          direction,
          date,
          memo: eventDetail
        });
        router.push("/");
      } catch (error) {
        alert("저장에 실패했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getAutoCategory = (text: string): EventType => {
    if (text.includes("결혼") || text.includes("웨딩")) return "결혼식";
    if (text.includes("장례") || text.includes("상") || text.includes("조의")) return "장례식";
    if (text.includes("돌") || text.includes("백일")) return "돌잔치";
    return "기타";
  };

  if (loading || !user) return null;

  return (
    <div className="p-6 pb-32 animate-up bg-[#0B0E14] min-h-screen">
      {/* 럭셔리 헤더 */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 group"
          >
            <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">경조사 기록하기</h1>
        </div>
        
        {/* 입력 모드 선택 */}
        <div className="flex bg-white/5 p-1.5 rounded-[20px] border border-white/5 shadow-inner">
          <button 
            type="button" 
            onClick={() => setIsBulkMode(false)} 
            className={`px-4 py-2 rounded-[14px] text-[11px] font-black tracking-tight transition-all ${!isBulkMode ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            하나씩
          </button>
          <button 
            type="button" 
            onClick={() => setIsBulkMode(true)} 
            className={`px-4 py-2 rounded-[14px] text-[11px] font-black tracking-tight transition-all ${isBulkMode ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            여러 명(메모장)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 공통 상황 설정 섹션 */}
        <div className="premium-card bg-[#1E293B]/40 space-y-8 border-white/5">
          <section>
            <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest">1. 입출금 선택</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setDirection("give")} 
                className={`py-5 rounded-2xl font-black text-xs transition-all border outline-none ${direction === "give" ? 'bg-white text-slate-900 border-white shadow-xl shadow-white/5' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                내가 낸 돈 (-)
              </button>
              <button 
                type="button" 
                onClick={() => setDirection("receive")} 
                className={`py-5 rounded-2xl font-black text-xs transition-all border outline-none ${direction === "receive" ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-900/40' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                내가 받은 돈 (+)
              </button>
            </div>
          </section>

          <section>
            <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-widest">2. 무슨 경조사인가요? (공통 메모)</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-focus-within:bg-indigo-500/10 transition-all"></div>
              <input 
                type="text" 
                placeholder="장녀 결혼식, 부친상 등..." 
                className="relative w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/40 font-bold text-white text-sm transition-all placeholder:text-slate-700" 
                value={eventDetail} 
                onChange={(e) => setEventDetail(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => toggleRecording("detail")} 
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording && focusedField === "detail" ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40 animate-pulse' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            </div>
          </section>
        </div>

        {!isBulkMode ? (
          /* 한 명씩 입력 모드 */
          <div className="space-y-8 animate-up stagger-1">
            <section className="text-center">
              <label className="text-[11px] font-black text-slate-500 uppercase mb-6 block tracking-widest">3. 누구에게 주었나요?</label>
              <div className="relative max-w-sm mx-auto group">
                <div className="absolute inset-x-10 inset-y-0 bg-indigo-500/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <input 
                  type="text" 
                  placeholder="지인 이름 입력..." 
                  className="relative w-full p-8 bg-transparent border-b-2 border-white/10 outline-none focus:border-indigo-500 text-3xl font-black text-center text-white transition-all placeholder:text-slate-800" 
                  value={personName} 
                  onChange={(e) => setPersonName(e.target.value)} 
                />
                <button 
                  type="button" 
                  onClick={() => toggleRecording("name")} 
                  className={`absolute -right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isRecording && focusedField === "name" ? 'bg-rose-500 text-white shadow-lg animate-pulse' : 'bg-white/5 border border-white/5 text-slate-600'}`}
                >
                  <MicrophoneIcon className="w-7 h-7" />
                </button>
              </div>
            </section>

            <section className="premium-card bg-indigo-500/5 border-indigo-500/10 p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-20 h-20 bg-indigo-500/10 blur-3xl"></div>
               <label className="relative z-10 text-[11px] font-black text-indigo-400 uppercase mb-8 block tracking-widest">4. 금액을 설정해 주세요</label>
               <div className="relative z-10 flex items-center justify-center gap-2 mb-10">
                 <input 
                    type="number" 
                    className="w-56 text-6xl font-black text-white bg-transparent border-none outline-none text-right tabular-nums placeholder:text-slate-800 tracking-tighter" 
                    placeholder="0" 
                    value={amount || ""} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                 />
                 <span className="text-2xl font-black text-indigo-300 italic opacity-40">원</span>
               </div>
               <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                 {[3, 5, 10, 20].map(v => (
                   <button 
                    key={v} 
                    type="button" 
                    onClick={() => setAmount(prev => prev + (v * 10000))} 
                    className="py-4 bg-white/5 text-indigo-400 font-black rounded-2xl border border-white/5 text-[11px] hover:bg-white/10 hover:border-indigo-500/30 transition-all active:scale-95"
                   >
                     +{v}만
                   </button>
                 ))}
               </div>
               <button 
                type="button" 
                onClick={() => setAmount(0)} 
                className="relative z-10 mt-8 text-[11px] font-black text-slate-600 hover:text-slate-400 tracking-tighter transition-all"
               >
                 금액 초기화
               </button>
            </section>
          </div>
        ) : (
          /* 스마트 메모장(Bulk Entry) */
          <div className="space-y-8 animate-up stagger-1">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                <ClipboardDocumentListIcon className="w-4 h-4 text-indigo-400" /> 스마트 메모장
              </label>
              <div className="text-[9px] text-emerald-400 font-black bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-400/20">
                <ShieldCheckIcon className="w-3.5 h-3.5" /> 실시간 자동 분석 중
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
              <textarea
                placeholder="홍길동 5만&#13;&#10;김철수 결혼식 100,000&#13;&#10;이영희 돌잔치 10만"
                className="relative w-full h-80 p-8 bg-[#1E293B]/40 border border-white/5 rounded-[32px] outline-none focus:border-indigo-500/30 text-base font-bold text-white shadow-2xl leading-relaxed placeholder:text-slate-700 transition-all"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => toggleRecording("bulk")} 
                className={`absolute bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${isRecording && focusedField === "bulk" ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}
              >
                <MicrophoneIcon className="w-7 h-7" />
              </button>
            </div>

            {/* 실시간 분석 리포트 */}
            {parsedEntries.length > 0 && (
              <div className="premium-card bg-slate-900/80 border-indigo-500/20 shadow-indigo-900/20">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">인식된 인원</span>
                    <span className="text-5xl font-black text-white">{totalCount}<small className="text-sm font-bold opacity-30 ml-2">명</small></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">합계 금액</span>
                    <span className="text-5xl font-black text-indigo-400 italic tabular-nums">{totalAmount.toLocaleString()}<small className="text-sm font-bold opacity-30 ml-2">원</small></span>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scroll">
                  {parsedEntries.map((entry, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl text-sm font-bold transition-all ${entry.isValid ? 'bg-white/5 border border-white/5' : 'bg-rose-500/5 border border-rose-500/10 opacity-30'}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-600">{String(idx+1).padStart(2, '0')}</span>
                        <span className="text-white tracking-tight">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`tabular-nums ${entry.amount > 0 ? 'text-indigo-400' : 'text-rose-400'}`}>{entry.amount.toLocaleString()}원</span>
                        {entry.isValid ? <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> : <TrashIcon className="w-5 h-5 text-rose-500" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">실시간 분석 엔진 동기화 중</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 하단 제어 */}
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">경조사 날짜</label>
              <input 
                type="date" 
                className="bg-transparent border-none outline-none font-black text-slate-400 text-sm cursor-pointer" 
                style={{ colorScheme: 'dark' }}
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
           </div>
        </div>

        {/* 메인 기록 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`relative w-full py-8 rounded-[32px] overflow-hidden group shadow-2xl transition-all active:scale-95 ${
            isBulkMode ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white shadow-indigo-900/20'
          }`}
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <div className="relative flex items-center justify-center gap-3">
            {isSubmitting ? (
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <>
                <PencilSquareIcon className="w-7 h-7" />
                <span className="text-xl font-black">{isBulkMode ? `${totalCount}건 일괄 기록하기` : "기록 완료"}</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
}
