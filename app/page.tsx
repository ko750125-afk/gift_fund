"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  subscribeEvents, 
  subscribePeople, 
  downloadAsCSV 
} from "@/lib/db";
import { EventRecord, Person } from "@/types";
import { 
  ArrowDownTrayIcon, 
  ArrowsUpDownIcon,
  UserCircleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  BellIcon,
  QueueListIcon
} from "@heroicons/react/24/outline";
import EditEventModal from "@/components/EditEventModal";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [peopleMap, setPeopleMap] = useState<Map<string, string>>(new Map());
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

  const totalGiven = events
    .filter(e => e.direction === "give")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = events
    .filter(e => e.direction === "receive")
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryStats = events
    .filter(e => e.direction === "give")
    .reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const budgetItems = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1]);

  const maxCategoryAmount = Math.max(...Object.values(categoryStats), 1);

  const filteredEvents = events.filter(e => {
    const personName = peopleMap.get(e.personId)?.toLowerCase() || "";
    const type = e.type.toLowerCase();
    const memo = (e.memo || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return personName.includes(search) || type.includes(search) || memo.includes(search);
  });

  return (
    <div className="p-6 pb-28 animate-up">
      {/* 럭셔리 다크 헤더 */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white font-black text-2xl">
              {user.displayName?.split(' ')?.[0]?.slice(0, 5) || "USER"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                반갑습니다!
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Standard</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1 italic">오늘의 경조사를 확인하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-11 h-11 flex items-center justify-center text-slate-400 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
            <BellIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => downloadAsCSV(user.uid)}
            className="w-11 h-11 flex items-center justify-center text-slate-400 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 종합 자산 현황 보드 (Luxury Card) */}
      <section className="premium-card bg-[#1E293B]/80 mb-10 overflow-hidden relative border-white/10 ring-1 ring-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">전체 자산 흐름</p>
            <span className="text-[10px] text-emerald-400 font-black bg-emerald-400/10 px-2 py-0.5 rounded-full">정상 작동 중</span>
          </div>
          <div className="flex items-baseline gap-2 mb-10">
            <h2 className="text-3xl font-black tabular-nums tracking-tight text-white">
              {(totalReceived - totalGiven).toLocaleString()}
              <span className="text-lg ml-1 text-slate-400">원</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">보낸 금액</p>
              </div>
              <p className="text-xl font-black text-white tabular-nums tracking-tighter italic">-{totalGiven.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">받은 금액</p>
              </div>
              <p className="text-xl font-black text-white tabular-nums tracking-tighter italic">+{totalReceived.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 지출 리포트 (Dark Graph) */}
      <section className="mb-14 animate-up stagger-1">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
          <h2 className="text-lg font-black text-white tracking-tight">지출 분석 리포트</h2>
        </div>
        
        <div className="premium-card">
          {budgetItems.length > 0 ? (
            <div className="space-y-7">
              {budgetItems.map(([type, amount], idx) => {
                const percentage = (amount / maxCategoryAmount) * 100;
                const palette = [
                  "from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]",
                  "from-purple-600 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
                  "from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
                  "from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                ];
                const colorScheme = palette[idx % palette.length];

                return (
                  <div key={type} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{type}</span>
                      </div>
                      <span className="text-base font-black text-white tabular-nums tracking-tighter">
                        {amount.toLocaleString()}<span className="text-[10px] text-slate-500 ml-0.5">원</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                      <div 
                        className={`h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out ${colorScheme}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/5 animate-pulse">
                <ChartBarIcon className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-xs text-slate-500 font-bold leading-relaxed tracking-tight">
                분석할 지출 데이터가 없습니다.<br/>
                <span className="text-indigo-400/60 transition-colors cursor-pointer" onClick={() => router.push('/add')}>내역을 추가해 보세요.</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 타임라인 검색 및 리스트 */}
      <section className="animate-up stagger-2">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-rose-500 rounded-full"></div>
            <h2 className="text-lg font-black text-white tracking-tight">최근 경조사 내역</h2>
          </div>
          <button 
            onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
            className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 hover:bg-white/10 shadow-lg"
          >
            <ArrowsUpDownIcon className="w-3.5 h-3.5 text-slate-500" />
            {sortBy === "date" ? "날짜순" : "금액순"}
          </button>
        </div>

        {/* 다크 프리미엄 검색바 */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-focus-within:bg-indigo-500/10 transition-all duration-700"></div>
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="누구인지, 또는 어떤 경조사인지 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full h-16 bg-[#1E293B]/60 backdrop-blur-xl border border-white/5 rounded-[24px] pl-14 pr-6 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* 타임라인 리스트 (Dark Row) */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="py-20 text-center premium-card border-dashed border-white/5 bg-transparent">
              <QueueListIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-[11px] text-slate-600 font-black tracking-widest uppercase">작성된 기록이 없습니다</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => {
                  setSelectedEvent(event);
                  setIsEditModalOpen(true);
                }}
                className="premium-card flex items-center justify-between hover:bg-white/10 hover:border-white/10 cursor-pointer active:scale-95 group transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                    event.direction === "give" ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  }`}>
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-white tracking-tighter">
                        {peopleMap.get(event.personId) || "알 수 없음"}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg bg-white/5 text-slate-500 border border-white/5 group-hover:text-slate-300">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-1 tracking-tight">{event.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black tracking-tighter italic ${
                    event.direction === "give" ? 'text-indigo-400' : 'text-rose-400'
                  }`}>
                    {event.direction === "give" ? "-" : "+"}{event.amount.toLocaleString()}
                  </p>
                  {event.memo && (
                    <p className="text-[10px] text-slate-600 truncate max-w-[100px] mt-1 font-bold italic group-hover:text-slate-400">
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
      <EditEventModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        personName={selectedEvent ? (peopleMap.get(selectedEvent.personId) || "알 수 없음") : ""}
      />
    </div>
  );
}
