import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  maintenanceMode: z.boolean(),
  maxFreeLinks: z.number().min(1).max(100),
  allowedOAuthProviders: z.array(z.string()),
  announcementBanner: z.string().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') throw new Error('Forbidden');
  return session;
}

export async function GET() {
  try {
    await requireAdmin();
    const setting = await prisma.appSetting.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
    return NextResponse.json({ setting });
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const setting = await prisma.appSetting.upsert({ where: { id: 'global' }, update: parsed.data, create: { id: 'global', ...parsed.data } });
    await prisma.auditLog.create({ data: { adminId: session.user.id, action: 'UPDATE_SETTINGS', targetType: 'SYSTEM', metadata: parsed.data } });
    return NextResponse.json({ setting });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
