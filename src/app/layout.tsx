import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { SessionAccountProvider } from "@/providers/SessionAccountProvider";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { TwitterProvider } from "@/providers/TwitterProvider";
import { StepProvider } from "@/providers/StepProvider";
import "../services/publicClient";

const geistSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Text Swap",
  description: "Secure swaps from tweets, posts, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Text Swap</title>
        <meta name="description" content="Text Swap" />
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
                  <StepProvider>
                    {children}
                  </StepProvider>
                </TwitterProvider>
              </SessionAccountProvider>
            </PermissionProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
