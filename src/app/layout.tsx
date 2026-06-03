import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { APP_DESCRIPTION, APP_TITLE } from "@/lib/brand";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
