import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../assets/brand.ts';
import { api } from '../utils/apiClient.ts';
import type { Plan } from '../types/index.ts';
import { PixCheckoutModal } from '../components/modals/PixCheckoutModal.tsx';
import {
  Sparkles,
  MapPin,
  FileText,
  MessageSquare,
  TrendingUp,
  Globe,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
} from 'lucide-react';

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'plan_mensal',
    name: 'Plano Mensal (12x)',
    description: 'Acesso completo à plataforma com pagamento mensal durante 12 parcelas.',
    price: 39.9,
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
      'Suporte prioritário',
    ],
  },
  {
    id: 'plan_vitalicio',
    name: 'Vitalício Master',
    description: 'Acesso vitalício irrestrito à Vende AI sem mensalidades futuras.',
    price: 227.0,
    billing_type: 'vitalicio',
    installments: 1,
    duration_months: 999,
    active: true,
    features: [
      'Acesso vitalício irrestrito',
      'Geração ilimitada de prompts e sites',
      'Busca avançada de empresas sem site',
      'Exportação livre de código HTML/Tailwind',
      'Scripts de alta conversão para WhatsApp',
      'Sem mensalidades nem renovações',
    ],
  },
];

interface LandingViewProps {
  onGoToApp: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGoToApp,
  onGoToLogin,
  onGoToRegister,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [selectedPlanForPix, setSelectedPlanForPix] = useState<Plan | null>(null);

