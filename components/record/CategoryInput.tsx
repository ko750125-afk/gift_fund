import React from 'react';
import { MicrophoneIcon } from "@heroicons/react/24/outline";

interface CategoryInputProps {
  value: string;
  onChange: (val: string) => void;
  onRecord: () => void;
  isRecording: boolean;
}

const CategoryInput = ({ value, onChange, onRecord, isRecording }: CategoryInputProps) => (
  <section>
    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">상황 (예: 결혼식, 부친상)</label>
    <div className="relative group">
      <input 
        type="text" 
        placeholder="무슨 경조사인가요?" 
        className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500/40 font-bold text-white text-sm transition-all" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
      <button 
        type="button" 
        onClick={onRecord} 
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-600 hover:text-slate-400'}`}
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
    </div>
  </section>
);

export default CategoryInput;
