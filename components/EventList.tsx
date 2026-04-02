import React from 'react';
import { EventRecord } from '@/types';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface EventListProps {
  events: EventRecord[];
  peopleMap: Map<string, string>;
  onEdit: (event: EventRecord) => void;
  onDelete: (id: string) => void;
}

/**
 * 초심플 경조사 리스트
 * - 큰 글씨, 고대비, 직관적인 색상 (나간돈 빨강/들어온돈 파랑)
 */
const EventList = ({ events, peopleMap, onEdit, onDelete }: EventListProps) => {
  
  // 날짜 포맷터 (예: 2026-04-01 -> 4/1(수))
  const formatLocalDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekDay = weekDays[date.getDay()];
      return `${month}/${day}(${weekDay})`;
    } catch {
      return dateStr;
    }
  };

  if (events.length === 0) {
    return (
      <div className="py-12 text-center bg-[#111] rounded-2xl border-2 border-dashed border-[#333]">
        <p className="text-slate-600 font-bold">기록된 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id}
          className="premium-card !p-0 overflow-hidden flex flex-col active:bg-[#222] transition-colors"
        >
          {/* 상단 섹션: 날짜, 이름, 금액 */}
          <div className="p-5 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center bg-[#222] border border-[#333] rounded-xl px-2 py-1 min-w-[55px]">
                <span className="text-[14px] font-black text-white leading-tight">
                  {formatLocalDate(event.date)}
                </span>
              </div>
              
              <div className="flex flex-col min-w-0">
                <h3 className="text-xl font-black text-white truncate max-w-[120px] tracking-tight">
                  {peopleMap.get(event.personId) || '지인'}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-2xl font-black tracking-tighter ${
                event.direction === 'give' ? 'text-rose-500' : 'text-blue-500'
              }`}>
                {event.direction === 'give' ? '-' : '+'}{event.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mx-5 h-[1px] bg-white/5"></div>

          {/* 하단 섹션: 항목, 메모, 관리 버튼 */}
          <div className="p-5 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap ${
                event.direction === 'give' ? 'bg-rose-950 text-rose-500' : 'bg-blue-950 text-blue-500'
              }`}>
                {event.type}
              </span>
              {event.memo && (
                <span className="text-xs text-slate-500 font-bold truncate max-w-[150px]">
                  {event.memo}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                className="p-2 text-slate-500 hover:text-white transition-all bg-[#111] border border-[#333] rounded-lg"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (event.id) onDelete(event.id); 
                }}
                className="p-2 text-slate-700 hover:text-rose-500 transition-all bg-[#111] border border-[#333] rounded-lg"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
