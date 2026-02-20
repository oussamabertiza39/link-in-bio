import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/utils';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) return NextResponse.json({ error: 'No customer found' }, { status: 400 });

  const portal = await stripe.billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: absoluteUrl('/billing') });
  return NextResponse.json({ url: portal.url });
}
