import React from 'react';
import {
  MapPin,
  Navigation,
  Shield,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Star,
  Car,
  Clock,
  ArrowRight,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { RideStatus, CabOption, Language, GoogleMapsConfig } from '../types';
import { translations } from '../translations';
import { GoogleMapView } from './GoogleMapView';

interface CustomerViewProps {
  language: Language;
  rideStatus: RideStatus;
  pickup: string;
  setPickup: (v: string) => void;
  drop: string;
  setDrop: (v: string) => void;
  cabs: CabOption[];
  selectedCab: CabOption;
  selectedCabId: 'mini' | 'sedan' | 'suv';
  setSelectedCabId: (id: 'mini' | 'sedan' | 'suv') => void;
  handleCustomerBookRide: () => void;
  handleResetRide: () => void;
  startOtp: string;
  copiedOtp: boolean;
  handleCopyOtp: () => void;
  tripProgress: number;
  currentKmRemaining: string;
  currentMinsRemaining: number;
  setShowSosModal: (v: boolean) => void;
  setActiveCall: (v: 'customer_to_driver' | 'driver_to_customer' | null) => void;
  setActiveChat: (v: 'customer' | 'driver' | null) => void;
  carPos: { x: number; y: number; rot: number };
  pX: number;
  pY: number;
  dX: number;
  dY: number;
  ratingStars: number;
  setRatingStars: (n: number) => void;
  selectedTip: number;
  setSelectedTip: (n: number) => void;
  tipGiven: boolean;
  setTipGiven: (v: boolean) => void;
  onOpenPaymentModal: () => void;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
  mapsConfig: GoogleMapsConfig;
  onOpenSettings: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  language,
  rideStatus,
  pickup,
  setPickup,
  drop,
  setDrop,
  cabs,
  selectedCab,
  selectedCabId,
  setSelectedCabId,
  handleCustomerBookRide,
  handleResetRide,
  startOtp,
  copiedOtp,
  handleCopyOtp,
  tripProgress,
  currentKmRemaining,
  currentMinsRemaining,
  setShowSosModal,
  setActiveCall,
  setActiveChat,
  carPos,
  pX,
  pY,
  dX,
  dY,
  ratingStars,
  setRatingStars,
  selectedTip,
  setSelectedTip,
  tipGiven,
  setTipGiven,
  onOpenPaymentModal,
  triggerAudio,
  mapsConfig,
  onOpenSettings
}) => {
  const t = translations[language];

  const quickDestinations = [
    { name: t.railwayStation, address: 'Jaipur Junction, Station Road', distance: '4.2 km' },
    { name: t.cityCenterMall, address: 'MI Road, C-Scheme', distance: '3.1 km' },
    { name: t.airportTerminal, address: 'Airport Terminal 2, Sanganer', distance: '11.8 km' }
  ];

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* 1. INTERACTIVE GOOGLE MAPS / VECTOR GPS MAP */}
      <GoogleMapView
        language={language}
        rideStatus={rideStatus}
        pickup={pickup}
        drop={drop}
        mapsConfig={mapsConfig}
        onOpenSettings={onOpenSettings}
        setShowSosModal={setShowSosModal}
        tripProgress={tripProgress}
        currentKmRemaining={currentKmRemaining}
        currentMinsRemaining={currentMinsRemaining}
        carPos={carPos}
        pX={pX}
        pY={pY}
        dX={dX}
        dY={dY}
      />

      {/* 2. PICKUP & DROP INPUT CARDS + QUICK DESTINATION CHIPS */}
      {rideStatus === 'idle' && (
        <div className="space-y-3">
          {/* Pickup & Drop Inputs */}
          <div className="bg-zinc-950 p-3 sm:p-4 rounded-2xl border border-zinc-800 space-y-2.5">
            {/* Pickup */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-400 block font-semibold uppercase">{t.pickupLocation}</label>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-200 font-medium focus:outline-none placeholder-zinc-600"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800/80"></div>

            {/* Drop */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-400 block font-semibold uppercase">{t.dropLocation}</label>
                <input
                  type="text"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-200 font-medium focus:outline-none placeholder-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Quick Destination Chips */}
          <div>
            <span className="text-[11px] text-zinc-400 font-semibold block mb-1.5">{t.quickDestinations}:</span>
            <div className="flex flex-wrap gap-2">
              {quickDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => {
                    triggerAudio('click');
                    setDrop(dest.address);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    drop === dest.address
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{dest.name}</span>
                  <span className="text-[10px] opacity-75">({dest.distance})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. CAB SELECTOR */}
          <div>
            <span className="text-xs font-bold text-white block mb-2">{t.chooseCab}:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {cabs.map((cab) => {
                const isSelected = selectedCabId === cab.id;
                return (
                  <button
                    key={cab.id}
                    onClick={() => {
                      triggerAudio('click');
                      setSelectedCabId(cab.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {cab.badgeNameEn && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {language === 'hi' ? cab.badgeNameHi : cab.badgeNameEn}
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Car className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                        <span className="text-xs font-bold text-white">
                          {language === 'hi' ? cab.nameHi : cab.nameEn}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                        {language === 'hi' ? cab.descHi : cab.descEn}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <span className="text-sm font-black text-emerald-400 font-mono">₹{cab.fare}</span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{language === 'hi' ? cab.etaHi : cab.etaEn}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Book Raj Cab Action Button */}
          <button
            id="book-cab-btn"
            onClick={handleCustomerBookRide}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Car className="w-4 h-4 stroke-[2.5]" />
            <span>{t.bookRide} • ₹{selectedCab.fare}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. SEARCHING RADAR STATE */}
      {rideStatus === 'searching' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
            <div className="relative w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400">
              <Car className="w-8 h-8 animate-bounce" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t.searchingRadar}</h4>
            <p className="text-xs text-zinc-400 mt-1">{t.radarHint}</p>
          </div>
          <div className="text-[11px] text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800/80 inline-block">
            Vehicle requested: <span className="text-amber-400 font-semibold">{selectedCab.nameEn} (₹{selectedCab.fare})</span>
          </div>
        </div>
      )}

      {/* 5. DRIVER ARRIVED / OTP SHARING STATE */}
      {(rideStatus === 'driver_arrived' || rideStatus === 'in_transit') && (
        <div className="space-y-3">
          {/* Driver Card */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/30">
                  RP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Ramesh Patel</h4>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> 4.9
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{t.carDetails}</p>
                </div>
              </div>

              {/* Call & Chat buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerAudio('click');
                    setActiveCall('customer_to_driver');
                  }}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 transition-colors"
                  title={t.callDriver}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    triggerAudio('click');
                    setActiveChat('customer');
                  }}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-colors"
                  title={t.chatDriver}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OTP Banner */}
            {rideStatus === 'driver_arrived' && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-300 block font-semibold">{t.startOtpLabel}</span>
                  <div className="text-xl font-black text-amber-400 font-mono tracking-widest">{startOtp}</div>
                </div>
                <button
                  onClick={handleCopyOtp}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOtp ? t.otpCopied : t.copyOtp}</span>
                </button>
              </div>
            )}

            {/* In Transit Details */}
            {rideStatus === 'in_transit' && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{t.distanceRemaining}:</span>
                  <span className="text-amber-400 font-bold font-mono">{currentKmRemaining} km</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{t.etaRemaining}:</span>
                  <span className="text-white font-medium">~{currentMinsRemaining} mins</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${tripProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. COMPLETED SCREEN & RATING */}
      {rideStatus === 'completed' && (
        <div className="space-y-3">
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-white">Ride Completed!</h3>
            <p className="text-xs text-zinc-400">Total fare: ₹{selectedCab.fare}</p>
          </div>

          {/* Button to re-open UPI/Cash payment modal */}
          <button
            onClick={onOpenPaymentModal}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
          >
            <span>View UPI / Cash Invoice & Receipt</span>
          </button>

          {/* Rating */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center space-y-2.5">
            <span className="text-xs text-zinc-400 font-medium">{t.rateDriver}</span>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    triggerAudio('click');
                    setRatingStars(star);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Tip Driver */}
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block mb-1.5">{t.addTip}</span>
              <div className="flex justify-center gap-2">
                {[20, 30, 50].map((amount) => (
                  <button
                    key={amount}
                    disabled={tipGiven}
                    onClick={() => {
                      triggerAudio('success');
                      setSelectedTip(amount);
                      setTipGiven(true);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      tipGiven && selectedTip === amount
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-500/50'
                    }`}
                  >
                    +₹{amount} {tipGiven && selectedTip === amount && '✓'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleResetRide}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
          >
            {t.bookAnother}
          </button>
        </div>
      )}
    </div>
  );
};
