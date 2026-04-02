"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  subscribePersonEvents, 
  subscribePeople 
} from "@/lib/db";
import { Person, EventRecord } from "@/types";
import { 
  ChevronLeftIcon,
  ArrowsUpDownIcon,
  TagIcon,
  CalendarDaysIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import EditEventModal from "@/components/EditEventModal";

export default function PersonDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [person, setPerson] = useState<Person | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    
    // 지인 정보 구독
    const unsubPeople = subscribePeople(user.uid, (people) => {
      const p = people.find(item => item.id === id);
      if (p) setPerson(p);
    });

    // 해당 지인의 경조사 내역 구독
    const unsubEvents = subscribePersonEvents(id, sortBy, setEvents);

    return () => {
      unsubPeople();
      unsubEvents();
    };
  }, [user, id, sortBy]);

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0E14]">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!person) {
    return (
      <div className="p-20 text-center bg-[#0B0E14] min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm font-black text-slate-700 tracking-widest uppercase mb-6">정보를 찾을 수 없습니다</p>
        <button onClick={() => router.push("/people")} className="text-indigo-400 font-bold underline">목록으로 돌아가기</button>
      </div>
    );
  }

  const totalGiven = events.filter(e => e.direction === "give").reduce((s, e) => s + e.amount, 0);
  const totalReceived = events.filter(e => e.direction === "receive").reduce((s, e) => s + e.amount, 0);

  const filteredEvents = events.filter(e => {
    const type = e.type.toLowerCase();
    const memo = (e.memo || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return type.includes(search) || memo.includes(search);
  });

  return (
    <div className="p-6 pb-28 animate-up bg-[#0B0E14] min-h-screen">
      <header className="flex items-center gap-4 mb-10 px-1">
        <button 
          onClick={() => router.back()} 
          className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 group"
        >
          <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">{person.name}</h1>
          <p className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 inline-flex items-center gap-1 uppercase tracking-widest mt-1.5">
            <TagIcon className="w-3 h-3" /> {person.relationship}
          </p>
        </div>
      </header>

      {/* 종합 현황 */}
      <section className="premium-card bg-[#1E293B]/80 mb-12 relative overflow-hidden ring-1 ring-white/5">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[60px]"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">내가 보낸 총액</span>
              <span className="text-xl font-black text-white italic tracking-tighter">-{totalGiven.toLocaleString()}원</span>
            </div>
            <ArrowUpRightIcon className="w-5 h-5 text-indigo-500 rotate-90 opacity-40" />
          </div>
          <div className="w-full h-px bg-white/5"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">내가 받은 총액</span>
              <span className="text-xl font-black text-rose-500 italic tracking-tighter">+{totalReceived.toLocaleString()}원</span>
            </div>
            <ArrowUpRightIcon className="w-5 h-5 text-rose-500 opacity-40" />
          </div>
        </div>
      </section>

      {/* 검색 바 */}
      <div className="relative mb-12 group">
        <div className="absolute inset-x-0 inset-y-0 bg-indigo-500/5 blur-2xl group-focus-within:bg-indigo-500/10 transition-all duration-700"></div>
        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="기록된 내용을 검색해 보세요..."
          className="relative w-full h-15 bg-[#1E293B]/60 backdrop-blur-xl border border-white/5 rounded-[22px] pl-14 pr-12 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-8 px-1">
        <h2 className="text-lg font-black text-white tracking-tight uppercase">경조사 기록 일지</h2>
        <button 
          onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
          className="text-[9px] font-black text-slate-400 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/10"
        >
          <ArrowsUpDownIcon className="w-3.5 h-3.5" />
          {sortBy === "date" ? "날짜순" : "금액순"}
        </button>
      </div>

      <div className="space-y-1">
        {filteredEvents.length === 0 ? (
          <div className="py-20 text-center premium-card border-dashed border-white/5 bg-transparent">
            <p className="text-[10px] text-slate-700 font-black tracking-[0.2em] uppercase italic">기록된 내역이 없습니다</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <div 
              key={event.id} 
              className="relative pl-10 pb-10 border-l border-white/5 last:pb-0 animate-up shadow-inner"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => {
                setSelectedEvent(event);
                setIsEditModalOpen(true);
              }}
            >
              <div className={`absolute top-1 -left-[5.5px] w-2.5 h-2.5 rounded-full ring-4 ring-slate-950 ${
                event.direction === "give" ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
              }`} />

              <div className="premium-card bg-[#1E293B]/60 hover:bg-white/10 hover:border-white/10 active:scale-[0.98] transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border shadow-inner ${
                      event.direction === "give" ? 'bg-rose-500/10 border-rose-500/10 text-rose-500' : 'bg-indigo-500/10 border-indigo-500/10 text-indigo-400'
                    }`}>
                      {event.direction === "give" ? "보냄" : "받음"}
                    </span>
                    <span className="text-base font-black text-white tracking-tight">{event.type}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1 group-hover:text-slate-400 transition-colors">
                    <CalendarDaysIcon className="w-3.5 h-3.5" /> {event.date}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-black italic tracking-tighter tabular-nums ${
                    event.direction === "give" ? 'text-rose-500' : 'text-indigo-400'
                  }`}>
                    {event.direction === "give" ? "-" : "+"}{event.amount.toLocaleString()}
                    <small className="text-xs ml-1 opacity-40 non-italic">원</small>
                  </div>
                  {event.memo && <p className="text-[10px] text-slate-600 font-bold italic opacity-60 group-hover:opacity-100 transition-opacity">"{event.memo}"</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <EditEventModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          personName={person.name}
        />
      )}
    </div>
  );
}
