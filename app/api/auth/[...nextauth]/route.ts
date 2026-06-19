import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "mock",
      name: "Mock Hackathon Login",
      credentials: {
        provider: { label: "Provider", type: "text" }
      },
      async authorize(credentials) {
        // Automatically return a mock user for the hackathon
        return {
          id: "1",
          name: `${credentials?.provider || 'Demo'} User`,
          email: `demo@${(credentials?.provider || 'demo').toLowerCase()}.com`,
          image: "https://i.pravatar.cc/150?u=mock"
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "hackathon-super-secret-key-12345",
});

export { handler as GET, handler as POST };
