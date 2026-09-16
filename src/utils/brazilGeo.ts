export interface StateData {
  uf: string;
  name: string;
  cities: {
    name: string;
    neighborhoods: string[];
  }[];
}

export const BRAZIL_GEO: StateData[] = [
  {
    uf: 'SP',
    name: 'São Paulo',
    cities: [
      {
        name: 'São Paulo',
        neighborhoods: ['Pinheiros', 'Moema', 'Vila Madalena', 'Itaim Bibi', 'Santana', 'Tatuapé', 'Bela Vista', 'Jardins', 'Perdizes', 'Santo Amaro'],
      },
      {
        name: 'Campinas',
        neighborhoods: ['Cambuí', 'Barão Geraldo', 'Taquaral', 'Centro', 'Nova Campinas'],
      },
      {
        name: 'Santos',
        neighborhoods: ['Gonzaga', 'Boqueirão', 'Ponta da Praia', 'Aparecida', 'Centro'],
      },
      {
        name: 'São Bernardo do Campo',
        neighborhoods: ['Rudge Ramos', 'Centro', 'Baeta Neves', 'Assunção'],
      },
      {
        name: 'Ribeirão Preto',
        neighborhoods: ['Jardim Botânico', 'Centro', 'Vila Tibério', 'Ipiranga'],
      },
    ],
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    cities: [
      {
        name: 'Rio de Janeiro',
        neighborhoods: ['Copacabana', 'Ipanema', 'Barra da Tijuca', 'Leblon', 'Botafogo', 'Tijuca', 'Flamengo', 'Centro', 'Recreio dos Bandeirantes', 'Madureira'],
      },
      {
        name: 'Niterói',
        neighborhoods: ['Icaraí', 'Santa Rosa', 'Centro', 'Ingá', 'São Francisco'],
      },
      {
        name: 'Duque de Caxias',
        neighborhoods: ['Centro', '25 de Agosto', 'Jardim 25 de Agosto', 'Vila São Luís'],
      },
      {
        name: 'Nova Iguaçu',
        neighborhoods: ['Centro', 'K11', 'Caonze', 'Jardim Tropical'],
      },
    ],
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    cities: [
      {
        name: 'Belo Horizonte',
        neighborhoods: ['Savassi', 'Lourdes', 'Funcionários', 'Buritis', 'Sion', 'Pampulha', 'Centro', 'Anchieta'],
      },
      {
        name: 'Uberlândia',
        neighborhoods: ['Santa Mônica', 'Centro', 'Martins', 'Tibery'],
      },
      {
        name: 'Juiz de Fora',
        neighborhoods: ['Centro', 'São Mateus', 'Cascatinha', 'Granbery'],
      },
    ],
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    cities: [
      {
        name: 'Porto Alegre',
        neighborhoods: ['Moinhos de Vento', 'Bela Vista', 'Cidade Baixa', 'Petrópolis', 'Menino Deus', 'Centro Histórico'],
      },
      {
        name: 'Caxias do Sul',
        neighborhoods: ['Centro', 'São Pelegrino', 'Lourdes', 'Pio X'],
      },
    ],
  },
  {
    uf: 'PR',
    name: 'Paraná',
    cities: [
      {
        name: 'Curitiba',
        neighborhoods: ['Batel', 'Bigorrilho', 'Água Verde', 'Centro', 'Juvevê', 'Cabral', 'Portão'],
      },
      {
        name: 'Londrina',
        neighborhoods: ['Gleba Palhano', 'Centro', 'Jardim Shangri-lá'],
      },
    ],
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    cities: [
      {
        name: 'Florianópolis',
        neighborhoods: ['Centro', 'Lagoa da Conceição', 'Jurerê Internacional', 'Trindade', 'Campeche'],
      },
      {
        name: 'Joinville',
        neighborhoods: ['América', 'Centro', 'Anita Garibaldi', 'Glória'],
      },
      {
        name: 'Balneário Camboriú',
        neighborhoods: ['Centro', 'Barra Sul', 'Pioneiros', 'Nações'],
      },
    ],
  },
  {
    uf: 'BA',
    name: 'Bahia',
    cities: [
      {
        name: 'Salvador',
        neighborhoods: ['Pituba', 'Barra', 'Rio Vermelho', 'Itaigara', 'Graça', 'Caminho das Árvores'],
      },
      {
        name: 'Feira de Santana',
        neighborhoods: ['Centro', 'Kalilândia', 'Santa Mônica'],
      },
    ],
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    cities: [
      {
        name: 'Recife',
        neighborhoods: ['Boa Viagem', 'Graças', 'Espinheiro', 'Casa Forte', 'Pina', 'Recife Antigo'],
      },
      {
        name: 'Olinda',
        neighborhoods: ['Bairro Novo', 'Casa Caiada', 'Carmo'],
      },
    ],
  },
  {
    uf: 'CE',
    name: 'Ceará',
    cities: [
      {
        name: 'Fortaleza',
        neighborhoods: ['Meireles', 'Aldeota', 'Varjota', 'Cocó', 'Praia de Iracema'],
      },
    ],
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    cities: [
      {
        name: 'Brasília',
        neighborhoods: ['Asa Sul', 'Asa Norte', 'Sudoeste', 'Lago Sul', 'Lago Norte', 'Águas Claras'],
      },
    ],
  },
  {
    uf: 'GO',
    name: 'Goiás',
    cities: [
      {
        name: 'Goiânia',
        neighborhoods: ['Setor Bueno', 'Setor Marista', 'Jardim Goiás', 'Setor Oeste', 'Centro'],
      },
    ],
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    cities: [
      {
        name: 'Vitória',
        neighborhoods: ['Praia do Canto', 'Jardim da Penha', 'Jardim Camburi', 'Centro'],
      },
      {
        name: 'Vila Velha',
        neighborhoods: ['Praia da Costa', 'Itapuã', 'Centro'],
      },
    ],
  },
];

