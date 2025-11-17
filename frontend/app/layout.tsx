import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "./providers/SolanaProvider";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "Localshare - Invest in Local Businesses",
  description: "Blockchain-powered platform connecting investors with local businesses. Invest in bakeries, restaurants and other neighborhood establishments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-950">
        <SolanaProvider>
          <Navbar />
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}

