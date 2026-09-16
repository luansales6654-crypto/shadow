import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import type { Website } from '../types/index.ts';
import { Modal } from '../components/ui/Modal.tsx';
import {
  Globe,
  Plus,
  Eye,
  Copy,
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles,
  Smartphone,
  Monitor,
  Download,
} from 'lucide-react';

interface MySitesViewProps {
  onNavigateToCreate: () => void;
}

export const MySitesView: React.FC<MySitesViewProps> = ({ onNavigateToCreate }) => {
  const { addToast } = useAuth();
  const [sites, setSites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewSite, setPreviewSite] = useState<Website | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const res = await api.getSites();
      setSites(res.sites || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await api.duplicateSite(id);
      setSites([res.site, ...sites]);
      addToast('Site duplicado com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao duplicar.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o site "${name}"?`)) return;
    try {
      await api.deleteSite(id);
      setSites(sites.filter((s) => s.id !== id));
      addToast('Site excluído.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Erro ao excluir.', 'error');
    }
  };

  const handleCopyLink = (site: Website) => {
    const url = `${window.location.origin}/site/${site.slug || site.id}`;
    navigator.clipboard.writeText(url);
    addToast('Link público copiado!', 'success');
  };

  const handleDownloadHtml = (site: Website) => {
    const blob = new Blob([site.html_content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${site.name.toLowerCase().replace(/\s+/g, '-')}-site.html`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Download do HTML iniciado!', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Portfólio de Projetos
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Meus Sites Criados</h2>
          <p className="text-xs text-gray-400">
            Gerencie, visualize e compartilhe os sites gerados para seus clientes.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.3)] transition flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Site</span>
        </button>
      </div>

      {/* Empty State */}
      {sites.length === 0 && !loading && (
        <div className="py-20 text-center bg-[#0B0B0B] border border-gray-800 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-gray-500 mx-auto flex items-center justify-center">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Nenhum site salvo no seu portfólio</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Utilize nosso gerador com inteligência artificial para criar sites completos em minutos.
            </p>
          </div>
          <button
            onClick={onNavigateToCreate}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.3)] transition"
          >
            CRIAR MEU PRIMEIRO SITE
          </button>
        </div>
      )}

      {/* Sites Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div
            key={site.id}
            className="rounded-2xl bg-[#0B0B0B] border border-gray-800 hover:border-purple-500/40 transition flex flex-col justify-between overflow-hidden group shadow-lg"
          >
            {/* Top Preview Bar */}
            <div className="h-32 bg-zinc-950 border-b border-gray-800/80 relative overflow-hidden flex items-center justify-center p-3">
              <div
                className="w-full h-full rounded-lg border border-gray-800 opacity-60 pointer-events-none scale-75 origin-top overflow-hidden"
              >
                <iframe
                  title="thumbnail"
                  srcDoc={site.html_content}
                  className="w-full h-[400px] border-0"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent" />

              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                {site.niche_name || 'Geral'}
              </span>
            </div>

            {/* Content info */}
            <div className="p-5 space-y-3">
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                  {site.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(site.created_at).toLocaleDateString('pt-BR')}</span>
                  {site.style && <span>• {site.style}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewSite(site)}
                    className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(site)}
                    className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-200 text-xs font-semibold border border-zinc-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                  <button
                    onClick={() => handleDuplicate(site.id)}
                    className="hover:text-purple-300 transition"
                  >
                    Duplicar
                  </button>

                  <button
                    onClick={() => handleDownloadHtml(site)}
                    className="hover:text-purple-300 flex items-center gap-1 transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>Baixar HTML</span>
                  </button>

                  <button
                    onClick={() => handleDelete(site.id, site.name)}
                    className="hover:text-red-400 text-gray-500 transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewSite && (
        <Modal
          isOpen={Boolean(previewSite)}
          onClose={() => setPreviewSite(null)}
          title={`Visualização: ${previewSite.name}`}
          subtitle="Página comercial em tempo real"
          maxWidth="5xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    previewMode === 'desktop' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-400'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    previewMode === 'mobile' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadHtml(previewSite)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-gray-300 font-semibold border border-zinc-800 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar HTML</span>
                </button>
                <button
                  onClick={() => handleCopyLink(previewSite)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link Público</span>
                </button>
              </div>
            </div>

            <div
              className={`mx-auto rounded-xl overflow-hidden border border-gray-800 shadow-2xl transition-all duration-300 ${
                previewMode === 'mobile'
                  ? 'max-w-[390px] h-[700px] border-4 border-zinc-800'
                  : 'w-full h-[700px]'
              }`}
            >
              <iframe
                title={previewSite.name}
                srcDoc={previewSite.html_content}
                className="w-full h-full bg-white border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
