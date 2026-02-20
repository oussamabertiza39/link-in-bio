import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/utils';
import { stripe, STRIPE_PRO_PRICE_ID } from '@/lib/stripe';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const customerId = user.stripeCustomerId || (await stripe.customers.create({ email: user.email || undefined })).id;
  if (!user.stripeCustomerId) await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: absoluteUrl('/billing?success=1'),
    cancel_url: absoluteUrl('/billing?canceled=1'),
  });

  return NextResponse.json({ url: checkout.url });
}
