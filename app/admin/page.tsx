import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export default async function AdminPage() {
  const [totalUsers, freeUsers, proUsers, totalLinks, totalClicks] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'FREE' } }),
    prisma.user.count({ where: { plan: 'PRO' } }),
    prisma.link.count(),
    prisma.click.count(),
  ]);

  let monthlyRevenue = 0;
  const invoices = await stripe.invoices.list({ limit: 100 });
  monthlyRevenue = invoices.data
    .filter((invoice) => new Date(invoice.created * 1000).getMonth() === new Date().getMonth())
    .reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) / 100;

  const cards = [
    ['Total Users', totalUsers],
    ['Free Users', freeUsers],
    ['Pro Users', proUsers],
    ['Total Links', totalLinks],
    ['Total Clicks', totalClicks],
    ['Monthly Revenue', `$${monthlyRevenue.toFixed(2)}`],
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border p-4">
            <p className="text-sm text-slate-300">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
