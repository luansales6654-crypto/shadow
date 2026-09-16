import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import type { Lead, Proposal } from '../types/index.ts';
import {
  FileText,
  Sparkles,
  MessageSquare,
  Copy,
  Save,
  Check,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ProposalsViewProps {
  initialLead?: any;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({ initialLead }) => {
  const { addToast } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [businessName, setBusinessName] = useState(initialLead?.name || '');
  const [niche, setNiche] = useState(initialLead?.niche || 'Comércio Local');
  const [phone, setPhone] = useState(initialLead?.phone || '');
  const [city, setCity] = useState(initialLead?.city || '');

  const [generatedText, setGeneratedText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    if (initialLead) {
      setBusinessName(initialLead.name || '');
      setNiche(initialLead.niche || 'Comércio Local');
      setPhone(initialLead.phone || '');
      setCity(initialLead.city || '');
    }
  }, [initialLead]);

  const loadData = async () => {
    try {
      const [leadsRes, propsRes] = await Promise.all([
        api.getLeads().catch(() => ({ leads: [] })),
        api.getProposals().catch(() => ({ proposals: [] })),
      ]);
      setLeads(leadsRes.leads || []);
      setSavedProposals(propsRes.proposals || []);
    } catch {}
  };

  const handleSelectExistingLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      setBusinessName(found.name);
      setNiche(found.niche);
      setPhone(found.phone || '');
      setCity(found.city || '');
    }
  };

  const handleGenerateProposal = async () => {
    if (!businessName.trim()) {
      addToast('Informe o nome da empresa.', 'warning');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.generateProposalWithAI({
        name: businessName,
        niche,
        phone,
        city,
      });

      setGeneratedText(res.proposal);
      addToast(
        res.isAiGenerated
          ? 'Proposta gerada com Gemini IA!'
          : 'Proposta comercial estruturada!',
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Erro ao gerar proposta.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    addToast('Mensagem da proposta copiada!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const clean = phone.replace(/\D/g, '');
    const targetPhone = clean.startsWith('55') ? clean : `55${clean}`;
    const encoded = encodeURIComponent(generatedText);
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank');
    addToast('WhatsApp aberto com a proposta preenchida!', 'success');
  };

  const handleSaveProposal = async () => {
    if (!generatedText) return;
    try {
      const res = await api.saveProposal({
        lead_id: selectedLeadId || undefined,
        lead_name: businessName,
        content: generatedText,
        status: 'draft',
      });
      setSavedProposals([res.proposal, ...savedProposals]);
      addToast('Proposta salva no histórico!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao salvar.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
          Inteligência Comercial Gemini
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Gerador de Propostas com IA</h2>
        <p className="text-xs text-gray-400">
          Crie abordagens irresistíveis e personalizadas para enviar diretamente no WhatsApp dos clientes potenciais.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Dados da Empresa
          </h3>

          {leads.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Puxar do CRM de Leads
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectExistingLead(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-purple-300 outline-none focus:border-purple-500"
              >
                <option value="">Selecione um lead salvo...</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.niche})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nome da Empresa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Auto Mecânica Silva"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nicho de Atuação</label>
            <input
              type="text"
              placeholder="Ex: Mecânica automotiva"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp do Dono/Empresa</label>
            <input
              type="text"
              placeholder="(11) 99999-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Cidade</label>
            <input
              type="text"
              placeholder="Ex: Santos, SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleGenerateProposal}
            disabled={generating}
            id="btn-gerar-proposta"
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GERAR PROPOSTA COM IA</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Area: 7 cols */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Mensagem Comercial WhatsApp
              </h3>

              {generatedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 text-xs font-semibold transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleSaveProposal}
                    className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                </div>
              )}
            </div>

            <textarea
              rows={12}
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              placeholder="Clique em 'GERAR PROPOSTA COM IA' para que a inteligência artificial formule uma mensagem personalizada e persuasiva com gatilhos de autoridade e escassez..."
              className="w-full p-4 rounded-xl bg-black border border-gray-800 text-xs text-gray-200 leading-relaxed outline-none focus:border-purple-500 resize-none font-sans"
            />
          </div>

          {generatedText && (
            <button
              onClick={handleSendWhatsApp}
              disabled={!phone}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ENVIAR NO WHATSAPP AGORA</span>
            </button>
          )}
        </div>
      </div>

      {/* Proposals History */}
      {savedProposals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
            Histórico de Propostas Salvas ({savedProposals.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {savedProposals.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-2 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{p.lead_name}</h4>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">
                  {p.content}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setGeneratedText(p.content);
                      setBusinessName(p.lead_name);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-purple-400 hover:underline font-semibold"
                  >
                    Carregar no Editor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
