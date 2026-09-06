import React, { useState, useEffect } from 'react';
import {
  Car,
  User,
  ShieldAlert,
  Phone,
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  RideStatus,
  Language,
  ViewMode,
  CabOption,
  FareSettings,
  DriverInfo,
  PaymentMethod,
  GoogleMapsConfig,
  ChatMessage,
  FCMNotification
} from './types';
import { translations } from './translations';
import { playSystemTone } from './utils/audio';
import { Navbar } from './components/Navbar';
import { CustomerView } from './components/CustomerView';
import { DriverView } from './components/DriverView';
import { PaymentModal } from './components/PaymentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ChatDrawer } from './components/ChatDrawer';
import { NotificationToast } from './components/NotificationToast';
import { NotificationDrawer } from './components/NotificationDrawer';

export const INITIAL_DRIVERS: DriverInfo[] = [
  {
    id: 'd1',
    name: 'Ramesh Patel',
    vehicle: 'White Maruti Dzire (Sedan)',
    plate: 'RJ 09 AB 4521',
    rating: 4.9,
    trips: 1240,
    status: 'verified',
    phone: '+91 98290 12345',
    joinDate: 'March 2023',
    earningsToday: 1450
  },
  {
    id: 'd2',
    name: 'Vikram Singh',
    vehicle: 'Silver WagonR (Mini)',
    plate: 'RJ 14 CZ 8812',
    rating: 4.8,
    trips: 890,
    status: 'verified',
    phone: '+91 94140 76543',
    joinDate: 'July 2023',
    earningsToday: 980
  },
  {
    id: 'd3',
    name: 'Mukesh Sharma',
    vehicle: 'Maruti Ertiga (Raj SUV)',
    plate: 'RJ 14 PA 3390',
    rating: 4.95,
    trips: 1650,
    status: 'verified',
    phone: '+91 98281 99887',
    joinDate: 'Jan 2022',
    earningsToday: 2100
  },
  {
    id: 'd4',
    name: 'Deepak Choudhary',
    vehicle: 'Hyundai Aura (Sedan)',
    plate: 'RJ 14 TA 9011',
    rating: 4.6,
    trips: 410,
    status: 'pending',
    phone: '+91 96020 33445',
    joinDate: 'Yesterday',
    earningsToday: 0
  },
  {
    id: 'd5',
    name: 'Sanjay Meena',
    vehicle: 'Toyota Innova (Raj SUV)',
    plate: 'RJ 14 EA 1102',
    rating: 4.3,
    trips: 215,
    status: 'suspended',
    phone: '+91 97840 55667',
    joinDate: 'Nov 2023',
    earningsToday: 0
  }
];

export const INITIAL_FARES: FareSettings = {
  miniBase: 50,
  miniPerKm: 12,
  sedanBase: 70,
  sedanPerKm: 16,
  suvBase: 110,
  suvPerKm: 22,
  platformCommissionPercent: 15,
  taxPercent: 5
};

