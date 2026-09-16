import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import { Badge } from '../components/ui/Badge.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import {
  ShieldCheck,
  CreditCard,
  Users,
  Settings,
  Activity,
  Check,
  X,
  Eye,
  Sparkles,
  MapPin,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Lock,
  Save,
} from 'lucide-react';

interface AdminPanelViewProps {
  onNavigate?: (view: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onNavigate }) => {
  const { user, isAdmin, addToast } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'users' | 'settings' | 'tests' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);

  // Admin Data
  const [overview, setOverview] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [logs, setLogs] = useState<{ activityLogs: any[]; aiLogs: any[] }>({ activityLogs: [], aiLogs: [] });

  // Proof preview modal
  const [previewProof, setPreviewProof] = useState<any>(null);
  const [rejectProofId, setRejectProofId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settings form state
  const [pixKey, setPixKey] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Test states
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<any>(null);
  const [testingMaps, setTestingMaps] = useState(false);
  const [mapsTestResult, setMapsTestResult] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, payRes, usrRes, setRes, logRes] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminPayments().catch(() => ({ payments: [] })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminSettings().catch(() => ({ settings: null })),
        api.getAdminLogs().catch(() => ({ activityLogs: [], aiLogs: [] })),
      ]);

      setOverview(ovRes);
      setPayments(payRes.payments || []);
      setUsersList(usrRes.users || []);
      setLogs(logRes);

      if (setRes.settings) {
        setAdminSettings(setRes.settings);
        setPixKey(setRes.settings.pix_key || '');
        setReceiverName(setRes.settings.receiver_name || '');
        setSupportPhone(setRes.settings.support_whatsapp || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await api.approvePayment(paymentId);
      addToast('Pagamento aprovado e usuário ativado com sucesso!', 'success');
      loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Erro ao aprovar.', 'error');
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectProofId) return;
    try {
      await api.rejectPayment(rejectProofId, rejectReason || 'Comprovante não reconhecido');
      addToast('Pagamento rejeitado.', 'info');
      setRejectProofId(null);
      setRejectReason('');
      loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Erro ao rejeitar.', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.updateAdminSettings({
        pix_key: pixKey,
        receiver_name: receiverName,
        support_whatsapp: supportPhone,
      });
      setAdminSettings(res.settings);
      addToast('Configurações salvas!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao salvar.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateAdminUser(userId, { status: newStatus });
      addToast(`Status do usuário alterado para ${newStatus}.`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Erro ao atualizar usuário.', 'error');
    }
  };

  const handleRunGeminiTest = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await api.testGemini();
      setGeminiTestResult(res);
      addToast('Teste do Gemini concluído com sucesso!', 'success');
    } catch (err: any) {
      setGeminiTestResult({ success: false, message: err.message });
      addToast('Falha no teste do Gemini.', 'error');
    } finally {
      setTestingGemini(false);
    }
  };

  const handleRunMapsTest = async () => {
    setTestingMaps(true);
    setMapsTestResult(null);
    try {
      const res = await api.testMaps();
      setMapsTestResult(res);
      addToast('Teste do Google Maps concluído com sucesso!', 'success');
    } catch (err: any) {
      setMapsTestResult({ success: false, message: err.message });
      addToast('Falha no teste do Maps.', 'error');
    } finally {
      setTestingMaps(false);
    }
  };

  // Strict check: ONLY luancamp953@gmail.com with role admin
  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Acesso Restrito ao Administrador Master</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Esta área é restrita e monitorada. Somente a conta <strong className="text-purple-300">luancamp953@gmail.com</strong> possui autorização de gerenciamento master do sistema.
        </p>
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#0B0B0E] to-purple-900/30 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_35px_rgba(124,58,237,0.2)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-black uppercase tracking-wider text-purple-300">
              Painel Master de Controle Total
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Administrador: {user?.email}</h2>
          <p className="text-xs text-gray-400">
            Acesso irrestrito ao banco de dados, aprovação de pagamentos Pix, usuários e APIs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Ir para o Dashboard de Vendas</span>
            </button>
          )}
          <button
            onClick={loadAllAdminData}
            className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* Quick shortcuts to work tools */}
      {onNavigate && (
        <div className="p-4 rounded-2xl bg-[#0B0B0E] border border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Ferramentas de Trabalho e Vendas:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('prospecting')}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-gray-200 font-semibold transition flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Encontrar Empresas</span>
            </button>
            <button
              onClick={() => onNavigate('create-site')}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-gray-200 font-semibold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Criar Site com IA</span>
            </button>
            <button
              onClick={() => onNavigate('leads')}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-gray-200 font-semibold transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Meus Leads (CRM)</span>
            </button>
            <button
              onClick={() => onNavigate('proposals')}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-gray-200 font-semibold transition flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Propostas com IA</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'payments' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>Pagamentos Pix</span>
          {pendingPayments.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black animate-pulse">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Usuários ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Chave Pix & Sistema
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'tests' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Diagnóstico de APIs
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Logs do Sistema
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total de Usuários</span>
              <p className="text-2xl font-black text-white mt-1">{overview.users?.total ?? overview.stats?.totalUsers ?? 0}</p>
              <span className="text-[10px] text-emerald-400 font-semibold">{overview.users?.active ?? overview.stats?.activeUsers ?? 0} ativos</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase">Pagamentos Pendentes</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{overview.payments?.pending ?? overview.stats?.pendingPaymentsCount ?? 0}</p>
              <span className="text-[10px] text-gray-400">Aguardando aprovação</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase">Sites Gerados</span>
              <p className="text-2xl font-black text-purple-300 mt-1">{overview.system?.sitesCreated ?? overview.stats?.totalWebsites ?? 0}</p>
              <span className="text-[10px] text-gray-400">Via IA Gemini</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase">Leads no CRM</span>
              <p className="text-2xl font-black text-blue-400 mt-1">{overview.system?.leadsTotal ?? overview.stats?.totalLeads ?? 0}</p>
              <span className="text-[10px] text-gray-400">Prospecção Maps</span>
            </div>
          </div>

          {/* Pending payments alert */}
          {pendingPayments.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Existem {pendingPayments.length} comprovante(s) Pix aguardando sua aprovação!
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    Clique na aba &quot;Pagamentos Pix&quot; para analisar e aprovar os comprovantes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('payments')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition"
              >
                Revisar Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENTS MANAGEMENT */}
      {activeTab === 'payments' && (
        <div className="rounded-2xl bg-[#0B0B0B] border border-gray-800 overflow-hidden space-y-4">
          <div className="p-5 border-b border-gray-800 bg-[#0E0E12] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Comprovantes Pix Recebidos</h3>
              <p className="text-xs text-gray-400">Analise os arquivos enviados e libere o acesso dos assinantes.</p>
            </div>
            <span className="text-xs text-gray-400 font-bold">{payments.length} transações</span>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              Nenhum comprovante enviado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-zinc-950 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Plano / Valor</th>
                    <th className="py-3 px-4">Comprovante</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}{' '}
                        {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{p.user_name}</div>
                        <span className="text-[10px] text-gray-500">{p.user_email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-purple-300">{p.plan_name}</span>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          R$ {p.amount ? p.amount.toFixed(2).replace('.', ',') : '0,00'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setPreviewProof(p)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 text-xs font-semibold flex items-center gap-1 border border-zinc-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Arquivo</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'approved' ? (
                          <Badge variant="green">APROVADO</Badge>
                        ) : p.status === 'rejected' ? (
                          <Badge variant="red">REJEITADO</Badge>
                        ) : (
                          <Badge variant="amber">PENDENTE</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprovePayment(p.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Aprovar</span>
                            </button>
                            <button
                              onClick={() => setRejectProofId(p.id)}
                              className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 font-semibold text-xs border border-red-500/40 transition flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Rejeitar</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500">Concluído</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-[#0B0B0B] border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 bg-[#0E0E12] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Usuários Cadastrados</h3>
            <span className="text-xs text-gray-400 font-bold">{usersList.length} usuários</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-zinc-950 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Função</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {usersList.map((u) => {
                  const isMaster = u.email === 'luancamp953@gmail.com';
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                      <td className="py-3 px-4 text-purple-300 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        {isMaster ? (
                          <Badge variant="purple">MASTER ADMIN</Badge>
                        ) : (
                          <span className="text-gray-400 capitalize">{u.role}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{u.planName || 'Padrão'}</td>
                      <td className="py-3 px-4">
                        {u.status === 'active' ? (
                          <Badge variant="green">ATIVO</Badge>
                        ) : u.status === 'suspended' ? (
                          <Badge variant="red">SUSPENSO</Badge>
                        ) : (
                          <Badge variant="amber">PENDENTE</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isMaster ? (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                              u.status === 'active'
                                ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/40'
                                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspender' : 'Ativar'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-600">Protegido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS (CHAVE PIX) */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Configuração da Chave Pix & Plataforma</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Defina os dados da chave Pix que serão apresentados aos compradores no checkout.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Chave Pix Oficial (CPF, E-mail, Celular ou Aleatória)
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="22116932700"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-purple-300 outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Valor padrão cadastrado: 22116932700
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Nome do Beneficiário no Pix
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Luan Sales"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                WhatsApp de Suporte do Administrador
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="(11) 98888-0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: DIAGNÓSTICO DE APIS */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gemini Test Card */}
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Google AI Studio (Gemini SDK)</h4>
                  <p className="text-xs text-gray-400">@google/genai • gemini-2.5-flash</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Testa a comunicação com os servidores do Google AI Studio para geração de sites completos e textos comerciais.
              </p>

              <button
                onClick={handleRunGeminiTest}
                disabled={testingGemini}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingGemini ? 'animate-spin' : ''}`} />
                <span>{testingGemini ? 'Testando Gemini...' : 'Executar Teste Gemini'}</span>
              </button>

              {geminiTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    geminiTestResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {geminiTestResult.success ? '✓ Conexão Estabelecida' : '✕ Erro no Teste'}
                  </p>
                  <p>{geminiTestResult.message}</p>
                </div>
              )}
            </div>

            {/* Maps Test Card */}
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Google Maps & Places API</h4>
                  <p className="text-xs text-gray-400">Prospecção de empresas brasileiras</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Testa a geolocalização e busca de estabelecimentos comerciais sem website no Brasil.
              </p>

              <button
                onClick={handleRunMapsTest}
                disabled={testingMaps}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingMaps ? 'animate-spin' : ''}`} />
                <span>{testingMaps ? 'Consultando Maps...' : 'Executar Teste Google Maps'}</span>
              </button>

              {mapsTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    mapsTestResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {mapsTestResult.success ? '✓ Conexão Ativa' : '✕ Erro'}
                  </p>
                  <p>{mapsTestResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Atividades Recentes do Sistema
            </h4>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60 font-mono text-[11px]">
              {logs.activityLogs.length === 0 ? (
                <p className="text-gray-500 py-4">Sem logs registrados.</p>
              ) : (
                logs.activityLogs.map((l) => (
                  <div key={l.id} className="py-2.5 flex items-center justify-between text-gray-400">
                    <span className="text-purple-300 font-semibold">{l.action}</span>
                    <span className="text-gray-300 truncate max-w-sm">{l.details}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(l.created_at).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Receipt File */}
      {previewProof && (
        <Modal
          isOpen={Boolean(previewProof)}
          onClose={() => setPreviewProof(null)}
          title={`Comprovante Pix: ${previewProof.user_name}`}
          subtitle={`Plano: ${previewProof.plan_name} • Valor: R$ ${previewProof.amount?.toFixed(2)}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-black max-h-[500px] flex items-center justify-center p-2">
              {previewProof.file_url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewProof.file_url}
                  className="w-full h-[450px] border-0"
                  title="PDF Comprovante"
                />
              ) : (
                <img
                  src={previewProof.file_url}
                  alt="Comprovante"
                  className="max-h-[450px] max-w-full object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-400">
                Enviado em: {new Date(previewProof.created_at).toLocaleString('pt-BR')}
              </span>

              {previewProof.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPreviewProof(null);
                      setRejectProofId(previewProof.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-950/60 text-red-300 text-xs font-semibold"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => {
                      handleApprovePayment(previewProof.id);
                      setPreviewProof(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
                  >
                    Aprovar e Liberar Acesso
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reject Reason */}
      <Modal
        isOpen={Boolean(rejectProofId)}
        onClose={() => setRejectProofId(null)}
        title="Rejeitar Comprovante"
        subtitle="Informe o motivo para que o usuário possa corrigir o envio"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            placeholder="Ex: Valor incorreto, comprovante ilegível, não identificamos o Pix em conta..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-red-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectProofId(null)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-gray-400 text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleRejectPayment}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            >
              Confirmar Rejeição
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
