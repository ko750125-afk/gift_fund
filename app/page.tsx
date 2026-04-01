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
  ChartBarIcon
} from "@heroicons/react/24/outline";
import EditEventModal from "@/components/EditEventModal";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [peopleMap, setPeopleMap] = useState<Map<string, string>>(new Map());
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 편집 모달 활성화 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  // 로그인 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 데이터 구독 (실시간)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 총액 계산
  const totalGiven = events
    .filter(e => e.direction === "give")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = events
    .filter(e => e.direction === "receive")
    .reduce((sum, e) => sum + e.amount, 0);

  // 카테고리별 통계 계산 (낸 금액 기준)
  const categoryStats = events
    .filter(e => e.direction === "give")
    .reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const budgetItems = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1]); // 금액 큰 순으로 정렬

  const maxCategoryAmount = Math.max(...Object.values(categoryStats), 1);

  // 검색어 필터링 실시간 반영
  const filteredEvents = events.filter(e => {
    const personName = peopleMap.get(e.personId)?.toLowerCase() || "";
    const type = e.type.toLowerCase();
    const memo = (e.memo || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return personName.includes(search) || type.includes(search) || memo.includes(search);
  });

  return (
    <div className="p-6 pb-24 animate-fade-in">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500">반가워요, 대표님!</p>
          <h1 className="text-2xl font-bold text-gray-900">경조사 대시보드</h1>
        </div>
        <button 
          onClick={() => downloadAsCSV(user.uid)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          title="엑셀 다운로드"
        >
          <ArrowDownTrayIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-semibold mb-1">내가 보낸 총액</p>
          <p className="text-xl font-bold text-indigo-900">
            {totalGiven.toLocaleString()}원
          </p>
        </div>
        <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
          <p className="text-xs text-rose-600 font-semibold mb-1">내가 받은 총액</p>
          <p className="text-xl font-bold text-rose-900">
            {totalReceived.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 카테고리별 지출 통계 */}
      {budgetItems.length > 0 && (
        <div className="mb-10 animate-fade-in stagger-1">
          <div className="flex items-center gap-2 mb-4 px-1">
            <ChartBarIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-800">항목별 지출 현황</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            {budgetItems.map(([type, amount], idx) => {
              const percentage = (amount / maxCategoryAmount) * 100;
              const barColors = [
                "bg-indigo-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500"
              ];
              const colorClass = barColors[idx % barColors.length];

              return (
                <div key={type} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                      {type}
                    </span>
                    <span className="text-sm font-black text-gray-900">{amount.toLocaleString()}원</span>
                  </div>
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 검색바 */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="이름이나 '결혼식' 같은 키워드로 검색..."
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 font-medium"
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

      {/* 최근 기록 타이틀 & 정렬 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">최근 경조사 기록</h2>
        <button 
          onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-all"
        >
          <ArrowsUpDownIcon className="w-3.5 h-3.5" />
          {sortBy === "date" ? "날짜순" : "금액순"}
        </button>
      </div>

      {/* 기록 리스트 */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircleIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400">
              {searchTerm ? `'${searchTerm}'에 대한 검색 결과가 없습니다.` : "아직 등록된 기록이 없습니다. 하단 + 버튼으로 시작해 보세요!"}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="card flex items-center justify-between border-l-4 cursor-pointer active:scale-[0.98] transition-transform" 
              style={{
                borderLeftColor: event.direction === "give" ? "#4F46E5" : "#EC4899"
              }}
              onClick={() => {
                setSelectedEvent(event);
                setIsEditModalOpen(true);
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-2xl ${event.direction === "give" ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                  <UserCircleIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/people/${event.personId}`);
                      }}
                      className="font-bold text-gray-900 hover:text-primary transition-colors underline decoration-gray-200 underline-offset-4 decoration-2"
                    >
                      {peopleMap.get(event.personId) || "알 수 없음"}
                    </button>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">{event.type}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${event.direction === "give" ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {event.direction === "give" ? "-" : "+"}{event.amount.toLocaleString()}원
                </p>
                {event.memo && <p className="text-[10px] text-gray-400 truncate max-w-[100px] mt-0.5 font-medium italic">"{event.memo}"</p>}
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
        personName={selectedEvent ? (peopleMap.get(selectedEvent.personId) || "알 수 없음") : ""}
      />
    </div>
  );
}

// 아이콘 임포트 에러 방지 (PlusCircleIcon이 heroicons/react/24/outline에 있음)
