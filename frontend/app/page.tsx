"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Invista em negócios locais com blockchain</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-50 leading-tight">
              Conectando <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">investidores</span>
              <br />e <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">empreendedores</span> locais
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Invista em padarias, restaurantes, academias e outros negócios do seu bairro. 
              Receba dividendos mensais e ajude a economia local a crescer.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/marketplace"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
              >
                Explorar Negócios
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-50 font-semibold flex items-center gap-2 transition-all border border-slate-700"
              >
                Cadastrar Meu Negócio
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            {[
              { label: "Negócios cadastrados", value: "150+", icon: Users },
              { label: "Investimentos realizados", value: "R$ 2.4M", icon: TrendingUp },
              { label: "Taxa de sucesso", value: "94%", icon: Shield },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-50">{stat.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-emerald-400 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Devnet Banner */}
      <div className="sticky top-16 z-40 border-y border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <p className="text-sm text-amber-300">
              ⚠️ <strong>PROTÓTIPO EDUCACIONAL</strong> - Usa SOL da Devnet (testnet) • Não invista valores reais
            </p>
            <a 
              href="https://faucet.solana.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 hover:underline font-medium"
            >
              → Pegar SOL de teste grátis
            </a>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="relative py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-50 mb-4">Como Funciona</h2>
            <p className="text-xl text-slate-400">Simples, transparente e seguro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Explore Negócios",
                description: "Navegue por negócios locais verificados, veja análises financeiras e avaliações da nossa IA.",
                icon: "🔍",
              },
              {
                step: "02",
                title: "Invista com Segurança",
                description: "Escolha quanto investir e receba cotas tokenizadas na blockchain. Tudo transparente e auditável.",
                icon: "💰",
              },
              {
                step: "03",
                title: "Receba Dividendos",
                description: "Acompanhe o crescimento do negócio e receba sua parte dos lucros mensalmente.",
                icon: "📈",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-sm font-mono text-emerald-400 mb-2">PASSO {item.step}</div>
                  <h3 className="text-xl font-bold text-slate-50 mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-slate-50">
                Por que escolher a Localshare?
              </h2>
              <p className="text-lg text-slate-300">
                Combinamos o melhor da tecnologia blockchain com análises inteligentes 
                para democratizar o acesso a investimentos em negócios locais.
              </p>
              
              <div className="space-y-4">
                {[
                  {
                    title: "Análise com IA",
                    description: "Nossa inteligência artificial avalia cada negócio em tempo real, considerando balanços, histórico e perspectivas.",
                  },
                  {
                    title: "Transparência Total",
                    description: "Todos os investimentos são registrados na blockchain Solana. Auditável e imutável.",
                  },
                  {
                    title: "Economia Local",
                    description: "Seu investimento fica no bairro, gerando empregos e desenvolvimento para sua comunidade.",
                  },
                  {
                    title: "Baixo Investimento Mínimo",
                    description: "Comece investindo a partir de R$ 100. Invista no seu ritmo.",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-50 mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                  alt="Investimento local"
                  className="rounded-2xl w-full h-auto shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl p-6 shadow-xl">
                  <p className="text-sm text-white/80 mb-1">Retorno médio</p>
                  <p className="text-3xl font-bold text-white">18% a.a.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
            <div className="relative space-y-6">
              <h2 className="text-4xl font-bold text-slate-50">
                Pronto para começar?
              </h2>
              <p className="text-xl text-slate-300">
                Conecte sua carteira e comece a investir em minutos.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25"
              >
                Ver Oportunidades
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl" />
              <div>
                <p className="font-bold text-slate-50">Localshare</p>
                <p className="text-xs text-slate-400">Invista Local</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2025 Localshare. Protótipo educacional na rede Devnet.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
