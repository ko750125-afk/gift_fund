"use client";

import { useEffect, useState } from "react";
import { EventRecord, EventType } from "@/types";
import { updateEvent, deleteEvent } from "@/lib/db";
import { 
  XMarkIcon, 
  TrashIcon, 
  CheckIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventRecord | null;
  personName: string;
}

export default function EditEventModal({ isOpen, onClose, event, personName }: EditEventModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState("");
  const [type, setType] = useState<EventType>("기타");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setAmount(event.amount);
      setDate(event.date);
      setType(event.type);
      setMemo(event.memo || "");
      setShowDeleteConfirm(false);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await updateEvent(event.id!, {
        amount,
        date,
        type,
        memo
      });
      onClose();
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteEvent(event.id!);
      onClose();
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1E293B] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl border-t border-white/5 animate-up">
        {/* 헤더 */}
        <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${event.direction === "give" ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TagIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{personName}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">상세 정보 관리</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
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
                onChange={(e) => setAmount(Number(e.target.value))}
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
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block tracking-widest flex items-center gap-2">
                <TagIcon className="w-4 h-4" /> 카테고리
              </label>
              <select 
                className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 font-bold text-white text-sm appearance-none cursor-pointer transition-all"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
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
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-8 bg-black/20 flex flex-col gap-4">
          {showDeleteConfirm ? (
            <div className="flex gap-3 animate-fade-in">
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 bg-rose-600 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-rose-900/40 active:scale-95 transition-all"
              >
                네, 삭제하겠습니다
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-[0.5] bg-white/5 text-slate-400 py-5 rounded-2xl font-black text-sm border border-white/5 active:scale-95 transition-all"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="col-span-1 bg-white/5 text-rose-500 p-5 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-rose-500/10 active:scale-95 transition-all shadow-lg"
              >
                <TrashIcon className="w-7 h-7" />
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="col-span-4 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckIcon className="w-7 h-7" />
                    저장하기
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
