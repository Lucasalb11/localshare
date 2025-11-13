# 🦀 Localshare - Anchor Program

Programa Solana (Smart Contract) do protocolo Localshare Lite desenvolvido com Anchor Framework.

## 📖 Documentação Completa

Para documentação detalhada do programa, arquitetura, segurança e exemplos de uso, consulte:

**[LOCALSHARE_README.md](./LOCALSHARE_README.md)**

## ⚡ Quick Commands

```bash
# Compilar
anchor build

# Testar
anchor test

# Deploy (local)
anchor deploy

# Deploy (devnet)
anchor deploy --provider.cluster devnet
```

## 📊 Estrutura

```
anchor_project/
├── programs/my_program/    # Código fonte do smart contract
│   └── src/lib.rs         # Programa principal (389 linhas)
├── tests/                 # Testes de integração
│   ├── integration.ts     # Suite completa de testes
│   └── localshare.ts      # Testes bootstrap
├── migrations/            # Scripts de deploy
├── target/               # Artefatos compilados
│   ├── deploy/          # .so e keypairs
│   ├── idl/             # Interface Definition Language
│   └── types/           # TypeScript types
├── Anchor.toml          # Configuração do projeto
└── Cargo.toml          # Dependências Rust
```

## 🎯 Funcionalidades

### 4 Instruções Implementadas

1. **`init_config`** - Configuração global do protocolo
2. **`register_business`** - Registro de negócios
3. **`create_offering`** - Criação de ofertas de shares
4. **`buy_shares`** - Compra de shares

### 3 Contas (PDAs)

- **Config**: Configuração global
- **Business**: Perfil do negócio
- **Offering**: Oferta de shares

## ✅ Testes

```bash
anchor test
```

**Resultado**: 11/11 testes passando ✅

## 🔒 Segurança

- ✅ Proteção contra integer overflow
- ✅ Validações de entrada robustas
- ✅ PDAs determinísticas
- ✅ Constraints Anchor
- ✅ Erros customizados (9 tipos)

## 📝 Program ID

```
8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y
```

## 🔗 Cluster

Configurado para: **localnet** (ver `Anchor.toml`)

Para mudar:
```bash
# Devnet
solana config set --url devnet

# Mainnet (produção)
solana config set --url mainnet-beta
```

---

Desenvolvido com [Anchor Framework](https://www.anchor-lang.com/) 🦀
