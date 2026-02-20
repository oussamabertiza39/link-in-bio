'use client';

import { Button } from '@/components/ui/button';

export default function BillingPage() {
  async function checkout() {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function portal() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
      <p>$5/month. Unlimited links, analytics, custom themes.</p>
      <div className="flex gap-2">
        <Button onClick={checkout}>Checkout</Button>
        <Button onClick={portal} className="bg-muted">Manage Billing</Button>
      </div>
    </main>
  );
}
