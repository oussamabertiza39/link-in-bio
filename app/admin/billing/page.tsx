import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export default async function AdminBillingPage() {
  const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100 });
  const churned = await stripe.subscriptions.list({ status: 'canceled', limit: 100 });
  const proUsers = await prisma.user.findMany({ where: { plan: 'PRO' }, select: { id: true, email: true, username: true } });
  const mrr = subscriptions.data.reduce((sum, sub) => sum + (sub.items.data[0]?.price.unit_amount || 0), 0) / 100;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Billing & Revenue</h1>
      <p>MRR: ${mrr.toFixed(2)}</p>
      <p>Active subscriptions: {subscriptions.data.length}</p>
      <p>Churned subscriptions: {churned.data.length}</p>
      <h2 className="font-semibold">Current Pro Users</h2>
      {proUsers.map((u) => <p key={u.id}>{u.username} ({u.email})</p>)}
    </div>
  );
}
