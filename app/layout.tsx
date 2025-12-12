import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileLayout from "../components/layout/MobileLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mosque Web App",
  description: "A mobile app built for ease the transaction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  );
}
