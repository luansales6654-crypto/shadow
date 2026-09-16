import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Plan,
  Payment,
  Website,
  Lead,
  Proposal,
  Sale,
  AppNotification,
  AdminSettings,
  ActivityLog,
  AiGenerationLog,
} from '../types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vendeai_database.json');
const SECRET = process.env.AUTH_SECRET || 'vendeai_encryption_key_2026';

// Hashing with salt
export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SECRET).update(password).digest('hex');
}

export function createToken(userId: string, email: string, role: string): string {
  const payload = JSON.stringify({
    userId,
    email,
    role,
    timestamp: Date.now(),
    expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(SECRET, 'salt', 32), iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const [ivHex, encrypted] = token.split(':');
    if (!ivHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(SECRET, 'salt', 32), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const parsed = JSON.parse(decrypted);
    if (Date.now() - parsed.timestamp > parsed.expiresIn) {
      return null;
    }
    return { userId: parsed.userId, email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  plans: Plan[];
  payments: Payment[];
  websites: Website[];
  leads: Lead[];
  proposals: Proposal[];
  sales: Sale[];
  notifications: AppNotification[];
  admin_settings: AdminSettings;
  activity_logs: ActivityLog[];
  ai_generations: AiGenerationLog[];
}

const DEFAULT_ADMIN_EMAIL = 'luancamp953@gmail.com';
const DEFAULT_ADMIN_PASS = 'luansales2014';

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_master',
      name: 'Luan (Administrador)',
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hashPassword(DEFAULT_ADMIN_PASS),
      role: 'admin',
      status: 'active',
      planId: 'plan_vitalicio',
      planName: 'Vitalício Master',
      planType: 'vitalicio',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
  ],
  plans: [
    {
      id: 'plan_mensal',
      name: 'Plano Mensal (12x)',
      description: 'Acesso à Vende AI com pagamento mensal durante 12 parcelas.',
      price: 39.90,
      billing_type: 'mensal',
      installments: 12,
      duration_months: 12,
      active: true,
      features: [
        'Criador de sites com IA Gemini',
        'Pesquisa de empresas reais com Google Maps',
        'CRM de prospecção completo',
        'Gerador de propostas para WhatsApp',
        'Painel de controle de vendas',
      ],
    },
    {
      id: 'plan_vitalicio',
      name: 'Vitalício',
      description: 'Acesso vitalício irrestrito à Vende AI sem cobranças recorrentes.',
      price: 227.0,
      billing_type: 'vitalicio',
      installments: 1,
      duration_months: 999,
      active: true,
      features: [
        'Acesso vitalício completo',
        'Geração ilimitada de prompts e sites',
        'Busca avançada de empresas sem site',
        'CRM de vendas e métricas em tempo real',
        'Acesso a todas as futuras atualizações',
        'Suporte prioritário',
      ],
    },
  ],
  payments: [],
  websites: [],
  leads: [],
  proposals: [],
  sales: [],
  notifications: [
    {
      id: 'notif_welcome_admin',
      user_id: 'usr_admin_master',
      title: 'Bem-vindo ao Vende AI',
      message: 'Sistema inicializado com sucesso. Você possui acesso administrativo total.',
      type: 'system',
      read: false,
      created_at: new Date().toISOString(),
    },
  ],
  admin_settings: {
    pix: {
      pix_key: '22116932700',
      receiver_name: 'Vende AI - Luan',
      instruction: 'Transfira o valor exato do plano escolhido e envie o comprovante abaixo para liberação imediata.',
      active: true,
    },
    gemini: {
      model: 'gemini-3.8-flash',
      active: true,
      system_instruction: 'Você é o motor de inteligência artificial de alta conversão da Vende AI, especialista em websites comerciais para empresas locais brasileiras.',
      has_api_key: Boolean(process.env.GEMINI_API_KEY),
    },
    maps: {
      provider: 'google_places',
      active: true,
      has_api_key: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    },
    features: {
      gemini_enabled: true,
      maps_enabled: true,
      crm_enabled: true,
      proposals_enabled: true,
      sales_enabled: true,
    },
    maintenance_mode: false,
  },
  activity_logs: [
    {
      id: 'log_boot',
      user_id: 'usr_admin_master',
      user_email: DEFAULT_ADMIN_EMAIL,
      action: 'SYSTEM_BOOT',
      details: 'Plataforma Vende AI inicializada e pronta para operações.',
      created_at: new Date().toISOString(),
    },
  ],
  ai_generations: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
    this.ensureAdminUser();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Merge with initial db defaults in case new fields were added
        return {
          ...INITIAL_DB,
          ...parsed,
          admin_settings: {
            ...INITIAL_DB.admin_settings,
            ...(parsed.admin_settings || {}),
          },
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh:', err);
    }
    this.persist(INITIAL_DB);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  private persist(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // Guarantee that only luancamp953@gmail.com is admin and default credentials exist
  private ensureAdminUser() {
    let admin = this.data.users.find((u) => u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase());
    if (!admin) {
      admin = {
        id: 'usr_admin_master',
        name: 'Luan (Administrador)',
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash: hashPassword(DEFAULT_ADMIN_PASS),
        role: 'admin',
        status: 'active',
        planId: 'plan_vitalicio',
        planName: 'Vitalício',
        planType: 'vitalicio',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      this.data.users.push(admin);
      this.save();
    } else {
      // Strictly enforce admin role and valid credentials
      admin.role = 'admin';
      admin.status = 'active';
      admin.passwordHash = hashPassword(DEFAULT_ADMIN_PASS);
      this.save();
    }

    // Safety rule: Guarantee NO OTHER user has role === 'admin'
    let changed = false;
    for (const u of this.data.users) {
      if (u.email.toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase() && u.role === 'admin') {
        u.role = 'user';
        changed = true;
      }
    }
    if (changed) this.save();
  }

  // --- USERS ---
  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(name: string, email: string, pass: string, planId?: string) {
    const cleanEmail = email.toLowerCase().trim();
    if (this.findUserByEmail(cleanEmail)) {
      throw new Error('E-mail já cadastrado.');
    }
    // Only DEFAULT_ADMIN_EMAIL can ever be admin
    const isAdmin = cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();
    const plan = this.data.plans.find((p) => p.id === planId) || this.data.plans[1]; // default vitalício

    const newUser: User & { passwordHash: string } = {
      id: 'usr_' + crypto.randomUUID().slice(0, 10),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(pass),
      role: isAdmin ? 'admin' : 'user',
      // All registered users start active with full access to work tools
      status: 'active',
      planId: plan.id,
      planName: plan.name,
      planType: plan.billing_type,
      installmentsPaid: isAdmin ? 12 : 0,
      totalInstallments: plan.installments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.logActivity(newUser.id, newUser.email, 'USER_REGISTERED', `Novo usuário registrado no plano ${plan.name}`);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const user = this.findUserById(id);
    if (!user) throw new Error('Usuário não encontrado');
    
    // Prevent non-admin user from elevating to admin
    if (updates.role === 'admin' && user.email.toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      delete updates.role;
    }

    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  updateUserPassword(id: string, newPass: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    user.passwordHash = hashPassword(newPass);
    user.updatedAt = new Date().toISOString();
    this.save();
  }

  getAllUsers(): User[] {
    // Return sanitized users (without passwordHash)
    return this.data.users.map(({ passwordHash, ...u }) => u);
  }

  // --- PLANS ---
  getPlans() {
    return this.data.plans;
  }

  updatePlan(planId: string, updates: Partial<Plan>) {
    const plan = this.data.plans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plano não encontrado');
    Object.assign(plan, updates);
    this.save();
    return plan;
  }

  // --- PAYMENTS & PROOFS ---
  createPayment(userId: string, planId: string, proofData?: { file_url: string; file_type: string; file_name: string; file_size: number }) {
    const user = this.findUserById(userId);
    const plan = this.data.plans.find((p) => p.id === planId);
    if (!user || !plan) throw new Error('Dados inválidos para pagamento');

    const paymentId = 'pay_' + crypto.randomUUID().slice(0, 10);
    const payment: Payment = {
      id: paymentId,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      status: 'pending',
      payment_method: 'pix',
      created_at: new Date().toISOString(),
      proof: proofData
        ? {
            id: 'proof_' + crypto.randomUUID().slice(0, 8),
            payment_id: paymentId,
            file_url: proofData.file_url,
            file_type: proofData.file_type,
            file_name: proofData.file_name,
            file_size: proofData.file_size,
            uploaded_at: new Date().toISOString(),
          }
        : undefined,
    };

    this.data.payments.unshift(payment);

    // Create notification for admin
    const adminUser = this.findUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (adminUser) {
      this.createNotification(
        adminUser.id,
        'Novo Pagamento Pendente',
        `${user.name} enviou um comprovante de R$ ${plan.price.toFixed(2)} para o ${plan.name}.`,
        'system'
      );
    }

    this.logActivity(user.id, user.email, 'PAYMENT_SUBMITTED', `Comprovante Pix enviado para plano ${plan.name}`);
    this.save();
    return payment;
  }

  approvePayment(paymentId: string, adminUserId: string) {
    const payment = this.data.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');
    if (payment.status === 'approved') return payment; // Idempotent

    payment.status = 'approved';
    payment.approved_at = new Date().toISOString();
    payment.approved_by = adminUserId;

    // Activate user plan
    const user = this.findUserById(payment.user_id);
    if (user) {
      user.status = 'active';
      user.planId = payment.plan_id;
      user.planName = payment.plan_name;
      user.installmentsPaid = (user.installmentsPaid || 0) + 1;
      user.updatedAt = new Date().toISOString();

      // Notify user
      this.createNotification(
        user.id,
        'Pagamento Aprovado! 🎉',
        'Seu acesso à plataforma Vende AI foi liberado com sucesso. Aproveite todas as ferramentas!',
        'payment_approved'
      );
    }

    this.logActivity(adminUserId, DEFAULT_ADMIN_EMAIL, 'PAYMENT_APPROVED', `Aprovado pagamento ${paymentId} do usuário ${payment.user_email}`);
    this.save();
    return payment;
  }

  rejectPayment(paymentId: string, adminUserId: string, reason: string) {
    const payment = this.data.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');

    payment.status = 'rejected';
    payment.rejected_at = new Date().toISOString();
    payment.rejected_by = adminUserId;
    payment.rejection_reason = reason || 'Comprovante não localizado ou dados divergentes';

    // Notify user
    this.createNotification(
      payment.user_id,
      'Pagamento Não Aprovado',
      `Seu comprovante foi analisado mas não pôde ser aprovado. Motivo: ${payment.rejection_reason}`,
      'payment_rejected'
    );

    this.logActivity(adminUserId, DEFAULT_ADMIN_EMAIL, 'PAYMENT_REJECTED', `Recusado pagamento ${paymentId}: ${reason}`);
    this.save();
    return payment;
  }

  getPayments() {
    return this.data.payments;
  }

  getUserPayments(userId: string) {
    return this.data.payments.filter((p) => p.user_id === userId);
  }

  // --- WEBSITES ---
  saveWebsite(userId: string, siteData: Omit<Website, 'id' | 'created_at' | 'updated_at'>) {
    const id = 'site_' + crypto.randomUUID().slice(0, 10);
    const newSite: Website = {
      ...siteData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [
        {
          version: 1,
          created_at: new Date().toISOString(),
          prompt: siteData.prompt,
          html_content: siteData.html_content || '',
          notes: 'Versão inicial criada',
        },
      ],
    };
    this.data.websites.unshift(newSite);
    this.createNotification(userId, 'Site Criado', `O site "${newSite.name}" foi salvo nos seus projetos.`, 'site_created');
    this.save();
    return newSite;
  }

  updateWebsite(id: string, userId: string, updates: Partial<Website>) {
    const site = this.data.websites.find((s) => s.id === id && s.user_id === userId);
    if (!site) throw new Error('Site não encontrado');

    if (updates.html_content && updates.html_content !== site.html_content) {
      const nextVersion = (site.versions?.length || 1) + 1;
      site.versions = site.versions || [];
      site.versions.push({
        version: nextVersion,
        created_at: new Date().toISOString(),
        prompt: updates.prompt || site.prompt,
        html_content: updates.html_content,
        notes: `Versão ${nextVersion}`,
      });
    }

    Object.assign(site, updates, { updated_at: new Date().toISOString() });
    this.save();
    return site;
  }

  duplicateWebsite(id: string, userId: string) {
    const site = this.data.websites.find((s) => s.id === id && s.user_id === userId);
    if (!site) throw new Error('Site não encontrado');

    const duplicate: Website = {
      ...JSON.parse(JSON.stringify(site)),
      id: 'site_' + crypto.randomUUID().slice(0, 10),
      name: `${site.name} (Cópia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.websites.unshift(duplicate);
    this.save();
    return duplicate;
  }

  deleteWebsite(id: string, userId: string) {
    const index = this.data.websites.findIndex((s) => s.id === id && s.user_id === userId);
    if (index === -1) throw new Error('Site não encontrado');
    this.data.websites.splice(index, 1);
    this.save();
    return true;
  }

  getUserWebsites(userId: string) {
    return this.data.websites.filter((s) => s.user_id === userId);
  }

  // --- LEADS ---
  saveLead(userId: string, leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    // Check duplication idempotence:
    // Check place_id or company_name + phone + address
    const existing = this.data.leads.find((l) => {
      if (l.user_id !== userId) return false;
      if (leadData.external_place_id && l.external_place_id === leadData.external_place_id) return true;
      const sameName = l.company_name.toLowerCase().trim() === leadData.company_name.toLowerCase().trim();
      const sameCity = (l.city || '').toLowerCase().trim() === (leadData.city || '').toLowerCase().trim();
      return sameName && sameCity;
    });

    if (existing) {
      return { lead: existing, alreadyExisted: true };
    }

    const lead: Lead = {
      ...leadData,
      id: 'lead_' + crypto.randomUUID().slice(0, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [],
      history: [
        {
          id: 'hist_' + crypto.randomUUID().slice(0, 8),
          from_status: 'novo',
          to_status: leadData.status || 'novo',
          changed_at: new Date().toISOString(),
          reason: 'Lead salvo na prospecção',
        },
      ],
    };

    this.data.leads.unshift(lead);
    this.createNotification(userId, 'Lead Salvo', `Empresa "${lead.company_name}" adicionada aos seus leads.`, 'lead_saved');
    this.save();
    return { lead, alreadyExisted: false };
  }

  getUserLeads(userId: string) {
    return this.data.leads.filter((l) => l.user_id === userId);
  }

  updateLeadStatus(id: string, userId: string, newStatus: Lead['status'], reason?: string) {
    const lead = this.data.leads.find((l) => l.id === id && l.user_id === userId);
    if (!lead) throw new Error('Lead não encontrado');

    const oldStatus = lead.status;
    lead.status = newStatus;
    lead.updated_at = new Date().toISOString();
    lead.history = lead.history || [];
    lead.history.push({
      id: 'hist_' + crypto.randomUUID().slice(0, 8),
      from_status: oldStatus,
      to_status: newStatus,
      changed_at: new Date().toISOString(),
      reason,
    });

    this.save();
    return lead;
  }

  addLeadNote(id: string, userId: string, noteText: string) {
    const lead = this.data.leads.find((l) => l.id === id && l.user_id === userId);
    if (!lead) throw new Error('Lead não encontrado');
    lead.notes = lead.notes || [];
    const note = {
      id: 'note_' + crypto.randomUUID().slice(0, 8),
      lead_id: id,
      author_id: userId,
      note: noteText,
      created_at: new Date().toISOString(),
    };
    lead.notes.push(note);
    this.save();
    return note;
  }

  deleteLead(id: string, userId: string) {
    const index = this.data.leads.findIndex((l) => l.id === id && l.user_id === userId);
    if (index === -1) throw new Error('Lead não encontrado');
    this.data.leads.splice(index, 1);
    this.save();
    return true;
  }

  // --- PROPOSALS ---
  saveProposal(userId: string, proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) {
    const proposal: Proposal = {
      ...proposalData,
      id: 'prop_' + crypto.randomUUID().slice(0, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.proposals.unshift(proposal);
    this.createNotification(userId, 'Proposta Salva', `Proposta para ${proposal.lead_name} registrada.`, 'proposal_created');
    this.save();
    return proposal;
  }

  getUserProposals(userId: string) {
    return this.data.proposals.filter((p) => p.user_id === userId);
  }

  // --- SALES ---
  registerSale(userId: string, saleData: Omit<Sale, 'id' | 'created_at' | 'user_id'>) {
    const sale: Sale = {
      ...saleData,
      user_id: userId,
      id: 'sale_' + crypto.randomUUID().slice(0, 10),
      created_at: new Date().toISOString(),
    };
    this.data.sales.unshift(sale);

    // If sale is associated with a lead, update lead status to 'vendido'
    if (sale.lead_id) {
      try {
        this.updateLeadStatus(sale.lead_id, userId, 'vendido', 'Venda realizada com sucesso');
      } catch {}
    }

    this.createNotification(userId, 'Venda Registrada! 💰', `Venda de R$ ${sale.amount.toFixed(2)} para ${sale.client_name} registrada.`, 'sale_registered');
    this.save();
    return sale;
  }

  getUserSales(userId: string) {
    return this.data.sales.filter((s) => s.user_id === userId);
  }

  // --- NOTIFICATIONS ---
  createNotification(userId: string, title: string, message: string, type: AppNotification['type']) {
    const notif: AppNotification = {
      id: 'notif_' + crypto.randomUUID().slice(0, 10),
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  getUserNotifications(userId: string) {
    return this.data.notifications.filter((n) => n.user_id === userId);
  }

  markNotificationRead(id: string, userId: string) {
    const notif = this.data.notifications.find((n) => n.id === id && n.user_id === userId);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }

  markAllNotificationsRead(userId: string) {
    for (const n of this.data.notifications) {
      if (n.user_id === userId) n.read = true;
    }
    this.save();
  }

  // --- ADMIN SETTINGS & AUDIT ---
  getAdminSettings(): AdminSettings {
    return {
      ...this.data.admin_settings,
      gemini: {
        ...this.data.admin_settings.gemini,
        has_api_key: Boolean(process.env.GEMINI_API_KEY),
      },
      maps: {
        ...this.data.admin_settings.maps,
        has_api_key: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      },
    };
  }

  updateAdminSettings(updates: Partial<AdminSettings>) {
    this.data.admin_settings = {
      ...this.data.admin_settings,
      ...updates,
      pix: {
        ...this.data.admin_settings.pix,
        ...(updates.pix || {}),
      },
      gemini: {
        ...this.data.admin_settings.gemini,
        ...(updates.gemini || {}),
      },
      maps: {
        ...this.data.admin_settings.maps,
        ...(updates.maps || {}),
      },
      features: {
        ...this.data.admin_settings.features,
        ...(updates.features || {}),
      },
    };
    this.save();
    return this.getAdminSettings();
  }

  logActivity(userId: string, email: string, action: string, details: string) {
    this.data.activity_logs.unshift({
      id: 'log_' + crypto.randomUUID().slice(0, 10),
      user_id: userId,
      user_email: email,
      action,
      details,
      created_at: new Date().toISOString(),
    });
    if (this.data.activity_logs.length > 500) {
      this.data.activity_logs.pop();
    }
    this.save();
  }

  getActivityLogs() {
    return this.data.activity_logs.slice(0, 100);
  }

  logAiGeneration(userId: string, type: 'website' | 'proposal' | 'test', model: string, status: 'success' | 'failed', error?: string, tokens?: number) {
    this.data.ai_generations.unshift({
      id: 'aigen_' + crypto.randomUUID().slice(0, 10),
      user_id: userId,
      type,
      model,
      status,
      tokens,
      error,
      created_at: new Date().toISOString(),
    });
    this.save();
  }

  getAiLogs() {
    return this.data.ai_generations.slice(0, 100);
  }

  getAdminStats() {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter((u) => u.status === 'active').length;
    const pendingPayments = this.data.payments.filter((p) => p.status === 'pending');
    const totalRevenue = this.data.payments
      .filter((p) => p.status === 'approved')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalSalesRevenue = this.data.sales.reduce((acc, s) => acc + s.amount, 0);
    const totalWebsites = this.data.websites.length;
    const totalLeads = this.data.leads.length;
    const totalProposals = this.data.proposals.length;
    const totalSales = this.data.sales.length;

    return {
      totalUsers,
      activeUsers,
      pendingPaymentsCount: pendingPayments.length,
      platformRevenue: totalRevenue,
      userSalesRevenue: totalSalesRevenue,
      totalWebsites,
      totalLeads,
      totalProposals,
      totalSales,
    };
  }
}

export const db = new Database();
