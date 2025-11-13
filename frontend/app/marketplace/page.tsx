"use client";

import { useState } from "react";
import Link from "next/link";
import { mockBusinesses } from "../data/mockBusinesses";
import { MapPin, TrendingUp, Users, Star } from "lucide-react";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  
  const categories = ["Todos", "Alimentação", "Serviços Automotivos", "Saúde e Bem-estar"];
  
  const filteredBusinesses = selectedCategory === "Todos"
    ? mockBusinesses
    : mockBusinesses.filter(b => b.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-50 mb-4">
            Explore Negócios
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Descubra oportunidades de investimento em negócios locais verificados. 
            Cada negócio passa por análise rigorosa da nossa IA.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Link
              key={business.id}
              href={`/business/${business.id}`}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={business.images[0]}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                
                {/* AI Score Badge */}
                {business.aiAnalysis && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {business.aiAnalysis.score}/100
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-sm text-slate-300 text-xs">
                  {business.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-50 mb-2 group-hover:text-emerald-400 transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {business.shortDescription}
                  </p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{business.location.city}, {business.location.state}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Retorno/ano</p>
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>{business.financials.yearlyGrowth.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Avaliação</p>
                    <p className="text-slate-50 font-semibold">
                      R$ {(business.financials.valuation / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-slate-50 font-semibold">{business.metrics.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Investment Info */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Cotas disponíveis</span>
                    <span className="text-sm font-semibold text-slate-50">
                      {business.sharesInfo.availableShares}/{business.sharesInfo.totalShares}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-sky-500"
                      style={{
                        width: `${(business.sharesInfo.availableShares / business.sharesInfo.totalShares) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    A partir de R$ {business.sharesInfo.minInvestment.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg">
              Nenhum negócio encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

