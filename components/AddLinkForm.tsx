'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AddLinkForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url }),
      });
      setTitle('');
      setUrl('');
      onAdded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <Input placeholder="Link title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button onClick={submit} disabled={loading || !title || !url}>{loading ? 'Adding...' : 'Add Link'}</Button>
    </div>
  );
}
