import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import { Badge } from '../components/ui/Badge.tsx';
import {
  User,
  Lock,
  Sparkles,
  MapPin,
  ShieldCheck,
  Save,
  Check,
  Key,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, isAdmin, addToast } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('As senhas digitadas não coincidem.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      addToast('A nova senha deve ter no mínimo 6 caracteres.', 'warning');
      return;
    }

    setUpdatingPass(true);
    try {
      await api.updatePassword(currentPassword, newPassword);
      addToast('Senha atualizada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.message || 'Erro ao alterar senha.', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
          Configurações da Conta
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Meu Perfil & Segurança</h2>
        <p className="text-xs text-gray-400">
          Gerencie suas credenciais de acesso e visualize o status de suas integrações.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          Informações da Conta
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-gray-400 block mb-1">Nome</span>
            <span className="font-bold text-white text-sm">{user?.name}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-gray-400 block mb-1">E-mail Cadastrado</span>
            <span className="font-bold text-white text-sm">{user?.email}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-gray-400 block mb-1">Plano Atual</span>
            <span className="font-bold text-purple-300 text-sm">
              {isAdmin ? 'Acesso Master Total' : user?.planName || 'Plano Vende AI'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-gray-400 block mb-1">Status da Assinatura</span>
            <div className="mt-1">
              {isAdmin ? (
                <Badge variant="purple">ADMINISTRADOR MASTER</Badge>
              ) : user?.status === 'active' ? (
                <Badge variant="green">ATIVO</Badge>
              ) : (
                <Badge variant="amber">AGUARDANDO APROVAÇÃO</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security: Update Password */}
      <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          Segurança e Alteração de Senha
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Senha Atual</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
          >
            {updatingPass ? 'Atualizando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>

      {/* Connected Services Status */}
      <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" />
          Serviços Integrados
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Google AI Studio (Gemini)</p>
                <p className="text-[10px] text-gray-400">Geração de sites e propostas</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
              CONECTADO
            </span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Google Maps & Places</p>
                <p className="text-[10px] text-gray-400">Prospecção de empresas locais</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
              CONECTADO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
