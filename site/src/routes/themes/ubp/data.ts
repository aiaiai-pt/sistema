// UBP Theme — Demo content model
// Source: dev_docs/specs/ubp-theme-research/content-model.md
// Realistic PT-municipal data for stress-testing the dark theme.

export type VerticalState = "Activo" | "Inactivo" | "Rascunho";
export type UserState = "Activo" | "Inactivo" | "Bloqueado";

export interface Vertical {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  estado: VerticalState;
  entidades: number;
  icon: string; // phosphor icon name (simplified to emoji-like hint)
}

export interface Municipality {
  code: string;
  nomeCompleto: string;
  curto: string;
  dominio: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  organizacao: string;
  grupos: string[];
  estado: UserState;
  ultimoAcesso: string;
}

export const categorias = [
  "Todos",
  "Mobilidade",
  "Micro Mobilidade",
  "Ambiente",
  "Infraestrutura",
  "Turismo e Cultura",
];

export const verticais: Vertical[] = [
  {
    id: "V-01",
    nome: "Autocarros",
    categoria: "Mobilidade",
    descricao:
      "Gestão da frota de autocarros urbanos, horários, ocupação em tempo real e integração com a rede intermodal.",
    estado: "Activo",
    entidades: 248,
    icon: "bus",
  },
  {
    id: "V-02",
    nome: "Trânsito",
    categoria: "Mobilidade",
    descricao:
      "Monitorização de fluxo viário, incidentes e tempos de percurso nas principais artérias do município.",
    estado: "Activo",
    entidades: 1432,
    icon: "traffic",
  },
  {
    id: "V-03",
    nome: "Estacionamento Público Rotativo",
    categoria: "Mobilidade",
    descricao:
      "Lugares de estacionamento tarifado, ocupação por zona e gestão de infracções.",
    estado: "Activo",
    entidades: 86,
    icon: "parking",
  },
  {
    id: "V-04",
    nome: "Bicicletas Partilhadas",
    categoria: "Micro Mobilidade",
    descricao:
      "Rede de bicicletas de uso partilhado, docas e disponibilidade em tempo real.",
    estado: "Activo",
    entidades: 512,
    icon: "bike",
  },
  {
    id: "V-05",
    nome: "Trotinetes",
    categoria: "Micro Mobilidade",
    descricao:
      "Frota de trotinetes eléctricas em regime free-floating com geo-cercas de operação.",
    estado: "Rascunho",
    entidades: 0,
    icon: "scooter",
  },
  {
    id: "V-06",
    nome: "Meteorologia",
    categoria: "Ambiente",
    descricao:
      "Estações meteorológicas municipais com leituras de temperatura, humidade, vento e precipitação.",
    estado: "Activo",
    entidades: 24,
    icon: "cloud",
  },
  {
    id: "V-07",
    nome: "Qualidade do Ar",
    categoria: "Ambiente",
    descricao:
      "Sensores de poluentes atmosféricos (PM2.5, PM10, NO₂, O₃) distribuídos pela malha urbana.",
    estado: "Activo",
    entidades: 38,
    icon: "wind",
  },
  {
    id: "V-08",
    nome: "Ruído Ambiente",
    categoria: "Ambiente",
    descricao: "",
    estado: "Activo",
    entidades: 17,
    icon: "wave",
  },
  {
    id: "V-09",
    nome: "Resíduos Sólidos Urbanos",
    categoria: "Ambiente",
    descricao:
      "Contentores com sensores de enchimento, rotas de recolha e indicadores de reciclagem por freguesia.",
    estado: "Activo",
    entidades: 3204,
    icon: "trash",
  },
  {
    id: "V-10",
    nome: "Iluminação Pública",
    categoria: "Infraestrutura",
    descricao:
      "Inventário de pontos de luz, consumo energético e gestão de avarias.",
    estado: "Activo",
    entidades: 18976,
    icon: "lightbulb",
  },
  {
    id: "V-11",
    nome: "Rede de Águas e Saneamento",
    categoria: "Infraestrutura",
    descricao:
      "Contadores inteligentes, pressão na rede e deteção de fugas em tempo real.",
    estado: "Inactivo",
    entidades: 452,
    icon: "water",
  },
  {
    id: "V-12",
    nome: "Espaços Verdes",
    categoria: "Infraestrutura",
    descricao:
      "Cadastro de jardins, parques e árvores em arruamento com estado fitossanitário.",
    estado: "Activo",
    entidades: 874,
    icon: "tree",
  },
  {
    id: "V-13",
    nome: "Pontos de Interesse Turístico",
    categoria: "Turismo e Cultura",
    descricao:
      "Monumentos, miradouros e equipamentos culturais com horários e afluência estimada.",
    estado: "Activo",
    entidades: 193,
    icon: "pin",
  },
  {
    id: "V-14",
    nome: "Eventos Culturais Municipais",
    categoria: "Turismo e Cultura",
    descricao:
      "Agenda de eventos promovidos ou apoiados pelo município com localização e público estimado.",
    estado: "Activo",
    entidades: 67,
    icon: "ticket",
  },
  {
    id: "V-15",
    nome: "Wi-Fi Municipal",
    categoria: "Infraestrutura",
    descricao:
      "Hotspots de acesso público gratuito, utilização e estado operacional dos equipamentos.",
    estado: "Activo",
    entidades: 142,
    icon: "wifi",
  },
];

