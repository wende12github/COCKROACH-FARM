'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Dashboard/Sidebar";
import { useAuth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { updateLastLogin } from "@/lib/auth";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect logic
  useEffect(() => {
    if (loading) return; // Wait until auth state is known

    // If not logged in → redirect to login (except when already on auth pages)
    if (!user && !pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }

    // If logged in → redirect away from auth pages to dashboard
    if (user && pathname.startsWith('/auth')) {
      updateLastLogin(user.uid);
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // If user is on /auth/login or /auth/register → show ONLY the page (no sidebar)
  if (!user && pathname.startsWith('/auth')) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gray-50 dark:bg-gray-900`}>
          {children}
        </body>
      </html>
    );
  }

  // If user is logged in → show full dashboard layout with Sidebar
  if (user) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gray-50 dark:bg-gray-900`}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        </body>
      </html>
    );
  }

  // Fallback (should not reach here due to redirects)
  return null;
}