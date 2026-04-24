import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminMode } from "@/components/admin-mode";
import { StudentHotkey } from "@/components/student-hotkey";

export const metadata: Metadata = {
  title: {
    default: "Trojan SMIF — USC Marshall Student Managed Investment Fund",
    template: "%s · Trojan SMIF",
  },
  description:
    "The Trojan Student Managed Investment Fund is an MSF-exclusive investment organization at USC Marshall School of Business — managing a $100,000 paper portfolio across US and international equities, fixed income, and alternatives.",
  metadataBase: new URL("https://trojansmif.vercel.app"),
  openGraph: {
    title: "Trojan SMIF — USC Marshall Student Managed Investment Fund",
    description:
      "An MSF-led investment fund at USC Marshall managing a long-only, multi-asset portfolio benchmarked to the S&P 500.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <AdminMode />
        <StudentHotkey />
      </body>
    </html>
  );
}
