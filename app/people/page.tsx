"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  subscribeEvents, 
  subscribePeople 
} from "@/lib/db";
import { Person, EventRecord, PersonSummary } from "@/types";
import { 
  UserGroupIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UsersIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function PeopleListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsubPeople = subscribePeople(user.uid, setPeople);
    const unsubEvents = subscribeEvents(user.uid, "date", setEvents);
    return () => {
      unsubPeople();
      unsubEvents();
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E14]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const peopleSummary: PersonSummary[] = people.map(p => {
    const pEvents = events.filter(e => e.personId === p.id);
    const totalGiven = pEvents.filter(e => e.direction === "give").reduce((s, e) => s + e.amount, 0);
    const totalReceived = pEvents.filter(e => e.direction === "receive").reduce((s, e) => s + e.amount, 0);
    
    return {
      ...p,
      totalGiven,
      totalReceived
    };
  });

  const filteredPeople = peopleSummary.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pb-28 animate-up bg-[#0B0E14] min-h-screen">
      {/* 럭셔리 다크 헤더 */}
      <header className="flex items-center justify-between mb-10 px-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400">
            <UsersIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">지명 내역</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Networking Asset Profiling</p>
          </div>
        </div>
      </header>

      {/* 프리미엄 검색바 */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-indigo-500/5 blur-2xl group-focus-within:bg-indigo-500/10 transition-all duration-700"></div>
        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="지인 이름을 검색해 보세요..."
          className="relative w-full h-16 bg-[#1E293B]/60 backdrop-blur-xl border border-white/5 rounded-[24px] pl-14 pr-12 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/30 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* 지인 리스트 (Luxury Row) */}
      <div className="space-y-4">
        {filteredPeople.length === 0 ? (
          <div className="py-24 text-center premium-card border-dashed border-white/5 bg-transparent">
            <UserGroupIcon className="w-14 h-14 mx-auto mb-4 text-slate-800" />
            <p className="text-[11px] text-slate-600 font-black tracking-widest uppercase italic">
              {searchTerm ? "No search results match" : "No network data available"}
            </p>
          </div>
        ) : (
          filteredPeople.map((p, idx) => (
            <Link key={p.id} href={`/people/${p.id}`} className={`block animate-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="premium-card flex items-center justify-between group hover:bg-white/10 hover:border-white/10 active:scale-95 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/5 flex items-center justify-center text-indigo-400 font-black text-xl group-hover:from-indigo-600 group-hover:to-indigo-400 group-hover:text-white transition-all shadow-xl">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-white text-lg tracking-tight">
                        {p.name}
                      </h3>
                      <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 group-hover:text-slate-300">
                        {p.relationship}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">OUT</span>
                        <p className="text-sm font-black text-indigo-400">-{p.totalGiven.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">IN</span>
                        <p className="text-sm font-black text-rose-400">+{p.totalReceived.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ArrowUpRightIcon className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  <span className="text-[9px] font-black text-slate-700 italic">PROFILED</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
