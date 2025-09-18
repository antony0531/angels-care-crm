import { Lead as PrismaLead, User, LeadActivity } from '@prisma/client';

// Extended Lead type with relations
export interface Lead extends PrismaLead {
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  activities?: LeadActivity[];
}

// Frontend Lead interface for compatibility
export interface FrontendLead {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  insuranceType: string;
  status: 'new' | 'contacted' | 'converted';
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage: string;
  sessionDuration: number; // in seconds
  pagesViewed: number;
  formCompletionTime: number; // in seconds
  createdAt: string;
  contactedAt?: string;
  convertedAt?: string;
  assignedAgent?: string;
  estimatedValue?: number;
  notes?: string;
}

// Convert Prisma Lead to Frontend Lead format
export function convertLeadToFrontend(lead: Lead): FrontendLead {
  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName || undefined,
    email: lead.email,
    phone: lead.phone || '',
    insuranceType: formatInsuranceType(lead.insuranceType),
    status: mapLeadStatus(lead.status),
    source: formatSource(lead.source),
    utmSource: lead.utmSource || undefined,
    utmMedium: lead.utmMedium || undefined,
    utmCampaign: lead.utmCampaign || undefined,
    landingPage: lead.landingPage || '/',
    sessionDuration: lead.sessionDuration || 0,
    pagesViewed: lead.pagesViewed || 1,
    formCompletionTime: lead.formCompletionTime || 0,
    createdAt: lead.createdAt.toISOString(),
    contactedAt: lead.contactedAt?.toISOString(),
    convertedAt: lead.convertedAt?.toISOString(),
    assignedAgent: lead.assignedTo?.name,
    estimatedValue: lead.estimatedValue || undefined,
  };
}

// Helper functions for data transformation
function formatInsuranceType(type: string): string {
  const mapping: Record<string, string> = {
    'MEDICARE_ADVANTAGE': 'Medicare Advantage',
    'ACA_PLANS': 'ACA Plans',
    'SUPPLEMENT': 'Supplement',
    'PART_D': 'Part D',
    'LIFE_INSURANCE': 'Life Insurance',
    'AUTO_INSURANCE': 'Auto Insurance',
    'HOME_INSURANCE': 'Home Insurance',
    'OTHER': 'Other',
  };
  return mapping[type] || type;
}

function mapLeadStatus(status: string): 'new' | 'contacted' | 'converted' {
  const mapping: Record<string, 'new' | 'contacted' | 'converted'> = {
    'NEW': 'new',
    'CONTACTED': 'contacted',
    'QUALIFIED': 'contacted',
    'PROPOSAL': 'contacted',
    'NEGOTIATION': 'contacted',
    'CONVERTED': 'converted',
    'LOST': 'new',
    'UNQUALIFIED': 'new',
  };
  return mapping[status] || 'new';
}

function formatSource(source: string): string {
  const mapping: Record<string, string> = {
    'GOOGLE_ADS': 'Google Ads',
    'FACEBOOK': 'Facebook',
    'LINKEDIN': 'LinkedIn',
    'ORGANIC': 'Organic',
    'DIRECT': 'Direct',
    'REFERRAL': 'Referral',
    'WEBSITE': 'Website',
    'MANUAL': 'Manual',
    'IMPORT': 'Import',
    'OTHER': 'Other',
  };
  return mapping[source] || source;
}

// Lead creation/update types
export interface CreateLeadData {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  insuranceType: string;
  source?: string;
  status?: string;
  city?: string;
  state?: string;
  country?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  sessionDuration?: number;
  pagesViewed?: number;
  formCompletionTime?: number;
  estimatedValue?: number;
  metadata?: any;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  contactedAt?: Date;
  convertedAt?: Date;
  assignedToId?: string;
}