"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function Navbar() {
  const pathname = usePathname();
  const { connected } = useWallet();

  const navItems = [
    { href: "/", label: "Início" },
    { href: "/marketplace", label: "Explorar Negócios" },
    ...(connected ? [{ href: "/dashboard", label: "Meu Painel" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-50">Localshare</span>
              <span className="text-xs text-slate-400 -mt-1">Invista Local</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-emerald-400"
                    : "text-slate-300 hover:text-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-4">
            <WalletMultiButton className="!bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 !rounded-lg !text-sm !font-medium !h-10" />
          </div>
        </div>
      </div>
    </nav>
  );
}

