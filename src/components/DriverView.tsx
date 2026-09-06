import React from 'react';
import {
  Car,
  TrendingUp,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Power,
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RideStatus, CabOption, Language } from '../types';
import { translations } from '../translations';

interface DriverViewProps {
  language: Language;
  driverOnline: boolean;
  setDriverOnline: (v: boolean) => void;
  driverEarnings: number;
  driverTrips: number;
  rideStatus: RideStatus;
  pickup: string;
  drop: string;
  selectedCab: CabOption;
  offerCountdown: number;
  handleDriverAccept: () => void;
  handleDriverDecline: () => void;
  driverEnteredOtp: string;
  setDriverEnteredOtp: (v: string) => void;
  handleVerifyOtpAndStart: (code?: string) => void;
  otpError: string | null;
  tripProgress: number;
  inTransitSpeed: number;
  setInTransitSpeed: (v: number) => void;
  handleCompleteTrip: () => void;
  handleResetRide: () => void;
  startOtp: string;
  currentKmRemaining: string;
  currentMinsRemaining: number;
  setActiveCall: (v: 'customer_to_driver' | 'driver_to_customer' | null) => void;
  setActiveChat: (v: 'customer' | 'driver' | null) => void;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
}

export const DriverView: React.FC<DriverViewProps> = ({
  language,
  driverOnline,
  setDriverOnline,
  driverEarnings,
  driverTrips,
  rideStatus,
  pickup,
  drop,
  selectedCab,
  offerCountdown,
  handleDriverAccept,
  handleDriverDecline,
  driverEnteredOtp,
  setDriverEnteredOtp,
  handleVerifyOtpAndStart,
  otpError,
  tripProgress,
  inTransitSpeed,
  setInTransitSpeed,
  handleCompleteTrip,
  handleResetRide,
  startOtp,
  currentKmRemaining,
  currentMinsRemaining,
  setActiveCall,
  setActiveChat,
  triggerAudio
}) => {
  const t = translations[language];

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* 1. DRIVER PROFILE & DAILY EARNINGS BAR */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Ramesh Patel</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  TOP PARTNER
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">White Dzire • RJ 09 AB 4521</p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            id="driver-duty-toggle"
            type="button"
            onClick={() => {
              triggerAudio('click');
              setDriverOnline(!driverOnline);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              driverOnline
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{driverOnline ? t.onlineStatus : t.offlineStatus}</span>
          </button>
        </div>

        {/* Daily Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
          <div className="p-2.5 bg-zinc-900 rounded-xl">
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">{t.totalEarnings}</span>
            <span className="text-lg font-black text-emerald-400 font-mono">₹{driverEarnings}</span>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded-xl">
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">{t.completedTrips}</span>
            <span className="text-lg font-black text-white font-mono">{driverTrips}</span>
          </div>
        </div>
      </div>

      {/* Offline Notice */}
      {!driverOnline && (
        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t.offlineStatus}</h4>
            <p className="text-xs text-zinc-400 mt-1">{t.driverOfflineNotice}</p>
          </div>
          <button
            onClick={() => {
              triggerAudio('click');
              setDriverOnline(true);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl"
          >
            {t.toggleGoOnline}
          </button>
        </div>
      )}

      {/* 2. ONLINE & IDLE STATE */}
      {driverOnline && rideStatus === 'idle' && (
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-3">
          <div className="relative w-14 h-14 mx-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
            <div className="relative w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t.driverDutyReady}</h4>
            <p className="text-xs text-zinc-500 mt-1">High demand zone: Civil Lines & Airport corridor</p>
          </div>
        </div>
      )}

      {/* 3. INCOMING RIDE OFFER ALERT WITH COUNTDOWN */}
      {driverOnline && rideStatus === 'searching' && (
        <div className="bg-zinc-950 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>{t.incomingRequest}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold text-xs rounded-lg border border-amber-500/40">
              <Clock className="w-3.5 h-3.5" />
              <span>{offerCountdown}s</span>
            </div>
          </div>

          {/* Fare & Passenger Details */}
          <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-medium">{t.fareEstimate}</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">₹{selectedCab.fare}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white block">Aarav Sharma</span>
              <span className="text-[10px] text-amber-400 font-medium">★ 4.85 (142 rides)</span>
            </div>
          </div>

          {/* Route details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-zinc-400">Pickup:</span>
              <span className="text-white font-medium truncate">{pickup}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-zinc-400">Drop:</span>
              <span className="text-white font-medium truncate">{drop}</span>
            </div>
          </div>

          {/* Accept / Decline Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              id="driver-decline-btn"
              onClick={handleDriverDecline}
              className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            >
              {t.declineRide}
            </button>
            <button
              id="driver-accept-btn"
              onClick={handleDriverAccept}
              className="py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
            >
              {t.acceptRide} (₹{selectedCab.fare})
            </button>
          </div>
        </div>
      )}

      {/* 4. DRIVER ARRIVED / OTP VERIFICATION SCREEN */}
      {driverOnline && rideStatus === 'driver_arrived' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h4 className="text-sm font-bold text-white">Arrived at Pickup Location</h4>
              <p className="text-xs text-zinc-400">{pickup}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCall('driver_to_customer')}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveChat('driver')}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* OTP Input Form */}
          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
            <div>
              <label className="text-xs font-bold text-amber-400 block mb-1">
                {t.enterOtpPrompt}
              </label>
              <p className="text-[11px] text-zinc-400">{t.otpInstruction}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={driverEnteredOtp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDriverEnteredOtp(val);
                }}
                placeholder="5821"
                className="w-36 bg-zinc-950 border-2 border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-white tracking-widest focus:outline-none"
              />

              {/* Quick Fill Helper */}
              <button
                type="button"
                onClick={() => {
                  setDriverEnteredOtp(startOtp);
                  handleVerifyOtpAndStart(startOtp);
                }}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.autoFillOtp}
              </button>
            </div>

            {otpError && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{otpError}</span>
              </div>
            )}
          </div>

          <button
            id="driver-start-ride-btn"
            onClick={() => handleVerifyOtpAndStart()}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>{t.startRideBtn}</span>
          </button>
        </div>
      )}

      {/* 5. IN-TRANSIT NAVIGATION SCREEN */}
      {driverOnline && rideStatus === 'in_transit' && (
        <div className="space-y-4">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">{t.inTransitNav}</span>
                <h4 className="text-sm font-bold text-white">Continue straight onto Tonk Road</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-amber-400">{inTransitSpeed}</span>
                <span className="text-[10px] text-zinc-500 block">km/h</span>
              </div>
            </div>

            {/* Destination summary */}
            <div className="p-2.5 bg-zinc-900 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Destination</span>
                <span className="text-zinc-200 font-medium truncate max-w-[180px]">{drop}</span>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-bold">{currentKmRemaining} km</span>
                <span className="text-[10px] text-zinc-500 block">~{currentMinsRemaining} mins</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${tripProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>En Route</span>
                <span>{Math.round(tripProgress)}% completed</span>
              </div>
            </div>
          </div>

          {/* Action: Complete Trip */}
          <button
            id="driver-complete-trip-btn"
            onClick={handleCompleteTrip}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>{t.completeTripBtn} (₹{selectedCab.fare})</span>
          </button>
        </div>
      )}

      {/* 6. TRIP SETTLED SCREEN */}
      {driverOnline && rideStatus === 'completed' && (
        <div className="space-y-4">
          <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">{t.cashSettledNotice}</h4>
            <p className="text-xs text-zinc-400">
              ₹{selectedCab.fare} credited to your daily balance. Total today: ₹{driverEarnings}.
            </p>
          </div>

          <button
            onClick={handleResetRide}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-colors"
          >
            Ready for Next Passenger
          </button>
        </div>
      )}
    </div>
  );
};
