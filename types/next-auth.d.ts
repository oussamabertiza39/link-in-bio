import { Plan, UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      plan: Plan;
      role: UserRole;
      isBanned: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username: string;
    plan: Plan;
    role: UserRole;
    isBanned: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    plan: Plan;
    role: UserRole;
    isBanned: boolean;
  }
}
