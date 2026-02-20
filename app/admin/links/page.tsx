'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LinkItem = { id: string; title: string; url: string; isFlagged: boolean; user: { username: string } };

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    const res = await fetch(`/api/admin/links?page=${page}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setLinks(data.links || []);
  }

  useEffect(() => { void load(); }, [page, search]);

  async function remove(id: string) {
    await fetch('/api/admin/links', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  }

  async function flag(id: string, isFlagged: boolean) {
    await fetch('/api/admin/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isFlagged: !isFlagged }) });
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Link Moderation</h1>
      <Input placeholder="Search URL or title" value={search} onChange={(e) => setSearch(e.target.value)} />
      {links.map((link) => (
        <div key={link.id} className="rounded-lg border border-border p-3">
          <p>{link.title} - {link.url}</p>
          <p className="text-sm text-slate-300">@{link.user.username}</p>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => flag(link.id, link.isFlagged)} className="bg-amber-600">{link.isFlagged ? 'Unflag' : 'Flag'}</Button>
            <Button onClick={() => remove(link.id)} className="bg-red-700">Delete</Button>
          </div>
        </div>
      ))}
      <div className="flex gap-2"><Button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button><Button onClick={() => setPage((p) => p + 1)}>Next</Button></div>
    </div>
  );
}