export interface NicheItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  category: string;
  color: string;
}

export const POPULAR_NICHES: NicheItem[] = [
  { id: 'pet_shop', name: 'Pet Shop & Veterinária', iconName: 'Dog', description: 'Banho, tosa, consultas e produtos pet', category: 'Pets', color: '#EC4899' },
  { id: 'barbearia', name: 'Barbearia', iconName: 'Scissors', description: 'Cortes, barba, estilo e agendamentos', category: 'Beleza', color: '#8B5CF6' },
  { id: 'salao_beleza', name: 'Salão de Beleza', iconName: 'Sparkles', description: 'Cabelos, unhas, maquiagem e estética', category: 'Beleza', color: '#F43F5E' },
  { id: 'restaurante', name: 'Restaurante & Gastronomia', iconName: 'Utensils', description: 'Cardápio, reservas e pedidos WhatsApp', category: 'Alimentação', color: '#F59E0B' },
  { id: 'pizzaria', name: 'Pizzaria & Delivery', iconName: 'Pizza', description: 'Pizzas artesanais e pedidos rápidos', category: 'Alimentação', color: '#EF4444' },
  { id: 'hamburgueria', name: 'Hamburgueria Artesanal', iconName: 'Beef', description: 'Burgers gourmet e promoções', category: 'Alimentação', color: '#EA580C' },
  { id: 'dentista', name: 'Dentista & Odontologia', iconName: 'Smile', description: 'Implantes, clareamento e avaliações', category: 'Saúde', color: '#06B6D4' },
  { id: 'clinica', name: 'Clínica Médica & Estética', iconName: 'HeartPulse', description: 'Exames, procedimentos e consultas', category: 'Saúde', color: '#10B981' },
  { id: 'academia', name: 'Academia & Crossfit', iconName: 'Dumbbell', description: 'Planos, musculação e treinos', category: 'Fitness', color: '#6366F1' },
  { id: 'imobiliaria', name: 'Imobiliária & Corretores', iconName: 'Home', description: 'Venda, locação e lançamentos', category: 'Imóveis', color: '#3B82F6' },
  { id: 'mecanica', name: 'Oficina Mecânica & Auto Center', iconName: 'Wrench', description: 'Revisão, freios, troca de óleo e pneus', category: 'Automotivo', color: '#64748B' },
  { id: 'loja_roupas', name: 'Loja de Roupas & Calçados', iconName: 'ShoppingBag', description: 'Catálogo de moda e vendas locais', category: 'Varejo', color: '#D946EF' },
  { id: 'advocacia', name: 'Advocacia & Jurídico', iconName: 'Scale', description: 'Consultoria jurídica e causas cíveis/trabalhistas', category: 'Serviços', color: '#78716C' },
  { id: 'contabilidade', name: 'Contabilidade & Assessoria', iconName: 'Calculator', description: 'Abertura de empresas, MEI e IRPF', category: 'Serviços', color: '#14B8A6' },
  { id: 'arquitetura', name: 'Arquitetura & Design', iconName: 'Compass', description: 'Projetos residenciais e reformas', category: 'Projetos', color: '#A855F7' },
  { id: 'hotel', name: 'Hotel & Pousada', iconName: 'Bed', description: 'Quartos, diárias e reservas diretas', category: 'Turismo', color: '#EAB308' },
];

