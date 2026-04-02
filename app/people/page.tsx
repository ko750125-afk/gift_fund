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
  MagnifyingGlassIcon,
  XMarkIcon,
  UsersIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

/**
 * 초심플 인맥 목록 페이지
 * - 큰 글씨, 명확한 고대비 디자인
 * - '분석' 대신 '받은돈/보낸돈' 핵심 정보만 노출
 */
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="max-w-md mx-auto bg-black min-h-screen p-4 pb-28">
      {/* 초심플 헤더 */}
      <header className="py-6 mb-4 border-b border-white/10 flex items-center gap-3">
        <UsersIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-black text-white tracking-tight italic">인맥 검색</h1>
      </header>

      {/* 대형 검색바 */}
      <div className="relative mb-8">
        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
        <input 
          type="text" 
          placeholder="성함을 입력하세요"
          className="w-full bg-[#111] border-2 border-[#333] rounded-2xl pl-14 pr-12 py-5 text-xl font-bold text-white placeholder:text-slate-700 focus:border-blue-600 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 인맥 리스트 (심플 가독성) */}
      <div className="space-y-3">
        {filteredPeople.length === 0 ? (
          <div className="py-16 text-center bg-[#111] rounded-2xl border-2 border-dashed border-[#333]">
            <UserGroupIcon className="w-10 h-10 mx-auto mb-4 text-slate-800" />
            <p className="text-sm text-slate-600 font-bold uppercase tracking-widest italic">
              {searchTerm ? "검색 결과가 없습니다" : "등록된 인맥이 없습니다"}
            </p>
          </div>
        ) : (
          filteredPeople.map((p, idx) => (
            <Link key={p.id} href={`/people/${p.id}`} className="block">
              <div className="premium-card !p-5 flex items-center justify-between active:bg-[#222] transition-colors">
                <div className="flex items-center gap-5">
                  {/* 이름 첫 글자 배지 (크게) */}
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-white text-xl tracking-tight">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-black text-slate-500 bg-[#222] border border-[#333] px-2 py-0.5 rounded-lg">
                        {p.relationship}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-slate-600">보냄</span>
                        <p className="text-sm font-black text-rose-500">-{p.totalGiven.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-slate-600">받음</span>
                        <p className="text-sm font-black text-blue-400">+{p.totalReceived.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRightIcon className="w-6 h-6 text-slate-800" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
