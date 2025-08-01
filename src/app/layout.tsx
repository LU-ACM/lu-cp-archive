import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ToasterProvider } from "@/components/ui/toaster-provider";
import ReactQueryProvider from "@/components/query-client-provider";
import { type ReactNode } from "react";
import { auth } from "@/lib/auth";
import AuthProvider from "@/components/auth-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lu-cp-archive.vercel.app/"),
  title: "LU-CP-Archive",
  description: "Leading University Competitive Programming Archive",
  openGraph: {
    title: "LU-CP-Archive",
    description: "Leading University Competitive Programming Archive",
    type: "website",
    images: "./opengraph-image.png",
  },
  twitter: {
    title: "LU-CP-Archive",
    description: "Leading University Competitive Programming Archive",
    card: "summary_large_image",
    images: "./opengraph-image.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  return (
    <AuthProvider session={session}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <main className="relative flex min-h-screen flex-col font-sans">
                <Navbar />
                <div className="flex flex-1 flex-col">{children}</div>
                <Footer />
              </main>
              <ToasterProvider />
            </ThemeProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
