import React from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  onClose: () => void;
}

const Header = ({ onClose }: HeaderProps) => (
  <div className="flex items-center justify-between p-6 border-b border-white/5">
    <h2 className="text-xl font-black text-white italic">경조사 기록하기</h2>
    <button 
      onClick={onClose}
      className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
    >
      <XMarkIcon className="w-6 h-6" />
    </button>
  </div>
);

export default Header;
