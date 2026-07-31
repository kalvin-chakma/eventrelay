export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    delivered: "bg-emerald-100 text-emerald-700",
    success: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
