import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import type { Sale } from '../types/index.ts';
import { Modal } from '../components/ui/Modal.tsx';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Calendar,
  CreditCard,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

interface SalesViewProps {
  initialSaleData?: any;
}

export const SalesView: React.FC<SalesViewProps> = ({ initialSaleData }) => {
  const { addToast } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Sale Modal
  const [showModal, setShowModal] = useState(Boolean(initialSaleData));
  const [clientName, setClientName] = useState(initialSaleData?.name || '');
  const [niche, setNiche] = useState(initialSaleData?.niche || 'Comércio Local');
  const [phone, setPhone] = useState(initialSaleData?.phone || '');
  const [amount, setAmount] = useState('500.00');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await api.getSales();
      setSales(res.sales || []);
      setTotalRevenue(res.totalRevenue || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount) {
      addToast('Preencha o nome do cliente e o valor.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.registerSale({
        client_name: clientName,
        niche,
        phone,
        amount: Number(amount),
        payment_method: paymentMethod,
        notes,
        lead_id: initialSaleData?.id,
      });

      setSales([res.sale, ...sales]);
      setTotalRevenue((prev) => prev + Number(amount));
      setShowModal(false);
      setClientName('');
      setAmount('500.00');
      setNotes('');
      addToast('Venda registrada com sucesso! Parabéns pelo contrato!', 'success', 'Venda Fechada 💰');
    } catch (err: any) {
      addToast(err.message || 'Erro ao registrar venda.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const ticketMedio = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Gestão Financeira Comercial
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Vendas & Faturamento</h2>
          <p className="text-xs text-gray-400">
            Acompanhe o faturamento real com seus contratos de sites e serviços digitais.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Venda</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </p>
          <span className="text-[10px] text-gray-500 mt-1 block">Receita confirmada</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vendas Fechadas</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{sales.length}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">Contratos assinados</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            R$ {ticketMedio.toFixed(2).replace('.', ',')}
          </p>
          <span className="text-[10px] text-gray-500 mt-1 block">Por projeto entregue</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="rounded-2xl bg-[#0B0B0B] border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-[#0E0E12] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            Contratos e Vendas Registradas
          </h3>
          <span className="text-xs text-gray-400">{sales.length} registros</span>
        </div>

        {sales.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-400">Nenhuma venda registrada ainda.</p>
            <p>Quando fechar um cliente, clique em &quot;Registrar Nova Venda&quot; para computar sua receita.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-zinc-950 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Data</th>
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Nicho</th>
                  <th className="py-3 px-4 font-semibold">Forma</th>
                  <th className="py-3 px-4 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(s.sale_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{s.client_name}</div>
                      {s.phone && <span className="text-[10px] text-gray-500">{s.phone}</span>}
                    </td>
                    <td className="py-3 px-4 text-purple-300">{s.niche || '-'}</td>
                    <td className="py-3 px-4 text-gray-400">{s.payment_method}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">
                      R$ {Number(s.amount).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Sale Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Nova Venda"
        subtitle="Adicione o contrato fechado às suas métricas financeiras"
      >
        <form onSubmit={handleRegisterSale} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nome do Cliente / Empresa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Dra. Larissa Odontologia"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nicho</label>
              <input
                type="text"
                placeholder="Ex: Odontologia"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(11) 98888-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valor do Contrato (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-bold outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Observações do Contrato (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Ex: Incluso hospedagem e suporte por 3 meses..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-gray-400 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
            >
              {submitting ? 'Salvando...' : 'Salvar Venda'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
