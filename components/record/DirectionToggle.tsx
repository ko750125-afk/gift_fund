import React from 'react';
import { EventDirection } from "@/types";

interface DirectionToggleProps {
  direction: EventDirection;
  onDirectionChange: (dir: EventDirection) => void;
}

const DirectionToggle = ({ direction, onDirectionChange }: DirectionToggleProps) => (
  <div className="grid grid-cols-2 gap-3">
    <button 
      type="button" 
      onClick={() => onDirectionChange("give")} 
      className={`py-5 rounded-2xl font-black text-xs transition-all border ${direction === "give" ? 'bg-white text-slate-900 border-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'}`}
    >
      돈 보냈을 때 (-)
    </button>
    <button 
      type="button" 
      onClick={() => onDirectionChange("receive")} 
      className={`py-5 rounded-2xl font-black text-xs transition-all border ${direction === "receive" ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-900/20' : 'bg-white/5 border-white/5 text-slate-500'}`}
    >
      돈 받았을 때 (+)
    </button>
  </div>
);

export default DirectionToggle;
