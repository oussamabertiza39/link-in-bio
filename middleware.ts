import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function isMaintenanceMode(req: Request) {
  try {
    const response = await fetch(new URL('/api/public/settings', req.url), {
      method: 'GET',
      cache: 'no-store',
      headers: { 'x-middleware-request': '1' },
    });

    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data?.maintenanceMode);
  } catch {
    return false;
  }
}

export async function middleware(req: Request) {
  const { pathname } = new URL(req.url);
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  const maintenanceMode = await isMaintenanceMode(req);

  if (maintenanceMode && !token?.id) {
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
