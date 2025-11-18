# 📋 Manual QA Checklist - Localshare

Este checklist deve ser seguido no navegador após o deploy do programa e frontend no devnet.

## 🔧 Pré-requisitos

- [ ] Conectar wallet Phantom ao devnet
- [ ] Ter SOL suficiente no devnet (pelo menos 0.5 SOL)
- [ ] Frontend deployado e acessível
- [ ] Programa deployado no devnet

---

## 👤 Como Owner (Proprietário do Negócio)

### 1. Registrar Negócio

- [ ] Acessar a página de registro de negócio (`/register-business`)
- [ ] Preencher o nome do negócio (ex: "Café da Esquina")
- [ ] Conectar wallet Phantom
- [ ] Clicar em "Registrar Negócio"
- [ ] Confirmar transação no Phantom
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que o negócio aparece no dashboard (`/dashboard`)

### 2. Configurar Oferta

- [ ] Acessar a página de configuração (ou onboarding)
- [ ] Preencher:
  - Total de shares: `1000`
  - Preço por share: `0.001 SOL` (ou valor pequeno)
  - Treasury: endereço da wallet (ou outro endereço)
- [ ] Clicar em "Configurar Oferta"
- [ ] Confirmar transação no Phantom
- [ ] Verificar mensagem de sucesso

### 3. Criar Token (Init Share Mint)

- [ ] Acessar a página de criação de token (ou onboarding)
- [ ] Clicar em "Criar Token" ou "Inicializar Share Mint"
- [ ] Confirmar transação no Phantom
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que o token foi criado (pode aparecer na wallet)

### 4. Publicar Negócio (List Business)

- [ ] Acessar a página de publicação (ou onboarding)
- [ ] Clicar em "Publicar no Marketplace" ou "Listar Negócio"
- [ ] Confirmar transação no Phantom
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que o negócio aparece no marketplace (`/marketplace`)

---

## 👤 Como Investor (Comprador)

### 5. Navegar no Marketplace

- [ ] Acessar a página do marketplace (`/marketplace`)
- [ ] Verificar que o negócio listado aparece na lista
- [ ] Verificar informações exibidas:
  - Nome do negócio
  - Preço por share
  - Total de shares disponíveis
  - Outras informações relevantes

### 6. Abrir Página do Negócio

- [ ] Clicar no negócio no marketplace
- [ ] Verificar que a página de detalhes abre (`/business/[id]`)
- [ ] Verificar informações exibidas:
  - Nome completo
  - Preço por share
  - Total de shares
  - Botão de compra

### 7. Comprar Shares

- [ ] Na página do negócio, inserir quantidade de shares (ex: `10`)
- [ ] Verificar o valor total calculado
- [ ] Clicar em "Comprar Shares" ou botão similar
- [ ] Confirmar transação no Phantom
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que a transação foi confirmada

### 8. Verificar Tokens na Wallet (Phantom)

- [ ] Abrir Phantom wallet
- [ ] Verificar que os tokens aparecem na seção de tokens
- [ ] Verificar que a quantidade está correta (ex: `10` shares)
- [ ] Verificar que o nome/símbolo do token está correto
- [ ] (Opcional) Verificar o mint address do token no Explorer

### 9. Verificar Saldo SOL

- [ ] Verificar que o SOL foi debitado da wallet do comprador
- [ ] Verificar que o SOL foi creditado na treasury (se possível)
- [ ] Verificar que o valor corresponde ao esperado (quantidade × preço por share + taxas)

---

## ✅ Validações Adicionais

### Funcionalidades

- [ ] Testar compra de diferentes quantidades
- [ ] Testar compra de quantidade maior que disponível (deve falhar)
- [ ] Testar compra de 0 shares (deve falhar)
- [ ] Verificar que o saldo do vault diminui após compra
- [ ] Verificar que o negócio continua listado após compra

### Edge Cases

- [ ] Tentar comprar mais shares do que disponível
- [ ] Tentar comprar de negócio não listado (se possível)
- [ ] Verificar comportamento com wallet sem SOL suficiente

### UI/UX

- [ ] Verificar mensagens de erro são claras
- [ ] Verificar loading states durante transações
- [ ] Verificar confirmações de sucesso
- [ ] Verificar navegação entre páginas funciona

---

## 🐛 Problemas Encontrados

Documente qualquer problema encontrado durante o QA:

```
[Data/Hora] - [Descrição do problema]
- Página: 
- Ação: 
- Erro: 
- Screenshot (se aplicável): 
```

---

## 📝 Notas

- Use devnet para todos os testes
- Mantenha screenshots de transações importantes
- Verifique todas as transações no Solana Explorer
- Teste com diferentes quantidades e cenários

---

**Última atualização:** [Data]
**Versão do Programa:** `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`
**Cluster:** Devnet

