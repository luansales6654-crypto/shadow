import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../assets/brand.ts';
import { api } from '../utils/apiClient.ts';
import type { Plan } from '../types/index.ts';
import { Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RegisterViewProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onGoToLanding: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSuccess,
  onGoToLogin,
  onGoToLanding,
}) => {
  const { register } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_vitalicio');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPlans().then((res) => {
      setPlans(res.plans || []);
      if (res.plans?.length) {
        setSelectedPlanId(res.plans.find((p) => p.billing_type === 'vitalicio')?.id || res.plans[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password, selectedPlanId);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
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
          <h2 className="text-2xl font-black text-white tracking-tight">Criar Conta na Vende AI</h2>
          <p className="text-xs text-gray-400 mt-1">
            Escolha seu plano e comece a faturar com sites e prospecção
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white placeholder:text-gray-600 transition"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white placeholder:text-gray-600 transition"
                />
              </div>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Selecione seu Plano</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const isVitalicio = p.billing_type === 'vitalicio';

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                          : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                      </div>
                      <p className="text-sm font-black text-purple-300">
                        R$ {p.price.toFixed(2).replace('.', ',')}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {isVitalicio ? 'Acesso Vitalício' : '12x mensais'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center justify-center gap-2 pt-3"
            >
              {loading ? (
                <span>Criando conta...</span>
              ) : (
                <>
                  <span>CADASTRAR E CONTINUAR</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Já possui uma conta?{' '}
              <button
                onClick={onGoToLogin}
                className="text-purple-400 hover:text-purple-300 font-bold underline transition"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
