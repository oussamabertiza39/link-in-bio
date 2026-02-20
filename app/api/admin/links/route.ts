import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const flagSchema = z.object({ id: z.string(), isFlagged: z.boolean() });
const deleteSchema = z.object({ id: z.string() });

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
    const links = await prisma.link.findMany({
      where: {
        OR: [{ title: { contains: search, mode: 'insensitive' } }, { url: { contains: search, mode: 'insensitive' } }],
      },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
    });
    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = flagSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    await prisma.link.update({ where: { id: parsed.data.id }, data: { isFlagged: parsed.data.isFlagged } });
    await prisma.auditLog.create({ data: { adminId: session.user.id, action: parsed.data.isFlagged ? 'FLAG_LINK' : 'UNFLAG_LINK', targetType: 'LINK', targetId: parsed.data.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = deleteSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    await prisma.link.delete({ where: { id: parsed.data.id } });
    await prisma.auditLog.create({ data: { adminId: session.user.id, action: 'DELETE_LINK', targetType: 'LINK', targetId: parsed.data.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
