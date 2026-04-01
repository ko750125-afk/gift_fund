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

  // 모달이 열릴 때 초기값 설정
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-slide-up">
        {/* 헤더 */}
        <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${event.direction === "give" ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">{personName}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">기록 수정 및 관리</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 금액 입력 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest flex items-center gap-1">
              <CurrencyDollarIcon className="w-3 h-3" /> 금액
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                className="flex-1 p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-black text-gray-800"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <span className="font-bold text-gray-400">원</span>
            </div>
          </div>

          {/* 날짜 및 유형 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> 날짜
              </label>
              <input 
                type="date" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-800 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest flex items-center gap-1">
                <TagIcon className="w-3 h-3" /> 종류
              </label>
              <select 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-800 text-sm appearance-none"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
              >
                <option value="결혼">결혼</option>
                <option value="장례">장례</option>
                <option value="돌잔치">돌잔치</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest flex items-center gap-1">
              <DocumentTextIcon className="w-3 h-3" /> 메모 (내용)
            </label>
            <input 
              type="text" 
              placeholder="상세 내용을 입력해 주세요"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-800 text-sm"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 bg-gray-50/50 flex flex-col gap-3">
          {showDeleteConfirm ? (
            <div className="flex gap-2 animate-fade-in">
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-rose-200"
              >
                네, 삭제할게요
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-400 py-4 rounded-2xl font-black text-sm border border-gray-100"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="col-span-1 bg-white text-rose-500 p-4 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm hover:bg-rose-50 transition-colors"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="col-span-3 bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckIcon className="w-6 h-6" />
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
