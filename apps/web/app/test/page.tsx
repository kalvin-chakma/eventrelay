"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

async function fetchStats() {
  const res = await api.dashboard.$get(undefined, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export default function TestPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading stats…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-red-500">Error: {(error as Error).message}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 p-8">
      <h1 className="text-2xl font-bold text-slate-800">
        EventRelay — Client & Tailwind Test
      </h1>
      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Total" value={data?.total} color="bg-slate-800" />
        <StatCard label="Success" value={data?.success} color="bg-emerald-600" />
        <StatCard label="Failed" value={data?.failed} color="bg-red-600" />
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl ${color} p-6 text-white shadow-lg`}>
      <p className="text-sm uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-4xl font-bold">{value ?? "—"}</p>
    </div>
  );
}
