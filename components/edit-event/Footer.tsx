import React from 'react';
import { TrashIcon, CheckIcon } from "@heroicons/react/24/outline";

interface FooterProps {
  onSave: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  showDeleteConfirm: boolean;
  onToggleDeleteConfirm: (show: boolean) => void;
}

const Footer = ({ 
  onSave, onDelete, isSubmitting, showDeleteConfirm, onToggleDeleteConfirm 
}: FooterProps) => (
  <div className="p-8 bg-black/20 flex flex-col gap-4">
    {showDeleteConfirm ? (
      <div className="flex gap-3 animate-fade-in">
        <button 
          onClick={onDelete}
          disabled={isSubmitting}
          className="flex-1 bg-rose-600 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-rose-900/40 active:scale-95 transition-all"
        >
          {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : "네, 삭제하겠습니다"}
        </button>
        <button 
          onClick={() => onToggleDeleteConfirm(false)}
          className="flex-[0.5] bg-white/5 text-slate-400 py-5 rounded-2xl font-black text-sm border border-white/5 active:scale-95 transition-all"
        >
          취소
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-5 gap-4">
        <button 
          onClick={() => onToggleDeleteConfirm(true)}
          className="col-span-1 bg-white/5 text-rose-500 p-5 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-rose-500/10 active:scale-95 transition-all shadow-lg"
          title="삭제하기"
        >
          <TrashIcon className="w-7 h-7" />
        </button>
        <button 
          onClick={onSave}
          disabled={isSubmitting}
          className="col-span-4 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {isSubmitting ? (
            <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckIcon className="w-7 h-7" />
              저장하기
            </>
          )}
        </button>
      </div>
    )}
  </div>
);

export default Footer;
