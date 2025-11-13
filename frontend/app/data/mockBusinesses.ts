import { BusinessData } from "../types/business";

export const mockBusinesses: BusinessData[] = [
  {
    id: "padaria-sao-pedro",
    name: "Padaria São Pedro",
    category: "Alimentação",
    description: `A Padaria São Pedro é um estabelecimento tradicional no bairro de Pinheiros, São Paulo, 
    com mais de 15 anos de história. Especializada em pães artesanais e produtos de confeitaria, 
    atende diariamente mais de 500 clientes. O negócio possui uma clientela fiel e está em processo 
    de expansão com planos de abrir uma segunda unidade.
    
    Nossos produtos são 100% artesanais, feitos diariamente com ingredientes selecionados. 
    Contamos com uma equipe de padeiros experientes e um ambiente acolhedor que é referência no bairro.
    
    Buscamos investidores para expandir nossa operação e abrir mais 2 unidades nos próximos 18 meses.`,
    shortDescription: "Padaria artesanal tradicional em Pinheiros com planos de expansão",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Rua dos Pinheiros, 1234 - Pinheiros",
    },
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200",
    owner: {
      name: "Pedro Silva Santos",
      role: "Fundador e Padeiro-Mestre",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    financials: {
      monthlyRevenue: 85000,
      monthlyCosts: 52000,
      netProfit: 33000,
      yearlyGrowth: 18.5,
      valuation: 850000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 250,
      pricePerShare: 850,
      minInvestment: 4250, // 5 shares
    },
    metrics: {
      yearsInBusiness: 15,
      employees: 12,
      monthlyCustomers: 15000,
      rating: 4.8,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 87,
      strengths: [
        "Localização privilegiada em área nobre de São Paulo",
        "Clientela fiel com ticket médio crescente",
        "Marca consolidada há 15 anos no bairro",
        "Margem de lucro saudável (38%)",
        "Plano de expansão bem estruturado",
      ],
      risks: [
        "Dependência de mão de obra especializada",
        "Concorrência crescente no segmento artesanal",
        "Sazonalidade em períodos de férias",
      ],
      recommendation: "Investimento recomendado. Negócio consolidado com boa perspectiva de crescimento.",
    },
  },
  {
    id: "cafeteria-aroma",
    name: "Cafeteria Aroma",
    category: "Alimentação",
    description: `A Cafeteria Aroma é uma cafeteria especializada em cafés especiais, localizada no coração 
    de Vila Madalena. Trabalhamos com grãos selecionados de pequenos produtores brasileiros e oferecemos 
    uma experiência única aos amantes de café.
    
    Nossa proposta vai além do café: criamos um espaço de convivência e coworking, atraindo freelancers, 
    estudantes e profissionais da região. Também oferecemos workshops mensais sobre métodos de preparo.
    
    Buscamos investimento para ampliar o espaço e adicionar uma mini-torrefação própria.`,
    shortDescription: "Cafeteria especializada em cafés especiais e espaço de coworking",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Rua Harmonia, 456 - Vila Madalena",
    },
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      "https://images.unsplash.com/photo-1559496417-e7f25cb247f6?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=200",
    owner: {
      name: "Ana Carolina Mendes",
      role: "Barista e Empreendedora",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    financials: {
      monthlyRevenue: 45000,
      monthlyCosts: 28000,
      netProfit: 17000,
      yearlyGrowth: 32.5,
      valuation: 420000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 300,
      pricePerShare: 420,
      minInvestment: 2100,
    },
    metrics: {
      yearsInBusiness: 3,
      employees: 6,
      monthlyCustomers: 3500,
      rating: 4.9,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 82,
      strengths: [
        "Crescimento acelerado (32% ao ano)",
        "Diferenciação com cafés especiais e coworking",
        "Localização estratégica em bairro boêmio",
        "Comunidade engajada de clientes regulares",
        "Modelo de receita diversificado",
      ],
      risks: [
        "Negócio relativamente novo (3 anos)",
        "Alta dependência da fundadora",
        "Investimento necessário para escalabilidade",
      ],
      recommendation: "Investimento com bom potencial. Risco moderado compensado pelo crescimento acelerado.",
    },
  },
  {
    id: "oficina-mecanica-moderna",
    name: "Oficina Mecânica Moderna",
    category: "Serviços Automotivos",
    description: `A Oficina Mecânica Moderna atua há 20 anos no mercado automotivo, especializada em 
    manutenção preventiva e corretiva de veículos nacionais e importados. Possuímos equipamentos de 
    última geração e uma equipe altamente qualificada.
    
    Atendemos tanto clientes pessoa física quanto frotas empresariais. Temos contratos fixos com 
    3 empresas de logística da região, garantindo um fluxo constante de receita.
    
    Buscamos investimento para modernizar ainda mais nossa estrutura e criar um serviço de 
    manutenção móvel (officina que vai até o cliente).`,
    shortDescription: "Oficina mecânica tradicional com 20 anos de experiência e contratos B2B",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Av. dos Bandeirantes, 3200 - Ipiranga",
    },
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800",
      "https://images.unsplash.com/photo-1632823469910-59d2e3357006?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200",
    owner: {
      name: "Roberto Carlos Almeida",
      role: "Mecânico e Proprietário",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    financials: {
      monthlyRevenue: 125000,
      monthlyCosts: 78000,
      netProfit: 47000,
      yearlyGrowth: 12.3,
      valuation: 1200000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 200,
      pricePerShare: 1200,
      minInvestment: 6000,
    },
    metrics: {
      yearsInBusiness: 20,
      employees: 15,
      monthlyCustomers: 450,
      rating: 4.7,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 85,
      strengths: [
        "Longo histórico de operação (20 anos)",
        "Receita recorrente com contratos B2B",
        "Baixa inadimplência e boa margem",
        "Equipe estável e qualificada",
        "Reputação sólida no mercado",
      ],
      risks: [
        "Crescimento moderado",
        "Dependência de contratos empresariais",
        "Necessidade de atualização tecnológica constante",
      ],
      recommendation: "Investimento seguro e estável. Ideal para perfil conservador com foco em dividendos.",
    },
  },
  {
    id: "restaurante-sabor-nordestino",
    name: "Sabor Nordestino",
    category: "Alimentação",
    description: `O Sabor Nordestino é um restaurante especializado em culinária típica do Nordeste brasileiro, 
    com foco em pratos da Bahia e Pernambuco. Localizado na região da Liberdade, atende tanto no 
    salão quanto por delivery.
    
    Nossos pratos são preparados com receitas tradicionais, ingredientes autênticos trazidos 
    diretamente do Nordeste. Nos finais de semana, oferecemos música ao vivo com forró e MPB.
    
    Buscamos investimento para ampliar a cozinha e aumentar a capacidade de atendimento.`,
    shortDescription: "Restaurante de comida nordestina com música ao vivo",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Rua da Glória, 789 - Liberdade",
    },
    images: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200",
    owner: {
      name: "Maria José da Silva",
      role: "Chef e Proprietária",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    financials: {
      monthlyRevenue: 68000,
      monthlyCosts: 45000,
      netProfit: 23000,
      yearlyGrowth: 25.8,
      valuation: 580000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 350,
      pricePerShare: 580,
      minInvestment: 2900,
    },
    metrics: {
      yearsInBusiness: 8,
      employees: 10,
      monthlyCustomers: 2800,
      rating: 4.6,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 78,
      strengths: [
        "Culinária diferenciada com baixa concorrência direta",
        "Forte crescimento ano a ano (25%)",
        "Eventos culturais atraem público fiel",
        "Diversificação com delivery",
        "Chef proprietária com expertise reconhecida",
      ],
      risks: [
        "Margem de lucro apertada (33%)",
        "Alta rotatividade no setor de restaurantes",
        "Dependência de poucos fornecedores específicos",
      ],
      recommendation: "Investimento interessante para quem busca apoiar negócios culturais com crescimento.",
    },
  },
  {
    id: "academia-fit-zone",
    name: "Academia Fit Zone",
    category: "Saúde e Bem-estar",
    description: `A Academia Fit Zone é uma academia de médio porte com foco em treinamento funcional, 
    musculação e aulas coletivas. Possui 450 alunos ativos e uma equipe de 8 personal trainers.
    
    Nossa diferenciação está no atendimento personalizado e na criação de programas de treino 
    individualizados. Oferecemos também acompanhamento nutricional incluso nas mensalidades premium.
    
    Buscamos investimento para adicionar uma área de fisioterapia e expandir para modalidades 
    como pilates e yoga.`,
    shortDescription: "Academia moderna com foco em treinos personalizados",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Av. Paulista, 2500 - Consolação",
    },
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200",
    owner: {
      name: "Carlos Eduardo Fitness",
      role: "Personal Trainer e Gestor",
      avatar: "https://i.pravatar.cc/150?img=15",
    },
    financials: {
      monthlyRevenue: 95000,
      monthlyCosts: 58000,
      netProfit: 37000,
      yearlyGrowth: 15.2,
      valuation: 950000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 280,
      pricePerShare: 950,
      minInvestment: 4750,
    },
    metrics: {
      yearsInBusiness: 6,
      employees: 14,
      monthlyCustomers: 450,
      rating: 4.5,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 80,
      strengths: [
        "Localização premium na Av. Paulista",
        "Modelo de receita recorrente (mensalidades)",
        "Baixa inadimplência (5%)",
        "Crescimento consistente",
        "Equipe qualificada e engajada",
      ],
      risks: [
        "Alta concorrência na região",
        "Sazonalidade (picos em jan/fev)",
        "Necessidade de renovação de equipamentos",
      ],
      recommendation: "Investimento sólido. Setor de saúde e bem-estar em expansão pós-pandemia.",
    },
  },
];

