"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { 
  XMarkIcon,
  MicrophoneIcon,
  TrashIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { 
  addEvent, 
  getOrCreatePerson,
  addEventsBatch
} from "@/lib/db";
import { EventType, EventDirection } from "@/types";

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function RecordModal({ isOpen, onClose, userId }: RecordModalProps) {
  const [direction, setDirection] = useState<EventDirection>("give");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventDetail, setEventDetail] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [bulkText, setBulkText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<"name" | "detail" | "bulk">("name");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (direction === "receive") {
      setIsBulkMode(true);
    } else {
      setIsBulkMode(false);
    }
  }, [direction]);

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
      let amnt = 0;
      let amountStr = match[2].replace(/,/g, "");
      
      if (amountStr.endsWith("만")) {
        amnt = parseInt(amountStr.replace("만", "")) * 10000;
      } else if (amountStr.endsWith("천")) {
        amnt = parseInt(amountStr.replace("천", "")) * 1000;
      } else {
        amnt = parseInt(amountStr);
      }

      return {
        raw: match[0],
        name,
        amount: amnt,
        isValid: name !== "" && amnt > 0
      };
    });
  }, [bulkText]);

  const totalAmount = parsedEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCount = parsedEntries.filter(e => e.isValid).length;

  const getAutoCategory = (text: string): EventType => {
    if (text.includes("결혼") || text.includes("웨딩")) return "결혼식";
    if (text.includes("장례") || text.includes("상") || text.includes("조의")) return "장례식";
    if (text.includes("돌") || text.includes("백일")) return "돌잔치";
    return "기타";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);
    try {
      if (isBulkMode) {
        const validEntries = parsedEntries.filter(e => e.isValid);
        if (validEntries.length === 0) {
          alert("유효한 내용을 한 줄 이상 입력해 주세요 (예: 홍길동 5만)");
          setIsSubmitting(false);
          return;
        }
        const batchData = validEntries.map(entry => ({
          personName: entry.name,
          type: getAutoCategory(eventDetail),
          amount: entry.amount,
          direction,
          date,
          memo: eventDetail
        }));
        await addEventsBatch(userId, batchData);
      } else {
        if (!personName.trim() || amount <= 0) {
          alert("이름과 금액을 입력해 주세요.");
          setIsSubmitting(false);
          return;
        }
        const personId = await getOrCreatePerson(userId, personName);
        await addEvent({
          userId,
          personId,
          type: getAutoCategory(eventDetail),
          amount,
          direction,
          date,
          memo: eventDetail
        });
      }
      onClose();
      // Reset form
      setPersonName("");
      setAmount(0);
      setBulkText("");
      setEventDetail("");
    } catch (error) {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0B0E14]">
      {/* 고정 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-xl font-black text-white italic">경조사 기록하기</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
        {/* 입출금 선택 섹션 */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={() => setDirection("give")} 
              className={`py-5 rounded-2xl font-black text-xs transition-all border ${direction === "give" ? 'bg-white text-slate-900 border-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'}`}
            >
              돈 보냈을 때 (-)
            </button>
            <button 
              type="button" 
              onClick={() => setDirection("receive")} 
              className={`py-5 rounded-2xl font-black text-xs transition-all border ${direction === "receive" ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-900/20' : 'bg-white/5 border-white/5 text-slate-500'}`}
            >
              돈 받았을 때 (+)
            </button>
          </div>
        </section>

        {/* 상황 입력 */}
        <section>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">상황 (예: 결혼식, 부친상)</label>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="무슨 경조사인가요?" 
              className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/40 font-bold text-white text-sm" 
              value={eventDetail} 
              onChange={(e) => setEventDetail(e.target.value)} 
            />
            <button 
              type="button" 
              onClick={() => toggleRecording("detail")} 
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center ${isRecording && focusedField === "detail" ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-600'}`}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          </div>
        </section>

        <div className="h-px bg-white/5 my-2"></div>

        {/* 입력 모드 */}
        {!isBulkMode ? (
          <div className="space-y-8 animate-up">
            <section className="text-center">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-4 block tracking-widest text-center">보낸(받은) 사람 이름</label>
              <div className="relative max-w-sm mx-auto">
                <input 
                  type="text" 
                  placeholder="누구인가요?" 
                  className="w-full p-4 bg-transparent border-b-2 border-white/10 outline-none focus:border-indigo-500 text-3xl font-black text-center text-white placeholder:text-slate-800" 
                  value={personName} 
                  onChange={(e) => setPersonName(e.target.value)} 
                />
                <button 
                  type="button" 
                  onClick={() => toggleRecording("name")} 
                  className={`absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center ${isRecording && focusedField === "name" ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-slate-600'}`}
                >
                  <MicrophoneIcon className="w-6 h-6" />
                </button>
              </div>
            </section>

            <section className="bg-indigo-500/5 rounded-3xl p-8 border border-white/5 text-center">
              <label className="text-[10px] font-black text-indigo-400 uppercase mb-6 block tracking-widest">금액 설정</label>
              <div className="flex items-center justify-center gap-2 mb-8 text-4xl font-black text-white">
                <input 
                  type="number" 
                  className="w-48 text-center bg-transparent border-none outline-none tabular-nums placeholder:text-slate-800" 
                  placeholder="0" 
                  value={amount || ""} 
                  onChange={(e) => setAmount(Number(e.target.value))} 
                />
                <span className="text-xl text-slate-500 italic">원</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 10, 20].map(v => (
                  <button 
                    key={v} 
                    type="button" 
                    onClick={() => setAmount(prev => prev + (v * 10000))} 
                    className="py-3 bg-white/5 text-indigo-400 font-bold rounded-xl border border-white/5 text-xs hover:bg-white/10 transition-all active:scale-95"
                  >
                    +{v}만
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6 animate-up">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                <ClipboardDocumentListIcon className="w-4 h-4 text-indigo-400" /> 스마트 장부 (여러 명)
              </label>
              <div className="text-[8px] text-emerald-400 font-black bg-emerald-400/5 px-2 py-1 rounded-lg border border-emerald-400/20">실시간 인식 중</div>
            </div>
            <div className="relative group">
              <textarea
                placeholder="홍길동 5만&#13;&#10;김철수 10만"
                className="w-full h-64 p-6 bg-white/5 border border-white/5 rounded-3xl outline-none focus:border-indigo-500/30 text-lg font-bold text-white shadow-inner resize-none custom-scroll placeholder:text-slate-700"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => toggleRecording("bulk")} 
                className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ${isRecording && focusedField === "bulk" ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}
              >
                <MicrophoneIcon className="w-6 h-6" />
              </button>
            </div>

            {parsedEntries.length > 0 && (
              <div className="rounded-3xl bg-slate-900 border border-white/5 p-6 space-y-4 shadow-2xl">
                 <div className="flex justify-between text-xs font-bold border-b border-white/5 pb-4">
                    <span className="text-slate-500 uppercase">인식된 정보</span>
                    <span className="text-indigo-400 italic">{totalCount}명 / {totalAmount.toLocaleString()}원</span>
                 </div>
                 <div className="space-y-2 max-h-40 overflow-y-auto custom-scroll">
                    {parsedEntries.map((entry, idx) => (
                      <div key={idx} className={`flex justify-between p-3 rounded-xl text-sm font-bold ${entry.isValid ? 'bg-white/2 border border-white/5' : 'opacity-20'}`}>
                        <span className="text-white">{entry.name}</span>
                        <span className="text-indigo-400">{entry.amount.toLocaleString()}원</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 py-2 opacity-50">
           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">날짜</label>
           <input 
              type="date" 
              className="bg-transparent border-none outline-none font-black text-slate-400 text-sm" 
              style={{ colorScheme: 'dark' }}
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
           />
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="p-6 border-t border-white/5 bg-[#0B0E14]">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-6 rounded-[28px] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
            isBulkMode ? 'bg-white text-slate-900 shadow-xl' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
          }`}
        >
          {isSubmitting ? (
            <div className="w-7 h-7 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          ) : (
            <>
              <PencilSquareIcon className="w-6 h-6" />
              <span>{isBulkMode ? `${totalCount}건 한꺼번에 저장` : "저장 완료"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
