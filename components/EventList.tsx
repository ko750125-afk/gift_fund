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
  if (events.length === 0) {
    return (
      <div className="py-12 text-center bg-[#111] rounded-2xl border-2 border-dashed border-[#333]">
        <p className="text-slate-600 font-bold">기록된 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div 
          key={event.id}
          className="premium-card !p-5 flex items-center justify-between active:bg-[#222] transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* 날짜 (크고 굵게) */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black text-slate-500">{event.date.split('-')[1]}월</span>
              <span className="text-xl font-black text-white">{event.date.split('-')[2]}</span>
            </div>
            
            <div className="h-8 w-1 bg-[#333] rounded-full mx-1"></div>

            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight">
                {peopleMap.get(event.personId) || '지인'}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase ${
                  event.direction === 'give' ? 'text-rose-600' : 'text-blue-600'
                }`}>
                  {event.type}
                </span>
                {event.memo && (
                  <span className="text-[10px] text-slate-600 font-bold truncate max-w-[80px]">
                    | {event.memo}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className={`text-2xl font-black tracking-tighter block ${
                event.direction === 'give' ? 'text-rose-500' : 'text-blue-500'
              }`}>
                {event.direction === 'give' ? '-' : '+'}{event.amount.toLocaleString()}
              </span>
            </div>

            {/* 작업 버튼 (항상 노출하여 접근성 향상) */}
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                className="p-2 text-slate-500 hover:text-white transition-all"
              >
                <PencilSquareIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (event.id) onDelete(event.id); 
                }}
                className="p-2 text-slate-700 hover:text-rose-500 transition-all"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
