#!/bin/bash
# Script para iniciar Solana Localnet e fazer setup inicial

set -e

echo "🚀 Iniciando Solana Localnet..."

# Verificar se o validator já está rodando
if lsof -Pi :8899 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Validator já está rodando na porta 8899"
    echo "💡 Para resetar, execute: pkill solana-test-validator && $0"
    exit 1
fi

# Iniciar validator em background
echo "📦 Iniciando validator local..."
solana-test-validator > /tmp/solana-validator.log 2>&1 &
VALIDATOR_PID=$!

echo "⏳ Aguardando validator iniciar (5 segundos)..."
sleep 5

# Verificar se o processo ainda está rodando
if ! ps -p $VALIDATOR_PID > /dev/null; then
    echo "❌ Erro ao iniciar validator. Verifique os logs:"
    cat /tmp/solana-validator.log
    exit 1
fi

# Configurar Solana CLI para localhost
echo "⚙️  Configurando Solana CLI para localhost..."
solana config set --url localhost

# Airdrop
echo "💰 Fazendo airdrop de 10 SOL..."
solana airdrop 10

# Verificar saldo
echo ""
echo "✅ Setup completo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Saldo atual:"
solana balance
echo ""
echo "🔗 Endpoint: http://127.0.0.1:8899"
echo "📝 Validator PID: $VALIDATOR_PID"
echo "📋 Logs: /tmp/solana-validator.log"
echo ""
echo "💡 Comandos úteis:"
echo "   - Parar validator: kill $VALIDATOR_PID"
echo "   - Reset completo: pkill solana-test-validator && solana-test-validator --reset"
echo "   - Ver logs: tail -f /tmp/solana-validator.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

