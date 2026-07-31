"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, hydrate, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/subscriptions", label: "Subscriptions" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <nav className="flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-3">
        <span className="font-bold text-slate-800">EventRelay</span>
        <div className="flex gap-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium ${
                pathname === l.href
                  ? "text-slate-900 underline underline-offset-4"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto text-sm text-slate-500 hover:text-red-600"
        >
          Logout
        </button>
      </nav>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
