#!/bin/bash
# Script para fazer deploy do programa Anchor no localnet

set -e

echo "🔨 Fazendo deploy do programa Localshare no Localnet..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "Anchor.toml" ]; then
    echo "❌ Erro: Execute este script a partir do diretório anchor_project/"
    exit 1
fi

# Verificar se o validator está rodando
if ! lsof -Pi :8899 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Validator não está rodando!"
    echo "💡 Execute primeiro: ../scripts/localnet.sh"
    exit 1
fi

# Verificar saldo
echo "💰 Verificando saldo..."
BALANCE=$(solana balance --url localhost | awk '{print $1}')
echo "   Saldo atual: $BALANCE SOL"
echo ""

# Se saldo < 2 SOL, fazer airdrop
if (( $(echo "$BALANCE < 2" | bc -l 2>/dev/null || echo "0") )); then
    echo "⚠️  Saldo baixo. Fazendo airdrop..."
    solana airdrop 2 --url localhost
    sleep 2
fi

# Build
echo "🔨 Compilando programa..."
anchor build

# Deploy
echo ""
echo "🚀 Fazendo deploy..."
anchor deploy

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Program ID: $(solana address -k target/deploy/my_program-keypair.json)"
echo "🔗 Explorer: http://localhost:8899"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

