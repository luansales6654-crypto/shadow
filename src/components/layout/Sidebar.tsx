import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../../assets/brand.ts';
import {
  LayoutDashboard,
  Wand2,
  Globe,
  MapPin,
  Users,
  FileText,
  TrendingUp,
  Settings,
  HelpCircle,
  ShieldCheck,
  LogOut,
  X,
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-site', label: 'Criar Site', icon: Wand2 },
    { id: 'my-sites', label: 'Meus Sites', icon: Globe },
    { id: 'prospecting', label: 'Encontrar Empresas', icon: MapPin },
    { id: 'leads', label: 'Meus Leads (CRM)', icon: Users },
    { id: 'proposals', label: 'Propostas com IA', icon: FileText },
    { id: 'sales', label: 'Vendas & Faturamento', icon: TrendingUp },
    { id: 'help', label: 'Central de Ajuda', icon: HelpCircle },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between bg-[#050505] border-r border-gray-800/80 w-64 p-4 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-3 py-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-purple-400/40 bg-black flex items-center justify-center shrink-0">
              <img
                src={VENDE_AI_LOGO}
                alt="Vende AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">VENDE</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/50 text-purple-300 font-black text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Plataforma SaaS Comercial</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User status alert if pending payment */}
        {user && user.status === 'waiting_payment' && !isAdmin && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Pagamento Pendente
            </div>
            <p className="text-[11px] text-amber-300/80 mb-2">
              Envie o comprovante Pix para liberação imediata.
            </p>
            <button
              onClick={() => handleItemClick('plans-modal')}
              className="w-full py-1 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-[11px] transition"
            >
              Ver Chave Pix & Comprovante
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-zinc-900/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Admin & Logout */}
      <div className="pt-3 border-t border-gray-800/80 space-y-2">
        {/* Vende AI Status Card */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/30 to-zinc-900 border border-purple-500/20 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-400/40 shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.4)]">
            <img
              src={VENDE_AI_LOGO}
              alt="Vende AI"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-[11px] font-bold text-white truncate">Vende AI Ativo</p>
            </div>
            <p className="text-[10px] text-gray-400 truncate">Gemini & Maps Prontos</p>
          </div>
        </div>

        {isAdmin && (
          <button
            id="nav-admin"
            onClick={() => handleItemClick('admin')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              currentView === 'admin'
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_25px_rgba(124,58,237,0.5)]'
                : 'bg-purple-950/30 text-purple-300 border-purple-500/40 hover:bg-purple-900/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>Painel Master Admin</span>
          </button>
        )}

        <button
          onClick={() => {
            logout();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-40">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-300 h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
