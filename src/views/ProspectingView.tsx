import React, { useState } from 'react';
import { InteractiveMap } from '../components/InteractiveMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../utils/apiClient.ts';
import {
  BRAZIL_STATES,
  CITIES_BY_STATE,
  POPULAR_NICHES,
} from '../utils/brazilGeo.ts';
import { Badge } from '../components/ui/Badge.tsx';
import {
  MapPin,
  Search,
  Globe,
  Phone,
  Star,
  ExternalLink,
  Plus,
  Check,
  Wand2,
  FileText,
  AlertCircle,
  Loader2,
  Filter,
  Layers,
  Map as MapIcon,
} from 'lucide-react';

interface ProspectingViewProps {
  onCreateSiteForCompany: (data: { name: string; city: string; phone: string; niche: string }) => void;
  onGenerateProposalForCompany: (lead: any) => void;
}

export const ProspectingView: React.FC<ProspectingViewProps> = ({
  onCreateSiteForCompany,
  onGenerateProposalForCompany,
}) => {
  const { addToast } = useAuth();

  const [selectedNiche, setSelectedNiche] = useState('Pet Shop');
  const [selectedState, setSelectedState] = useState('SP');
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [neighborhood, setNeighborhood] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'no_website' | 'has_website'>('all');
  const [displayMode, setDisplayMode] = useState<'grid' | 'map'>('grid');
  const [savedLeadIds, setSavedLeadIds] = useState<Record<string, boolean>>({});

  const availableCities = CITIES_BY_STATE[selectedState] || ['Capital'];

  const handleStateChange = (uf: string) => {
    setSelectedState(uf);
    const cities = CITIES_BY_STATE[uf] || ['Capital'];
    setSelectedCity(cities[0]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const data = await api.searchPlaces({
        niche: selectedNiche,
        state: selectedState,
        city: selectedCity,
        neighborhood,
      });

      setResults(data.results || []);
      addToast(
        `Encontradas ${data.results?.length || 0} empresas em ${selectedCity}!`,
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Erro ao consultar Google Maps.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (biz: any) => {
    try {
      await api.saveLead({
        name: biz.name,
        niche: selectedNiche,
        phone: biz.phone,
        address: biz.address,
        city: `${selectedCity}, ${selectedState}`,
        neighborhood: neighborhood || '',
        google_maps_url: biz.google_maps_url,
        has_website: biz.has_website,
        website_url: biz.website_url,
        rating: biz.rating,
        user_ratings_total: biz.user_ratings_total,
        status: 'prospect',
      });

      setSavedLeadIds((prev) => ({ ...prev, [biz.name]: true }));
      addToast(`"${biz.name}" salvo no seu CRM de Leads!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao salvar lead.', 'error');
    }
  };

  const filteredResults = results.filter((item) => {
    if (filterType === 'no_website') return !item.has_website;
    if (filterType === 'has_website') return item.has_website;
    return true;
  });

  const noWebsiteCount = results.filter((r) => !r.has_website).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
          Prospecção Inteligente via Google Maps
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Encontrar Empresas Locais</h2>
        <p className="text-xs text-gray-400">
          Descubra empresas no Google Maps que ainda não possuem site oficial e representam oportunidades comerciais de alto fechamento.
        </p>
      </div>

      {/* Search Filter Form */}
      <form onSubmit={handleSearch} className="p-6 rounded-2xl bg-[#0B0B0B] border border-gray-800 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nicho / Ramo</label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            >
              {POPULAR_NICHES.map((n) => (
                <option key={n.id} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Estado (UF)</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            >
              {BRAZIL_STATES.map((s) => (
                <option key={s.uf} value={s.uf}>
                  {s.uf} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Cidade</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
            >
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Bairro (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Centro, Moema..."
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-gray-600 outline-none focus:border-purple-500"
            >
            </input>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            id="btn-buscar-empresas"
            className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando Google Maps...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>ENCONTRAR EMPRESAS</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Header & Tabs */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Resultados:</span>
              <span className="text-xs text-gray-400">
                {results.length} empresas encontradas ({noWebsiteCount} sem site)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterType === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Todas ({results.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('no_website')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    filterType === 'no_website' ? 'bg-purple-600 text-white' : 'text-amber-300'
                  }`}
                >
                  <span>Sem Site</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                    {noWebsiteCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('has_website')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterType === 'has_website' ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Com Site ({results.length - noWebsiteCount})
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDisplayMode('grid')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    displayMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Grade</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('map')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    displayMode === 'map' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Mapa Interativo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map or Grid View */}
          {displayMode === 'map' ? (
            <InteractiveMap
              businesses={filteredResults}
              selectedCity={selectedCity}
              selectedState={selectedState}
              savedLeadIds={savedLeadIds}
              onSaveLead={handleSaveLead}
              onCreateSite={(biz) =>
                onCreateSiteForCompany({
                  name: biz.name,
                  city: `${selectedCity}, ${selectedState}`,
                  phone: biz.phone || '',
                  niche: selectedNiche,
                })
              }
              onGenerateProposal={(biz) => onGenerateProposalForCompany(biz)}
            />
          ) : (
            <>
              {filteredResults.length === 0 ? (
                <div className="py-16 text-center bg-[#0B0B0B] border border-gray-800 rounded-2xl space-y-2">
                  <p className="text-sm text-gray-300">Nenhuma empresa encontrada com o filtro selecionado.</p>
                  <p className="text-xs text-gray-500">Tente buscar em outro bairro ou alternar o nicho.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((biz, idx) => {
                    const isSaved = savedLeadIds[biz.name];

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl bg-[#0B0B0B] border transition flex flex-col justify-between ${
                          !biz.has_website
                            ? 'border-purple-500/30 shadow-[0_0_20px_rgba(124,58,237,0.1)]'
                            : 'border-gray-800'
                        }`}
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            {!biz.has_website ? (
                              <Badge variant="purple" className="text-[10px] font-bold">
                                SEM SITE IDENTIFICADO
                              </Badge>
                            ) : (
                              <Badge variant="green" className="text-[10px]">
                                SITE ENCONTRADO
                              </Badge>
                            )}

                            {biz.rating && (
                              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{biz.rating}</span>
                                <span className="text-[10px] text-gray-500">({biz.user_ratings_total})</span>
                              </div>
                            )}
                          </div>

                          {/* Business Name */}
                          <h4 className="text-base font-bold text-white mb-2 leading-snug">{biz.name}</h4>

                          {/* Details */}
                          <div className="space-y-1.5 text-xs text-gray-400 mb-4">
                            {biz.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{biz.address}</span>
                              </div>
                            )}
                            {biz.phone && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{biz.phone}</span>
                              </div>
                            )}
                            {biz.website_url && (
                              <div className="flex items-center gap-2 text-blue-400 truncate">
                                <Globe className="w-3.5 h-3.5 shrink-0" />
                                <a
                                  href={biz.website_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="truncate hover:underline"
                                >
                                  {biz.website_url.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-gray-800/80 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleSaveLead(biz)}
                              disabled={isSaved}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border ${
                                isSaved
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                                  : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-gray-200'
                              }`}
                            >
                              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              <span>{isSaved ? 'SALVO NO CRM' : 'Salvar Lead'}</span>
                            </button>

                            <button
                              onClick={() => onGenerateProposalForCompany(biz)}
                              className="py-2 px-3 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 text-purple-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-purple-400" />
                              <span>Proposta</span>
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              onCreateSiteForCompany({
                                name: biz.name,
                                city: `${selectedCity}, ${selectedState}`,
                                phone: biz.phone || '',
                                niche: selectedNiche,
                              })
                            }
                            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)] transition flex items-center justify-center gap-1.5"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>CRIAR SITE PARA ESTA EMPRESA</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
