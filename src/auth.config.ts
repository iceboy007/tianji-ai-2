import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith("/chat");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      // 管理后台需要登录，API 层再验证管理员身份
      if (isOnAdmin && !isLoggedIn) {
        return false;
      }

      // 仅档案页需要登录，对话页未登录也可体验
      if (isOnProfile && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.quotaRemaining = (user as any).quotaRemaining;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).quotaRemaining = token.quotaRemaining as number;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user || !user.passwordHash) return null;

          const passwordMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            quotaRemaining: user.quotaRemaining,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
};
