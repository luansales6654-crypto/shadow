import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from './ui/Badge.tsx';
import {
  MapPin,
  Globe,
  Phone,
  Star,
  Plus,
  Check,
  Wand2,
  FileText,
  Maximize2,
  Layers,
  Compass,
  X,
} from 'lucide-react';

interface InteractiveMapProps {
  businesses: any[];
  selectedCity: string;
  selectedState: string;
  onSaveLead: (biz: any) => void;
  savedLeadIds: Record<string, boolean>;
  onCreateSite: (biz: any) => void;
  onGenerateProposal: (biz: any) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  businesses,
  selectedCity,
  selectedState,
  onSaveLead,
  savedLeadIds,
  onCreateSite,
  onGenerateProposal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  const [mapTheme, setMapTheme] = useState<'dark' | 'standard'>('dark');

  // Valid businesses with coordinates
  const validBusinesses = businesses.filter(
    (b) => typeof b.latitude === 'number' && typeof b.longitude === 'number' && !isNaN(b.latitude) && !isNaN(b.longitude)
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on first business or São Paulo by default
    const firstWithCoords = validBusinesses[0];
    const initialCenter: [number, number] = firstWithCoords
      ? [firstWithCoords.latitude, firstWithCoords.longitude]
      : [-23.55052, -46.633308];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom dark / standard tiles
    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Initial size invalidation after render
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapTheme]);

  // Update Markers and Bounds when businesses change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (validBusinesses.length === 0) return;

    const bounds: [number, number][] = [];

    validBusinesses.forEach((biz) => {
      const lat = biz.latitude;
      const lng = biz.longitude;
      bounds.push([lat, lng]);

      const isNoWebsite = !biz.has_website;
      const pinColor = isNoWebsite ? '#9333ea' : '#2563eb';
      const shadowColor = isNoWebsite ? 'rgba(147, 51, 234, 0.6)' : 'rgba(37, 99, 235, 0.6)';
      const iconSymbol = isNoWebsite ? '⚡' : '🌐';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            ${isNoWebsite ? `
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              border: 2.5px solid #a855f7;
              animation: mapPulse 1.8s infinite ease-out;
              pointer-events: none;
              top: -6px;
              left: -6px;
              z-index: -1;
            "></div>
            ` : ''}
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${pinColor};
              box-shadow: 0 0 14px ${shadowColor};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #ffffff;
              transition: transform 0.2s ease;
              position: relative;
              z-index: 2;
            ">
              ${iconSymbol}
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${pinColor};
              margin-top: -1px;
              position: relative;
              z-index: 2;
            "></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup);

      marker.on('click', () => {
        setActiveBiz(biz);
        map.panTo([lat, lng], { animate: true });
      });
    });

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch {
        // Safe fallback
      }
    }
  }, [validBusinesses]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || validBusinesses.length === 0) return;
    const bounds: [number, number][] = validBusinesses.map((b) => [b.latitude, b.longitude]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-gray-800 bg-[#0B0B0B] shadow-2xl">
      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Info pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-gray-800 text-xs shadow-lg text-white font-medium">
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {selectedCity}, {selectedState}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-purple-300 font-bold">{validBusinesses.length} empresas mapeadas</span>
        </div>

        {/* Right: Map style & Recenter buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFitBounds}
            title="Ajustar visualização em todas as empresas"
            className="p-2 rounded-xl bg-black/80 hover:bg-zinc-900 backdrop-blur-md border border-gray-800 text-gray-300 hover:text-white transition shadow-lg flex items-center gap-1.5 text-xs font-semibold"
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Centralizar</span>
          </button>

          <button
            type="button"
            onClick={() => setMapTheme((prev) => (prev === 'dark' ? 'standard' : 'dark'))}
            title="Alternar estilo do mapa"
            className="p-2 rounded-xl bg-black/80 hover:bg-zinc-900 backdrop-blur-md border border-gray-800 text-gray-300 hover:text-white transition shadow-lg flex items-center gap-1.5 text-xs font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{mapTheme === 'dark' ? 'Modo Escuro' : 'Modo Padrão'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-auto flex items-center gap-3 px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-gray-800 text-[11px] text-gray-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.8)]" />
          <span className="font-semibold text-purple-300">Sem Site (Oportunidade)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
          <span className="font-semibold text-blue-300">Com Site</span>
        </div>
      </div>

      {/* Interactive Detail Popup Card when a Pin is Clicked */}
      {activeBiz && (
        <div className="absolute top-14 right-3 z-20 w-80 max-w-[calc(100%-24px)] rounded-2xl bg-[#0F0F14]/95 backdrop-blur-xl border border-gray-800 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              {!activeBiz.has_website ? (
                <Badge variant="purple" className="text-[10px] font-bold">
                  ⚡ SEM SITE IDENTIFICADO
                </Badge>
              ) : (
                <Badge variant="blue" className="text-[10px]">
                  🌐 SITE ENCONTRADO
                </Badge>
              )}
            </div>
            <button
              onClick={() => setActiveBiz(null)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white leading-snug mb-1">{activeBiz.name}</h4>

          {activeBiz.rating && (
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{activeBiz.rating}</span>
              <span className="text-[10px] text-gray-500 font-normal">
                ({activeBiz.user_ratings_total || activeBiz.reviews_count || 0} avaliações)
              </span>
            </div>
          )}

          <div className="space-y-1.5 text-xs text-gray-400 mb-4">
            {activeBiz.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{activeBiz.address}</span>
              </div>
            )}
            {activeBiz.phone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{activeBiz.phone}</span>
              </div>
            )}
            {activeBiz.website_url && (
              <div className="flex items-center gap-2 text-blue-400 truncate">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={activeBiz.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate hover:underline"
                >
                  {activeBiz.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Actions inside Map Card */}
          <div className="space-y-2 pt-3 border-t border-gray-800/80">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSaveLead(activeBiz)}
                disabled={savedLeadIds[activeBiz.name]}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 border ${
                  savedLeadIds[activeBiz.name]
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-gray-200'
                }`}
              >
                {savedLeadIds[activeBiz.name] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span className="truncate">{savedLeadIds[activeBiz.name] ? 'Salvo' : 'Salvar Lead'}</span>
              </button>

              <button
                onClick={() => onGenerateProposal(activeBiz)}
                className="py-2 px-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 text-purple-300 text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Proposta</span>
              </button>
            </div>

            <button
              onClick={() => onCreateSite(activeBiz)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(124,58,237,0.4)] transition flex items-center justify-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>CRIAR SITE PARA ESTA EMPRESA</span>
            </button>
          </div>
        </div>
      )}
      {/* Dynamic Keyframes for Pulsating Markers */}
      <style>{`
        @keyframes mapPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          70% {
            transform: scale(1.1);
            opacity: 0.5;
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
          }
        }
      `}</style>
    </div>
  );
};
