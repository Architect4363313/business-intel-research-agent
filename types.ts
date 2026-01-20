
export interface Owner {
  firstName: string;
  lastName: string;
}

export interface StrategicContact {
  name: string;
  role: string;
  area: 'Finanzas' | 'Operaciones' | 'Tecnología' | 'Propiedad' | 'Otros';
  relevance: string;
  validity: string;
  confidence: 'Alto' | 'Medio' | 'Bajo';
  source: string;
  secondarySource?: string;
}

export interface SuggestedEmail {
  email: string;
  status: 'Público' | 'Inferido';
  source: string;
  bounceRisk: 'Bajo' | 'Medio' | 'Alto';
}

export interface ContactChannel {
  type: string;
  data: string;
  status: 'Público' | 'Inferido';
  source: string;
}

export interface LegalInfo {
  legalName: string;
  owners: string[];
}

export interface DirectContacts {
  email: string;
  phone: string;
}

export interface SocialProfile {
    platform: string;
    url: string;
    handle: string;
}

export interface TechStack {
    category: string;
    provider: string;
}

export interface OperationalInfo {
    menuType: string;
    orderingSystem: string;
    paymentMethods: string[];
    digitalMenuUrl?: string;
}

export interface SwotAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface Competitor {
    name: string;
    advantage: string;
}

export interface HoneiAnalysis {
    fitScore: number;
    fitLabel: "Muy Alta" | "Alta" | "Media" | "Baja";
    reasoning: string;
    matchedFeatures: string[];
    executiveSummary: string;
}

export interface BusinessProfile {
  businessName: string;
  city: string;
  fullAddress: string;
  owners: Owner[];
  strategicContacts: StrategicContact[];
  legalInfo: LegalInfo;
  directContacts: DirectContacts;
  emailDomain: string;
  suggestedEmails: SuggestedEmail[];
  contactChannels: ContactChannel[];
  businessSummary: string;
  
  techStack: TechStack[];
  operationalInfo: OperationalInfo;
  painPoints: string[];
  socialMedia: SocialProfile[];
  iceBreaker: string;
  
  swot: SwotAnalysis;
  competitors: Competitor[];
  estimatedVolume: string;
  
  honeiAnalysis: HoneiAnalysis;
  osintNotes: {
      unverified: string;
      verificationSteps: string;
  };
  
  googleSearchSources: {
      uri: string;
      title: string;
  }[];
}
