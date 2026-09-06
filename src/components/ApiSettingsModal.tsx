import React, { useState } from 'react';
import {
  Settings,
  X,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Language, GoogleMapsConfig } from '../types';
import { translations } from '../translations';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  mapsConfig?: GoogleMapsConfig;
  config?: GoogleMapsConfig;
  onSaveConfig: (newConfig: GoogleMapsConfig) => void;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  mapsConfig,
  config,
  onSaveConfig,
  triggerAudio
}) => {
  const activeConfig = mapsConfig || config || {
    apiKey: '',
    isLoaded: false,
    loadError: null,
    useLiveMap: false
  };

  const [inputKey, setInputKey] = useState<string>(activeConfig.apiKey || '');
  const [useLiveMap, setUseLiveMap] = useState<boolean>(Boolean(activeConfig.useLiveMap));
  const [showSavedNotification, setShowSavedNotification] = useState<boolean>(false);

  // Sync state whenever modal opens or props change
  React.useEffect(() => {
    if (isOpen) {
      setInputKey(activeConfig.apiKey || '');
      setUseLiveMap(Boolean(activeConfig.useLiveMap));
    }
  }, [isOpen, activeConfig.apiKey, activeConfig.useLiveMap]);

  if (!isOpen) return null;

  const t = translations[language];

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerAudio('success');
    const trimmed = inputKey.trim();
    onSaveConfig({
      apiKey: trimmed,
      isLoaded: false,
      loadError: null,
      useLiveMap: trimmed.length > 0 ? useLiveMap : false
    });
    try {
      if (trimmed) {
        localStorage.setItem('google_maps_api_key', trimmed);
      } else {
        localStorage.removeItem('google_maps_api_key');
      }
    } catch {
      // Storage access exception safe
    }
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    triggerAudio('click');
    setInputKey('');
    setUseLiveMap(false);
    onSaveConfig({
      apiKey: '',
      isLoaded: false,
      loadError: null,
      useLiveMap: false
    });
    try {
      localStorage.removeItem('google_maps_api_key');
    } catch {
      // safe
    }
  };

  const handleLoadDemoKey = () => {
    triggerAudio('click');
    // Common public demo key pattern for prototyping Google Maps Platform
    const demoKey = 'AIzaSyDemoMapsPlatformKeyRajCabPrototype2026';
    setInputKey(demoKey);
    setUseLiveMap(true);
  };

  const isConfigured = Boolean(mapsConfig.apiKey && mapsConfig.apiKey.length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.apiSettingsTitle}</span>
              </h3>
              <p className="text-xs text-zinc-400">{t.apiSettingsSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="my-4">
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isConfigured && mapsConfig.useLiveMap
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isConfigured && mapsConfig.useLiveMap ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              <div>
                <span className="font-semibold block text-white">
                  {isConfigured && mapsConfig.useLiveMap ? t.keyActiveStatus : t.keyInactiveStatus}
                </span>
                <span className="text-[11px] opacity-80">
                  {isConfigured && mapsConfig.useLiveMap
                    ? 'Dynamic Places Autocomplete and Routes Service active'
                    : 'Interactive dark vector simulation active with GPS coordinates'}
                </span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isConfigured && mapsConfig.useLiveMap
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {isConfigured && mapsConfig.useLiveMap ? 'LIVE' : 'VECTOR'}
            </span>
          </div>
        </div>

        {/* API Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.apiKeyLabel}</span>
              </span>
              {inputKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                >
                  {t.clearApiKey}
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none placeholder:text-zinc-600 shadow-inner"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">{t.googleMapsDocsNote}</p>
          </div>

          {/* Toggle Live Mode vs Vector Fallback */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="pr-3">
              <span className="text-xs font-bold text-white block">{t.useLiveGoogleMap}</span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Renders real Google Map satellite/dark tiles, Places autocomplete, and dynamic route polylines.
              </span>
            </div>
            <input
              type="checkbox"
              id="toggle-live-map-chk"
              checked={useLiveMap}
              onChange={(e) => setUseLiveMap(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Helper Links & Demo Key info */}
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Need an API key?</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>Maps Demo Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-300 hover:text-white font-semibold flex items-center gap-1"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-zinc-500">
              If left blank, Raj Cab automatically falls back to the interactive dark vector map simulation.
            </p>
          </div>

          {showSavedNotification && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings applied successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 gap-3">
            <button
              type="button"
              onClick={handleLoadDemoKey}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.loadDemoKey}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-transform active:scale-95"
              >
                {t.saveApiKey}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
