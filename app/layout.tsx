import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sohcahtoa Payout BDC",
  description: "Sohcahtoa Payout BDC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased`}>
        <Toaster position="top-right" richColors />
        <TooltipProvider delayDuration={0}>
          <QueryProvider>{children}</QueryProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
