export type UserRole = 'admin' | 'user' | 'support';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'waiting_payment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  planId?: string;
  planName?: string;
  planType?: 'vitalicio' | 'mensal';
  installmentsPaid?: number;
  totalInstallments?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_type: 'vitalicio' | 'mensal';
  installments: number;
  duration_months: number;
  active: boolean;
  features: string[];
}

export interface PaymentProof {
  id: string;
  payment_id: string;
  file_url: string; // base64 or stored URL
  file_type: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  payment_method: 'pix';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  proof?: PaymentProof;
}

export interface WebsiteVersion {
  version: number;
  created_at: string;
  prompt: string;
  html_content: string;
  notes?: string;
}

export interface Website {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  niche_id: string;
  niche_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  style: string;
  objectives: string[];
  company_data: {
    name: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    city?: string;
    address?: string;
    hours?: string;
  };
  prompt: string;
  html_content?: string;
  status: 'draft' | 'ready' | 'published';
  created_at: string;
  updated_at: string;
  versions?: WebsiteVersion[];
}

export type LeadStatus =
  | 'novo'
  | 'contato'
  | 'interessado'
  | 'proposta'
  | 'negociacao'
  | 'vendido'
  | 'perdido'
  | 'prospect'
  | 'contacted'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  note: string;
  created_at: string;
}

export interface LeadStatusHistory {
  id: string;
  from_status: LeadStatus;
  to_status: LeadStatus;
  changed_at: string;
  reason?: string;
}

export interface Lead {
  id: string;
  user_id: string;
  external_place_id?: string;
  company_name: string;
  category: string;
  phone?: string;
  whatsapp?: string;
  website?: string | null;
  has_website: boolean;
  instagram?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews_count?: number;
  status: LeadStatus;
  maps_url?: string;
  created_at: string;
  updated_at: string;
  notes?: LeadNote[];
  history?: LeadStatusHistory[];
}

export interface Proposal {
  id: string;
  user_id: string;
  lead_id: string;
  lead_name: string;
  niche: string;
  content: string;
  whatsapp_number?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  lead_id?: string;
  client_name: string;
  service: string;
  amount: number;
  sale_date: string;
  notes?: string;
  status: 'completed' | 'pending';
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'payment_approved' | 'payment_rejected' | 'site_created' | 'lead_saved' | 'proposal_created' | 'sale_registered' | 'system';
  read: boolean;
  created_at: string;
}

export interface PixSettings {
  pix_key: string;
  receiver_name: string;
  instruction: string;
  active: boolean;
}

export interface AdminSettings {
  pix: PixSettings;
  gemini: {
    model: string;
    active: boolean;
    system_instruction?: string;
    has_api_key?: boolean;
  };
  maps: {
    provider: 'google_places' | 'osm_places';
    active: boolean;
    has_api_key?: boolean;
  };
  features: {
    gemini_enabled: boolean;
    maps_enabled: boolean;
    crm_enabled: boolean;
    proposals_enabled: boolean;
    sales_enabled: boolean;
  };
  maintenance_mode: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: string;
  ip?: string;
  created_at: string;
}

export interface AiGenerationLog {
  id: string;
  user_id: string;
  type: 'website' | 'proposal' | 'test';
  model: string;
  status: 'success' | 'failed';
  tokens?: number;
  error?: string;
  created_at: string;
}
