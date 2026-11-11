import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "HerShield – AI-Powered Campus Safety",
    template: "%s · HerShield",
  },
  description:
    "HerShield is an AI-powered campus safety management system: SOS reporting, trusted contacts, incident tracking and a security response console. Academic prototype for DIU SE331.",
};

export const viewport: Viewport = {
  themeColor: "#101828",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
