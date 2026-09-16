import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../assets/brand.ts';
import { Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onGoToLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onGoToRegister,
  onGoToLanding,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <button
            onClick={onGoToLanding}
            className="inline-flex items-center gap-2.5 mb-4 hover:opacity-80 transition"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-purple-400/40 bg-black flex items-center justify-center shrink-0">
              <img
                src={VENDE_AI_LOGO}
                alt="Vende AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl text-white tracking-tight">VENDE</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/50 text-purple-300 font-black text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                AI
              </span>
            </div>
          </button>
          <h2 className="text-2xl font-black text-white tracking-tight">Acesse sua Conta</h2>
          <p className="text-xs text-gray-400 mt-1">Entre no painel comercial da Vende AI</p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white placeholder:text-gray-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white placeholder:text-gray-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>ENTRAR NA PLATAFORMA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Ainda não tem conta?{' '}
              <button
                onClick={onGoToRegister}
                className="text-purple-400 hover:text-purple-300 font-bold underline transition"
              >
                Cadastre-se e escolha um plano
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
