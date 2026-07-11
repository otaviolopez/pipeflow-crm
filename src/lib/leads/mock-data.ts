import { ACTIVITY_TYPES, OWNERS } from "./types";
import type { Activity, ActivityType, Lead } from "./types";

// Mesmas 11 empresas usadas no mock do pipeline (src/lib/pipeline/mock-data.ts)
// — só para o dado mockado contar uma história coerente entre as duas telas.
// A ligação de verdade (deals.lead_id → leads.id) só existe a partir do M10.
const COMPANIES = [
  "Studio Aurora",
  "Grupo Ravena",
  "Cafeteria Bom Grão",
  "Ótica Visão Clara",
  "Construtora Pinheiro",
  "Farmácia Vida Plena",
  "Auto Peças União",
  "Studio de Pilates Movimente",
  "Padaria Trigo Dourado",
  "Barbearia Corte Fino",
  "Loja Estilo Urbano",
];

const FIRST_NAMES = [
  "Mariana", "Pedro", "Juliana", "Rafael", "Camila", "Lucas", "Beatriz",
  "Gustavo", "Fernanda", "Thiago", "Larissa", "Diego", "Patrícia", "Rodrigo",
  "Vanessa", "Eduardo", "Aline", "Marcelo", "Renata", "Felipe",
];

const LAST_NAMES = [
  "Alves", "Barros", "Cardoso", "Duarte", "Esteves", "Farias", "Gomes",
  "Henriques", "Iglesias", "Junqueira",
];

const ROLE_TITLES = ["Sócio(a)", "Gerente", "Comprador(a)"];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (marcas de combinação)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function hoursAgoISO(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

const TOTAL_MOCK_LEADS = 55;

function buildMockLeads(): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < TOTAL_MOCK_LEADS; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const company = COMPANIES[i % COMPANIES.length];
    leads.push({
      id: String(i + 1),
      name: `${firstName} ${lastName}`,
      email: `${slugify(firstName)}.${slugify(lastName)}@${slugify(company)}.com.br`,
      phone: `(11) 9${String(80000000 + i * 137).padStart(8, "0")}`,
      company,
      roleTitle: i % 4 === 3 ? null : ROLE_TITLES[i % 3],
      // i % 7 (não múltiplo de 3) para o status não ficar sempre correlacionado
      // com o mesmo responsável (i % 3) nos dados mockados.
      status: i % 7 === 0 ? "inactive" : "active",
      ownerName: OWNERS[i % OWNERS.length],
      // Mais antigos primeiro, espalhados pelos últimos ~55 dias — dá pra
      // testar o filtro de data de cadastro com resultado variado.
      createdAt: daysAgoISO(TOTAL_MOCK_LEADS - i),
    });
  }
  return leads;
}

const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string[]> = {
  call: [
    "Liguei para apresentar o produto.",
    "Retornei a ligação sobre o orçamento.",
  ],
  email: [
    "Enviei a proposta comercial por e-mail.",
    "Encaminhei o catálogo de serviços.",
  ],
  meeting: [
    "Reunião de apresentação realizada.",
    "Alinhamento de próximos passos.",
  ],
  note: [
    "Cliente pediu para retornar na próxima semana.",
    "Prefere contato por WhatsApp.",
  ],
};

function buildMockActivities(leads: Lead[]): Activity[] {
  const activities: Activity[] = [];
  let counter = 0;
  leads.forEach((lead, leadIndex) => {
    // index % 5 varia de 0 a 4 atividades — alguns leads ficam sem nenhuma,
    // o suficiente pra testar o estado vazio da timeline também.
    const activityCount = leadIndex % 5;
    for (let i = 0; i < activityCount; i++) {
      const type = ACTIVITY_TYPES[(leadIndex + i) % ACTIVITY_TYPES.length].id;
      const descriptions = ACTIVITY_DESCRIPTIONS[type];
      counter += 1;
      activities.push({
        id: `act-${counter}`,
        leadId: lead.id,
        type,
        description: descriptions[i % descriptions.length],
        authorName: OWNERS[(leadIndex + i) % OWNERS.length],
        createdAt: hoursAgoISO(counter * 7),
      });
    }
  });
  return activities;
}

export const MOCK_LEADS = buildMockLeads();
export const MOCK_ACTIVITIES = buildMockActivities(MOCK_LEADS);
