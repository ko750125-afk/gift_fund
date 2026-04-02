"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  subscribeEvents,
  subscribePeople,
  downloadAsCSV
} from "@/lib/db";
import { EventRecord } from "@/types";
import {
  ArrowDownTrayIcon,
  ArrowsUpDownIcon,
  UserCircleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  QueueListIcon
} from "@heroicons/react/24/outline";
import EditEventModal from "@/components/EditEventModal";
import RecordModal from "@/components/RecordModal";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [peopleMap, setPeopleMap] = useState<Map<string, string>>(new Map());
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const unsubPeople = subscribePeople(user.uid, (people) => {
      const pMap = new Map();
      people.forEach(p => pMap.set(p.id, p.name));
      setPeopleMap(pMap);
    });

    const unsubEvents = subscribeEvents(user.uid, sortBy, (data) => {
      setEvents(data);
    });

    return () => {
      unsubPeople();
      unsubEvents();
    };
  }, [user, sortBy]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E14]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter(e => {
    const personName = peopleMap.get(e.personId)?.toLowerCase() || "";
    const type = e.type.toLowerCase();
    const memo = (e.memo || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return personName.includes(search) || type.includes(search) || memo.includes(search);
  });

  return (
    <div className="p-6 pb-32 animate-up max-w-lg mx-auto bg-[#0B0E14] min-h-screen">
      {/* 럭셔리 미니멀 헤더 */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-900/40 italic">
            GP
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight italic">나의 경조사 장부</h1>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Digital Ledger System</p>
          </div>
        </div>
        <button 
          onClick={() => downloadAsCSV(user.uid)}
          className="w-11 h-11 flex items-center justify-center text-slate-500 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
      </header>

      {/* 1단계: 기록하기 (Main Action) */}
      <section className="mb-14">
        <button 
          onClick={() => setIsRecordModalOpen(true)}
          className="relative w-full py-12 bg-indigo-600 rounded-[40px] overflow-hidden group shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 flex flex-col items-center justify-center gap-3"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
          <PlusCircleIcon className="w-14 h-14 text-white" />
          <span className="text-2xl font-black text-white tracking-tight">경조사 기록하기</span>
          <div className="w-12 h-1 bg-white/20 rounded-full"></div>
        </button>
      </section>

      {/* 2단계: 검색하기 */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="w-1.5 h-5 bg-rose-500 rounded-full"></div>
          <h2 className="text-lg font-black text-white tracking-tight italic">내역 찾아보기</h2>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-white/5 blur-2xl group-focus-within:bg-white/10 transition-all duration-700"></div>
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-700 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="이름이나 상황을 입력하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full h-20 bg-[#1E293B]/60 backdrop-blur-3xl border border-white/10 rounded-[30px] pl-16 pr-8 text-lg font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          )}
        </div>
      </section>

      {/* 3단계: 장부 리스트 */}
      <section className="animate-up">
        <div className="flex items-center justify-between mb-8 px-1">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">장부 타임라인</span>
          <button 
            onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
            className="text-[10px] font-black text-indigo-400 flex items-center gap-2 px-4 py-2 bg-indigo-400/5 border border-indigo-400/10 rounded-full hover:bg-indigo-400/10 transition-all"
          >
            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
            {sortBy === "date" ? "최신순 정렬" : "금액순 정렬"}
          </button>
        </div>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/2">
              <QueueListIcon className="w-20 h-20 text-slate-800/50 mx-auto mb-6" />
              <p className="text-[11px] text-slate-700 font-black tracking-widest uppercase italic">등록된 기록이 없습니다</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => {
                  setSelectedEvent(event);
                  setIsEditModalOpen(true);
                }}
                className="premium-card flex items-center justify-between hover:bg-white/5 cursor-pointer active:scale-[0.98] group transition-all p-8 rounded-[35px] border-white/5 bg-[#1E293B]/40"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                    event.direction === "give" ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    <UserCircleIcon className="w-9 h-9" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-white tracking-tighter">
                        {peopleMap.get(event.personId) || "이름 없음"}
                      </span>
                      <span className="text-[10px] font-black text-slate-600 border border-white/5 px-2 py-0.5 rounded-lg bg-white/5">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-bold mt-1 tracking-tight">{event.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black tracking-tighter italic ${
                    event.direction === "give" ? 'text-indigo-400' : 'text-rose-400'
                  }`}>
                    {event.direction === "give" ? "-" : "+"}{event.amount.toLocaleString()}
                  </p>
                  {event.memo && (
                    <p className="text-[10px] text-slate-700 truncate max-w-[120px] mt-1.5 font-bold italic group-hover:text-slate-500">
                      "{event.memo}"
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 편집 모달 */}
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

      {/* 기록 모달 */}
      <RecordModal 
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        userId={user.uid}
      />
    </div>
  );
}
