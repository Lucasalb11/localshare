#!/bin/bash
# Script para configurar e fazer deploy no Devnet

set -e

echo "🌐 Configurando Devnet..."
echo ""

# Verificar saldo
BALANCE=$(solana balance --url devnet 2>/dev/null | awk '{print $1}' || echo "0")
echo "💰 Saldo atual: $BALANCE SOL"

# Se saldo < 2 SOL, solicitar airdrop
if (( $(echo "$BALANCE < 2" | bc -l 2>/dev/null || echo "1") )); then
  echo "⚠️  Saldo baixo. Solicitando airdrop..."
  echo "   (Pode falhar devido a limites de rate - aguarde alguns minutos se necessário)"
  
  solana airdrop 2 --url devnet || {
    echo ""
    echo "❌ Airdrop falhou. Opções:"
    echo "   1. Aguarde alguns minutos e tente novamente:"
    echo "      solana airdrop 2 --url devnet"
    echo ""
    echo "   2. Use um faucet web:"
    echo "      - https://solfaucet.com/"
    echo "      - https://faucet.solana.com/"
    echo ""
    echo "   3. Use localnet para desenvolvimento:"
    echo "      ../scripts/localnet.sh"
    exit 1
  }
  
  sleep 2
  echo "✅ Airdrop recebido!"
  solana balance --url devnet
fi

echo ""
echo "✅ Devnet configurado!"
echo "💡 Para fazer deploy: cd anchor_project && anchor deploy --provider.cluster devnet"

