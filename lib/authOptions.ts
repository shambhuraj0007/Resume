import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { clientPromise } from './mongodb'
import { initializeUserCredits } from '@/payment/creditService'
import connectDB from './mongodb'

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!profile?.email) {
        throw new Error('No Profile!');
      }
      // User data is automatically stored in MongoDB by the adapter
      
      // Initialize credits for new user
      try {
        await connectDB();
        const User = (await import('@/models/User')).default;
        const existingUser = await User.findOne({ email: profile.email });
        
        if (existingUser) {
          // Initialize credits if not already done
          const userId = (existingUser._id as any).toString();
          await initializeUserCredits(userId);
        }
      } catch (error) {
        console.error('Error initializing user credits:', error);
        // Don't block sign-in if credit initialization fails
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/signin',
  }
}

export default NextAuth(authOptions)
