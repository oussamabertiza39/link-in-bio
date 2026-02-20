'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSettingsPage() {
  const [data, setData] = useState({ maintenanceMode: false, maxFreeLinks: 5, allowedOAuthProviders: 'google,email', announcementBanner: '' });

  async function load() {
    const res = await fetch('/api/admin/settings');
    const json = await res.json();
    if (json.setting) {
      setData({
        maintenanceMode: json.setting.maintenanceMode,
        maxFreeLinks: json.setting.maxFreeLinks,
        allowedOAuthProviders: (json.setting.allowedOAuthProviders || []).join(','),
        announcementBanner: json.setting.announcementBanner || '',
      });
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, allowedOAuthProviders: data.allowedOAuthProviders.split(',').map((p) => p.trim()) }),
    });
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">System Settings</h1>
      <label className="flex items-center gap-2"><input type="checkbox" checked={data.maintenanceMode} onChange={(e) => setData((p) => ({ ...p, maintenanceMode: e.target.checked }))} /> Maintenance mode</label>
      <Input type="number" value={data.maxFreeLinks} onChange={(e) => setData((p) => ({ ...p, maxFreeLinks: Number(e.target.value) }))} />
      <Input value={data.allowedOAuthProviders} onChange={(e) => setData((p) => ({ ...p, allowedOAuthProviders: e.target.value }))} />
      <Input value={data.announcementBanner} onChange={(e) => setData((p) => ({ ...p, announcementBanner: e.target.value }))} />
      <Button onClick={save}>Save settings</Button>
    </div>
  );
}
