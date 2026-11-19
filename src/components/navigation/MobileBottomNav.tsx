"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Trophy, AlertCircle, Swords } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  hasPulse?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [unresolvedMistakes, setUnresolvedMistakes] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchMistakesCount() {
      try {
        const res = await fetch("/api/mistakes?limit=1");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.stats?.totalUnresolved !== undefined) {
            setUnresolvedMistakes(data.stats.totalUnresolved);
          }
        }
      } catch (err) {
        // Silently catch in offline or non-blocking mode
      }
    }

    fetchMistakesCount();
    const interval = setInterval(fetchMistakesCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems: NavItem[] = [
    {
      name: "الرئيسية",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "التعلم",
      href: "/?tab=curriculum",
      icon: BookOpen,
    },
    {
      name: "بنك الأسئلة",
      href: "/dashboard/exam-simulator",
      icon: Trophy,
    },
    {
      name: "أخطائي",
      href: "/dashboard/mistakes",
      icon: AlertCircle,
      badge: unresolvedMistakes > 0 ? (unresolvedMistakes > 99 ? "99+" : unresolvedMistakes) : undefined,
    },
    {
      name: "تحدي 1v1",
      href: "/dashboard/challenge",
      icon: Swords,
      hasPulse: true,
    },
  ];

  // Do not render bottom nav on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      dir="rtl"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B1528]/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] transition-all"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0.5rem))" }}
      aria-label="التنقل السفلي للموبايل"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-amber-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <span className="absolute -top-1 w-7 h-1 bg-amber-400 rounded-full shadow-[0_0_10px_#EABF58]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.5px] text-amber-400 -translate-y-0.5" : "stroke-[1.8px]"
                  }`}
                />

                {/* Unresolved Mistakes Badge */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* 1v1 Pulse Dot */}
                {item.hasPulse && !item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[62px] ${isActive ? "text-amber-400 font-black" : "text-slate-300 font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
