export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "red";
}) {
  const colors = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  const base = "border-slate-200 bg-white text-slate-800";
  const cls = accent ? colors[accent] : base;

  return (
    <div className={`rounded-xl border p-5 ${cls}`}>
      <p className="text-xs font-semibold tracking-wide uppercase opacity-70">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
