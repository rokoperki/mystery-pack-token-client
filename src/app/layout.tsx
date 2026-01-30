// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query-provider";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mystery Pack",
  description: "Mystery token packs on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-zinc-950 text-white min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <WalletProvider>
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#18181b",
                  border: "1px solid #27272a",
                  color: "#fff",
                },
              }}
            />
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}