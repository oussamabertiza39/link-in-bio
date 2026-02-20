import Link from 'next/link';

interface LinkCardProps {
  title: string;
  url: string;
  icon?: string | null;
}

export function LinkCard({ title, url, icon }: LinkCardProps) {
  return (
    <Link href={url} target="_blank" className="flex items-center justify-between rounded-xl border border-border bg-black/20 px-4 py-3">
      <span>{title}</span>
      {icon ? <span className="text-sm text-slate-300">{icon}</span> : null}
    </Link>
  );
}
