import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../../assets/brand.ts';
import { Badge } from '../ui/Badge.tsx';
import { Bell, Menu, User as UserIcon, LogOut, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { api } from '../../utils/apiClient.ts';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, onNavigate }) => {
  const { user, isAdmin, logout, notifications, refreshNotifications } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshNotifications();
    } catch {}
  };

  const getPlanBadge = () => {
    if (isAdmin) {
      return (
        <Badge variant="purple" className="flex items-center gap-1.5 px-3 py-1 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
          MASTER ADMIN
        </Badge>
      );
    }
    if (user?.status === 'waiting_payment') {
      return <Badge variant="amber">AGUARDANDO APROVAÇÃO</Badge>;
    }
    if (user?.planType === 'vitalicio') {
      return (
        <Badge variant="purple" className="flex items-center gap-1 font-bold">
          <Sparkles className="w-3 h-3 text-purple-300" />
          VITALÍCIO
        </Badge>
      );
    }
    if (user?.planType === 'mensal') {
      return <Badge variant="blue">MENSAL — {user.installmentsPaid || 1}/{user.totalInstallments || 12}</Badge>;
    }
    return <Badge variant="gray">ATIVO</Badge>;
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#070707]/90 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-zinc-900 text-gray-400 hover:text-white border border-zinc-800"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-purple-500/40 shadow-[0_0_12px_rgba(124,58,237,0.4)] hidden sm:block shrink-0 bg-black">
            <img
              src={VENDE_AI_LOGO}
              alt="Vende AI"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Olá, {firstName} <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Pronto para encontrar novos clientes e vender sites hoje?
            </p>
          </div>
        </div>
      </div>

      {/* Right: Plan badge, Notifs, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:block">{getPlanBadge()}</div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowUserMenu(false);
            }}
            className="relative p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-gray-300 hover:text-white border border-zinc-800 transition"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-black animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0E0E10] border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">Notificações</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Marcar lidas
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-zinc-900/50 transition ${
                        !n.read ? 'bg-purple-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-gray-200">{n.title}</p>
                        <span className="text-[10px] text-gray-500">
                          {new Date(n.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifs(false);
            }}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0E0E10] border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-gray-800/80 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-950/30 flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Painel Administrador
                </button>
              )}

              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-zinc-900 flex items-center gap-2 transition"
              >
                <UserIcon className="w-4 h-4 text-gray-400" />
                Configurações da Conta
              </button>

              <div className="my-1 border-t border-gray-800/80" />

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Sair da Plataforma
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
