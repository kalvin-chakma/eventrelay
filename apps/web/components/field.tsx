export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm text-slate-700">{value}</p>
    </div>
  );
}
