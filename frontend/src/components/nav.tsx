"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/notices", label: "알림장", icon: "📋" },
  { href: "/textbooks", label: "교재", icon: "📚" },
  { href: "/lesson-plans", label: "레슨플랜", icon: "📅" },
  { href: "/review", label: "데일리 리뷰", icon: "✏️" },
  { href: "/quiz", label: "퀴즈", icon: "🎯" },
  { href: "/learn", label: "학습모드", icon: "🎮" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-100 bg-white min-h-screen pt-6 px-3 fixed left-0 top-0">
        <Link href="/" className="px-3 mb-8">
          <h1 className="text-2xl font-bold text-primary-600">영유</h1>
          <p className="text-xs text-gray-400 mt-0.5">우리 아이 학습 트래커</p>
        </Link>
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center py-2 px-1 text-[10px] font-medium transition-colors min-w-[3.5rem]",
                pathname === link.href ? "text-primary-600" : "text-gray-400"
              )}
            >
              <span className="text-xl mb-0.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