export default function App() {
  // 1. App-level settings
  const [language, setLanguage] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 2. Shared Ride State Machine
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [pickup, setPickup] = useState<string>('Civil Lines Metro, Station Road');
  const [drop, setDrop] = useState<string>('Airport Terminal 2, Sanganer');
  const [selectedCabId, setSelectedCabId] = useState<'mini' | 'sedan' | 'suv'>('sedan');
  const [startOtp] = useState<string>('5821');

  // 3. Pricing & Fleet Management State
  const [fareSettings, setFareSettings] = useState<FareSettings>(INITIAL_FARES);
  const [driversList, setDriversList] = useState<DriverInfo[]>(INITIAL_DRIVERS);

  // 4. Driver Specific State
  const [driverOnline, setDriverOnline] = useState<boolean>(true);
  const [driverEarnings, setDriverEarnings] = useState<number>(1450);
  const [driverTrips, setDriverTrips] = useState<number>(6);
  const [offerCountdown, setOfferCountdown] = useState<number>(15);
  const [driverEnteredOtp, setDriverEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // 5. In-Transit Dynamics
  const [tripProgress, setTripProgress] = useState<number>(0);
  const [inTransitSpeed, setInTransitSpeed] = useState<number>(44);
  const [isPausedTransit, setIsPausedTransit] = useState<boolean>(false);

  // 6. Modals & Overlays
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [showApiSettingsModal, setShowApiSettingsModal] = useState<boolean>(false);
  const [activeCall, setActiveCall] = useState<'customer_to_driver' | 'driver_to_customer' | null>(null);

  // 7. Google Maps Config State (Completely optional - defaults to Vector Map Simulation)
  const [mapsConfig, setMapsConfig] = useState<GoogleMapsConfig>(() => {
    let savedKey = '';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        savedKey = localStorage.getItem('google_maps_api_key') || '';
      }
    } catch {
      savedKey = '';
    }
    if (!savedKey) {
      try {
        const meta = import.meta as unknown as { env?: Record<string, string> };
        savedKey = (meta?.env?.VITE_GOOGLE_MAPS_KEY || meta?.env?.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '') as string;
      } catch {
        savedKey = '';
      }
    }
    return {
      apiKey: savedKey || '',
      isLoaded: false,
      loadError: null,
      useLiveMap: Boolean(savedKey && savedKey.trim().length > 5)
    };
  });

  // 8. In-App Real-Time Chat System State
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [chatDrawerRole, setChatDrawerRole] = useState<'customer' | 'driver'>('customer');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init-1',
      sender: 'driver',
      text: 'Namaste Aarav ji! I am heading towards your pickup location.',
      time: 'Just now',
      timestamp: Date.now() - 60000
    }
  ]);

  // 9. FCM Push Notification Simulator State
  const [notifications, setNotifications] = useState<FCMNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Welcome to Raj Cab Central',
      titleHi: 'राज कैब में आपका स्वागत है',
      body: 'Real-time GPS telemetry and cloud sync are online.',
      bodyHi: 'रियल-टाइम जीपीएस टेलीमेट्री और क्लाउड सिंक सक्रिय हैं।',
      type: 'system',
      timestamp: 'Just now',
      read: false,
      recipient: 'all'
    }
  ]);
  const [activeToast, setActiveToast] = useState<FCMNotification | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [selectedTip, setSelectedTip] = useState<number>(30);
  const [tipGiven, setTipGiven] = useState<boolean>(false);

  const t = translations[language];

  // Estimated standard trip distance is 7.2 km (Civil Lines to Airport corridor)
  const tripKm = 7.2;

  // Dynamic cabs options with live fare computation from fareSettings
  const cabs: CabOption[] = [
    {
      id: 'mini',
      nameEn: 'Raj Mini',
      nameHi: 'राज मिनी',
      badgeNameEn: 'Economy',
      badgeNameHi: 'किफायती',
      baseFare: fareSettings.miniBase,
      perKmRate: fareSettings.miniPerKm,
      fare: Math.round(fareSettings.miniBase + fareSettings.miniPerKm * tripKm),
      etaEn: '4 mins away',
      etaHi: '4 मिनट दूर',
      etaMins: 4,
      descEn: 'Compact hatchback for solo or light travels',
      descHi: 'एकल या हल्के सफर के लिए कॉम्पेक्ट हैचबैक',
      seats: '3-4 seats',
      iconType: 'mini'
    },
    {
      id: 'sedan',
      nameEn: 'Prime Sedan',
      nameHi: 'प्राइम सेडान',
      badgeNameEn: 'Popular',
      badgeNameHi: 'पसंदीदा',
      baseFare: fareSettings.sedanBase,
      perKmRate: fareSettings.sedanPerKm,
      fare: Math.round(fareSettings.sedanBase + fareSettings.sedanPerKm * tripKm),
      etaEn: '2 mins away',
      etaHi: '2 मिनट दूर',
      etaMins: 2,
      descEn: 'Roomy sedan with extra legroom & top rated driver',
      descHi: 'अतिरिक्त लेगरूम और उच्च-रेटेड ड्राइवर वाली सेडान',
      seats: '4 seats',
      iconType: 'sedan'
    },
    {
      id: 'suv',
      nameEn: 'Raj SUV',
      nameHi: 'राज एसयूवी',
      badgeNameEn: 'Premium',
      badgeNameHi: 'प्रीमियम',
      baseFare: fareSettings.suvBase,
      perKmRate: fareSettings.suvPerKm,
      fare: Math.round(fareSettings.suvBase + fareSettings.suvPerKm * tripKm),
      etaEn: '6 mins away',
      etaHi: '6 मिनट दूर',
      etaMins: 6,
      descEn: 'Spacious 6-seater Ertiga/Innova with ample boot space',
      descHi: 'विशाल 6-सीटर एर्टिगा/इनोवा पर्याप्त बूट स्पेस के साथ',
      seats: '6 seats',
      iconType: 'suv'
    }
  ];

  const selectedCab = cabs.find((c) => c.id === selectedCabId) || cabs[1];

  // Sound triggering helper
  const triggerAudio = (type: 'ping' | 'success' | 'alert' | 'click') => {
    if (soundEnabled) {
      playSystemTone(type);
    }
  };

  // Map coordinates & car tracking logic
  const pX = 170;
  const pY = 280;
  const dX = 540;
  const dY = 120;

  const calculateCarPosition = () => {
    if (rideStatus === 'idle') {
      return { x: 210, y: 260, rot: -25 };
    }
    if (rideStatus === 'searching') {
      return { x: 230, y: 240, rot: 15 };
    }
    if (rideStatus === 'driver_arrived') {
      return { x: pX + 15, y: pY - 10, rot: -45 };
    }
    if (rideStatus === 'in_transit') {
      const tProgress = Math.min(1, Math.max(0, tripProgress / 100));
      // Quadratic bezier calculation
      const cpX = 360;
      const cpY = 260;
      const x = Math.round((1 - tProgress) * (1 - tProgress) * pX + 2 * (1 - tProgress) * tProgress * cpX + tProgress * tProgress * dX);
      const y = Math.round((1 - tProgress) * (1 - tProgress) * pY + 2 * (1 - tProgress) * tProgress * cpY + tProgress * tProgress * dY);
      return { x, y, rot: -40 };
    }
    return { x: dX, y: dY, rot: -30 };
  };

  const carPos = calculateCarPosition();
  const currentKmRemaining = Math.max(0.2, (tripKm * (1 - tripProgress / 100))).toFixed(1);
  const currentMinsRemaining = Math.max(1, Math.round(14 * (1 - tripProgress / 100)));

  // Countdown timer for driver offer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rideStatus === 'searching' && driverOnline) {
      triggerAudio('alert');
      setOfferCountdown(15);
      timer = setInterval(() => {
        setOfferCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setRideStatus('idle');
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setOfferCountdown(15);
    }
    return () => clearInterval(timer);
  }, [rideStatus, driverOnline]);

  // Trip progress ticker in transit
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rideStatus === 'in_transit' && !isPausedTransit) {
      interval = setInterval(() => {
        setTripProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 1.25;
          if (next >= 100) {
            return 100;
          }
          return next;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [rideStatus, isPausedTransit]);

  // FCM Push Dispatcher helper
  const pushFCMNotification = (
    type: FCMNotification['type'],
    titleEn: string,
    titleHi: string,
    bodyEn: string,
    bodyHi: string,
    recipient: 'customer' | 'driver' | 'all'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: FCMNotification = {
      id: 'notif-' + Date.now(),
      title: titleEn,
      titleHi,
      body: bodyEn,
      bodyHi,
      type,
      timestamp: timeStr,
      read: false,
      recipient
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    triggerAudio('alert');
  };

  // Handlers for state transitions
  const handleCustomerBookRide = () => {
    triggerAudio('ping');
    setRideStatus('searching');
    setTripProgress(0);
    setDriverEnteredOtp('');
    setOtpError(null);

    // Dispatch FCM notification to Driver Fleet
    pushFCMNotification(
      'ride_booked',
      'New Ride Request: Prime Sedan',
      'नई राइड रिक्वेस्ट: प्राइम सेडान',
      'Customer waiting at Civil Lines Metro for Airport Terminal. Estimated fare: ₹185.',
      'सिविल लाइन्स मेट्रो से एयरपोर्ट टर्मिनल के लिए ग्राहक प्रतीक्षारत। अनुमानित किराया: ₹185।',
      'driver'
    );
  };

  const handleDriverAccept = () => {
    triggerAudio('success');
    setRideStatus('driver_arrived');

    // Dispatch FCM notification to Customer
    pushFCMNotification(
      'ride_accepted',
      'Ramesh Patel accepted your ride!',
      'रमेश पटेल ने आपकी राइड स्वीकार कर ली है!',
      'White Maruti Dzire (RJ 09 AB 4521) is arriving in 2 mins. Share start OTP 5821.',
      'सफेद मारुति डिजायर (RJ 09 AB 4521) 2 मिनट में पहुंच रही है। स्टार्ट ओटीपी 5821 बताएं।',
      'customer'
    );
  };

  const handleDriverDecline = () => {
    triggerAudio('click');
    setRideStatus('idle');
  };

  const handleVerifyOtpAndStart = (codeToVerify?: string) => {
    const input = codeToVerify !== undefined ? codeToVerify : driverEnteredOtp;
    if (input.trim() === startOtp) {
      triggerAudio('success');
      setOtpError(null);
      setRideStatus('in_transit');
      setTripProgress(5);

      pushFCMNotification(
        'driver_arrived',
        'Trip Started - Heading to Airport',
        'यात्रा शुरू हो गई है - एयरपोर्ट की ओर',
        'OTP 5821 verified. AC turned on. Enjoy your ride with Raj Cab!',
        'ओटीपी 5821 सत्यापित। एसी चालू है। राज कैब के साथ अपनी सुरक्षित यात्रा का आनंद लें!',
        'customer'
      );
    } else {
      triggerAudio('alert');
      setOtpError('Invalid OTP! Please enter passenger 4-digit code (5821).');
    }
  };

  const handleCompleteTrip = () => {
    triggerAudio('success');
    setRideStatus('completed');
    setTripProgress(100);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (amountPaid: number, method: PaymentMethod) => {
    // Credit driver's daily earnings balance
    setDriverEarnings((prev) => prev + amountPaid);
    setDriverTrips((prev) => prev + 1);

    // Also update Ramesh Patel in the admin driversList
    setDriversList((prev) =>
      prev.map((d) => (d.id === 'd1' ? { ...d, trips: d.trips + 1, earningsToday: d.earningsToday + amountPaid } : d))
    );

    // Dispatch FCM push notification
    pushFCMNotification(
      'payment_received',
      `Payment Received: ₹${amountPaid}`,
      `भुगतान प्राप्त हुआ: ₹${amountPaid}`,
      `₹${amountPaid} settled via ${method.toUpperCase()}. Digital receipt generated.`,
      `₹${amountPaid} का भुगतान ${method.toUpperCase()} द्वारा प्राप्त हुआ। डिजिटल रसीद जारी।`,
      'all'
    );
  };

  const handleResetRide = () => {
    triggerAudio('click');
    setRideStatus('idle');
    setTripProgress(0);
    setDriverEnteredOtp('');
    setOtpError(null);
    setShowPaymentModal(false);
    setShowSosModal(false);
    setActiveCall(null);
    setIsChatDrawerOpen(false);
    setTipGiven(false);
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(startOtp);
    setCopiedOtp(true);
    triggerAudio('click');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleSendMessage = (sender: 'customer' | 'driver', text: string) => {
    if (!text.trim()) return;
    triggerAudio('click');
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* 1. TOP NAVIGATION BAR */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        language={language}
        setLanguage={setLanguage}
        rideStatus={rideStatus}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        handleResetRide={handleResetRide}
        triggerAudio={triggerAudio}
        hasActiveApiKey={Boolean(mapsConfig.apiKey && mapsConfig.useLiveMap)}
        unreadNotificationCount={unreadNotificationCount}
        onOpenApiSettings={() => setShowApiSettingsModal(true)}
        onOpenNotifications={() => {
          setIsNotificationDrawerOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />

      {/* 2. REAL-TIME SYNCHRONIZED SIMULATION HELPER BAR */}
      {viewMode !== 'admin' && (
        <div className="bg-zinc-900/70 border-b border-zinc-800/80 px-4 py-2 text-xs text-zinc-400">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-300 font-semibold">{t.syncActive}</span>
              <span className="hidden sm:inline">{t.syncSubtitle}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-[11px] hidden sm:inline">{t.demoOtp}</span>
              <code className="px-2 py-0.5 bg-zinc-950 text-amber-400 font-mono font-bold rounded-md border border-zinc-800">
                5821
              </code>
              <button
                type="button"
                onClick={() => {
                  if (rideStatus === 'idle') handleCustomerBookRide();
                  else if (rideStatus === 'searching') handleDriverAccept();
                  else if (rideStatus === 'driver_arrived') handleVerifyOtpAndStart('5821');
                  else if (rideStatus === 'in_transit') handleCompleteTrip();
                  else handleResetRide();
                }}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-[11px] transition-colors"
              >
                {rideStatus === 'idle' && t.btnBookNow}
                {rideStatus === 'searching' && t.btnAcceptOffer}
                {rideStatus === 'driver_arrived' && t.btnEnterOtp}
                {rideStatus === 'in_transit' && t.btnCompleteTrip}
                {rideStatus === 'completed' && t.btnNewRide}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN INTERACTIVE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col justify-start">
        {viewMode === 'admin' ? (
          /* Admin Dashboard Tab */
          <AdminDashboard
            language={language}
            rideStatus={rideStatus}
            driverOnline={driverOnline}
            driverEarnings={driverEarnings}
            driverTrips={driverTrips}
            fareSettings={fareSettings}
            setFareSettings={setFareSettings}
            driversList={driversList}
            setDriversList={setDriversList}
            triggerAudio={triggerAudio}
          />
        ) : viewMode === 'split' ? (
          /* Split Screen Simulation Mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Screen: Customer Mode */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative flex flex-col min-h-[680px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-amber-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide">{t.customerTitle}</h2>
                    <p className="text-[11px] text-zinc-400">{t.customerSubtitle}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {t.customerApp}
                </span>
              </div>
              <CustomerView
                language={language}
                rideStatus={rideStatus}
                pickup={pickup}
                setPickup={setPickup}
                drop={drop}
                setDrop={setDrop}
                cabs={cabs}
                selectedCab={selectedCab}
                selectedCabId={selectedCabId}
                setSelectedCabId={setSelectedCabId}
                handleCustomerBookRide={handleCustomerBookRide}
                handleResetRide={handleResetRide}
                startOtp={startOtp}
                copiedOtp={copiedOtp}
                handleCopyOtp={handleCopyOtp}
                tripProgress={tripProgress}
                currentKmRemaining={currentKmRemaining}
                currentMinsRemaining={currentMinsRemaining}
                setShowSosModal={setShowSosModal}
                setActiveCall={setActiveCall}
                setActiveChat={(role) => {
                  if (role) {
                    setChatDrawerRole(role);
                    setIsChatDrawerOpen(true);
                  } else {
                    setIsChatDrawerOpen(false);
                  }
                }}
                carPos={carPos}
                pX={pX}
                pY={pY}
                dX={dX}
                dY={dY}
                ratingStars={ratingStars}
                setRatingStars={setRatingStars}
                selectedTip={selectedTip}
                setSelectedTip={setSelectedTip}
                tipGiven={tipGiven}
                setTipGiven={setTipGiven}
                onOpenPaymentModal={() => setShowPaymentModal(true)}
                triggerAudio={triggerAudio}
                mapsConfig={mapsConfig}
                onOpenSettings={() => setShowApiSettingsModal(true)}
              />
            </div>

            {/* Right Screen: Driver Partner Mode */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative flex flex-col min-h-[680px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide">{t.driverTitle}</h2>
                    <p className="text-[11px] text-zinc-400">{t.driverSubtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      driverOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {driverOnline ? `● ${t.onlineStatus}` : `○ ${t.offlineStatus}`}
                  </span>
                </div>
              </div>
              <DriverView
                language={language}
                driverOnline={driverOnline}
                setDriverOnline={setDriverOnline}
                driverEarnings={driverEarnings}
                driverTrips={driverTrips}
                rideStatus={rideStatus}
                pickup={pickup}
                drop={drop}
                selectedCab={selectedCab}
                offerCountdown={offerCountdown}
                handleDriverAccept={handleDriverAccept}
                handleDriverDecline={handleDriverDecline}
                driverEnteredOtp={driverEnteredOtp}
                setDriverEnteredOtp={setDriverEnteredOtp}
                handleVerifyOtpAndStart={handleVerifyOtpAndStart}
                otpError={otpError}
                tripProgress={tripProgress}
                inTransitSpeed={inTransitSpeed}
                setInTransitSpeed={setInTransitSpeed}
                handleCompleteTrip={handleCompleteTrip}
                handleResetRide={handleResetRide}
                startOtp={startOtp}
                currentKmRemaining={currentKmRemaining}
                currentMinsRemaining={currentMinsRemaining}
                setActiveCall={setActiveCall}
                setActiveChat={(role) => {
                  if (role) {
                    setChatDrawerRole(role);
                    setIsChatDrawerOpen(true);
                  } else {
                    setIsChatDrawerOpen(false);
                  }
                }}
                triggerAudio={triggerAudio}
              />
            </div>
          </div>
        ) : viewMode === 'customer' ? (
          /* Single Screen: Customer App */
          <div className="max-w-2xl mx-auto w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-7 shadow-2xl">
            <CustomerView
              language={language}
              rideStatus={rideStatus}
              pickup={pickup}
              setPickup={setPickup}
              drop={drop}
              setDrop={setDrop}
              cabs={cabs}
              selectedCab={selectedCab}
              selectedCabId={selectedCabId}
              setSelectedCabId={setSelectedCabId}
              handleCustomerBookRide={handleCustomerBookRide}
              handleResetRide={handleResetRide}
              startOtp={startOtp}
              copiedOtp={copiedOtp}
              handleCopyOtp={handleCopyOtp}
              tripProgress={tripProgress}
              currentKmRemaining={currentKmRemaining}
              currentMinsRemaining={currentMinsRemaining}
              setShowSosModal={setShowSosModal}
              setActiveCall={setActiveCall}
              setActiveChat={(role) => {
                if (role) {
                  setChatDrawerRole(role);
                  setIsChatDrawerOpen(true);
                } else {
                  setIsChatDrawerOpen(false);
                }
              }}
              carPos={carPos}
              pX={pX}
              pY={pY}
              dX={dX}
              dY={dY}
              ratingStars={ratingStars}
              setRatingStars={setRatingStars}
              selectedTip={selectedTip}
              setSelectedTip={setSelectedTip}
              tipGiven={tipGiven}
              setTipGiven={setTipGiven}
              onOpenPaymentModal={() => setShowPaymentModal(true)}
              triggerAudio={triggerAudio}
              mapsConfig={mapsConfig}
              onOpenSettings={() => setShowApiSettingsModal(true)}
            />
          </div>
        ) : (
          /* Single Screen: Driver App */
          <div className="max-w-2xl mx-auto w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-7 shadow-2xl">
            <DriverView
              language={language}
              driverOnline={driverOnline}
              setDriverOnline={setDriverOnline}
              driverEarnings={driverEarnings}
              driverTrips={driverTrips}
              rideStatus={rideStatus}
              pickup={pickup}
              drop={drop}
              selectedCab={selectedCab}
              offerCountdown={offerCountdown}
              handleDriverAccept={handleDriverAccept}
              handleDriverDecline={handleDriverDecline}
              driverEnteredOtp={driverEnteredOtp}
              setDriverEnteredOtp={setDriverEnteredOtp}
              handleVerifyOtpAndStart={handleVerifyOtpAndStart}
              otpError={otpError}
              tripProgress={tripProgress}
              inTransitSpeed={inTransitSpeed}
              setInTransitSpeed={setInTransitSpeed}
              handleCompleteTrip={handleCompleteTrip}
              handleResetRide={handleResetRide}
              startOtp={startOtp}
              currentKmRemaining={currentKmRemaining}
              currentMinsRemaining={currentMinsRemaining}
              setActiveCall={setActiveCall}
              setActiveChat={(role) => {
                if (role) {
                  setChatDrawerRole(role);
                  setIsChatDrawerOpen(true);
                } else {
                  setIsChatDrawerOpen(false);
                }
              }}
              triggerAudio={triggerAudio}
            />
          </div>
        )}
      </main>

      {/* 4. MODALS & POPUPS */}

      {/* Interactive UPI & Cash Payment Screen Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        language={language}
        selectedCab={selectedCab}
        fareSettings={fareSettings}
        pickup={pickup}
        drop={drop}
        onPaymentSuccess={handlePaymentSuccess}
        triggerAudio={triggerAudio}
      />

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-2 border-red-500/80 rounded-3xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                <span className="text-base sm:text-lg">Raj Cab Safety Shield (SOS)</span>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl">
                <p className="text-xs text-red-200 font-semibold mb-1">Live Ride Telemetry Dispatched</p>
                <p className="text-[11px] text-zinc-300">
                  Vehicle: <span className="text-white font-mono">White Dzire • RJ 09 AB 4521</span><br />
                  Driver: <span className="text-white">Ramesh Patel (Verified ID)</span><br />
                  GPS Coordinates: <span className="text-amber-400 font-mono">26.9124° N, 75.7873° E (Jaipur)</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:112"
                  onClick={() => triggerAudio('alert')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-center transition-all shadow-lg shadow-red-600/30"
                >
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-xs">Police Control (112)</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    triggerAudio('success');
                    alert('Raj Cab 24x7 Emergency Response Team has been alerted. An executive is tracking your ride.');
                    setShowSosModal(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-center border border-amber-500/40 transition-all"
                >
                  <ShieldAlert className="w-5 h-5 mb-1" />
                  <span className="text-xs">Raj Safety Helpline</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Phone Call Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-xl">
                <Phone className="w-8 h-8 animate-bounce" />
              </div>
            </div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Simulated Audio Call</p>
            <h4 className="text-base font-bold text-white mt-1">
              {activeCall === 'customer_to_driver' ? 'Calling Ramesh Patel (Driver)' : 'Calling Aarav Sharma (Customer)'}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              {activeCall === 'customer_to_driver' ? 'Dzire • RJ 09 AB 4521' : 'Pickup at Civil Lines Metro'}
            </p>
            <p className="text-xs text-emerald-400 font-mono mt-3">Connected • 00:08 (Audio clear)</p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  triggerAudio('click');
                  setActiveCall(null);
                }}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Real-Time Chat Trigger Button (Active during ride) */}
      {(rideStatus === 'driver_arrived' || rideStatus === 'in_transit') && !isChatDrawerOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom duration-300">
          <button
            id="floating-chat-trigger-btn"
            onClick={() => {
              triggerAudio('click');
              setIsChatDrawerOpen(true);
            }}
            className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-300/30 transition-transform active:scale-95 group"
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <span>{t.chatTabCustomer} / {t.chatTabDriver}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-950/20 text-zinc-950 text-[10px] font-mono font-black">
              {chatMessages.length}
            </span>
          </button>
        </div>
      )}

      {/* Production In-App Real-Time Chat Drawer */}
      <ChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        language={language}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        initialRole={chatDrawerRole}
        triggerAudio={triggerAudio}
        driverName="Ramesh Patel"
        customerName="Aarav Sharma"
      />

      {/* Real Google Maps API Key Configurator Modal */}
      <ApiSettingsModal
        isOpen={showApiSettingsModal}
        onClose={() => setShowApiSettingsModal(false)}
        language={language}
        mapsConfig={mapsConfig}
        config={mapsConfig}
        onSaveConfig={(newConfig) => {
          setMapsConfig(newConfig);
          try {
            if (newConfig.apiKey) {
              localStorage.setItem('google_maps_api_key', newConfig.apiKey);
            } else {
              localStorage.removeItem('google_maps_api_key');
            }
          } catch {
            // ignore
          }
        }}
        triggerAudio={triggerAudio}
      />

      {/* FCM Push Notification Floating Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        language={language}
      />

      {/* FCM Push Notification Simulator Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        language={language}
        notifications={notifications}
        onClearAll={() => setNotifications([])}
        onSimulatePush={(type) => {
          if (type === 'ride_booked') {
            pushFCMNotification(
              'ride_booked',
              'New Ride Request: Prime Sedan',
              'नई राइड रिक्वेस्ट: प्राइम सेडान',
              'Customer waiting at Civil Lines Metro for Airport Terminal. Estimated fare: ₹185.',
              'सिविल लाइन्स मेट्रो से एयरपोर्ट टर्मिनल के लिए ग्राहक प्रतीक्षारत। अनुमानित किराया: ₹185।',
              'driver'
            );
          } else if (type === 'ride_accepted') {
            pushFCMNotification(
              'ride_accepted',
              'Ramesh Patel accepted your ride!',
              'रमेश पटेल ने आपकी राइड स्वीकार कर ली है!',
              'White Maruti Dzire (RJ 09 AB 4521) is arriving in 2 mins. Share start OTP 5821.',
              'सफेद मारुति डिजायर (RJ 09 AB 4521) 2 मिनट में पहुंच रही है। स्टार्ट ओटीपी 5821 बताएं।',
              'customer'
            );
          } else if (type === 'driver_arrived') {
            pushFCMNotification(
              'driver_arrived',
              'Driver Arrived at Pickup Point',
              'ड्राइवर पिकअप पॉइंट पर पहुंच गया है',
              'Ramesh Patel is waiting outside Civil Lines Metro Gate 2.',
              'रमेश पटेल सिविल लाइन्स मेट्रो गेट 2 के बाहर प्रतीक्षा कर रहे हैं।',
              'customer'
            );
          } else {
            pushFCMNotification(
              'payment_received',
              'Trip Settled: ₹185 Received',
              'यात्रा संपन्न: ₹185 का भुगतान प्राप्त',
              'Settled via UPI (Google Pay). Driver daily total updated.',
              'यूपीआई (गूगल पे) द्वारा भुगतान प्राप्त। ड्राइवर का कुल दैनिक बैलेंस अपडेट।',
              'all'
            );
          }
        }}
        triggerAudio={triggerAudio}
      />
    </div>
  );
}
