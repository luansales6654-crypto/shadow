import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../assets/brand.ts';
import { api } from '../utils/apiClient.ts';
import {
  DollarSign,
  TrendingUp,
  Users,
  Globe,
  FileText,
  Wand2,
  MapPin,
  ArrowRight,
  PlusCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenSaleModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [sitesCount, setSitesCount] = useState(0);
  const [proposalsCount, setProposalsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | 'month' | 'all'>('7d');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [salesRes, leadsRes, sitesRes, propsRes] = await Promise.all([
        api.getSales().catch(() => ({ sales: [], totalRevenue: 0 })),
        api.getLeads().catch(() => ({ leads: [] })),
        api.getSites().catch(() => ({ sites: [] })),
        api.getProposals().catch(() => ({ proposals: [] })),
      ]);

      setSalesData(salesRes.sales || []);
      setTotalRevenue(salesRes.totalRevenue || 0);
      setLeadsCount(leadsRes.leads?.length || 0);
      setSitesCount(sitesRes.sites?.length || 0);
      setProposalsCount(propsRes.proposals?.length || 0);
    } finally {
      setLoading(false);
    }
  };

  // Build chart data from actual sales
  const buildChartData = () => {
    const days = periodFilter === '30d' ? 30 : 7;
    const result: { date: string; displayDate: string; revenue: number; sales: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const display = `${d.getDate()}/${d.getMonth() + 1}`;
      result.push({ date: iso, displayDate: display, revenue: 0, sales: 0 });
    }

    salesData.forEach((s) => {
      const saleDate = s.sale_date ? s.sale_date.split('T')[0] : '';
      const bucket = result.find((b) => b.date === saleDate);
      if (bucket) {
        bucket.revenue += Number(s.amount || 0);
        bucket.sales += 1;
      }
    });

    return result;
  };

  const chartData = buildChartData();
  const hasSales = salesData.length > 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Vende AI Command Bar Header with Avatar */}
      <div className="p-6 rounded-2xl bg-[#09090C] border border-gray-800/80 hover:border-purple-500/30 transition shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_25px_rgba(124,58,237,0.5)] bg-black shrink-0">
              <img
                src={VENDE_AI_LOGO}
                alt="Vende AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Painel Vende AI
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px] tracking-wider uppercase">
                  Motor de Vendas Ativo
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Central de inteligência para encontrar empresas sem site, gerar páginas profissionais e fechar contratos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('prospecting')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Achar Empresas</span>
            </button>
            <button
              onClick={() => onNavigate('create-site')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 font-bold text-xs border border-purple-500/30 transition flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>Criar Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Banner if empty account */}
      {leadsCount === 0 && sitesCount === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0E0E12] to-indigo-950/30 border border-purple-500/30 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-400/40 shadow-md shrink-0 bg-black mt-0.5">
                <img
                  src={VENDE_AI_LOGO}
                  alt="Vende AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <h3 className="text-lg font-bold text-white">Comece agora seu negócio de sites!</h3>
                </div>
                <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                  Você está pronto para encontrar empresas locais e fechar sua primeira venda de site. Comece buscando empresas sem site na sua cidade ou gerando uma página de alta conversão.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('prospecting')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.4)] transition flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Encontrar Empresas</span>
              </button>
              <button
                onClick={() => onNavigate('create-site')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-200 font-semibold text-xs border border-zinc-700 transition flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Criar Site com IA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
            Métricas Comerciais em Tempo Real
          </h2>
          <span className="text-[11px] text-gray-500">
            Atualização contínua • Sem valores simulados
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Faturamento */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800/90 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Faturamento</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {totalRevenue > 0 ? 'Faturamento total acumulado' : 'R$ 0,00 registrado até o momento'}
            </p>
          </div>

          {/* Card 2: Vendas */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800/90 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Vendas</span>
              <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{salesData.length}</p>
            <p className="text-[10px] text-gray-500 mt-1">Contratos fechados</p>
          </div>

          {/* Card 3: Leads */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800/90 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Leads</span>
              <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{leadsCount}</p>
            <p className="text-[10px] text-gray-500 mt-1">Empresas salvas no CRM</p>
          </div>

          {/* Card 4: Sites */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800/90 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Sites Criados</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-950/60 text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{sitesCount}</p>
            <p className="text-[10px] text-gray-500 mt-1">Páginas com IA Gemini</p>
          </div>

          {/* Card 5: Propostas */}
          <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800/90 hover:border-purple-500/40 transition col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Propostas</span>
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{proposalsCount}</p>
            <p className="text-[10px] text-gray-500 mt-1">Mensagens WhatsApp criadas</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">O que você quer fazer?</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            id="btn-quick-create-site"
            onClick={() => onNavigate('create-site')}
            className="p-4 rounded-xl bg-[#111116] hover:bg-purple-950/30 border border-gray-800 hover:border-purple-500/40 text-left transition group"
          >
            <Wand2 className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
            <h4 className="text-xs font-bold text-white">Criar Site com IA</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Gerar estrutura e código pronto</p>
          </button>

          <button
            id="btn-quick-prospect"
            onClick={() => onNavigate('prospecting')}
            className="p-4 rounded-xl bg-[#111116] hover:bg-purple-950/30 border border-gray-800 hover:border-purple-500/40 text-left transition group"
          >
            <MapPin className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition" />
            <h4 className="text-xs font-bold text-white">Encontrar Empresas</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Buscar locais sem site oficial</p>
          </button>

          <button
            id="btn-quick-leads"
            onClick={() => onNavigate('leads')}
            className="p-4 rounded-xl bg-[#111116] hover:bg-purple-950/30 border border-gray-800 hover:border-purple-500/40 text-left transition group"
          >
            <Users className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition" />
            <h4 className="text-xs font-bold text-white">Ver Meus Leads</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Gerenciar funil de vendas</p>
          </button>

          <button
            id="btn-quick-sales"
            onClick={() => onNavigate('sales')}
            className="p-4 rounded-xl bg-[#111116] hover:bg-purple-950/30 border border-gray-800 hover:border-purple-500/40 text-left transition group"
          >
            <TrendingUp className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
            <h4 className="text-xs font-bold text-white">Registrar Venda</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Lançar novo contrato e valor</p>
          </button>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Evolução de Vendas & Faturamento</h3>
            <p className="text-xs text-gray-400 mt-0.5">Histórico de contratos confirmados</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start">
            <button
              onClick={() => setPeriodFilter('7d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                periodFilter === '7d' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriodFilter('30d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                periodFilter === '30d' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Últimos 30 dias
            </button>
          </div>
        </div>

        {!hasSales ? (
          <div className="py-16 text-center space-y-4 border border-dashed border-gray-800 rounded-xl bg-zinc-950/50">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-gray-500 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-300">Você ainda não possui vendas neste período.</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Comece encontrando empresas no mapa que ainda não possuem site e envie uma proposta profissional.
              </p>
            </div>
            <button
              onClick={() => onNavigate('prospecting')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.3)] transition inline-flex items-center gap-2"
            >
              <span>ENCONTRAR EMPRESAS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis
                  stroke="#666"
                  tick={{ fill: '#888', fontSize: 11 }}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E0E12',
                    borderColor: '#333',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Faturamento']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#purpleGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
