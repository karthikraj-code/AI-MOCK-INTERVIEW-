import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "./db";
import User from "./models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Ensure correct host/redirects behind Vercel proxy
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          await connectToDatabase();
          
          // Find user in database
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("User not found");
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            jobRole: user.jobRole,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Allow either NEXTAUTH_SECRET or AUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
    signUp: "/signup",
    error: "/auth/error",
  },
  callbacks: {
    // Normalize redirects to deployment base URL
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        // Only allow same-origin redirects
        if (target.origin === baseUrl) return target.toString();
      } catch {}
      // Relative URLs are allowed
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.jobRole = (user as any).jobRole; // Add jobRole to token
        token.image = (user as any).image || user.image; // Add image to token (from OAuth or database)
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).jobRole = token.jobRole as string; // Add jobRole to session
        session.user.image = token.image as string; // Add image to session
      }
      return session;
    },
  },
});