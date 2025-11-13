import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "./providers/SolanaProvider";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "Localshare - Invista em Negócios Locais",
  description: "Plataforma de investimento em negócios locais com blockchain. Invista em padarias, restaurantes e outros estabelecimentos do seu bairro.",
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

