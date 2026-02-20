import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const setting = await prisma.appSetting.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global' },
  });

  return NextResponse.json({ maintenanceMode: setting.maintenanceMode });
}