  useEffect(() => {
    api
      .getPlans()
      .then((res) => {
        if (res.plans && res.plans.length > 0) {
          setPlans(res.plans);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      onGoToRegister();
    } else {
      setSelectedPlanForPix(plan);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-purple-400/40 bg-black flex items-center justify-center shrink-0">
              <img
                src={VENDE_AI_LOGO}
                alt="Vende AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-white tracking-tight">VENDE</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/50 text-purple-300 font-black text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <button
                onClick={onGoToApp}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
              >
                <span>Acessar Painel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onGoToLogin}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-zinc-900 transition"
                >
                  Entrar
                </button>
                <button
                  onClick={onGoToRegister}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
                >
                  Começar Agora
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-7">
          {/* Vende AI Hero Avatar Badge */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-purple-400/50 shadow-[0_0_40px_rgba(124,58,237,0.5)] bg-black transition-transform group-hover:scale-105">
                <img
                  src={VENDE_AI_LOGO}
                  alt="Avatar Vende AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-black font-extrabold text-[10px] border border-black shadow-md">
                ONLINE
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-xs text-purple-300 font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Central de Vendas de Sites com Inteligência Artificial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Crie sites, encontre empresas e transforme <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">leads em clientes</span>.
          </h1>

          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Tenha em uma única plataforma ferramentas de IA para criar sites profissionais, encontrar empresas reais sem site e gerar propostas prontas para fechar vendas no WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={isAuthenticated ? onGoToApp : onGoToRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(124,58,237,0.5)] transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>COMEÇAR AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#planos"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-gray-200 font-semibold text-sm border border-zinc-800 transition flex items-center justify-center"
            >
              VER PLANOS (PIX)
            </a>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="max-w-6xl mx-auto mt-16 p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-purple-500/20 to-transparent border border-gray-800/80 shadow-[0_0_60px_rgba(124,58,237,0.15)]">
          <div className="rounded-xl bg-[#09090C] border border-gray-800 overflow-hidden p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs font-mono text-gray-500">vendeai.app/dashboard</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300">
                AO VIVO
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0F0F12] border border-gray-800/80">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Faturamento</p>
                <p className="text-xl font-bold text-white mt-1">R$ 2.450,00</p>
                <span className="text-[10px] text-emerald-400">+100% este mês</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0F0F12] border border-gray-800/80">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Vendas Realizadas</p>
                <p className="text-xl font-bold text-white mt-1">5 fechadas</p>
                <span className="text-[10px] text-purple-400">R$ 490/ticket</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0F0F12] border border-gray-800/80">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Empresas sem Site</p>
                <p className="text-xl font-bold text-amber-400 mt-1">38 locais</p>
                <span className="text-[10px] text-gray-400">Via Google Maps</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0F0F12] border border-gray-800/80">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Sites Criados</p>
                <p className="text-xl font-bold text-purple-300 mt-1">12 páginas</p>
                <span className="text-[10px] text-gray-400">Com IA Gemini</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#070707] border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Fluxo Inteligente de Vendas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Tudo o que você precisa para faturar com sites locais
            </h2>
            <p className="text-sm text-gray-400">
              O conceito é simples: Clique → Escolha → IA → Lead → Proposta → Venda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 hover:border-purple-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Criador de Sites com IA</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Escolha o nicho e gere a estrutura do site em segundos. A IA monta layout, cores, textos persuasivos e botão de WhatsApp direto.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 hover:border-purple-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Encontrar Empresas Reais</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Encontre empresas reais por nicho, estado, cidade e bairro através do Google Maps e Places, filtrando quem não possui site oficial.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 hover:border-purple-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">CRM de Leads & Propostas</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Salve e organize seus potenciais clientes no Kanban. Gere mensagens personalizadas e abra o WhatsApp do cliente pronto para fechar negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Investimento
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Escolha seu plano</h2>
            <p className="text-sm text-gray-400">
              Pagamento facilitado via Pix com liberação segura pelo administrador.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => {
              const isVitalicio = plan.billing_type === 'vitalicio';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 transition-all flex flex-col justify-between ${
                    isVitalicio
                      ? 'bg-[#0E0E12] border-2 border-purple-500 shadow-[0_0_40px_rgba(124,58,237,0.3)]'
                      : 'bg-[#0B0B0B] border border-gray-800'
                  }`}
                >
                  {isVitalicio && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-md">
                      PAGAMENTO ÚNICO • MAIS POPULAR
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-6 min-h-[32px]">{plan.description}</p>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-gray-400">R$</span>
                        <span className="text-4xl sm:text-5xl font-black text-white">
                          {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          {isVitalicio ? 'à vista' : '/ mês'}
                        </span>
                      </div>
                      <p className="text-xs text-purple-300 font-semibold mt-1">
                        {isVitalicio ? 'Sem mensalidades recorrentes' : '12 pagamentos mensais'}
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition shadow-lg ${
                      isVitalicio
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_25px_rgba(124,58,237,0.4)]'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    }`}
                  >
                    COMPRAR AGORA (PIX)
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust Guarantee Badges */}
          <div className="mt-12 p-6 rounded-2xl bg-[#09090C] border border-gray-800/80 flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Garantia Incondicional de 7 Dias</p>
                <p className="text-[11px] text-gray-400">Satisfação garantida ou seu dinheiro de volta.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Pagamento Seguro via Pix</p>
                <p className="text-[11px] text-gray-400">Ativação rápida e liberação das ferramentas.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Suporte ao Aluno & Vendedor</p>
                <p className="text-[11px] text-gray-400">Canal direto para tirar dúvidas sobre vendas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-gray-900 text-center text-xs text-gray-500 space-y-4">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500/40 shrink-0">
            <img
              src={VENDE_AI_LOGO}
              alt="Vende AI"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight">VENDE AI</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Vende AI. Todos os direitos reservados.</p>
        <p className="text-[11px] text-gray-600">
          Tecnologia comercial em conformidade com as diretrizes do Google AI Studio e Google Maps Platform.
        </p>
      </footer>

      {/* Pix Modal for checkout */}
      {selectedPlanForPix && (
        <PixCheckoutModal
          isOpen={Boolean(selectedPlanForPix)}
          onClose={() => setSelectedPlanForPix(null)}
          selectedPlan={selectedPlanForPix}
          onPaymentSubmitted={() => setSelectedPlanForPix(null)}
        />
      )}
    </div>
  );
};
