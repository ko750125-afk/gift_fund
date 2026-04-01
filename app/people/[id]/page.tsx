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
  BanknotesIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import EditEventModal from "@/components/EditEventModal";

export default function PersonDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [searchTerm, setSearchTerm] = useState("");

  // 편집 모달 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 데이터 구독
  useEffect(() => {
    if (!user || !id) return;
    
    // 지인 정보 (단일 정보 구독)
    const unsubPeople = subscribePeople(user.uid, (people) => {
      const p = people.find(item => item.id === id);
      if (p) setPerson(p);
    });

    // 경조사 기록 구독
    const unsubEvents = subscribePersonEvents(id as string, sortBy, setEvents);

    return () => {
      unsubPeople();
      unsubEvents();
    };
  }, [user, id, sortBy]);

  if (loading || !user) return null;
  if (!person) return <div className="p-10 text-center text-gray-400 font-bold">지인 정보를 찾을 수 없습니다.</div>;

  const totalGiven = events.filter(e => e.direction === "give").reduce((s, e) => s + e.amount, 0);
  const totalReceived = events.filter(e => e.direction === "receive").reduce((s, e) => s + e.amount, 0);

  const filteredEvents = events.filter(e => {
    const type = e.type.toLowerCase();
    const memo = (e.memo || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return type.includes(search) || memo.includes(search);
  });

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{person.name} 님</h1>
          <p className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
            <TagIcon className="w-3 h-3" /> {person.relationship}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
            <PhoneIcon className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 합계 요약 */}
      <div className="bg-gray-50 p-6 rounded-3xl mb-10 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-500">내가 낸 총액</span>
          <span className="text-lg font-black text-indigo-600">{totalGiven.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <span className="text-sm font-bold text-gray-500">받은 총액</span>
          <span className="text-lg font-black text-rose-600">{totalReceived.toLocaleString()}원</span>
        </div>
      </div>

      {/* 검색바 */}
      <div className="relative mb-10 group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="항목이나 메모 내용으로 검색..."
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 h-full px-1"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 기록 리스트 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">전체 기록 <span className="text-primary text-sm ml-1">{events.length}건</span></h2>
        <button 
          onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"
        >
          <ArrowsUpDownIcon className="w-4 h-4" />
          {sortBy === "date" ? "날짜순" : "금액순"}
        </button>
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <p className="py-20 text-center text-gray-300 font-medium">
            {searchTerm ? `'${searchTerm}'에 대한 검색 결과가 없습니다.` : "아직 기록된 경조사가 없습니다."}
          </p>
        ) : (
          filteredEvents.map(event => (
            <div 
              key={event.id} 
              className="relative pl-8 pb-8 border-l-2 border-gray-100 last:pb-0 cursor-pointer group"
              onClick={() => {
                setSelectedEvent(event);
                setIsEditModalOpen(true);
              }}
            >
              {/* 타임라인 도트 */}
              <div className={`absolute top-0 -left-[9px] w-4 h-4 rounded-full border-2 border-white group-hover:scale-125 transition-transform ${
                event.direction === "give" ? 'bg-indigo-500 shadow-lg shadow-indigo-100' : 'bg-rose-500 shadow-lg shadow-rose-100'
              }`} />

              <div className="card shadow-md shadow-gray-100 transition-all hover:shadow-xl hover:shadow-gray-200 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${
                      event.direction === "give" ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {event.direction === "give" ? "함(낸)" : "받음"}
                    </span>
                    <span className="text-sm font-black text-gray-800">{event.type}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                    <CalendarDaysIcon className="w-3.5 h-3.5" /> {event.date}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-black text-xl ${
                    event.direction === "give" ? 'text-indigo-600' : 'text-rose-600'
                  }`}>
                    <BanknotesIcon className="w-5 h-5 opacity-30" />
                    {event.direction === "give" ? "-" : "+"}{event.amount.toLocaleString()}원
                  </div>
                  {event.memo && <p className="text-xs text-gray-400 font-medium italic">"{event.memo}"</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 편집 모달 */}
      <EditEventModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        personName={person.name}
      />
    </div>
  );
}
