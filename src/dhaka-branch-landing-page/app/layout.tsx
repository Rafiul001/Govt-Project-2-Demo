import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

// Hind Siliguri covers both Bengali and Latin — the typeface family widely
// used across Bangladesh government portals.
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "জাতীয় উন্নয়ন কর্তৃপক্ষ — ঢাকা শাখা",
  description:
    "জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখার সরকারি তথ্যবাতায়ন — নোটিশ বোর্ড, পরিচালনা পর্ষদ ও যোগাযোগ।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50">{children}</body>
    </html>
  );
}
