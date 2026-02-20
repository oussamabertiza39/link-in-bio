import { notFound } from 'next/navigation';

import { LinkCard } from '@/components/LinkCard';
import { ProfileHeader } from '@/components/ProfileHeader';
import { prisma } from '@/lib/prisma';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { links: { where: { isActive: true }, orderBy: { position: 'asc' } } },
  });

  if (!user || user.isBanned) return notFound();

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-5 p-4" style={{ backgroundColor: user.backgroundColor ?? '#0f172a' }}>
      <ProfileHeader name={user.name} username={user.username} bio={user.bio} avatar={user.avatar} />
      <div className="space-y-3">
        {user.links.map((link) => (
          <LinkCard key={link.id} title={link.title} url={`/api/analytics?linkId=${link.id}&url=${encodeURIComponent(link.url)}`} icon={link.icon} />
        ))}
      </div>
    </main>
  );
}
