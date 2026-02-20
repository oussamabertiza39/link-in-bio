import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { prisma } from '@/lib/prisma';

export async function middleware(req: Request) {
  const { pathname } = new URL(req.url);
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  const setting = await prisma.appSetting.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
  if (setting.maintenanceMode && !token?.id) {
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    if (token.role !== 'ADMIN') return NextResponse.redirect(new URL('/403', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
