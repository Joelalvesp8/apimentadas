import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isAdminEmail } from '@/lib/admin';
import { checkRateLimit } from '@/lib/utils/rate-limit';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasGoogleCredentials = !!(googleClientId && googleClientSecret);

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours - refresh token on activity
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    ...(hasGoogleCredentials
      ? [
          GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[Auth] Login attempt with missing email or password');
          return null;
        }

        const email = (credentials.email as string).toLowerCase();

        // Rate limit login attempts by email
        const rateLimited = checkRateLimit('auth-login', email);
        if (rateLimited) {
          console.warn(`[Auth] Rate limited login for: ${email}`);
          throw new Error('RATE_LIMITED');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.warn(`[Auth] User not found: ${email}`);
            return null;
          }

          if (!user.password) {
            console.warn(`[Auth] User has no password (OAuth account): ${email}`);
            throw new Error('OAUTH_ACCOUNT');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.warn(`[Auth] Invalid password for: ${email}`);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image || undefined,
          };
        } catch (error: any) {
          // Re-throw known custom errors
          if (error?.message === 'RATE_LIMITED' || error?.message === 'OAUTH_ACCOUNT') {
            throw error;
          }
          console.error(`[Auth] Database error during login for ${email}:`, error);
          throw new Error('DATABASE_ERROR');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // Auto-approve OAuth users on first sign in
      if (account && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || undefined },
        });
        if (dbUser && !dbUser.approved) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { approved: true },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
