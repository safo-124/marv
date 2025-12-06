import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"
import type { UserRole } from "@/app/generated/prisma/client"
import type { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      hospitalId?: string
      hospitalSlug?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    hospitalId?: string
    hospitalSlug?: string
  }
}

// Extended JWT type for our application
interface ExtendedJWT extends JWT {
  id?: string
  email?: string
  name?: string
  role?: UserRole
  hospitalId?: string
  hospitalSlug?: string
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            hospitalAdmin: {
              include: {
                hospital: true,
              },
            },
            healthWorker: {
              include: {
                hospital: true,
              },
            },
          },
        })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated")
        }

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        // Get hospital info if applicable
        let hospitalId: string | undefined
        let hospitalSlug: string | undefined

        if (user.hospitalAdmin) {
          hospitalId = user.hospitalAdmin.hospitalId
          hospitalSlug = user.hospitalAdmin.hospital.slug
        } else if (user.healthWorker) {
          hospitalId = user.healthWorker.hospitalId
          hospitalSlug = user.healthWorker.hospital.slug
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hospitalId,
          hospitalSlug,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.hospitalId = user.hospitalId
        token.hospitalSlug = user.hospitalSlug
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as UserRole
        session.user.hospitalId = token.hospitalId as string | undefined
        session.user.hospitalSlug = token.hospitalSlug as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})
