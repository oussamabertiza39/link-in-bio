import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
});

const moveSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(['up', 'down']),
});

const settingsSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  bio: z.string().max(280).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  backgroundColor: z.string().min(4),
  theme: z.string().min(2),
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  return session;
}

export async function GET() {
  try {
    const session = await requireSession();
    const links = await prisma.link.findMany({ where: { userId: session.user.id }, orderBy: { position: 'asc' } });
    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const settings = await prisma.appSetting.findUnique({ where: { id: 'global' } });
    const maxFree = settings?.maxFreeLinks ?? 5;
    const count = await prisma.link.count({ where: { userId: session.user.id } });
    if (session.user.plan === 'FREE' && count >= maxFree) {
      return NextResponse.json({ error: `Free plan allows ${maxFree} links` }, { status: 403 });
    }

    const link = await prisma.link.create({
      data: { ...parsed.data, userId: session.user.id, position: count + 1 },
    });
    return NextResponse.json({ link });
  } catch {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = moveSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const link = await prisma.link.findFirst({ where: { id: parsed.data.id, userId: session.user.id } });
    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const swapWithPos = parsed.data.direction === 'up' ? link.position - 1 : link.position + 1;
    const swapLink = await prisma.link.findFirst({ where: { userId: session.user.id, position: swapWithPos } });
    if (!swapLink) return NextResponse.json({ ok: true });

    await prisma.$transaction([
      prisma.link.update({ where: { id: link.id }, data: { position: swapWithPos } }),
      prisma.link.update({ where: { id: swapLink.id }, data: { position: link.position } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to reorder link' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = settingsSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: parsed.data.username,
        bio: parsed.data.bio,
        avatar: parsed.data.avatar || null,
        backgroundColor: parsed.data.backgroundColor,
        theme: parsed.data.theme,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed to save profile settings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession();
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.link.deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
