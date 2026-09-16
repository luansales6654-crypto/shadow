import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import {
  POPULAR_NICHES,
  COLOR_PALETTES,
  STYLE_OPTIONS,
  OBJECTIVE_OPTIONS,
} from '../utils/brazilGeo.ts';
import {
  Wand2,
  Check,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  Code,
  Eye,
  Save,
  Loader2,
  Sparkles,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface CreateSiteViewProps {
  onSiteSaved: (siteId: string) => void;
  initialData?: any;
}

export const CreateSiteView: React.FC<CreateSiteViewProps> = ({ onSiteSaved, initialData }) => {
  const { addToast } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedNiche, setSelectedNiche] = useState<any>(() => {
    if (initialData?.niche || initialData?.category) {
      const match = POPULAR_NICHES.find((n) =>
        n.name.toLowerCase().includes((initialData.niche || initialData.category).toLowerCase())
      );
      if (match) return match;
    }
    return POPULAR_NICHES[0];
  });
  const [selectedPalette, setSelectedPalette] = useState<any>(COLOR_PALETTES[0]);
  const [customPrimary, setCustomPrimary] = useState('');
  const [customSecondary, setCustomSecondary] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('Moderno');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    'Receber mensagens no WhatsApp',
    'Receber agendamentos de horário',
  ]);

  const [companyName, setCompanyName] = useState(initialData?.company_name || initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || initialData?.phone || '');
  const [instagram, setInstagram] = useState(initialData?.instagram || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [hours, setHours] = useState('Segunda a Sábado das 08h às 19h');

  // Generation state
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'prompt'>('preview');
  const [saving, setSaving] = useState(false);

  const loadingMessages = [
    'Analisando nicho de atuação...',
    'Selecionando estrutura de alta conversão...',
    'Definindo identidade visual e contraste...',
    'Organizando seções e benefícios comerciais...',
    'Preparando experiência mobile...',
    'Criando botões de ação e WhatsApp direto...',
    'Otimizando SEO local...',
    'Finalizando código com inteligência artificial...',
  ];

  const handleObjectiveToggle = (label: string) => {
    if (selectedObjectives.includes(label)) {
      setSelectedObjectives(selectedObjectives.filter((o) => o !== label));
    } else {
      setSelectedObjectives([...selectedObjectives, label]);
    }
  };

  const getPrimaryColor = () => customPrimary || selectedPalette.primary;
  const getSecondaryColor = () => customSecondary || selectedPalette.secondary;

  const preparePromptPreview = async () => {
    const params = {
      niche: selectedNiche.name,
      colors: {
        name: selectedPalette.name,
        primary: getPrimaryColor(),
        secondary: getSecondaryColor(),
      },
      style: selectedStyle,
      objectives: selectedObjectives,
      company_data: {
        name: companyName || `Negócio de ${selectedNiche.name}`,
        phone,
        whatsapp: whatsapp || phone,
        instagram,
        city,
        address,
        hours,
      },
    };

    try {
      const res = await api.generatePrompt(params);
      setGeneratedPrompt(res.prompt);
    } catch {}
  };

  const handleGoToReview = async () => {
    if (!companyName.trim()) {
      addToast('Por favor, informe o nome da empresa.', 'warning');
      return;
    }
    await preparePromptPreview();
    setStep(6);
  };

  const handleGenerateSite = async () => {
    setIsGenerating(true);
    setLoadingStepIndex(0);
    setStep(7);

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1200);

    const params = {
      niche: selectedNiche.name,
      colors: {
        name: selectedPalette.name,
        primary: getPrimaryColor(),
        secondary: getSecondaryColor(),
      },
      style: selectedStyle,
      objectives: selectedObjectives,
      company_data: {
        name: companyName,
        phone,
        whatsapp: whatsapp || phone,
        instagram,
        city,
        address,
        hours,
      },
    };

    try {
      const result = await api.generateWebsite(params);
      setGeneratedHtml(result.html);
      setGeneratedPrompt(result.prompt);
      addToast(result.isAiGenerated ? 'Site criado com IA Gemini!' : 'Site estruturado com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Falha na geração com IA.', 'error');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      const saved = await api.saveSite({
        name: companyName || `Site ${selectedNiche.name}`,
        niche_id: selectedNiche.id,
        niche_name: selectedNiche.name,
        primary_color: getPrimaryColor(),
        secondary_color: getSecondaryColor(),
        style: selectedStyle,
        objectives: selectedObjectives,
        company_data: {
          name: companyName,
          phone,
          whatsapp,
          instagram,
          city,
          address,
          hours,
        },
        prompt: generatedPrompt,
        html_content: generatedHtml,
        status: 'ready',
      });

      addToast('Projeto salvo em Meus Sites!', 'success');
      onSiteSaved(saved.site.id);
    } catch (err: any) {
      addToast(err.message || 'Erro ao salvar projeto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    addToast('Prompt copiado para a área de transferência!', 'success');
  };

  const handleOpenGemini = () => {
    handleCopyPrompt();
    window.open('https://gemini.google.com/app', '_blank');
    addToast('Prompt copiado! Abra o Gemini e cole para continuar a interação se desejar.', 'info', 'Gemini Aberto');
  };

  const stepsList = [
    '1. Nicho',
    '2. Cores',
    '3. Estilo',
    '4. Objetivo',
    '5. Informações',
    '6. Revisão',
    '7. Resultado',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb Steps */}
      <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-gray-800 flex items-center justify-between overflow-x-auto gap-2">
        {stepsList.map((st, idx) => {
          const stepNum = idx + 1;
          const isCurrent = step === stepNum;
          const isDone = step > stepNum;

          return (
            <div
              key={st}
              className={`flex items-center gap-2 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                isCurrent
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : isDone
                  ? 'text-emerald-400'
                  : 'text-gray-500'
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{st}</span>}
            </div>
          );
        })}
      </div>

      {/* STEP 1: NICHO */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Etapa 1 de 6</span>
              <h2 className="text-2xl font-black text-white mt-1">Qual é o nicho da empresa?</h2>
              <p className="text-xs text-gray-400">Clique no ramo de atuação para aplicar regras de alta conversão.</p>
            </div>
            {selectedNiche && (
              <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
                ✓ {selectedNiche.name} selecionado
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {POPULAR_NICHES.map((niche) => {
              const isSelected = selectedNiche?.id === niche.id;
              return (
                <button
                  key={niche.id}
                  onClick={() => setSelectedNiche(niche)}
                  className={`p-4 rounded-2xl border text-left transition-all group ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                      : 'bg-[#0B0B0B] border-gray-800/80 hover:border-gray-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{niche.category}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {niche.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{niche.description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center gap-2"
            >
              <span>CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CORES */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Etapa 2 de 6</span>
              <h2 className="text-2xl font-black text-white mt-1">Escolha as cores do site</h2>
              <p className="text-xs text-gray-400">Selecione uma paleta recomendada ou personalize as cores da marca.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = selectedPalette?.id === pal.id && !customPrimary;
              return (
                <div
                  key={pal.id}
                  onClick={() => {
                    setSelectedPalette(pal);
                    setCustomPrimary('');
                    setCustomSecondary('');
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                      : 'bg-[#0B0B0B] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white">{pal.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg shadow" style={{ backgroundColor: pal.primary }} />
                    <div className="w-8 h-8 rounded-lg border border-gray-700" style={{ backgroundColor: pal.secondary }} />
                  </div>
                  <p className="text-xs text-gray-400">{pal.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Custom color override */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Personalizar cores exatas (Opcional)
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Cor Primária (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customPrimary || selectedPalette.primary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#7C3AED"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Cor Secundária (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customSecondary || selectedPalette.secondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#0B0B0B"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center gap-2"
            >
              <span>CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ESTILO */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Etapa 3 de 6</span>
            <h2 className="text-2xl font-black text-white mt-1">Qual o estilo visual desejado?</h2>
            <p className="text-xs text-gray-400">Direciona o tom do design e a experiência estética do site.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STYLE_OPTIONS.map((st) => {
              const isSelected = selectedStyle === st.label;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStyle(st.label)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                      : 'bg-[#0B0B0B] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{st.label}</h4>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center gap-2"
            >
              <span>CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: OBJETIVO */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Etapa 4 de 6</span>
            <h2 className="text-2xl font-black text-white mt-1">Qual o principal objetivo do site?</h2>
            <p className="text-xs text-gray-400">Você pode marcar mais de uma opção para direcionar as CTAs.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {OBJECTIVE_OPTIONS.map((obj) => {
              const isSelected = selectedObjectives.includes(obj.label);
              return (
                <div
                  key={obj.id}
                  onClick={() => handleObjectiveToggle(obj.label)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(124,58,237,0.25)] text-white'
                      : 'bg-[#0B0B0B] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xs font-semibold">{obj.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-gray-700 bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center gap-2"
            >
              <span>CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: INFORMAÇÕES DA EMPRESA */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Etapa 5 de 6</span>
            <h2 className="text-2xl font-black text-white mt-1">Informações da Empresa</h2>
            <p className="text-xs text-gray-400">Preencha os dados básicos. Apenas o nome é obrigatório; o resto é opcional.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pet Shop Patinhas Felizes"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp para Atendimento
                </label>
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rio de Janeiro, RJ"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Endereço Físico
                </label>
                <input
                  type="text"
                  placeholder="Ex: Av. Nossa Senhora de Copacabana, 500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Instagram (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="@empresa_oficial"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  placeholder="Segunda a Sábado das 08h às 19h"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={handleGoToReview}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center gap-2"
            >
              <span>REVISAR PROJETO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REVISÃO & PROMPT AUTOMÁTICO */}
      {step === 6 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Etapa 6 de 6</span>
            <h2 className="text-2xl font-black text-white mt-1">Revisão e Prompt Automático</h2>
            <p className="text-xs text-gray-400">
              A Vende AI montou todo o prompt técnico. Você não precisa digitar comandos complexos.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Empresa & Nicho</span>
              <p className="text-sm font-bold text-white mt-0.5">{companyName}</p>
              <p className="text-xs text-purple-300">{selectedNiche.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Identidade Visual</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getPrimaryColor() }} />
                <span className="text-xs font-bold text-white">{selectedStyle}</span>
              </div>
              <p className="text-[11px] text-gray-400">{selectedPalette.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B0B0B] border border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Objetivos</span>
              <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                {selectedObjectives.join(' • ')}
              </p>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Prompt Preparado pela Vende AI
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-gray-300 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
                <button
                  onClick={handleOpenGemini}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no Gemini</span>
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              readOnly
              value={generatedPrompt}
              className="w-full p-4 rounded-xl bg-black border border-gray-800 font-mono text-xs text-gray-300 leading-relaxed outline-none resize-none"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              id="btn-gerar-site"
              onClick={handleGenerateSite}
              className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-[0_0_30px_rgba(124,58,237,0.5)] transition flex items-center gap-2 transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>CRIAR SITE COM IA AGORA</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: PROCESSING OR FINAL RESULT */}
      {step === 7 && (
        <div className="space-y-6">
          {isGenerating ? (
            /* Visual loading animation as specified in Section 50 */
            <div className="py-20 text-center space-y-6 bg-[#0B0B0B] border border-gray-800 rounded-3xl p-8 shadow-[0_0_40px_rgba(124,58,237,0.15)]">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-600/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  A Vende AI está construindo seu projeto...
                </h3>
                <p className="text-sm font-semibold text-purple-300 h-6">
                  {loadingMessages[loadingStepIndex]}
                </p>
              </div>

              <div className="max-w-md mx-auto h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-700"
                  style={{ width: `${((loadingStepIndex + 1) / loadingMessages.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Website Generated View */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B0B0B] border border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{companyName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold">
                      ✓ Site Pronto
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Página comercial completa gerada com IA</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mr-2">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        previewMode === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-400'
                      }`}
                      title="Desktop"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        previewMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-400'
                      }`}
                      title="Mobile"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'preview' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-300'
                    }`}
                  >
                    Visualização
                  </button>

                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'code' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-300'
                    }`}
                  >
                    Código HTML
                  </button>

                  <button
                    onClick={handleSaveProject}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Salvando...' : 'SALVAR PROJETO'}</span>
                  </button>
                </div>
              </div>

              {/* View container */}
              {activeTab === 'preview' && (
                <div
                  className={`mx-auto rounded-2xl overflow-hidden border border-gray-800 shadow-2xl transition-all duration-300 ${
                    previewMode === 'mobile' ? 'max-w-[390px] h-[750px] border-4 border-zinc-800' : 'w-full h-[750px]'
                  }`}
                >
                  <iframe
                    title="Website Preview"
                    srcDoc={generatedHtml}
                    className="w-full h-full bg-white border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              )}

              {activeTab === 'code' && (
                <div className="p-4 rounded-2xl bg-black border border-gray-800 relative">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedHtml);
                      addToast('Código HTML copiado!', 'success');
                    }}
                    className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </button>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-purple-200/90 max-h-[700px]">
                    <code>{generatedHtml}</code>
                  </pre>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(6)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ajustar Configurações</span>
                </button>
                <button
                  onClick={handleGenerateSite}
                  className="px-5 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GERAR NOVAMENTE</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
