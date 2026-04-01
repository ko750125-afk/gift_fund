"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UsersIcon, 
  PlusCircleIcon 
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeSolid, 
  UsersIcon as UsersSolid, 
  PlusCircleIcon as PlusSolid 
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const navItems = [
    { href: "/", label: "홈", icon: HomeIcon, activeIcon: HomeSolid },
    { href: "/add", label: "기록", icon: PlusCircleIcon, activeIcon: PlusSolid },
    { href: "/people", label: "인맥", icon: UsersIcon, activeIcon: UsersSolid },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[432px] z-50">
      <nav className="bg-[#1E293B]/60 backdrop-blur-3xl border border-white/5 h-20 px-10 flex items-center justify-between rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden relative">
        {/* 블러 배경 효과 */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-slate-400'}`}>
                <Icon className="w-7 h-7" />
              </div>
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-400 rounded-full glow-indigo shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
