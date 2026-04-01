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

  // 로그인 페이지에서는 하단 바를 숨깁니다.
  if (pathname === "/login") return null;

  const NavItem = ({ href, label, icon: Icon, activeIcon: ActiveIcon }: any) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className="flex flex-col items-center justify-center w-full transition-colors group">
        <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}>
          {isActive ? <ActiveIcon className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 h-20 px-6 flex items-center justify-around z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <NavItem href="/" label="대시보드" icon={HomeIcon} activeIcon={HomeSolid} />
      <NavItem href="/add" label="빠른입력" icon={PlusCircleIcon} activeIcon={PlusSolid} />
      <NavItem href="/people" label="내 인맥" icon={UsersIcon} activeIcon={UsersSolid} />
    </nav>
  );
}
