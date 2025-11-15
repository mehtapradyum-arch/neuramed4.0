// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  jwt: { maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  providers: [
    EmailProvider({
      server: process.env.RESEND_API_KEY ? undefined : undefined, // NextAuth will send via custom handler below
      from: process.env.EMAIL_FROM!,
      // We’ll override sendVerificationRequest via events for Resend/SendGrid
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = token.role as any;
      session.user.emailVerified = token.emailVerified as any;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Optionally auto-set role based on invite
    },
  },
  cookies: {
    // Secure cookies on Vercel (https enabled) automatically
  },
};