export const utilizadores: User[] = [
  {
    id: "U-001",
    nome: "Ana Rita Fonseca",
    email: "ana.fonseca@cm-lisboa.pt",
    organizacao: "CM Lisboa",
    grupos: ["Admin Municipal", "Gestor Ambiental"],
    estado: "Activo",
    ultimoAcesso: "há 2 min",
  },
  {
    id: "U-002",
    nome: "João Miguel Carvalho",
    email: "joao.carvalho@cm-lisboa.pt",
    organizacao: "CM Lisboa",
    grupos: ["Técnico de SIG"],
    estado: "Activo",
    ultimoAcesso: "há 14 min",
  },
  {
    id: "U-003",
    nome: "Maria Leonor Albuquerque Pinheiro",
    email: "maria.pinheiro@cm-porto.pt",
    organizacao: "CM Porto",
    grupos: [
      "Admin Municipal",
      "Gestor de Obras Públicas",
      "Gestor Ambiental",
      "Auditor Interno",
      "Aprovador de Contratos",
    ],
    estado: "Activo",
    ultimoAcesso: "há 1 h",
  },
  {
    id: "U-004",
    nome: "Pedro Nuno Ribeiro",
    email: "pedro.ribeiro@cm-porto.pt",
    organizacao: "CM Porto",
    grupos: ["Gestor de Mobilidade"],
    estado: "Activo",
    ultimoAcesso: "há 3 h",
  },
  {
    id: "U-005",
    nome: "Catarina Sousa Mendes",
    email: "catarina.mendes@cm-gaia.pt",
    organizacao: "CM V. N. Gaia",
    grupos: ["Técnico de SIG", "Colaborador Temporário"],
    estado: "Activo",
    ultimoAcesso: "há 1 dia",
  },
  {
    id: "U-006",
    nome: "Francisco Xavier Meneses da Silveira",
    email: "francisco.silveira@cm-sintra.pt",
    organizacao: "CM Sintra",
    grupos: ["Admin Municipal"],
    estado: "Activo",
    ultimoAcesso: "há 3 dias",
  },
  {
    id: "U-007",
    nome: "Inês Almeida",
    email: "ines.almeida@cm-sintra.pt",
    organizacao: "CM Sintra",
    grupos: ["Gestor Ambiental"],
    estado: "Activo",
    ultimoAcesso: "há 2 h",
  },
  {
    id: "U-008",
    nome: "Rui Manuel Tavares",
    email: "rui.tavares@cm-loures.pt",
    organizacao: "CM Loures",
    grupos: ["Gestor de Mobilidade", "Técnico de SIG"],
    estado: "Activo",
    ultimoAcesso: "há 47 min",
  },
  {
    id: "U-009",
    nome: "Sofia Beatriz Nogueira",
    email: "sofia.nogueira@cm-loures.pt",
    organizacao: "CM Loures",
    grupos: ["Colaborador Temporário"],
    estado: "Inactivo",
    ultimoAcesso: "há 94 dias",
  },
  {
    id: "U-010",
    nome: "Tiago Esteves",
    email: "tiago.esteves@cm-coimbra.pt",
    organizacao: "CM Coimbra",
    grupos: ["Admin Municipal", "Aprovador de Contratos"],
    estado: "Activo",
    ultimoAcesso: "há 26 min",
  },
  {
    id: "U-011",
    nome: "Margarida Oliveira Duarte",
    email: "margarida.duarte@cm-coimbra.pt",
    organizacao: "CM Coimbra",
    grupos: ["Gestor de Obras Públicas"],
    estado: "Bloqueado",
    ultimoAcesso: "há 18 dias",
  },
  {
    id: "U-012",
    nome: "Nuno Filipe Gonçalves",
    email: "nuno.goncalves@cm-aveiro.pt",
    organizacao: "CM Aveiro",
    grupos: ["Técnico de SIG", "Gestor Ambiental"],
    estado: "Activo",
    ultimoAcesso: "há 5 h",
  },
  {
    id: "U-013",
    nome: "Beatriz Saraiva",
    email: "beatriz.saraiva@cm-braga.pt",
    organizacao: "CM Braga",
    grupos: ["Gestor de Mobilidade"],
    estado: "Activo",
    ultimoAcesso: "há 12 min",
  },
  {
    id: "U-014",
    nome: "Henrique Machado Cordeiro",
    email: "henrique.cordeiro@cm-braga.pt",
    organizacao: "CM Braga",
    grupos: ["Admin Municipal"],
    estado: "Bloqueado",
    ultimoAcesso: "há 7 dias",
  },
  {
    id: "U-015",
    nome: "Joana Vasconcelos Antunes",
    email: "joana.antunes@cm-pontadelgada.pt",
    organizacao: "CM P. Delgada",
    grupos: ["Gestor Ambiental", "Auditor Interno"],
    estado: "Activo",
    ultimoAcesso: "há 2 dias",
  },
  {
    id: "U-016",
    nome: "Ricardo Machado",
    email: "ricardo.machado@ubiwhere.com",
    organizacao: "Ubiwhere",
    grupos: ["IT Admin", "Admin Municipal"],
    estado: "Activo",
    ultimoAcesso: "há 4 min",
  },
  {
    id: "U-017",
    nome: "Diogo Pereira Lampreia",
    email: "diogo.lampreia@ubiwhere.com",
    organizacao: "Ubiwhere",
    grupos: ["IT Admin"],
    estado: "Activo",
    ultimoAcesso: "nunca",
  },
];

export function initials(nome: string): string {
  const parts = nome.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  const first = parts[0][0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
