export type RideStatus = 'idle' | 'searching' | 'driver_arrived' | 'in_transit' | 'completed';

export type Language = 'en' | 'hi';

export type ViewMode = 'customer' | 'driver' | 'split' | 'admin';

export type PaymentMethod = 'upi' | 'cash';

export type UPIApp = 'gpay' | 'phonepe' | 'paytm' | 'qr';

export interface CabOption {
  id: 'mini' | 'sedan' | 'suv';
  nameEn: string;
  nameHi: string;
  badgeNameEn: string;
  badgeNameHi: string;
  baseFare: number;
  perKmRate: number;
  fare: number;
  etaEn: string;
  etaHi: string;
  etaMins: number;
  descEn: string;
  descHi: string;
  seats: string;
  iconType: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  rating: number;
  trips: number;
  status: 'verified' | 'pending' | 'suspended';
  phone: string;
  joinDate: string;
  earningsToday: number;
}

export interface FareSettings {
  miniBase: number;
  miniPerKm: number;
  sedanBase: number;
  sedanPerKm: number;
  suvBase: number;
  suvPerKm: number;
  platformCommissionPercent: number;
  taxPercent: number;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'driver';
  text: string;
  time: string;
  timestamp: number;
}

export interface FCMNotification {
  id: string;
  title: string;
  titleHi?: string;
  body: string;
  bodyHi?: string;
  type: 'ride_booked' | 'ride_accepted' | 'driver_arrived' | 'payment_received' | 'system';
  timestamp: string;
  read: boolean;
  recipient: 'customer' | 'driver' | 'all';
}

export interface GoogleMapsConfig {
  apiKey: string;
  isLoaded: boolean;
  loadError: string | null;
  useLiveMap: boolean;
}
