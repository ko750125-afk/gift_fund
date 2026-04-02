import React from 'react';
import { XMarkIcon, TagIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  personName: string;
  direction: "give" | "receive";
  onClose: () => void;
}

/**
 * 수정 모달 헤더
 * 색상 규칙: 나가는 돈(낸 돈, give) -> 빨강, 들어오는 돈(받은 돈, receive) -> 파랑
 */
const Header = ({ personName, direction, onClose }: HeaderProps) => (
  <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${direction === "give" ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
        <TagIcon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl font-black text-white">{personName}</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">상세 정보 관리</p>
      </div>
    </div>
    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
      <XMarkIcon className="w-6 h-6" />
    </button>
  </div>
);

export default Header;
