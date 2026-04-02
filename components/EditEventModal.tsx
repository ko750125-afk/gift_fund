"use client";

import { useEffect, useState } from "react";
import { EventRecord, EventType } from "@/types";
import { updateEvent, deleteEvent } from "@/lib/db";

// --- 리팩토링된 서브 컴포넌트들 ---
import Header from "./edit-event/Header";
import FormFields from "./edit-event/FormFields";
import Footer from "./edit-event/Footer";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventRecord | null;
  personName: string;
}

/**
 * 경조사 기록 수정 모달
 * - 기존 기록을 불러와서 수정하거나 삭제할 수 있는 기능을 제공합니다.
 * - 사용자 경험을 고려하여 삭제 전 확인 절차(Confirm)를 포함하고 있습니다.
 */
export default function EditEventModal({ isOpen, onClose, event, personName }: EditEventModalProps) {
  // 1. 상태 관리
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState("");
  const [type, setType] = useState<EventType>("기타");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 2. 모달 열릴 때 초기 데이터 세팅
  useEffect(() => {
    if (event && isOpen) {
      setAmount(event.amount);
      setDate(event.date);
      setType(event.type);
      setMemo(event.memo || "");
      setShowDeleteConfirm(false); // 재진입 시 삭제 확인 초기화
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  // 3. 수정 핸들러
  const handleUpdate = async () => {
    if (amount <= 0) {
      alert("금액을 정확히 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateEvent(event.id!, { amount, date, type, memo });
      onClose(); // 성공 시 닫기
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. 삭제 핸들러
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteEvent(event.id!);
      onClose(); // 성공 시 닫기
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1E293B] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl border-t border-white/5 animate-up">
        
        {/* 헤더 파트 */}
        <Header 
          personName={personName} 
          direction={event.direction} 
          onClose={onClose} 
        />

        {/* 입력 필드 파트 */}
        <FormFields 
          amount={amount} onAmountChange={setAmount}
          date={date} onDateChange={setDate}
          type={type} onTypeChange={setType}
          memo={memo} onMemoChange={setMemo}
        />

        {/* 하단 버튼 파트 (삭제/저장) */}
        <Footer 
          onSave={handleUpdate}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
          showDeleteConfirm={showDeleteConfirm}
          onToggleDeleteConfirm={setShowDeleteConfirm}
        />

      </div>
    </div>
  );
}
