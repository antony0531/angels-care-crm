import { randomUUID } from 'crypto';

export interface UniversalLeadData {
  // Required fields
  email: string;
  firstName: string;
  
  // Optional personal info
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  
  // Location
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Insurance specific
  insuranceType?: string;
  planType?: string;
  currentInsurance?: string;
  
  // Marketing data
  source: string;
  campaign?: string;
  medium?: string;
  content?: string;
  term?: string;
  
  // UTM parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  
  // Tracking
  landingPage?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  
  // Behavioral data
  pageViews?: number;
  sessionDuration?: number;
  formCompletionTime?: number;
  previousVisits?: number;
  
  // Lead context
  notes?: string;
  interests?: string[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  // Metadata
  customFields?: Record<string, any>;
  rawPayload?: Record<string, any>;
  
  // Timestamps
  submittedAt?: string;
  landingPageVisitedAt?: string;
}

export interface ProcessedLead {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  insuranceType: string;
  source: string;
  status: string;
  score: number;
  tags: string[];
  metadata: Record<string, any>;
  
  // UTM and tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  sessionDuration?: number;
  pagesViewed?: number;
  formCompletionTime?: number;
  
  // Location
  city?: string;
  state?: string;
  country?: string;
  
  // Business data
  estimatedValue?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps common insurance plan types to standardized enum values
 */
export function mapInsuranceType(planType?: string): string {
  if (!planType) return 'OTHER';
  
  const normalizedType = planType.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  
  const typeMap: Record<string, string> = {
    // Medicare variations
    'MEDICARE': 'MEDICARE_ADVANTAGE',
    'MEDICARE_ADVANTAGE': 'MEDICARE_ADVANTAGE',
    'MEDICARE_ADV': 'MEDICARE_ADVANTAGE',
    'MEDIGAP': 'SUPPLEMENT',
    'MEDICARE_SUPPLEMENT': 'SUPPLEMENT',
    
    // ACA variations
    'ACA': 'ACA_PLANS',
    'ACA_PLANS': 'ACA_PLANS',
    'AFFORDABLE_CARE_ACT': 'ACA_PLANS',
    'MARKETPLACE': 'ACA_PLANS',
    'HEALTH_INSURANCE': 'ACA_PLANS',
    
    // Supplement
    'SUPPLEMENT': 'SUPPLEMENT',
    'SUPP': 'SUPPLEMENT',
    
    // Part D
    'PART_D': 'PART_D',
    'PARTD': 'PART_D',
    'PRESCRIPTION': 'PART_D',
    'RX': 'PART_D',
    
    // Life Insurance
    'LIFE': 'LIFE_INSURANCE',
    'LIFE_INSURANCE': 'LIFE_INSURANCE',
    'TERM_LIFE': 'LIFE_INSURANCE',
    'WHOLE_LIFE': 'LIFE_INSURANCE',
    
    // Auto Insurance
    'AUTO': 'AUTO_INSURANCE',
    'AUTO_INSURANCE': 'AUTO_INSURANCE',
    'CAR': 'AUTO_INSURANCE',
    'VEHICLE': 'AUTO_INSURANCE',
    
    // Home Insurance
    'HOME': 'HOME_INSURANCE',
    'HOME_INSURANCE': 'HOME_INSURANCE',
    'HOMEOWNERS': 'HOME_INSURANCE',
    'PROPERTY': 'HOME_INSURANCE',
  };
  
  return typeMap[normalizedType] || 'OTHER';
}

/**
 * Calculates lead score based on available data
 */
export function calculateLeadScore(data: UniversalLeadData): number {
  let score = 0;
  
  // Base score for having required info
  if (data.email && data.firstName) score += 10;
  
  // Contact information completeness
  if (data.phone) score += 15;
  if (data.lastName) score += 5;
  if (data.zipCode) score += 10;
  
  // Demographics
  if (data.age) {
    // Medicare age range gets higher score
    if (data.age >= 65) score += 20;
    else if (data.age >= 50) score += 10;
    else score += 5;
  }
  
  // Insurance interest specificity
  if (data.insuranceType && data.insuranceType !== 'OTHER') score += 15;
  if (data.currentInsurance) score += 10;
  
  // Engagement indicators
  if (data.pageViews && data.pageViews > 1) score += Math.min(data.pageViews * 2, 10);
  if (data.sessionDuration && data.sessionDuration > 300) score += 10; // 5+ minutes
  if (data.formCompletionTime && data.formCompletionTime < 120) score += 5; // Quick form completion
  
  // Source quality
  const sourceScore: Record<string, number> = {
    'FACEBOOK_ADS': 10,
    'INSTAGRAM_ADS': 10,
    'GOOGLE_ADS': 15,
    'TIKTOK_ADS': 8,
    'PINTEREST_ADS': 12,
    'SNAPCHAT_ADS': 8,
    'ORGANIC_SEARCH': 20,
    'REFERRAL': 25,
    'DIRECT': 15,
    'EMAIL': 10,
    'LANDING_PAGE': 12
  };
  
  if (data.source && sourceScore[data.source.toUpperCase()]) {
    score += sourceScore[data.source.toUpperCase()];
  }
  
  // UTM campaign tracking
  if (data.utmCampaign) score += 5;
  if (data.utmSource) score += 5;
  
  // Repeat visitor bonus
  if (data.previousVisits && data.previousVisits > 0) {
    score += Math.min(data.previousVisits * 3, 15);
  }
  
  // Priority override
  if (data.priority === 'URGENT') score += 30;
  else if (data.priority === 'HIGH') score += 20;
  else if (data.priority === 'MEDIUM') score += 10;
  
  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Generates relevant tags based on lead data
 */
export function generateLeadTags(data: UniversalLeadData): string[] {
  const tags: string[] = [];
  
  // Age-based tags
  if (data.age) {
    if (data.age >= 65) tags.push('Medicare-Eligible');
    else if (data.age >= 50) tags.push('Pre-Medicare');
    else tags.push('Under-50');
  }
  
  // Source tags
  if (data.source) {
    tags.push(`Source-${data.source.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }
  
  // Insurance type tags
  if (data.insuranceType) {
    tags.push(data.insuranceType.replace('_', '-'));
  }
  
  // Engagement tags
  if (data.pageViews && data.pageViews > 5) tags.push('High-Engagement');
  if (data.sessionDuration && data.sessionDuration > 600) tags.push('Long-Session');
  if (data.previousVisits && data.previousVisits > 0) tags.push('Returning-Visitor');
  
  // Geographic tags
  if (data.state) tags.push(`State-${data.state}`);
  if (data.zipCode) tags.push(`Zip-${data.zipCode.substring(0, 3)}`);
  
  // Campaign tags
  if (data.utmCampaign) tags.push(`Campaign-${data.utmCampaign.replace(/[^a-zA-Z0-9]/g, '-')}`);
  
  // Priority tags
  if (data.priority) tags.push(`Priority-${data.priority}`);
  
  return tags.filter(tag => tag.length > 0);
}

/**
 * Platform-specific data mappers
 */
export const PLATFORM_MAPPERS = {
  facebook: (payload: any): UniversalLeadData => ({
    email: payload.email || payload.field_data?.find((f: any) => f.name === 'email')?.values?.[0],
    firstName: payload.first_name || payload.field_data?.find((f: any) => f.name === 'first_name')?.values?.[0],
    lastName: payload.last_name || payload.field_data?.find((f: any) => f.name === 'last_name')?.values?.[0],
    phone: payload.phone_number || payload.field_data?.find((f: any) => f.name === 'phone_number')?.values?.[0],
    zipCode: payload.zip_code || payload.field_data?.find((f: any) => f.name === 'zip_code')?.values?.[0],
    source: 'FACEBOOK_ADS',
    utmSource: 'facebook',
    utmMedium: 'paid_social',
    utmCampaign: payload.campaign_name || payload.ad_id,
    landingPage: payload.page_url,
    customFields: payload.field_data?.reduce((acc: any, field: any) => {
      acc[field.name] = field.values;
      return acc;
    }, {}),
    rawPayload: payload,
    submittedAt: payload.created_time || new Date().toISOString()
  }),

  google: (payload: any): UniversalLeadData => ({
    email: payload.email || payload.user_column_data?.find((d: any) => d.column_id === 'EMAIL')?.string_value,
    firstName: payload.first_name || payload.user_column_data?.find((d: any) => d.column_id === 'FIRST_NAME')?.string_value,
    lastName: payload.last_name || payload.user_column_data?.find((d: any) => d.column_id === 'LAST_NAME')?.string_value,
    phone: payload.phone_number || payload.user_column_data?.find((d: any) => d.column_id === 'PHONE_NUMBER')?.string_value,
    zipCode: payload.zip_code || payload.user_column_data?.find((d: any) => d.column_id === 'ZIP_CODE')?.string_value,
    source: 'GOOGLE_ADS',
    utmSource: 'google',
    utmMedium: 'paid_search',
    utmCampaign: payload.campaign_id,
    landingPage: payload.click_url,
    customFields: payload.user_column_data?.reduce((acc: any, data: any) => {
      acc[data.column_id] = data.string_value;
      return acc;
    }, {}),
    rawPayload: payload,
    submittedAt: payload.lead_gen_time || new Date().toISOString()
  }),

  landing_page: (payload: any): UniversalLeadData => ({
    email: payload.email,
    firstName: payload.firstName || payload.first_name,
    lastName: payload.lastName || payload.last_name,
    phone: payload.phone || payload.phoneNumber,
    age: payload.age ? parseInt(payload.age) : undefined,
    zipCode: payload.zipCode || payload.zip,
    city: payload.city,
    state: payload.state,
    insuranceType: payload.insuranceType || payload.planType,
    currentInsurance: payload.currentInsurance,
    source: 'LANDING_PAGE',
    utmSource: payload.utm_source,
    utmMedium: payload.utm_medium,
    utmCampaign: payload.utm_campaign,
    utmContent: payload.utm_content,
    utmTerm: payload.utm_term,
    landingPage: payload.page_url || payload.url,
    referrer: payload.referrer,
    userAgent: payload.user_agent,
    sessionDuration: payload.session_duration,
    pageViews: payload.page_views,
    formCompletionTime: payload.form_completion_time,
    notes: payload.notes || payload.comments,
    interests: payload.interests ? payload.interests.split(',').map((i: string) => i.trim()) : undefined,
    customFields: payload.custom_fields || {},
    rawPayload: payload,
    submittedAt: payload.submitted_at || new Date().toISOString()
  }),

  generic: (payload: any): UniversalLeadData => ({
    email: payload.email,
    firstName: payload.firstName || payload.first_name,
    lastName: payload.lastName || payload.last_name,
    phone: payload.phone || payload.phoneNumber,
    zipCode: payload.zipCode || payload.zip,
    source: payload.source || 'UNKNOWN',
    utmSource: payload.utm_source,
    utmMedium: payload.utm_medium,
    utmCampaign: payload.utm_campaign,
    insuranceType: payload.insuranceType || payload.planType,
    customFields: payload,
    rawPayload: payload,
    submittedAt: new Date().toISOString()
  }),

  instagram: (payload: any): UniversalLeadData => ({
    email: payload.email || payload.field_data?.find((f: any) => f.name === 'email')?.values?.[0],
    firstName: payload.first_name || payload.field_data?.find((f: any) => f.name === 'first_name')?.values?.[0],
    lastName: payload.last_name || payload.field_data?.find((f: any) => f.name === 'last_name')?.values?.[0],
    phone: payload.phone_number || payload.field_data?.find((f: any) => f.name === 'phone_number')?.values?.[0],
    zipCode: payload.zip_code || payload.field_data?.find((f: any) => f.name === 'zip_code')?.values?.[0],
    source: 'INSTAGRAM_ADS',
    utmSource: 'instagram',
    utmMedium: 'paid_social',
    utmCampaign: payload.campaign_name || payload.ad_id,
    landingPage: payload.page_url,
    customFields: payload.field_data?.reduce((acc: any, field: any) => {
      acc[field.name] = field.values;
      return acc;
    }, {}),
    rawPayload: payload,
    submittedAt: payload.created_time || new Date().toISOString()
  }),

  tiktok: (payload: any): UniversalLeadData => ({
    email: payload.email || payload.lead_info?.email || payload.form_data?.email,
    firstName: payload.first_name || payload.lead_info?.first_name || payload.form_data?.first_name,
    lastName: payload.last_name || payload.lead_info?.last_name || payload.form_data?.last_name,
    phone: payload.phone || payload.lead_info?.phone || payload.form_data?.phone,
    zipCode: payload.zip_code || payload.lead_info?.zip_code || payload.form_data?.zip_code,
    age: payload.age || payload.lead_info?.age ? parseInt(payload.age || payload.lead_info?.age) : undefined,
    source: 'TIKTOK_ADS',
    utmSource: 'tiktok',
    utmMedium: 'paid_social',
    utmCampaign: payload.campaign_id || payload.campaign_name,
    landingPage: payload.click_url,
    customFields: {
      ad_group_id: payload.ad_group_id,
      ad_id: payload.ad_id,
      advertiser_id: payload.advertiser_id,
      ...payload.form_data
    },
    rawPayload: payload,
    submittedAt: payload.event_time || payload.created_time || new Date().toISOString()
  }),

  pinterest: (payload: any): UniversalLeadData => ({
    email: payload.email || payload.lead_data?.email || payload.user_data?.email,
    firstName: payload.first_name || payload.lead_data?.first_name || payload.user_data?.first_name,
    lastName: payload.last_name || payload.lead_data?.last_name || payload.user_data?.last_name,
    phone: payload.phone || payload.lead_data?.phone || payload.user_data?.phone,
    zipCode: payload.zip_code || payload.lead_data?.zip_code || payload.user_data?.zip_code,
    age: payload.age || payload.lead_data?.age ? parseInt(payload.age || payload.lead_data?.age) : undefined,
    source: 'PINTEREST_ADS',
    utmSource: 'pinterest',
    utmMedium: 'paid_social',
    utmCampaign: payload.campaign_id || payload.campaign_name,
    landingPage: payload.click_url,
    customFields: {
      ad_group_id: payload.ad_group_id,
      pin_id: payload.pin_id,
      advertiser_id: payload.advertiser_id,
      ...payload.lead_data
    },
    rawPayload: payload,
    submittedAt: payload.event_time || payload.created_time || new Date().toISOString()
  }),

  snapchat: (payload: any): UniversalLeadData => ({
    email: payload.email || payload.user_data?.email || payload.conversion_data?.email,
    firstName: payload.first_name || payload.user_data?.first_name || payload.conversion_data?.first_name,
    lastName: payload.last_name || payload.user_data?.last_name || payload.conversion_data?.last_name,
    phone: payload.phone || payload.user_data?.phone || payload.conversion_data?.phone,
    zipCode: payload.zip_code || payload.user_data?.zip_code || payload.conversion_data?.zip_code,
    age: payload.age || payload.user_data?.age ? parseInt(payload.age || payload.user_data?.age) : undefined,
    source: 'SNAPCHAT_ADS',
    utmSource: 'snapchat',
    utmMedium: 'paid_social',
    utmCampaign: payload.campaign_id || payload.campaign_name,
    landingPage: payload.click_url,
    customFields: {
      ad_squad_id: payload.ad_squad_id,
      ad_id: payload.ad_id,
      advertiser_id: payload.advertiser_id,
      ...payload.conversion_data
    },
    rawPayload: payload,
    submittedAt: payload.timestamp || payload.event_time || new Date().toISOString()
  })
};

/**
 * Main function to process universal lead data into database format
 */
export function processLeadData(
  data: UniversalLeadData,
  options: {
    assignedToId?: string;
    defaultStatus?: string;
    platform?: keyof typeof PLATFORM_MAPPERS;
  } = {}
): ProcessedLead {
  const {
    assignedToId,
    defaultStatus = 'NEW',
    platform
  } = options;

  // Apply platform-specific processing if specified
  let processedData = data;
  if (platform && PLATFORM_MAPPERS[platform]) {
    processedData = PLATFORM_MAPPERS[platform](data.rawPayload || data);
  }

  const score = calculateLeadScore(processedData);
  const tags = generateLeadTags(processedData);
  const insuranceType = mapInsuranceType(processedData.insuranceType);

  return {
    id: randomUUID(),
    email: processedData.email,
    firstName: processedData.firstName,
    lastName: processedData.lastName,
    phone: processedData.phone,
    insuranceType,
    source: processedData.source,
    status: defaultStatus,
    score,
    tags,
    
    // UTM and tracking data
    utmSource: processedData.utmSource,
    utmMedium: processedData.utmMedium,
    utmCampaign: processedData.utmCampaign,
    landingPage: processedData.landingPage,
    sessionDuration: processedData.sessionDuration,
    pagesViewed: processedData.pageViews,
    formCompletionTime: processedData.formCompletionTime,
    
    // Location
    city: processedData.city,
    state: processedData.state,
    country: processedData.country,
    
    // Business data
    estimatedValue: calculateEstimatedValue(processedData),
    
    // Metadata includes all custom fields and raw payload
    metadata: {
      ...processedData.customFields,
      rawPayload: processedData.rawPayload,
      notes: processedData.notes,
      interests: processedData.interests,
      priority: processedData.priority,
      submittedAt: processedData.submittedAt,
      processingTimestamp: new Date().toISOString()
    },
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Calculate estimated lead value based on insurance type and demographics
 */
function calculateEstimatedValue(data: UniversalLeadData): number {
  let baseValue = 0;
  
  // Base values by insurance type
  const insuranceValues: Record<string, number> = {
    'MEDICARE_ADVANTAGE': 500,
    'ACA_PLANS': 300,
    'SUPPLEMENT': 400,
    'PART_D': 200,
    'LIFE_INSURANCE': 800,
    'AUTO_INSURANCE': 150,
    'HOME_INSURANCE': 200
  };
  
  const insuranceType = mapInsuranceType(data.insuranceType);
  baseValue = insuranceValues[insuranceType] || 100;
  
  // Multiply by lead score factor
  const scoreFactor = data ? calculateLeadScore(data) / 100 : 0.5;
  
  return Math.round(baseValue * scoreFactor);
}

/**
 * Validate required lead data
 */
export function validateLeadData(data: UniversalLeadData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (!data.firstName) {
    errors.push('First name is required');
  }
  
  if (!data.source) {
    errors.push('Source is required');
  }
  
  if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (data.age && (data.age < 0 || data.age > 120)) {
    errors.push('Invalid age');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}