export const COLOR_PALETTES = [
  { id: 'premium', name: 'Premium Tech', primary: '#7C3AED', secondary: '#0B0B0B', desc: 'Preto + Roxo Elétrico' },
  { id: 'profissional', name: 'Profissional Corp', primary: '#2563EB', secondary: '#0F172A', desc: 'Azul Nobre + Grafite' },
  { id: 'energia', name: 'Energia & Impacto', primary: '#DC2626', secondary: '#18181B', desc: 'Vermelho Vibrante + Preto' },
  { id: 'natural', name: 'Natural & Saúde', primary: '#059669', secondary: '#064E3B', desc: 'Verde Esmeralda + Musgo' },
  { id: 'elegante', name: 'Elegante Luxo', primary: '#D97706', secondary: '#1C1917', desc: 'Dourado Quente + Âmbar' },
  { id: 'moderno', name: 'Moderno Pop', primary: '#EA580C', secondary: '#27272A', desc: 'Laranja Elétrico + Carvão' },
];

export const STYLE_OPTIONS = [
  { id: 'moderno', label: 'Moderno', desc: 'Linhas limpas, cartões flutuantes e alta legibilidade' },
  { id: 'premium', label: 'Premium', desc: 'Acentos em roxo neon, contrastes refinados e luxo' },
  { id: 'minimalista', label: 'Minimalista', desc: 'Espaço em branco generoso e foco no conteúdo' },
  { id: 'corporativo', label: 'Corporativo', desc: 'Sóbrio, confiável, focado em credibilidade institucional' },
  { id: 'criativo', label: 'Criativo', desc: 'Visual marcante, dinâmico e impactante' },
  { id: 'tecnologico', label: 'Tecnológico', desc: 'Efeito neon sutil, tipografia moderna e alta tecnologia' },
];

export const OBJECTIVE_OPTIONS = [
  { id: 'whatsapp', label: 'Receber mensagens no WhatsApp' },
  { id: 'pedidos', label: 'Receber pedidos e orçamentos' },
  { id: 'agendamentos', label: 'Receber agendamentos de horário' },
  { id: 'servicos', label: 'Exibir portfólio e catálogo de serviços' },
  { id: 'localizacao', label: 'Divulgar localização física e mapa' },
  { id: 'credibilidade', label: 'Gerar autoridade e novos clientes' },
];

export const BRAZIL_STATES = BRAZIL_GEO.map((s) => ({
  uf: s.uf,
  name: s.name,
}));

export const CITIES_BY_STATE: Record<string, string[]> = BRAZIL_GEO.reduce((acc, s) => {
  acc[s.uf] = s.cities.map((c) => c.name);
  return acc;
}, {} as Record<string, string[]>);

