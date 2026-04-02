"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { EventRecord } from '@/types';

interface CalendarProps {
  events: EventRecord[];
}

/**
 * 📅 경조사 지출 현황 달력
 * - '내가 낸 돈'을 일자별로 합산하여 표시
 * - 월별 이동 기능 제공
 */
export default function Calendar({ events }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());

  // 현재 보고 있는 월의 정보 계산
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 이전 달 / 다음 달 이동
  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  // 1. 해당 월의 일자별 지출액 합산 (direction === "give")
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.direction !== 'give') return;
      
      const eventDate = new Date(event.date);
      if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
        const day = eventDate.getDate();
        totals[day] = (totals[day] || 0) + event.amount;
      }
    });
    
    return totals;
  }, [events, year, month]);

  // 2. 달력 그리드 데이터 생성
  const { paddingDays, daysInMonth } = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    
    // 월요일 시작으로 맞추기 위해 조정 (선택 사항, 여기선 일요일 시작)
    const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const dates = Array.from({ length: lastDateOfMonth }, (_, i) => i + 1);
    
    return { paddingDays: padding, daysInMonth: dates };
  }, [year, month]);

  // 금액 포맷터 (예: 95,000 -> 9.5만 / 5,000 -> 5천)
  const formatAmount = (amnt: number) => {
    if (amnt >= 10000) {
      const man = amnt / 10000;
      return `${parseFloat(man.toFixed(1))}만`;
    }
    if (amnt >= 1000) {
      const chun = Math.floor(amnt / 1000);
      return `${chun}천`;
    }
    return amnt.toLocaleString();
  };

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 mb-8 shadow-2xl overflow-hidden">
      {/* 헤더: 월 이동 */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-white tracking-widest italic">
          {year}년 {month + 1}월 <span className="text-rose-500 font-bold ml-1 text-sm not-italic">支出</span>
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all active:scale-90"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all active:scale-90"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 요일 라벨 */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayLabels.map((label, i) => (
          <div key={label} className={`text-center text-[10px] font-black uppercase tracking-tighter ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-x-2 gap-y-4">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="h-12"></div>
        ))}
        {daysInMonth.map(day => {
          const total = dailyTotals[day];
          const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
          
          return (
            <div key={day} className="flex flex-col items-center justify-start min-h-[48px] relative group">
              <span className={`text-xs font-bold mb-1 ${isToday ? 'bg-rose-500 text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
                {day}
              </span>
              {total > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-md px-1 py-0.5 w-full text-center">
                  <span className="text-[9px] font-black text-rose-400 leading-tight block truncate">
                    {formatAmount(total)}
                  </span>
                </div>
              )}
              
              {/* 호버 효과 장식 */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-all -z-10 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
