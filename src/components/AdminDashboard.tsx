import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Save,
  Check,
  Ban,
  Activity,
  Award
} from 'lucide-react';
import { Language, DriverInfo, FareSettings, RideStatus } from '../types';
import { translations } from '../translations';

interface AdminDashboardProps {
  language: Language;
  rideStatus: RideStatus;
  driverOnline: boolean;
  driverEarnings: number;
  driverTrips: number;
  fareSettings: FareSettings;
  setFareSettings: React.Dispatch<React.SetStateAction<FareSettings>>;
  driversList: DriverInfo[];
  setDriversList: React.Dispatch<React.SetStateAction<DriverInfo[]>>;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  rideStatus,
  driverOnline,
  driverEarnings,
  driverTrips,
  fareSettings,
  setFareSettings,
  driversList,
  setDriversList,
  triggerAudio
}) => {
  const t = translations[language];

  // Local draft state for fare inputs
  const [localFares, setLocalFares] = useState<FareSettings>({ ...fareSettings });
  const [saveBanner, setSaveBanner] = useState<boolean>(false);

  // Active rides dynamic computation
  const activeRidesCount = rideStatus === 'searching' || rideStatus === 'driver_arrived' || rideStatus === 'in_transit' ? 1 : 0;
  const onlineDriversCount = driversList.filter((d) => d.status === 'verified').length + (driverOnline ? 0 : -1);

  // Platform total revenue (15% platform commission cut from trips)
  const totalPlatformCut = Math.round((driverEarnings * fareSettings.platformCommissionPercent) / 100);

  const handleSaveFares = (e: React.FormEvent) => {
    e.preventDefault();
    setFareSettings({ ...localFares });
    triggerAudio('success');
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3000);
  };

  const handleToggleDriverStatus = (id: string, newStatus: 'verified' | 'pending' | 'suspended') => {
    triggerAudio('click');
    setDriversList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {t.adminTitle}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{t.adminSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 self-start md:self-auto">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{t.systemHealth}</span>
        </div>
      </div>

      {/* Save alert */}
      {saveBanner && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.fareUpdatedAlert}</span>
        </div>
      )}

      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Rides */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">{t.metricActiveRides}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{activeRidesCount}</div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Status: <span className="text-amber-400 font-medium capitalize">{rideStatus.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Online Drivers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">{t.metricOnlineDrivers}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {Math.max(1, onlineDriversCount)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Main Partner Ramesh: {driverOnline ? <span className="text-emerald-400 font-medium">Online</span> : <span className="text-red-400 font-medium">Offline</span>}
            </p>
          </div>
        </div>

        {/* Metric 3: Platform Revenue (15% Cut) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">{t.metricRevenue}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-300 font-mono">
              ₹{totalPlatformCut}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {fareSettings.platformCommissionPercent}% {t.metricCommissionNote}
            </p>
          </div>
        </div>

        {/* Metric 4: Completed Trips */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">{t.metricCompletedRides}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{driverTrips}</div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Gross Fare Volume: <span className="text-zinc-300 font-mono font-medium">₹{driverEarnings}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Fare Management Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.fareManagement}</h3>
              <p className="text-xs text-zinc-400">{t.fareSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalFares({
                miniBase: 50,
                miniPerKm: 12,
                sedanBase: 70,
                sedanPerKm: 16,
                suvBase: 110,
                suvPerKm: 22,
                platformCommissionPercent: 15,
                taxPercent: 5
              });
              triggerAudio('click');
            }}
            className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        <form onSubmit={handleSaveFares} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mini */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Raj Mini</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Hatchback</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{t.baseRate} (₹)</label>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    value={localFares.miniBase}
                    onChange={(e) => setLocalFares({ ...localFares, miniBase: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{t.perKmRate} (₹/km)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={localFares.miniPerKm}
                    onChange={(e) => setLocalFares({ ...localFares, miniPerKm: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Prime Sedan */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-amber-500/30 space-y-3 relative">
              <span className="absolute -top-2 right-3 text-[9px] font-bold bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full">
                POPULAR
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Prime Sedan</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono">Dzire/Etios</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{t.baseRate} (₹)</label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={localFares.sedanBase}
                    onChange={(e) => setLocalFares({ ...localFares, sedanBase: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{t.perKmRate} (₹/km)</label>
                  <input
                    type="number"
                    min="8"
                    max="60"
                    value={localFares.sedanPerKm}
                    onChange={(e) => setLocalFares({ ...localFares, sedanPerKm: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Raj SUV */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Raj SUV</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">6-Seater</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{t.baseRate} (₹)</label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={localFares.suvBase}
                    onChange={(e) => setLocalFares({ ...localFares, suvBase: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{t.perKmRate} (₹/km)</label>
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={localFares.suvPerKm}
                    onChange={(e) => setLocalFares({ ...localFares, suvPerKm: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 whitespace-nowrap">{t.commissionCut}:</label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={localFares.platformCommissionPercent}
                  onChange={(e) => setLocalFares({ ...localFares, platformCommissionPercent: Number(e.target.value) })}
                  className="w-20 bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                />
                <span className="text-xs text-zinc-500">%</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.updateFareBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Driver Verification & KYC Management Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.driverManagement}</h3>
              <p className="text-xs text-zinc-400">{t.driverTableSubtitle}</p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {driversList.length} Partners Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3 rounded-l-xl">{t.colDriverName}</th>
                <th className="p-3">{t.colContact}</th>
                <th className="p-3">{t.colRatingTrips}</th>
                <th className="p-3">{t.colStatus}</th>
                <th className="p-3 text-right rounded-r-xl">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {driversList.map((driver) => {
                return (
                  <tr key={driver.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{driver.name}</div>
                      <div className="text-[11px] text-zinc-400">{driver.vehicle}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-zinc-200">{driver.plate}</div>
                      <div className="text-[11px] text-zinc-500">{driver.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <span>★ {driver.rating}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">{driver.trips} trips completed</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          driver.status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : driver.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {driver.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                        {driver.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                        {driver.status === 'suspended' && <Ban className="w-3 h-3" />}
                        <span>
                          {driver.status === 'verified'
                            ? t.statusVerified
                            : driver.status === 'pending'
                            ? t.statusPending
                            : t.statusSuspended}
                        </span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {driver.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleToggleDriverStatus(driver.id, 'verified')}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-[11px] shadow-sm transition-all"
                        >
                          {t.btnApprove}
                        </button>
                      )}
                      {driver.status === 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleToggleDriverStatus(driver.id, 'suspended')}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-zinc-700 font-semibold rounded-lg text-[11px] transition-all"
                        >
                          {t.btnSuspend}
                        </button>
                      )}
                      {driver.status === 'suspended' && (
                        <button
                          type="button"
                          onClick={() => handleToggleDriverStatus(driver.id, 'verified')}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-[11px] transition-all"
                        >
                          {t.btnReactivate}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
