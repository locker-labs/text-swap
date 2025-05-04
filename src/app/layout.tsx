import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionAccountProvider } from "@/providers/SessionAccountProvider";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { TwitterProvider } from "@/providers/TwitterProvider";
import "../services/publicClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gator ERC7715",
  description: "A dApp to test the Gator ERC7715 implementation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Locker - Text Swap</title>
        <meta name="description" content="Locker Text Swap" />
        <meta name="apple-mobile-web-app-title" content="Text Swap" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased flex flex-col`}
      >
        <div className="flex-1">
          <main>
            <PermissionProvider>
              <SessionAccountProvider>
                <TwitterProvider>
                  {children}
                </TwitterProvider>
              </SessionAccountProvider>
            </PermissionProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
