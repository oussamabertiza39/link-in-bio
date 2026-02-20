import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { subDays } from 'date-fns';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.searchParams.get('linkId');
  const url = req.nextUrl.searchParams.get('url');

  if (linkId && url) {
    const userAgent = req.headers.get('user-agent') || undefined;
    const referrer = req.headers.get('referer') || undefined;
    await prisma.click.create({ data: { linkId, userAgent, referrer } });
    return NextResponse.redirect(url);
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clicks = await prisma.click.findMany({
    where: { link: { userId: session.user.id } },
    orderBy: { timestamp: 'asc' },
  });

  const series = Array.from({ length: 7 }).map((_, idx) => {
    const day = subDays(new Date(), 6 - idx);
    const key = day.toISOString().slice(0, 10);
    const total = clicks.filter((click) => click.timestamp.toISOString().slice(0, 10) === key).length;
    return { day: key.slice(5), clicks: total };
  });

  const totalClicks = clicks.length;
  return NextResponse.json({ totalClicks, series });
}
