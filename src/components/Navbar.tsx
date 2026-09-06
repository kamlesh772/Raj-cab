import React from 'react';
import {
  Car,
  User,
  Columns,
  ShieldCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe,
  Settings,
  Bell
} from 'lucide-react';
import { RideStatus, ViewMode, Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  rideStatus: RideStatus;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  handleResetRide: () => void;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
  hasActiveApiKey?: boolean;
  unreadNotificationCount?: number;
  onOpenApiSettings: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  language,
  setLanguage,
  rideStatus,
  soundEnabled,
  setSoundEnabled,
  handleResetRide,
  triggerAudio,
  hasActiveApiKey = false,
  unreadNotificationCount = 0,
  onOpenApiSettings,
  onOpenNotifications
}) => {
  const t = translations[language];

  // Localized Status Badge Info
  const getStatusBadge = () => {
    switch (rideStatus) {
      case 'idle':
        return { label: t.statusIdle, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
      case 'searching':
        return { label: t.statusSearching, color: 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' };
      case 'driver_arrived':
        return { label: t.statusDriverArrived, color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' };
      case 'in_transit':
        return { label: t.statusInTransit, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'completed':
        return { label: t.statusCompleted, color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand with Gold/Amber Taxi Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 font-black shadow-lg shadow-amber-500/20 border border-amber-300">
            <Car className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border-2 border-zinc-950"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                {t.brandName}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                ROYAL
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">{t.brandTagline}</p>
          </div>
        </div>

        {/* View Switcher: Customer / Driver / Split / Admin */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner overflow-x-auto">
          <button
            id="nav-customer-tab"
            onClick={() => {
              triggerAudio('click');
              setViewMode('customer');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'customer'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.customerApp}</span>
          </button>
          <button
            id="nav-driver-tab"
            onClick={() => {
              triggerAudio('click');
              setViewMode('driver');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'driver'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{t.driverApp}</span>
          </button>
          <button
            id="nav-split-tab"
            onClick={() => {
              triggerAudio('click');
              setViewMode('split');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'split'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{t.splitScreen}</span>
          </button>
          <button
            id="nav-admin-tab"
            onClick={() => {
              triggerAudio('click');
              setViewMode('admin');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'admin'
                ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.adminDashboard}</span>
          </button>
        </div>

        {/* Right Tools: Language Toggle (EN | HI) + Ride Status Pill + Sound + Reset */}
        <div className="flex items-center gap-2">
          {/* Accessible Language Switcher */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              id="lang-btn-en"
              onClick={() => {
                triggerAudio('click');
                setLanguage('en');
              }}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                language === 'en'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              id="lang-btn-hi"
              onClick={() => {
                triggerAudio('click');
                setLanguage('hi');
              }}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                language === 'hi'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="हिन्दी में बदलें"
            >
              हिन्दी
            </button>
          </div>

          {/* FCM Push Notification Simulator Bell */}
          <button
            id="fcm-notifications-bell"
            onClick={() => {
              triggerAudio('click');
              onOpenNotifications();
            }}
            title="Push Notifications"
            className="relative p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white font-bold text-[9px] border-2 border-zinc-950 animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Real Google Maps API Settings Gear */}
          <button
            id="maps-api-settings-btn"
            onClick={() => {
              triggerAudio('click');
              onOpenApiSettings();
            }}
            title={hasActiveApiKey ? 'Google Maps API: Connected' : 'Configure Google Maps API Key'}
            className="relative p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-zinc-300" />
            {hasActiveApiKey && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-zinc-950"></span>
            )}
          </button>

          {/* Ride Status Pill */}
          <div
            id="ride-status-pill"
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{statusBadge.label}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Simulation Reset */}
          <button
            id="reset-ride-btn"
            onClick={handleResetRide}
            title="Reset Simulation State"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
