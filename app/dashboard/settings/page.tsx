'use client';

import { useState } from 'react';
import { ThemePicker } from '@/components/ThemePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  const [form, setForm] = useState({ username: '', bio: '', avatar: '', backgroundColor: '#0f172a', theme: 'minimal' });
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch('/api/links', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Profile Settings</h1>
      <Input placeholder="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
      <Textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
      <Input placeholder="Avatar URL" value={form.avatar} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} />
      <Input type="color" value={form.backgroundColor} onChange={(e) => setForm((p) => ({ ...p, backgroundColor: e.target.value }))} />
      <ThemePicker currentTheme={form.theme} onSelect={(theme) => setForm((p) => ({ ...p, theme }))} />
      <Button onClick={save}>{loading ? 'Saving...' : 'Save settings'}</Button>
    </main>
  );
}
