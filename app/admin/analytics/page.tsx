import { prisma } from '@/lib/prisma';

export default async function AdminAnalyticsPage() {
  const [topProfiles, topLinks, daily] = await Promise.all([
    prisma.user.findMany({
      select: { username: true, _count: { select: { links: true } }, links: { select: { clicks: true } } },
      take: 50,
    }),
    prisma.link.findMany({ include: { user: true, _count: { select: { clicks: true } } }, orderBy: { clicks: { _count: 'desc' } }, take: 10 }),
    prisma.click.groupBy({ by: ['timestamp'], _count: true, orderBy: { timestamp: 'desc' }, take: 30 }),
  ]);

  const topProfilesMapped = topProfiles
    .map((user) => ({ username: user.username, clicks: user.links.reduce((a, l) => a + l.clicks.length, 0) }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Platform Analytics</h1>
      <section>
        <h2 className="font-semibold">Top 10 Profiles</h2>
        {topProfilesMapped.map((item) => <p key={item.username}>@{item.username}: {item.clicks} clicks</p>)}
      </section>
      <section>
        <h2 className="font-semibold">Top 10 Links</h2>
        {topLinks.map((link) => <p key={link.id}>{link.title} ({link._count.clicks})</p>)}
      </section>
      <section>
        <h2 className="font-semibold">Recent Traffic Points</h2>
        {daily.map((d, idx) => <p key={idx}>{new Date(d.timestamp).toLocaleDateString()}: {d._count}</p>)}
      </section>
    </div>
  );
}
