import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold">Link-in-Bio SaaS</h1>
      <p className="text-slate-300">Build your public profile, manage links, and unlock analytics with Pro.</p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 font-medium">Dashboard</Link>
        <Link href="/billing" className="rounded-md border border-border px-4 py-2">Upgrade</Link>
      </div>
    </main>
  );
}
