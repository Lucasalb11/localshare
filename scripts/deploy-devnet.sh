#!/bin/bash
# Script para fazer deploy do programa Anchor no Devnet

set -e

echo "🚀 Fazendo deploy do programa Localshare no Devnet..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "Anchor.toml" ]; then
    echo "❌ Erro: Execute este script a partir do diretório anchor_project/"
    exit 1
fi

# Verificar se está configurado para devnet
CLUSTER=$(grep -A1 "\[provider\]" Anchor.toml | grep "cluster" | cut -d'=' -f2 | tr -d ' ' || echo "devnet")
if [ "$CLUSTER" != "devnet" ]; then
    echo "⚠️  Aviso: Cluster configurado como '$CLUSTER', mas vamos usar devnet"
fi

# Verificar saldo
echo "💰 Verificando saldo no Devnet..."
BALANCE=$(solana balance --url devnet 2>/dev/null | awk '{print $1}' || echo "0")
echo "   Saldo atual: $BALANCE SOL"
echo ""

# Se saldo < 2 SOL, tentar airdrop
if (( $(echo "$BALANCE < 2" | bc -l 2>/dev/null || echo "1") )); then
    echo "⚠️  Saldo baixo. Tentando airdrop..."
    solana airdrop 2 --url devnet || echo "⚠️  Airdrop falhou. Você pode precisar fazer manualmente."
    sleep 2
    BALANCE=$(solana balance --url devnet | awk '{print $1}')
    echo "   Novo saldo: $BALANCE SOL"
    echo ""
fi

# Build
echo "🔨 Compilando programa..."
anchor build

# Verificar se o build foi bem-sucedido
if [ ! -f "target/deploy/my_program.so" ]; then
    echo "❌ Erro: Build falhou - arquivo .so não encontrado"
    exit 1
fi

# Deploy
echo ""
echo "🚀 Fazendo deploy no Devnet..."
anchor deploy --provider.cluster devnet

# Deploy IDL
echo ""
echo "📋 Fazendo deploy do IDL..."
anchor idl upgrade --provider.cluster devnet target/idl/my_program.json --filepath target/idl/my_program.json

# Sincronizar IDL com frontend
echo ""
echo "🔄 Sincronizando IDL com frontend..."
if [ -f "../scripts/sync-idl.sh" ]; then
    ../scripts/sync-idl.sh
else
    echo "⚠️  Script sync-idl.sh não encontrado. Sincronize manualmente."
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Program ID: $(solana address -k target/deploy/my_program-keypair.json)"
echo "🔗 Explorer: https://explorer.solana.com/address/$(solana address -k target/deploy/my_program-keypair.json)?cluster=devnet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
