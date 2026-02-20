import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
  mode: z.enum(['login', 'register']).default('login'),
});

const toUsername = (email: string) => email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/sign-in' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: 'Email + Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        mode: { label: 'Mode', type: 'text' },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password, name, mode } = parsed.data;
        const existing = await prisma.user.findUnique({ where: { email } });

        if (mode === 'register' && !existing) {
          const passwordHash = await bcrypt.hash(password, 12);
          const usernameBase = toUsername(email);
          const count = await prisma.user.count({ where: { username: { startsWith: usernameBase } } });
          return prisma.user.create({
            data: {
              email,
              name,
              passwordHash,
              username: count === 0 ? usernameBase : `${usernameBase}${count + 1}`,
            },
          });
        }

        if (!existing?.passwordHash) return null;
        const valid = await bcrypt.compare(password, existing.passwordHash);
        if (!valid || existing.isBanned) return null;
        return existing;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      return !dbUser?.isBanned;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.username = dbUser.username;
          token.plan = dbUser.plan;
          token.role = dbUser.role;
          token.isBanned = dbUser.isBanned;
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.plan = token.plan;
        session.user.role = (token.role as UserRole) || 'USER';
        session.user.isBanned = Boolean(token.isBanned);
      }
      return session;
    },
  },
};
