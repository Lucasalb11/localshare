# Localshare - Frontend

Frontend moderno e user-friendly para investimento em negócios locais com blockchain.

## 🚀 Quick Start

```bash
# Instalar dependências
yarn install

# Executar em desenvolvimento
yarn dev

# Build para produção
yarn build
yarn start
```

Acesse: **http://localhost:3000**

## 📱 Páginas

### 1. Landing Page (`/`)
- Hero section com CTA
- Explicação de como funciona
- Features principais
- Estatísticas
- Design Web2-friendly

### 2. Marketplace (`/marketplace`)
- Cards de negócios com fotos reais
- Filtros por categoria
- Score da IA
- Métricas financeiras
- Progresso de investimento

### 3. Detalhes do Negócio (`/business/[id]`)
- Informações completas do negócio
- Análise da IA (pontos fortes, riscos, recomendação)
- Dados financeiros detalhados
- Calculadora de investimento
- Fotos e localização

### 4. Dashboard (`/dashboard`)
- Cadastro de negócio (3 passos)
- Formulário human-friendly
- Upload de documentos
- Preview de dados financeiros

## 🎨 Design

- **Tema**: Dark mode elegante
- **Cores**: Emerald + Sky gradient
- **Framework**: Tailwind CSS
- **Ícones**: Lucide React
- **Fontes**: Sistema nativo

## 🏗️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS
- **Blockchain**: Solana (Devnet)
- **Client**: @coral-xyz/anchor
- **Wallet**: Solana Wallet Adapter

## 📂 Estrutura

```
app/
├── components/
│   └── Navbar.tsx          # Navegação principal
├── data/
│   └── mockBusinesses.ts   # 5 negócios fictícios reais
├── types/
│   └── business.ts         # Tipos TypeScript
├── lib/
│   └── localshare.ts       # Client Anchor + PDAs
├── hooks/
│   └── useLocalshareProgram.ts
├── providers/
│   └── SolanaProvider.tsx
├── page.tsx                # Landing page
├── marketplace/
│   └── page.tsx
├── business/[id]/
│   └── page.tsx
└── dashboard/
    └── page.tsx
```

## 💼 Negócios Mock

O frontend inclui 5 negócios fictícios com dados reais:

1. **Padaria São Pedro** - Padaria artesanal em Pinheiros (Score: 87/100)
2. **Cafeteria Aroma** - Café especial em Vila Madalena (Score: 82/100)
3. **Oficina Mecânica Moderna** - 20 anos de mercado (Score: 85/100)
4. **Sabor Nordestino** - Restaurante regional (Score: 78/100)
5. **Academia Fit Zone** - Av. Paulista (Score: 80/100)

## 🤖 Análise IA Simulada

Cada negócio possui:
- **Score** (0-100)
- **Pontos Fortes** (5 itens)
- **Riscos** (3 itens)
- **Recomendação** personalizada

## 🔐 Integração Blockchain

A wallet é integrada de forma sutil:
- Botão no canto superior direito
- Não invasivo
- Funciona sem wallet conectada (browse mode)
- Requer wallet apenas para investir

## 📝 Próximas Implementações

- [ ] Integrar formulário de cadastro com programa Anchor
- [ ] Implementar botão de investimento real
- [ ] Adicionar upload de imagens
- [ ] Criar dashboard do investidor
- [ ] Histórico de transações
- [ ] Sistema de notificações

## 🎯 Características

✅ Design Web2-friendly (sem jargões crypto)
✅ Imagens reais do Unsplash
✅ Dados financeiros realistas
✅ Análise IA simulada
✅ Navegação intuitiva
✅ Responsivo (mobile-first)
✅ Performance otimizada
✅ TypeScript strict
✅ Zero erros de lint

## 🌐 Rede

Por padrão, configurado para **Solana Devnet**.

Para mudar, edite `app/providers/SolanaProvider.tsx`:

```typescript
const network = WalletAdapterNetwork.Mainnet; // ou Testnet
```

## 📚 Documentação

- Landing page educativa
- UI autoexplicativa
- Tooltips e hints
- Formulários com placeholders claros

---

**Status**: ✅ Pronto para desenvolvimento
**Última atualização**: 2025-01
