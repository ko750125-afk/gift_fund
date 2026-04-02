"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventRecord } from "@/types";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// --- 간소화된 커스텀 훅 및 컴포넌트 ---
import { useEvents } from "@/hooks/useEvents";
import EventList from "@/components/EventList";
import EditEventModal from "@/components/EditEventModal";
import RecordModal from "@/components/RecordModal";
import { deleteEvent } from "@/lib/db";

/**
 * 초심플 대시보드 페이지
 * - 어르신들도 사용하기 쉬운 큰 글씨와 명확한 버튼
 * - 오직 "검색"과 "기록"에만 집중
 */
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    filteredEvents,
    peopleMap,
    searchQuery,
    setSearchQuery,
    loading: dataLoading
  } = useEvents(user?.uid);

  const [activeTab, setActiveTab] = useState<"give" | "receive">("give");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 심플 로딩
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleEditClick = (event: EventRecord) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      await deleteEvent(id);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black min-h-screen p-4 pb-24">
      {/* 1. 간결한 헤더 */}
      <header className="py-6 mb-4 border-b border-white/10 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight">나의 경조사 장부</h1>
        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest italic font-important">Digital Gift Ledger</p>
      </header>

      {/* 2. 대형 검색창 (항상 노출) */}
      <section className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="이름이나 단체명을 검색하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border-2 border-[#333] rounded-2xl pl-14 pr-12 py-5 text-xl font-bold text-white placeholder:text-slate-600 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </section>

      {/* 3. 대형 기록 버튼 (중앙 집중) */}
      <section className="mb-10">
        <button 
          onClick={() => setIsRecordModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white py-8 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20"
        >
          <div className="p-2 bg-white/20 rounded-full">
            <PlusIcon className="w-8 h-8 text-white stroke-[3]" />
          </div>
          <span className="text-2xl font-black tracking-tight">새 경조사 기록하기</span>
        </button>
      </section>

      {/* 4. 내역 리스트 (심플 가독성) */}
      <section className="animate-up">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-black text-white tracking-tight">
            {searchQuery ? "검색 결과" : activeTab === "give" ? "최근 보낸 내역" : "최근 받은 내역"}
          </h2>
        </div>

        <EventList 
          events={searchQuery ? filteredEvents : filteredEvents.filter(e => e.direction === activeTab)} 
          peopleMap={peopleMap} 
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </section>

      {/* 5. 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0E14] border-t border-white/5 pb-8 pt-4 px-6 z-50 flex items-center justify-around backdrop-blur-md">
        <button 
          onClick={() => setActiveTab("give")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "give" ? "text-rose-500 scale-110" : "text-slate-600 opacity-50"}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === "give" ? "bg-rose-500/10" : ""}`}>
            <PlusIcon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">내가 낸 돈</span>
        </button>
        
        <div className="w-px h-8 bg-white/5"></div>

        <button 
          onClick={() => setActiveTab("receive")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "receive" ? "text-indigo-500 scale-110" : "text-slate-600 opacity-50"}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === "receive" ? "bg-indigo-500/10" : ""}`}>
            <SparklesIcon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">나의 경조사</span>
        </button>
      </nav>

      {/* 모달: 편집 */}
      {selectedEvent && (
        <EditEventModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          personName={peopleMap.get(selectedEvent.personId) || "알 수 없음"}
        />
      )}

      {/* 모달: 기록 */}
      <RecordModal 
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        userId={user.uid}
        initialDirection={activeTab}
      />
    </div>
  );
}
