import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface SummaryCardsProps {
  totalGive: number;
  totalReceive: number;
}

/**
 * 대시보드 상단 요약 카드 컴포넌트
 * 프리미엄 핀테크 감성을 위한 그라데이션 및 레이어드 디자인 적용
 */
const SummaryCards = ({ totalGive, totalReceive }: SummaryCardsProps) => {
  return (
    <div className="summary-section mb-12">
      <div className="grid grid-cols-1 gap-6">
        
        {/* 나가는 돈 카드 (Rose Gold / Deep Red) */}
        <div className="premium-card relative overflow-hidden group">
          {/* 장식용 글로우 효과 */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 blur-[60px] group-hover:bg-rose-500/30 transition-all duration-700"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <ArrowUpIcon className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-[11px] font-black text-rose-300/60 uppercase tracking-widest">
                  Total Given
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                  {totalGive.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-rose-500/80">원</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold italic">
                보낸 마음의 총합
              </p>
            </div>
            
            {/* 배경 아이콘 장식 */}
            <ArrowUpIcon className="w-16 h-16 text-rose-500/10 absolute -right-4 -bottom-4 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

        {/* 들어오는 돈 카드 (Electric Indigo / Deep Blue) */}
        <div className="premium-card relative overflow-hidden group border-indigo-500/10 bg-indigo-950/20">
          {/* 장식용 글로우 효과 */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 blur-[60px] group-hover:bg-indigo-500/30 transition-all duration-700"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <ArrowDownIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-[11px] font-black text-indigo-300/60 uppercase tracking-widest">
                  Total Received
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                  {totalReceive.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-indigo-400/80">원</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold italic">
                받은 정성의 총합
              </p>
            </div>
            
            {/* 배경 아이콘 장식 */}
            <ArrowDownIcon className="w-16 h-16 text-indigo-500/10 absolute -right-4 -bottom-4 transform rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummaryCards;
