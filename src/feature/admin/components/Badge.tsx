export default function Badge({ status }: { status: string }) {
  const color =
    status === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
      : status === 'Expiring soon'
      ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
      : status === 'Expired'
      ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
      : 'bg-slate-100 text-slate-600 border border-slate-200/80';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-black shadow-2xs ${color}`}>
      {status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status}
    </span>
  );
}
