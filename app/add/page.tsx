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
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

// 브라우저의 음성 인식 API를 위한 타입 정의
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// 스마트 파싱 결과 인터페이스
interface ParsedEntry {
  raw: string;
  name: string;
  amount: number;
  isValid: boolean;
}

export default function AddEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 1. 공통 정보
  const [direction, setDirection] = useState<EventDirection>("give");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventDetail, setEventDetail] = useState(""); // "부친상", "장녀 결혼" 등
  
  // 2. 입력 모드
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // 3. 단일 입력 모드 전용 상태
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  
  // 4. 대량 입력(스마트 메모장) 모드 전용 상태
  const [bulkText, setBulkText] = useState("");
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [focusedField, setFocusedField] = useState<"name" | "detail" | "bulk">("name");

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 방향에 따라 모드 자동 선택 (받을 때는 대량 입력)
  useEffect(() => {
    if (direction === "receive") {
      setIsBulkMode(true);
    } else {
      setIsBulkMode(false);
    }
  }, [direction]);

  // 음성 인식 초기화
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

  // 실시간 스마트 파싱 로직 (한 줄에 여러 명 있어도 인식하도록 고도화)
  const parsedEntries = useMemo(() => {
    // 정규식: 이름(숫자가 아닌 문자들) + 공백(선택) + 금액(숫자/쉼표/단위)
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

  // 제출 처리
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
    if (text.includes("결혼") || text.includes("혼례")) return "결혼";
    if (text.includes("상") || text.includes("장례") || text.includes("소천")) return "장례";
    if (text.includes("돌") || text.includes("백일")) return "돌잔치";
    return "기타";
  };

  if (loading || !user) return null;

  return (
    <div className="p-4 pb-24 animate-fade-in bg-white min-h-screen max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">경조사비 기록기</h1>
        </div>
        
        {/* 모드 선택 */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button type="button" onClick={() => setIsBulkMode(false)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${!isBulkMode ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>하나씩</button>
          <button type="button" onClick={() => setIsBulkMode(true)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${isBulkMode ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>메모장(대량)</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 공통 정보 설정 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">1. 현금 흐름</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setDirection("give")} className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${direction === "give" ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>보낸 돈 (-)</button>
              <button type="button" onClick={() => setDirection("receive")} className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${direction === "receive" ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>받은 돈 (+)</button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">2. 무슨 일인가요? (공통 내용)</label>
            <div className="relative">
              <input type="text" placeholder="예: 장녀 결혼식, 부친상" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-primary font-bold text-gray-800 text-sm" value={eventDetail} onChange={(e) => setEventDetail(e.target.value)} />
              <button type="button" onClick={() => toggleRecording("detail")} className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center ${isRecording && focusedField === "detail" ? 'bg-primary text-white animate-pulse' : 'text-gray-300'}`}><MicrophoneIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {!isBulkMode ? (
          /* 한 명씩 입력 모드 */
          <div className="space-y-6 animate-fade-in py-4">
            <section>
              <label className="text-xs font-black text-gray-400 uppercase mb-4 block text-center">3. 누구에게 보냈나요?</label>
              <div className="relative max-w-sm mx-auto">
                <input type="text" placeholder="홍길동 삼촌, 사장님 등" className="w-full p-6 bg-white border-2 border-gray-100 rounded-3xl outline-none focus:border-primary text-xl font-black text-center shadow-lg shadow-gray-50" value={personName} onChange={(e) => setPersonName(e.target.value)} />
                <button type="button" onClick={() => toggleRecording("name")} className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center ${isRecording && focusedField === "name" ? 'bg-primary text-white animate-pulse' : 'bg-gray-50 text-gray-300'}`}><MicrophoneIcon className="w-6 h-6" /></button>
              </div>
            </section>

            <section className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100/50 text-center">
              <label className="text-xs font-black text-indigo-400 uppercase mb-6 block">4. 금액을 설정해 주세요</label>
              <div className="flex items-center justify-center gap-2 mb-8">
                <input type="number" className="w-48 text-5xl font-black text-indigo-900 bg-transparent border-none outline-none text-right placeholder-indigo-200" placeholder="0" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
                <span className="text-2xl font-black text-indigo-300">원</span>
              </div>
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {[30000, 50000, 100000, 200000].map(v => (
                  <button key={v} type="button" onClick={() => setAmount(prev => prev + v)} className="py-4 bg-white text-indigo-700 font-bold rounded-2xl border border-indigo-100 text-xs shadow-sm hover:border-primary hover:text-primary transition-all">+{v/10000}만</button>
                ))}
              </div>
              <button type="button" onClick={() => setAmount(0)} className="mt-6 text-[10px] font-black text-indigo-200 hover:text-indigo-400 tracking-tighter transition-colors">다시 입력하기</button>
            </section>
          </div>
        ) : (
          /* 스마트 메모장(대량 입력) 모드 */
          <div className="space-y-6 animate-fade-in py-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-4 h-4" /> 스마트 메모장
              </label>
              <div className="text-[10px] text-green-500 font-bold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheckIcon className="w-3.3" /> 실시간 분석 중
              </div>
            </div>

            <div className="relative">
              <textarea
                placeholder="예:&#13;&#10;홍길동 5만&#13;&#10;이영희 부친상 100,000&#13;&#10;김철수 결혼 10만"
                className="w-full h-80 p-6 bg-white border-2 border-gray-100 rounded-[32px] outline-none focus:border-primary text-base font-bold text-gray-800 shadow-xl shadow-gray-50 leading-relaxed placeholder-gray-200"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button type="button" onClick={() => toggleRecording("bulk")} className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center ${isRecording && focusedField === "bulk" ? 'bg-primary text-white animate-pulse' : 'bg-gray-100 text-gray-400 border border-white'}`}><MicrophoneIcon className="w-6 h-6" /></button>
            </div>

            {/* 실시간 분석 미리보기 */}
            {parsedEntries.length > 0 && (
              <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl shadow-gray-300 transform transition-all">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">인식된 인원</span>
                    <span className="text-4xl font-black">{totalCount}<small className="text-sm font-bold opacity-40 ml-1">명</small></span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">총 합계</span>
                    <span className="text-4xl font-black text-indigo-400">{totalAmount.toLocaleString()}<small className="text-sm font-bold opacity-40 ml-1">원</small></span>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-none">
                  {parsedEntries.map((entry, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all ${entry.isValid ? 'bg-white/5 border border-white/5' : 'bg-rose-500/10 border border-rose-500/20 opacity-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-[10px] font-black text-white/20">{idx+1}</span>
                        <span className="text-white/80">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={entry.amount > 0 ? 'text-indigo-300' : 'text-rose-300'}>{entry.amount.toLocaleString()}원</span>
                        {entry.isValid ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <TrashIcon className="w-4 h-4 text-rose-400" />}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/30 text-center mt-6 flex items-center justify-center gap-1">
                  <SparklesIcon className="w-3 h-3" /> 메모장 내용을 고치면 분석 결과가 바로 업데이트됩니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 하단 공통 정보 (날짜) */}
        <div className="flex items-center justify-between px-3">
          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">일시</label>
          <input type="date" className="bg-transparent border-none outline-none font-black text-gray-500 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-xl font-black py-7 rounded-[40px] shadow-2xl transition-all h-24 flex items-center justify-center gap-3 overflow-hidden group ${
            isBulkMode ? 'bg-primary text-white shadow-primary/30' : 'bg-gray-900 text-white shadow-gray-400/30'
          }`}
        >
          {isSubmitting ? (
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <PencilSquareIcon className="w-7 h-7 group-hover:scale-110 transition-transform" /> 
              <span>{isBulkMode ? `${totalCount}건 일괄 기록하기` : "지금 바로 기록"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
