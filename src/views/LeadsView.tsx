import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import type { Lead, LeadStatus } from '../types/index.ts';
import { Badge } from '../components/ui/Badge.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import {
  Users,
  MessageSquare,
  FileText,
  Wand2,
  Trash2,
  Plus,
  Phone,
  MapPin,
  Calendar,
  Columns,
  List,
  DollarSign,
} from 'lucide-react';

interface LeadsViewProps {
  onCreateSiteForLead: (lead: Lead) => void;
  onGenerateProposalForLead: (lead: Lead) => void;
  onRegisterSaleForLead: (lead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  onCreateSiteForLead,
  onGenerateProposalForLead,
  onRegisterSaleForLead,
}) => {
  const { addToast } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Lead Note modal
  const [activeLeadForNote, setActiveLeadForNote] = useState<Lead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Loss Reason modal
  const [leadForLossReason, setLeadForLossReason] = useState<Lead | null>(null);
  const [lossReason, setLossReason] = useState('');

  // Manual lead modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualNiche, setManualNiche] = useState('Comércio Local');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads();
      setLeads(res.leads || []);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'lost') {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        setLeadForLossReason(lead);
        return;
      }
    }

    try {
      await api.updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      addToast('Status do lead atualizado!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao alterar status.', 'error');
    }
  };

  const confirmLossReason = async () => {
    if (!leadForLossReason) return;
    try {
      await api.updateLeadStatus(leadForLossReason.id, 'lost', lossReason);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadForLossReason.id
            ? { ...l, status: 'lost', loss_reason: lossReason }
            : l
        )
      );
      addToast('Lead marcado como perdido.', 'info');
      setLeadForLossReason(null);
      setLossReason('');
    } catch (err: any) {
      addToast(err.message || 'Erro.', 'error');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeadForNote || !newNoteText.trim()) return;

    try {
      const res = await api.addLeadNote(activeLeadForNote.id, newNoteText.trim());
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === activeLeadForNote.id) {
            return {
              ...l,
              notes: [...(l.notes || []), res.note],
            };
          }
          return l;
        })
      );
      setNewNoteText('');
      setActiveLeadForNote(null);
      addToast('Anotação salva com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao adicionar nota.', 'error');
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Deseja remover "${name}" do seu CRM?`)) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      addToast('Lead excluído do CRM.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Erro ao excluir.', 'error');
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    try {
      const res = await api.saveLead({
        name: manualName,
        niche: manualNiche,
        phone: manualPhone,
        city: manualCity,
        status: 'prospect',
        has_website: false,
      });

      setLeads([res.lead, ...leads]);
      setShowManualModal(false);
      setManualName('');
      setManualPhone('');
      setManualCity('');
      addToast('Novo lead adicionado!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao criar lead.', 'error');
    }
  };

  const handleOpenWhatsApp = (phoneStr: string, name: string) => {
    const cleanPhone = phoneStr.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá! Sou especialista em presença digital e notei que a ${name} tem grande potencial para atrair mais clientes na internet. Gostaria de apresentar uma proposta especial de website.`
    );
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  const columns: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'prospect', label: '1. Prospect', color: 'border-blue-500/40 text-blue-300' },
    { id: 'contacted', label: '2. Contato Feito', color: 'border-purple-500/40 text-purple-300' },
    { id: 'proposal_sent', label: '3. Proposta Enviada', color: 'border-amber-500/40 text-amber-300' },
    { id: 'won', label: '4. Fechado (Venda)', color: 'border-emerald-500/40 text-emerald-300' },
    { id: 'lost', label: '5. Perdido', color: 'border-red-500/40 text-red-300' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Pipeline Comercial
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Meus Leads (CRM)</h2>
          <p className="text-xs text-gray-400">
            Acompanhe o funil de vendas dos potenciais clientes encontrados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.3)] transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {leads.length === 0 && !loading && (
        <div className="py-20 text-center bg-[#0B0B0B] border border-gray-800 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-gray-500 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Nenhum lead cadastrado ainda</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Utilize a ferramenta &quot;Encontrar Empresas&quot; para buscar empresas locais sem site ou adicione manualmente.
            </p>
          </div>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
          >
            Cadastrar Primeiro Lead
          </button>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {columns.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.id);

            return (
              <div
                key={col.id}
                className="rounded-2xl bg-[#0B0B0B] border border-gray-800/90 flex flex-col max-h-[800px] overflow-hidden"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-gray-800 bg-[#0E0E12] flex items-center justify-between`}>
                  <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-gray-400 text-[10px] font-bold flex items-center justify-center border border-zinc-800">
                    {colLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {colLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-gray-600 border border-dashed border-zinc-900 rounded-xl">
                      Nenhum lead
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-[#111116] border border-gray-800 hover:border-purple-500/40 transition space-y-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-semibold text-purple-400 uppercase">
                              {lead.niche}
                            </span>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="text-gray-600 hover:text-red-400 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">{lead.name}</h4>
                          {lead.city && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-gray-500 shrink-0" />
                              <span className="truncate">{lead.city}</span>
                            </p>
                          )}
                        </div>

                        {/* Status Mover Dropdown */}
                        <div>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="w-full text-[10px] py-1 px-2 rounded-lg bg-black border border-gray-800 text-gray-300 outline-none"
                          >
                            <option value="prospect">1. Prospect</option>
                            <option value="contacted">2. Contato Feito</option>
                            <option value="proposal_sent">3. Proposta Enviada</option>
                            <option value="won">4. Fechado (Venda)</option>
                            <option value="lost">5. Perdido</option>
                          </select>
                        </div>

                        {/* Quick action icons */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-800/60">
                          {lead.phone ? (
                            <button
                              onClick={() => handleOpenWhatsApp(lead.phone, lead.name)}
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 text-[10px] flex items-center gap-1 transition"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-600">Sem tel</span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onGenerateProposalForLead(lead)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 transition"
                              title="Gerar Proposta"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onCreateSiteForLead(lead)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-400 transition"
                              title="Criar Site"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                            </button>
                            {lead.status === 'won' && (
                              <button
                                onClick={() => onRegisterSaleForLead(lead)}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white transition"
                                title="Registrar Venda / Contrato"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && leads.length > 0 && (
        <div className="rounded-2xl bg-[#0B0B0B] border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0E0E12] text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Empresa</th>
                  <th className="py-3.5 px-4 font-semibold">Nicho</th>
                  <th className="py-3.5 px-4 font-semibold">Contato</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{lead.name}</div>
                      <span className="text-[10px] text-gray-500">{lead.city}</span>
                    </td>
                    <td className="py-3 px-4 text-purple-300">{lead.niche}</td>
                    <td className="py-3 px-4">
                      {lead.phone ? (
                        <button
                          onClick={() => handleOpenWhatsApp(lead.phone, lead.name)}
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {lead.phone}
                        </button>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="text-[11px] py-1 px-2 rounded-lg bg-zinc-900 border border-zinc-800 text-gray-200 outline-none"
                      >
                        <option value="prospect">Prospect</option>
                        <option value="contacted">Contato Feito</option>
                        <option value="proposal_sent">Proposta Enviada</option>
                        <option value="won">Fechado</option>
                        <option value="lost">Perdido</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onGenerateProposalForLead(lead)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 text-[11px] font-semibold border border-zinc-800"
                        >
                          Proposta
                        </button>
                        <button
                          onClick={() => onCreateSiteForLead(lead)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow-sm"
                        >
                          Criar Site
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="p-1 rounded text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Manual Lead */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Cadastrar Novo Lead"
        subtitle="Adicione uma empresa manualmente ao seu CRM"
      >
        <form onSubmit={handleCreateManualLead} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nome da Empresa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Pizzaria Forno Nobre"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nicho / Ramo</label>
            <input
              type="text"
              value={manualNiche}
              onChange={(e) => setManualNiche(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp / Telefone</label>
            <input
              type="text"
              placeholder="(11) 98765-4321"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Cidade, UF</label>
            <input
              type="text"
              placeholder="Ex: Curitiba, PR"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-gray-400 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Salvar Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reason for Loss */}
      <Modal
        isOpen={Boolean(leadForLossReason)}
        onClose={() => setLeadForLossReason(null)}
        title="Motivo da Perda"
        subtitle="Entenda as objeções para melhorar sua conversão"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Informe o motivo de &quot;{leadForLossReason?.name}&quot; não ter fechado:
          </p>
          <input
            type="text"
            placeholder="Ex: Achou caro, já contratou outra agência..."
            value={lossReason}
            onChange={(e) => setLossReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setLeadForLossReason(null)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-gray-400 text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={confirmLossReason}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            >
              Marcar como Perdido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
