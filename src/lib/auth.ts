import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "./prisma";
import { type USER_TYPE } from "@/types/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      checks: ["state"],
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          user_name: profile.login,
          user_type: "STANDARD",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.users.upsert({
          where: { email: user.email! },
          update: {
            name: user.name as string,
            image: user.image,
            user_name: user.user_name,
            updated_at: new Date(),
          },
          create: {
            name: user.name as string,
            email: user.email as string,
            image: user.image,
            user_name: user.user_name as string,
            user_type: "STANDARD",
          },
        });
        token.id = dbUser.id;
        token.user_type = dbUser.user_type;
        token.user_name = dbUser.user_name;
      }
      if (trigger === "update" && session) {
        if (session.user_type) token.user_type = session.user_type;
        if (session.user_name) token.user_name = session.user_name;
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;

        return token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.user_type = token.user_type as USER_TYPE;
        session.user.name = token.name;
        session.user.user_name = token.user_name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture;
      }
      return session;
    },
  },
});
