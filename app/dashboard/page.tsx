'use client';

import { useEffect, useState } from 'react';
import { AddLinkForm } from '@/components/AddLinkForm';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Button } from '@/components/ui/button';

type LinkItem = { id: string; title: string; url: string; isActive: boolean; position: number };

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ day: string; clicks: number }>>([]);

  async function load() {
    setLoading(true);
    const [linksRes, analyticsRes] = await Promise.all([fetch('/api/links'), fetch('/api/analytics')]);
    const linksJson = await linksRes.json();
    const analyticsJson = await analyticsRes.json();
    setLinks(linksJson.links || []);
    setChartData(analyticsJson.series || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function removeLink(id: string) {
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
    await load();
  }

  async function move(id: string, direction: 'up' | 'down') {
    await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, direction }),
    });
    await load();
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <AddLinkForm onAdded={load} />
      <section className="space-y-2">
        {loading ? <p>Loading links...</p> : links.map((link) => (
          <div key={link.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium">{link.title}</p>
              <p className="text-sm text-slate-300">{link.url}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => move(link.id, 'up')}>↑</Button>
              <Button onClick={() => move(link.id, 'down')}>↓</Button>
              <Button onClick={() => removeLink(link.id)} className="bg-red-600">Delete</Button>
            </div>
          </div>
        ))}
      </section>
      <section>
        <h2 className="mb-2 text-xl">Analytics</h2>
        <AnalyticsChart data={chartData} />
      </section>
    </main>
  );
}
