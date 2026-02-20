import { prisma } from '@/lib/prisma';

export default async function AdminModerationPage() {
  const [flaggedLinks, reports] = await Promise.all([
    prisma.link.findMany({ where: { isFlagged: true }, include: { user: true }, take: 50 }),
    prisma.report.findMany({ where: { status: 'OPEN' }, take: 50, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Content Moderation</h1>
      <section>
        <h2 className="mb-2 font-semibold">Flagged links</h2>
        {flaggedLinks.map((link) => (
          <div key={link.id} className="rounded border border-border p-2">{link.title} by @{link.user.username} — {link.flagReason || 'No reason'}</div>
        ))}
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Reported content</h2>
        {reports.map((report) => (
          <div key={report.id} className="rounded border border-border p-2">{report.targetType} {report.targetId} — {report.reason}</div>
        ))}
      </section>
    </div>
  );
}
