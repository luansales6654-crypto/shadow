import { Router, Request, Response, NextFunction } from 'express';
import { db, verifyToken, hashPassword, createToken } from './db.ts';
import { generateWebsiteWithAI, generateProposalWithAI, testGeminiConnection, buildWebsitePrompt } from './geminiService.ts';
import { searchPlaces, testMapsConnection } from './mapsService.ts';

export const apiRouter = Router();

const MASTER_ADMIN_EMAIL = 'luancamp953@gmail.com';

// Authentication middleware
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização ausente ou inválido.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sua sessão expirou. Faça login novamente.' });
  }

  const user = db.findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Conta suspensa pelo administrador.' });
  }

  req.user = payload;
  next();
}

// Strict Admin restriction middleware: Only luancamp953@gmail.com can pass
export function requireMasterAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.email.toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase() || req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acesso não autorizado. Apenas o administrador master especificado possui permissão total.',
      });
    }
    next();
  });
}

// Check active payment for regular users (Admin always has access)
export function requireActiveUser(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user) return;
    if (req.user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      return next(); // Admin always allowed
    }

    const user = db.findUserById(req.user.userId);
    if (!user || user.status !== 'active') {
      return res.status(403).json({
        error: 'Acesso restrito. Seu pagamento está aguardando aprovação pelo administrador.',
        status: user?.status || 'waiting_payment',
      });
    }
    next();
  });
}

// ==========================================
// 1. AUTH ROUTES
// ==========================================
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const user = db.findUserByEmail(cleanEmail);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
  }

  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Esta conta foi suspensa pela administração.' });
  }

  user.lastLoginAt = new Date().toISOString();
  db.logActivity(user.id, user.email, 'LOGIN', 'Login efetuado com sucesso');

  const token = createToken(user.id, user.email, user.role);
  const { passwordHash, ...safeUser } = user;

  res.json({
    token,
    user: safeUser,
  });
});

apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password, planId } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const user = db.createUser(name, email, password, planId);
    const token = createToken(user.id, user.email, user.role);
    const { passwordHash, ...safeUser } = user;

    res.status(201).json({
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao criar conta.' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  const user = db.findUserById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

apiRouter.post('/auth/update-password', requireAuth, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  const user = db.findUserById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  if (user.passwordHash !== hashPassword(currentPassword)) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  db.updateUserPassword(user.id, newPassword);
  db.logActivity(user.id, user.email, 'PASSWORD_CHANGE', 'Senha alterada com sucesso');
  res.json({ message: 'Senha atualizada com sucesso.' });
});

apiRouter.post('/auth/logout', requireAuth, (req: AuthRequest, res) => {
  db.logActivity(req.user!.userId, req.user!.email, 'LOGOUT', 'Usuário desconectado');
  res.json({ message: 'Desconectado com sucesso.' });
});

// ==========================================
// 2. PLANS & PUBLIC INFO
// ==========================================
apiRouter.get('/plans', (req, res) => {
  res.json({ plans: db.getPlans() });
});

apiRouter.get('/payments/pix-info', (req, res) => {
  const settings = db.getAdminSettings();
  res.json({
    pix: settings.pix,
    plans: db.getPlans().filter((p) => p.active),
  });
});

// ==========================================
// 3. USER PAYMENTS & PROOFS
// ==========================================
apiRouter.post('/payments/proof', requireAuth, (req: AuthRequest, res) => {
  const { planId, fileUrl, fileType, fileName, fileSize } = req.body;

  if (!planId) {
    return res.status(400).json({ error: 'Plano não selecionado.' });
  }

  if (!fileUrl) {
    return res.status(400).json({ error: 'O arquivo de comprovante é obrigatório.' });
  }

  try {
    const payment = db.createPayment(req.user!.userId, planId, {
      file_url: fileUrl,
      file_type: fileType || 'image/jpeg',
      file_name: fileName || 'comprovante_pix',
      file_size: fileSize || 0,
    });

    res.status(201).json({
      message: 'Comprovante enviado com sucesso! Aguarde a aprovação pelo administrador.',
      payment,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/payments/my-status', requireAuth, (req: AuthRequest, res) => {
  const user = db.findUserById(req.user!.userId);
  const payments = db.getUserPayments(req.user!.userId);
  const latestPayment = payments[0] || null;

  res.json({
    userStatus: user?.status,
    planName: user?.planName,
    planType: user?.planType,
    installmentsPaid: user?.installmentsPaid || 0,
    totalInstallments: user?.totalInstallments || 1,
    latestPayment,
    payments,
  });
});

// ==========================================
// 4. LEADS & GOOGLE MAPS PROSPECTING
// ==========================================
apiRouter.post('/leads/search', requireActiveUser, async (req: AuthRequest, res) => {
  const { niche, state, city, neighborhood } = req.body;

  if (!niche || !state || !city) {
    return res.status(400).json({ error: 'Nicho, Estado e Cidade são obrigatórios.' });
  }

  try {
    const searchResult = await searchPlaces({
      niche,
      state,
      city,
      neighborhood: neighborhood || 'Todos os Bairros',
    });

    res.json(searchResult);
  } catch (err: any) {
    console.error('Places Search Error:', err);
    res.status(500).json({ error: 'Erro ao buscar empresas. Tente novamente em instantes.' });
  }
});

apiRouter.post('/leads', requireActiveUser, (req: AuthRequest, res) => {
  const body = req.body;
  const company_name = body.company_name || body.name;
  const category = body.category || body.niche || 'Geral';

  if (!company_name) {
    return res.status(400).json({ error: 'Nome da empresa é obrigatório.' });
  }

  const validStatus = ['novo', 'em_contato', 'proposta_enviada', 'ganho', 'perdido'];
  const status = validStatus.includes(body.status) ? body.status : 'novo';

  const normalizedLead = {
    ...body,
    company_name,
    category,
    status,
    phone: body.phone || '',
    address: body.address || '',
    city: body.city || '',
    neighborhood: body.neighborhood || '',
    has_website: Boolean(body.has_website),
    website_url: body.website_url || body.website || null,
    rating: typeof body.rating === 'number' ? body.rating : 0,
    user_ratings_total: typeof body.user_ratings_total === 'number' ? body.user_ratings_total : 0,
    external_place_id: body.external_place_id || body.place_id || null,
  };

  const { lead, alreadyExisted } = db.saveLead(req.user!.userId, normalizedLead);
  res.status(alreadyExisted ? 200 : 201).json({
    lead,
    alreadyExisted,
    message: alreadyExisted ? 'Este lead já estava salvo na sua lista.' : 'Lead salvo com sucesso!',
  });
});

apiRouter.get('/leads', requireActiveUser, (req: AuthRequest, res) => {
  const leads = db.getUserLeads(req.user!.userId);
  res.json({ leads });
});

apiRouter.patch('/leads/:id/status', requireActiveUser, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  try {
    const lead = db.updateLeadStatus(id, req.user!.userId, status, reason);
    res.json({ lead });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.post('/leads/:id/notes', requireActiveUser, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'A nota não pode ser vazia.' });
  }

  try {
    const createdNote = db.addLeadNote(id, req.user!.userId, note);
    res.status(201).json({ note: createdNote });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.delete('/leads/:id', requireActiveUser, (req: AuthRequest, res) => {
  try {
    db.deleteLead(req.params.id, req.user!.userId);
    res.json({ message: 'Lead excluído com sucesso.' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ==========================================
// 5. PROPOSALS & AI
// ==========================================
apiRouter.post('/proposals/generate', requireActiveUser, async (req: AuthRequest, res) => {
  const body = req.body;
  const leadInput = body.lead || body;
  const company_name = leadInput.company_name || leadInput.name;
  const category = leadInput.category || leadInput.niche || 'Geral';

  if (!company_name) {
    return res.status(400).json({ error: 'Nome da empresa é obrigatório.' });
  }

  const normalizedLead = {
    ...leadInput,
    company_name,
    category,
    city: leadInput.city || '',
    phone: leadInput.phone || '',
    has_website: Boolean(leadInput.has_website),
  };

  try {
    const result = await generateProposalWithAI(req.user!.userId, normalizedLead);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar proposta com IA.' });
  }
});

apiRouter.post('/proposals', requireActiveUser, (req: AuthRequest, res) => {
  const proposalData = req.body;
  if (!proposalData.content || !proposalData.lead_name) {
    return res.status(400).json({ error: 'Conteúdo e nome do lead são obrigatórios.' });
  }

  const proposal = db.saveProposal(req.user!.userId, proposalData);
  res.status(201).json({ proposal });
});

apiRouter.get('/proposals', requireActiveUser, (req: AuthRequest, res) => {
  const proposals = db.getUserProposals(req.user!.userId);
  res.json({ proposals });
});

// ==========================================
// 6. SITES & AI WEBSITE CREATOR
// ==========================================
apiRouter.post('/sites/generate-prompt', requireActiveUser, (req: AuthRequest, res) => {
  const params = req.body;
  const prompt = buildWebsitePrompt(params);
  res.json({ prompt });
});

apiRouter.post('/sites/generate', requireActiveUser, async (req: AuthRequest, res) => {
  const params = req.body;
  if (!params.niche || !params.company_data?.name) {
    return res.status(400).json({ error: 'Nicho e nome da empresa são obrigatórios.' });
  }

  try {
    const result = await generateWebsiteWithAI(req.user!.userId, params);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar site com IA. Tente novamente.' });
  }
});

apiRouter.post('/sites', requireActiveUser, (req: AuthRequest, res) => {
  const siteData = req.body;
  if (!siteData.name || !siteData.niche_name) {
    return res.status(400).json({ error: 'Nome e nicho são obrigatórios.' });
  }

  const site = db.saveWebsite(req.user!.userId, siteData);
  res.status(201).json({ site });
});

apiRouter.get('/sites', requireActiveUser, (req: AuthRequest, res) => {
  const sites = db.getUserWebsites(req.user!.userId);
  res.json({ sites });
});

apiRouter.post('/sites/:id/duplicate', requireActiveUser, (req: AuthRequest, res) => {
  try {
    const duplicated = db.duplicateWebsite(req.params.id, req.user!.userId);
    res.status(201).json({ site: duplicated });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.patch('/sites/:id', requireActiveUser, (req: AuthRequest, res) => {
  try {
    const site = db.updateWebsite(req.params.id, req.user!.userId, req.body);
    res.json({ site });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.delete('/sites/:id', requireActiveUser, (req: AuthRequest, res) => {
  try {
    db.deleteWebsite(req.params.id, req.user!.userId);
    res.json({ message: 'Site excluído com sucesso.' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ==========================================
// 7. SALES & REVENUE
// ==========================================
apiRouter.post('/sales', requireActiveUser, (req: AuthRequest, res) => {
  const { client_name, service, amount, sale_date, notes, lead_id } = req.body;
  if (!client_name || !amount) {
    return res.status(400).json({ error: 'Nome do cliente e valor são obrigatórios.' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Valor da venda inválido.' });
  }

  const sale = db.registerSale(req.user!.userId, {
    client_name,
    service: service || 'Desenvolvimento de Website Comercial',
    amount: parsedAmount,
    sale_date: sale_date || new Date().toISOString().split('T')[0],
    notes,
    lead_id,
    status: 'completed',
  });

  res.status(201).json({ sale });
});

apiRouter.get('/sales', requireActiveUser, (req: AuthRequest, res) => {
  const sales = db.getUserSales(req.user!.userId);
  const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0);

  res.json({
    sales,
    totalRevenue,
    salesCount: sales.length,
  });
});

// ==========================================
// 8. NOTIFICATIONS
// ==========================================
apiRouter.get('/notifications', requireAuth, (req: AuthRequest, res) => {
  const notifications = db.getUserNotifications(req.user!.userId);
  res.json({ notifications });
});

apiRouter.patch('/notifications/read-all', requireAuth, (req: AuthRequest, res) => {
  db.markAllNotificationsRead(req.user!.userId);
  res.json({ message: 'Notificações lidas.' });
});

// ==========================================
// 9. ADMIN PORTAL (MASTER RESTRICTION: ONLY luancamp953@gmail.com)
// ==========================================
apiRouter.get('/admin/overview', requireMasterAdmin, (req: AuthRequest, res) => {
  const stats = db.getAdminStats();
  const settings = db.getAdminSettings();
  const recentPayments = db.getPayments().slice(0, 5);
  const recentLogs = db.getActivityLogs().slice(0, 8);

  res.json({
    stats,
    settings,
    recentPayments,
    recentLogs,
    users: {
      total: stats.totalUsers || 0,
      active: stats.activeUsers || 0,
    },
    payments: {
      pending: stats.pendingPaymentsCount || 0,
      revenue: stats.platformRevenue || 0,
    },
    system: {
      sitesCreated: stats.totalWebsites || 0,
      leadsTotal: stats.totalLeads || 0,
      proposalsTotal: stats.totalProposals || 0,
      salesTotal: stats.totalSales || 0,
    },
  });
});

apiRouter.get('/admin/payments', requireMasterAdmin, (req: AuthRequest, res) => {
  res.json({ payments: db.getPayments() });
});

apiRouter.post('/admin/payments/:id/approve', requireMasterAdmin, (req: AuthRequest, res) => {
  try {
    const payment = db.approvePayment(req.params.id, req.user!.userId);
    res.json({ message: 'Pagamento aprovado com sucesso! Acesso liberado.', payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/payments/:id/reject', requireMasterAdmin, (req: AuthRequest, res) => {
  const { reason } = req.body;
  try {
    const payment = db.rejectPayment(req.params.id, req.user!.userId, reason);
    res.json({ message: 'Pagamento recusado com registro do motivo.', payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/users', requireMasterAdmin, (req: AuthRequest, res) => {
  res.json({ users: db.getAllUsers() });
});

apiRouter.patch('/admin/users/:id', requireMasterAdmin, (req: AuthRequest, res) => {
  try {
    const user = db.updateUser(req.params.id, req.body);
    res.json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/settings', requireMasterAdmin, (req: AuthRequest, res) => {
  res.json({ settings: db.getAdminSettings() });
});

apiRouter.patch('/admin/settings', requireMasterAdmin, (req: AuthRequest, res) => {
  const updated = db.updateAdminSettings(req.body);
  db.logActivity(req.user!.userId, req.user!.email, 'SETTINGS_UPDATED', 'Configurações da plataforma atualizadas');
  res.json({ settings: updated });
});

apiRouter.get('/admin/plans', requireMasterAdmin, (req: AuthRequest, res) => {
  res.json({ plans: db.getPlans() });
});

apiRouter.patch('/admin/plans/:id', requireMasterAdmin, (req: AuthRequest, res) => {
  try {
    const plan = db.updatePlan(req.params.id, req.body);
    db.logActivity(req.user!.userId, req.user!.email, 'PLAN_UPDATED', `Plano ${plan.name} atualizado`);
    res.json({ plan });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/test-gemini', requireMasterAdmin, async (req: AuthRequest, res) => {
  const result = await testGeminiConnection();
  res.json(result);
});

apiRouter.post('/admin/test-maps', requireMasterAdmin, async (req: AuthRequest, res) => {
  const result = await testMapsConnection();
  res.json(result);
});

apiRouter.get('/admin/logs', requireMasterAdmin, (req: AuthRequest, res) => {
  res.json({
    activityLogs: db.getActivityLogs(),
    aiLogs: db.getAiLogs(),
  });
});
