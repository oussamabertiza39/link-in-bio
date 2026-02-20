import Link from 'next/link';
import { ReactNode } from 'react';

const items = [
  ['Overview', '/admin'],
  ['Users', '/admin/users'],
  ['Links', '/admin/links'],
  ['Analytics', '/admin/analytics'],
  ['Billing', '/admin/billing'],
  ['Moderation', '/admin/moderation'],
  ['Settings', '/admin/settings'],
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_1fr]">
      <aside className="border-r border-border p-4">
        <h2 className="mb-4 text-lg font-semibold">Admin</h2>
        <nav className="space-y-2">
          {items.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-md px-2 py-1 hover:bg-muted">{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="p-4">{children}</main>
    </div>
  );
}
