import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const actionSchema = z.object({
  type: z.enum(['BAN', 'UNBAN', 'DOWNGRADE', 'DELETE', 'IMPERSONATE']),
  userId: z.string(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') throw new Error('Forbidden');
  return session;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1);
    const search = req.nextUrl.searchParams.get('search') ?? '';
    const plan = req.nextUrl.searchParams.get('plan') ?? 'ALL';
    const users = await prisma.user.findMany({
      where: {
        AND: [
          search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { username: { contains: search, mode: 'insensitive' } }] } : {},
          plan === 'ALL' ? {} : { plan: plan as 'FREE' | 'PRO' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
      select: { id: true, avatar: true, name: true, email: true, username: true, plan: true, isBanned: true, createdAt: true },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = actionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { type, userId } = parsed.data;

    if (type === 'BAN') await prisma.user.update({ where: { id: userId }, data: { isBanned: true, bannedAt: new Date() } });
    if (type === 'UNBAN') await prisma.user.update({ where: { id: userId }, data: { isBanned: false, bannedAt: null } });
    if (type === 'DOWNGRADE') await prisma.user.update({ where: { id: userId }, data: { plan: 'FREE', stripeSubscriptionId: null } });
    if (type === 'DELETE') {
      await prisma.user.delete({ where: { id: userId } });
    }

    await prisma.auditLog.create({
      data: { adminId: session.user.id, action: type, targetType: 'USER', targetId: userId, metadata: { type } },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
