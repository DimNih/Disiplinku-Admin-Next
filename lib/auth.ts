import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import bcrypt from "bcrypt";

// Pastikan environment variables tersedia
const ensureEnvVars = () => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
  }
  if (!process.env.NEXTAUTH_URL && !process.env.VERCEL_URL) {
    console.warn("NEXTAUTH_URL is not defined. Falling back to default.");
  }
};

// Panggil untuk validasi environment variables
ensureEnvVars();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password diperlukan");
        }

        try {
          const adminRef = ref(db, "admin-dashboard/admin");
          const snapshot = await get(adminRef);
          if (!snapshot.exists()) {
            throw new Error("Data admin tidak ditemukan");
          }

          const admins = snapshot.val() || {};
          let validAdmin = null;
          let adminId = null;

          for (const id in admins) {
            if (admins[id].username === credentials.username) {
              validAdmin = admins[id];
              adminId = id;
              break;
            }
          }

          if (!validAdmin) {
            throw new Error("Username atau password salah");
          }

          const match = await bcrypt.compare(credentials.password, validAdmin.password);
          if (!match) {
            throw new Error("Username atau password salah");
          }

          return {
            id: adminId,
            username: validAdmin.username,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error instanceof Error ? error.message : "Terjadi kesalahan pada server");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Gunakan NEXTAUTH_URL dengan fallback untuk Vercel atau localhost
  // Tidak perlu properti 'url' karena ini bukan bagian dari NextAuthOptions
};

export default authOptions;