import type { Metadata } from "next";

// Next.js processes this global stylesheet at build time; no TypeScript module declaration is required.
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: "SEVA — Donation, Food Distribution & Community Support Platform",
  description: "“Your Contribution. Someone's Meal. Someone's Hope.” Seva is an auditable social operating system connecting donors, volunteers, and beneficiaries. Minimum donation ₹20.",
  icons: {
    icon: "/seva-logo.png",
    apple: "/seva-logo.png",
  },
  openGraph: {
    title: "SEVA — Traceable Food Distribution & Social Aid Platform",
    description: "Accepting contributions from ₹20+. 100% verified ground delivery, photo proofs, and digital 80G tax receipts.",
    type: "website",
  },
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
