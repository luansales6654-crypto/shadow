import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { VENDE_AI_LOGO } from '../../assets/brand.ts';
import { api } from '../../utils/apiClient.ts';
import type { Plan } from '../../types/index.ts';
import {
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  onPaymentSubmitted?: () => void;
}

export const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onPaymentSubmitted,
}) => {
  const { user, addToast, refreshUser } = useAuth();
  const [pixInfo, setPixInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [fileData, setFileData] = useState<{ url: string; name: string; type: string; size: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getPixInfo().then((res) => {
        setPixInfo(res.pix);
      }).catch(() => {});
      setSubmitted(false);
      setFileData(null);
      setError(null);
    }
  }, [isOpen]);

  if (!selectedPlan) return null;

  const pixKey = pixInfo?.pix_key || '22116932700';
  const receiver = pixInfo?.receiver_name || 'Vende AI - Luan';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    addToast('Chave Pix copiada com sucesso!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/(image\/jpeg|image\/png|application\/pdf)/)) {
      setError('Formato inválido. Envie um comprovante em JPG, PNG ou PDF.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 15MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setFileData({
        url: reader.result as string,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) {
      setError('Por favor, anexe o arquivo do comprovante Pix.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitPaymentProof({
        planId: selectedPlan.id,
        fileUrl: fileData.url,
        fileType: fileData.type,
        fileName: fileData.name,
        fileSize: fileData.size,
      });

      setSubmitted(true);
      addToast('Comprovante enviado com sucesso! Aguarde aprovação.', 'success');
      await refreshUser();
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pagamento via Pix"
      subtitle="Liberação de Acesso à Plataforma Vende AI"
      maxWidth="lg"
    >
      {submitted ? (
        <div className="py-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-white mb-2">Comprovante Enviado com Sucesso!</h4>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Seu pagamento foi enviado para análise. Aguarde a aprovação do administrador para que seu plano seja ativado.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Plano Selecionado:</span>
              <span className="font-bold text-white">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Valor Informado:</span>
              <span className="font-bold text-purple-300">
                R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Status Atual:</span>
              <span className="font-bold text-amber-400">AGUARDANDO APROVAÇÃO</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg transition"
          >
            Entendido, Acompanhar Status
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plan Summary */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 shadow-md shrink-0 bg-black">
                <img
                  src={VENDE_AI_LOGO}
                  alt="Vende AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                  Resumo do Pedido
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{selectedPlan.name}</h4>
                <p className="text-xs text-gray-400">
                  {selectedPlan.billing_type === 'vitalicio' ? 'Acesso vitalício único' : '12 pagamentos mensais'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-black text-white">
                R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="block text-[10px] text-gray-400">
                {selectedPlan.billing_type === 'vitalicio' ? 'Pagamento Único' : '/mês'}
              </span>
            </div>
          </div>

          {/* Pix instructions & Copy Key */}
          <div className="p-5 rounded-2xl bg-[#0F0F12] border border-purple-500/30 space-y-4 shadow-[0_0_25px_rgba(124,58,237,0.1)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold text-gray-200">
                Realize o pagamento através da chave Pix abaixo:
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black border border-gray-800 flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Chave Pix</span>
                <span className="font-mono text-sm font-bold text-purple-300 select-all truncate block">
                  {pixKey}
                </span>
              </div>
              <button
                type="button"
                id="btn-copiar-pix"
                onClick={handleCopyPix}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Chave Pix copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPIAR CHAVE PIX</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>Beneficiário: <strong className="text-gray-200">{receiver}</strong></span>
              <span>Valor: <strong className="text-purple-300">R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</strong></span>
            </div>
          </div>

          {/* Form to submit proof */}
          <form onSubmit={handleSubmitProof} className="space-y-4">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-purple-400" />
              Envie Seu Comprovante Pix
            </h5>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Seu Nome</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Seu E-mail</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Upload Drop Area */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Arquivo do Comprovante (JPG, PNG ou PDF)
                </label>
                <div className="relative border-2 border-dashed border-gray-700 hover:border-purple-500/60 rounded-xl p-5 text-center bg-zinc-900/40 transition group cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {fileData ? (
                    <div className="flex items-center justify-center gap-3 text-purple-300 text-xs font-semibold">
                      <FileCheck className="w-5 h-5 text-purple-400" />
                      <span className="truncate max-w-xs">{fileData.name}</span>
                      <span className="text-gray-400">({(fileData.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-7 h-7 mx-auto text-gray-400 group-hover:text-purple-400 transition" />
                      <p className="text-xs font-medium text-gray-300">
                        Arraste seu comprovante aqui ou <span className="text-purple-400 underline">clique para selecionar</span>
                      </p>
                      <p className="text-[10px] text-gray-500">Formatos aceitos: JPG, PNG, PDF (Máximo 15MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-semibold text-xs border border-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !fileData}
                className="w-2/3 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Enviando comprovante...</span>
                ) : (
                  <span>ENVIAR COMPROVANTE</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
