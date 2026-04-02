"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UsersIcon,
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeSolid, 
  UsersIcon as UsersSolid, 
} from "@heroicons/react/24/solid";

/**
 * 초심플 하단 네비게이션
 * - 홈(기록/검색) 및 인맥 관리만 유지
 * - 어르신들을 위한 큼직한 아이콘과 높은 대비
 */
export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const navItems = [
    { href: "/", label: "장부 홈", icon: HomeIcon, activeIcon: HomeSolid },
    { href: "/people", label: "사람 검색", icon: UsersIcon, activeIcon: UsersSolid },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
      <nav className="bg-[#1A1A1A] border-2 border-[#333] h-20 flex items-center justify-around rounded-2xl shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center justify-center transition-all px-8 py-2 ${isActive ? 'text-blue-500 scale-110' : 'text-slate-600'}`}
            >
              <Icon className="w-8 h-8" />
              <span className={`text-[10px] font-black mt-1 uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
