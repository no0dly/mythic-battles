import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nInit from "../i18n/i18n-init";
import { TRPCReactProvider } from "@/trpc/Provider";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mythic Battles",
  description: "App for managing drafts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <I18nInit>
            <div className="h-screen flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                {children}
              </main>
            </div>
          </I18nInit>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
