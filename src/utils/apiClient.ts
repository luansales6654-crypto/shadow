const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('vendeai_token');
}

export function setToken(token: string) {
  localStorage.setItem('vendeai_token', token);
}

export function clearToken() {
  localStorage.removeItem('vendeai_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ error: 'Resposta inválida do servidor' }));

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(data.error || `Erro na requisição (${res.status})`);
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, planId?: string) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, planId }),
    }),

  getMe: () => request<{ user: any }>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  // Plans & Payments
  getPlans: () => request<{ plans: any[] }>('/plans'),

  getPixInfo: () => request<{ pix: any; plans: any[] }>('/payments/pix-info'),

  submitPaymentProof: (data: { planId: string; fileUrl: string; fileType: string; fileName: string; fileSize: number }) =>
    request<{ message: string; payment: any }>('/payments/proof', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyPaymentStatus: () => request<any>('/payments/my-status'),

  // Leads & Prospecting
  searchPlaces: (params: { niche: string; state: string; city: string; neighborhood?: string }) =>
    request<{ results: any[]; query: string; provider: string }>('/leads/search', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  saveLead: (leadData: any) =>
    request<{ lead: any; alreadyExisted: boolean; message: string }>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    }),

  getLeads: () => request<{ leads: any[] }>('/leads'),

  updateLeadStatus: (id: string, status: string, reason?: string) =>
    request<{ lead: any }>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  addLeadNote: (id: string, note: string) =>
    request<{ note: any }>(`/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  deleteLead: (id: string) =>
    request<{ message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),

  // Proposals
  generateProposalWithAI: (lead: any) =>
    request<{ proposal: string; modelUsed: string; isAiGenerated: boolean }>('/proposals/generate', {
      method: 'POST',
      body: JSON.stringify({ lead }),
    }),

  saveProposal: (proposalData: any) =>
    request<{ proposal: any }>('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    }),

  getProposals: () => request<{ proposals: any[] }>('/proposals'),

  // Sales
  registerSale: (saleData: any) =>
    request<{ sale: any }>('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    }),

  getSales: () => request<{ sales: any[]; totalRevenue: number; salesCount: number }>('/sales'),

  // Sites
  generatePrompt: (params: any) =>
    request<{ prompt: string }>('/sites/generate-prompt', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  generateWebsite: (params: any) =>
    request<{ prompt: string; html: string; modelUsed: string; isAiGenerated: boolean }>('/sites/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  saveSite: (siteData: any) =>
    request<{ site: any }>('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
    }),

  getSites: () => request<{ sites: any[] }>('/sites'),

  duplicateSite: (id: string) =>
    request<{ site: any }>(`/sites/${id}/duplicate`, {
      method: 'POST',
    }),

  updateSite: (id: string, updates: any) =>
    request<{ site: any }>(`/sites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteSite: (id: string) =>
    request<{ message: string }>(`/sites/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<{ notifications: any[] }>('/notifications'),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/read-all', {
      method: 'PATCH',
    }),

  // Admin (Strictly luancamp953@gmail.com)
  getAdminOverview: () => request<any>('/admin/overview'),
  getAdminPayments: () => request<{ payments: any[] }>('/admin/payments'),
  approvePayment: (id: string) =>
    request<{ message: string; payment: any }>(`/admin/payments/${id}/approve`, {
      method: 'POST',
    }),
  rejectPayment: (id: string, reason: string) =>
    request<{ message: string; payment: any }>(`/admin/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  getAdminUsers: () => request<{ users: any[] }>('/admin/users'),
  updateAdminUser: (id: string, updates: any) =>
    request<{ user: any }>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getAdminSettings: () => request<{ settings: any }>('/admin/settings'),
  updateAdminSettings: (updates: any) =>
    request<{ settings: any }>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  updateAdminPlan: (id: string, updates: any) =>
    request<{ plan: any }>(`/admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  testGemini: () => request<{ success: boolean; message: string; model: string }>('/admin/test-gemini', { method: 'POST' }),
  testMaps: () => request<{ success: boolean; message: string }>('/admin/test-maps', { method: 'POST' }),
  getAdminLogs: () => request<{ activityLogs: any[]; aiLogs: any[] }>('/admin/logs'),
};
