import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileLayout from "./components/layout/MobileLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mosque Web App",
  description: "A mobile app built for ease the transaction",
};

// const HIDE_TABS_ON = [];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hideTabs = false; // You can implement logic to check current path
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileLayout hideTabs={hideTabs}>{children}</MobileLayout>
      </body>
    </html>
  );
}
