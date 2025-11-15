# 🚀 Scripts de Deploy - Localshare

Scripts auxiliares para facilitar o desenvolvimento e deploy do projeto Localshare.

## 📋 Scripts Disponíveis

### 1. `localnet.sh` - Iniciar Localnet

Inicia um validator Solana local e configura o ambiente.

**Uso:**
```bash
./scripts/localnet.sh
```

**O que faz:**
- ✅ Inicia `solana-test-validator` em background
- ✅ Configura Solana CLI para `localhost`
- ✅ Faz airdrop de 10 SOL (ilimitado!)
- ✅ Mostra informações úteis (PID, logs, etc)

**Comandos úteis:**
```bash
# Parar validator
pkill solana-test-validator

# Reset completo (limpa tudo)
pkill solana-test-validator
solana-test-validator --reset

# Ver logs
tail -f /tmp/solana-validator.log
```

---

### 2. `deploy-local.sh` - Deploy no Localnet

Faz build e deploy do programa Anchor no localnet.

**Uso:**
```bash
cd anchor_project
../scripts/deploy-local.sh
```

**O que faz:**
- ✅ Verifica se o validator está rodando
- ✅ Verifica saldo e faz airdrop se necessário
- ✅ Compila o programa (`anchor build`)
- ✅ Faz deploy (`anchor deploy`)
- ✅ Mostra Program ID e informações

**Pré-requisitos:**
- Validator local rodando (execute `localnet.sh` primeiro)

---

### 3. `devnet-setup.sh` - Setup Devnet

Configura e verifica saldo no Devnet.

**Uso:**
```bash
./scripts/devnet-setup.sh
```

**O que faz:**
- ✅ Verifica saldo atual
- ✅ Solicita airdrop se necessário (< 2 SOL)
- ✅ Fornece alternativas se airdrop falhar

**Nota:** Devnet tem limites de rate. Se o airdrop falhar, aguarde alguns minutos ou use um faucet web.

---

## 🎯 Workflow Recomendado

### Desenvolvimento Local (Recomendado)

```bash
# Terminal 1: Iniciar validator
./scripts/localnet.sh

# Terminal 2: Deploy
cd anchor_project
../scripts/deploy-local.sh

# Terminal 3: Frontend (opcional - com localnet)
cd frontend
NEXT_PUBLIC_SOLANA_NETWORK=localnet yarn dev
```

### Deploy Devnet

```bash
# Configurar Devnet
./scripts/devnet-setup.sh

# Deploy
cd anchor_project
anchor deploy --provider.cluster devnet
```

---

## 🔧 Configuração do Frontend

O frontend pode ser configurado para usar diferentes redes via variável de ambiente:

```bash
# Localnet
NEXT_PUBLIC_SOLANA_NETWORK=localnet yarn dev

# Devnet (padrão)
NEXT_PUBLIC_SOLANA_NETWORK=devnet yarn dev
# ou simplesmente
yarn dev

# Mainnet
NEXT_PUBLIC_SOLANA_NETWORK=mainnet yarn dev
```

---

## 📝 Troubleshooting

### Validator não inicia
```bash
# Verificar se porta 8899 está em uso
lsof -i :8899

# Matar processo existente
pkill solana-test-validator
```

### Deploy falha por saldo insuficiente
```bash
# Localnet: airdrop ilimitado
solana airdrop 10 --url localhost

# Devnet: usar faucet web ou aguardar
solana airdrop 2 --url devnet
```

### Reset completo do Localnet
```bash
pkill solana-test-validator
rm -rf anchor_project/test-ledger
solana-test-validator --reset
```

---

## 🎓 Dicas

- **Localnet** é ideal para desenvolvimento: rápido, sem limites, airdrop ilimitado
- **Devnet** é útil para testes de integração e demonstrações
- **Mainnet** apenas para produção (requer auditoria!)

---

**Última atualização:** Janeiro 2025

