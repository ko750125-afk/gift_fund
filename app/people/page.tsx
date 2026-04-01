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
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function PeopleListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 데이터 구독
  useEffect(() => {
    if (!user) return;
    const unsubPeople = subscribePeople(user.uid, setPeople);
    const unsubEvents = subscribeEvents(user.uid, "date", setEvents);
    return () => {
      unsubPeople();
      unsubEvents();
    };
  }, [user]);

  if (loading || !user) return null;

  // 인맥별 데이터 가공
  const peopleSummary: PersonSummary[] = people.map(p => {
    const pEvents = events.filter(e => e.personId === p.id);
    const totalGiven = pEvents.filter(e => e.direction === "give").reduce((s, e) => s + e.amount, 0);
    const totalReceived = pEvents.filter(e => e.direction === "receive").reduce((s, e) => s + e.amount, 0);
    
    return {
      ...p,
      totalGiven,
      totalReceived
    };
  }).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 인맥 관리</h1>

      {/* 검색 바 */}
      <div className="relative mb-8 group">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="이름으로 검색..." 
          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 지인 리스트 */}
      <div className="space-y-4">
        {peopleSummary.length === 0 ? (
          <div className="py-20 text-center opacity-50">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">등록된 지인이 없거나 검색 결과가 없습니다.</p>
          </div>
        ) : (
          peopleSummary.map((p) => (
            <Link key={p.id} href={`/people/${p.id}`}>
              <div className="card flex items-center justify-between group hover:border-primary transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-gray-100 group-hover:border-primary">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                      {p.name}
                      <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{p.relationship}</span>
                    </h3>
                    <div className="flex gap-4 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">보낸 돈</span>
                        <p className="text-sm font-black text-indigo-500">-{p.totalGiven.toLocaleString()}원</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">받은 돈</span>
                        <p className="text-sm font-black text-rose-500">+{p.totalReceived.toLocaleString()}원</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
