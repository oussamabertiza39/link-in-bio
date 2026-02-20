'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminUser = { id: string; avatar: string | null; name: string | null; email: string | null; username: string; plan: string; isBanned: boolean; createdAt: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('ALL');
  const [page, setPage] = useState(1);

  async function load() {
    const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}&plan=${plan}`);
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => { void load(); }, [page, search, plan]);

  async function action(type: string, userId: string) {
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, userId }) });
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <div className="flex gap-2">
        <Input placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded-md border border-border bg-transparent px-2" value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="ALL">All plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-border p-3">
            <p>{user.name || user.username} ({user.email})</p>
            <p className="text-sm text-slate-300">{user.plan} • {new Date(user.createdAt).toLocaleDateString()}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={() => window.location.href = `/${user.username}`}>View profile</Button>
              <Button onClick={() => action(user.isBanned ? 'UNBAN' : 'BAN', user.id)} className="bg-amber-600">{user.isBanned ? 'Unban' : 'Ban'}</Button>
              <Button onClick={() => action('DOWNGRADE', user.id)} className="bg-muted">Force free</Button>
              <Button onClick={() => action('IMPERSONATE', user.id)} className="bg-cyan-700">Impersonate</Button>
              <Button onClick={() => confirm('Delete user?') && action('DELETE', user.id)} className="bg-red-700">Delete</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
