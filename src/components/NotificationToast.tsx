import React, { useEffect } from 'react';
import {
  Bell,
  X,
  Car,
  CheckCircle2,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { FCMNotification, Language } from '../types';

interface NotificationToastProps {
  notification: FCMNotification | null;
  onDismiss: () => void;
  language: Language;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  language
}) => {
  useEffect(() => {
    if (!notification) return;

    // Trigger physical hardware vibration on supported mobile devices
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([120, 60, 120]);
      }
    } catch {
      // Ignored if permissions are restricted in iframe
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 5500);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const displayTitle =
    language === 'hi' && notification.titleHi ? notification.titleHi : notification.title;
  const displayBody =
    language === 'hi' && notification.bodyHi ? notification.bodyHi : notification.body;

  const getIcon = () => {
    switch (notification.type) {
      case 'ride_booked':
      case 'ride_accepted':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'driver_arrived':
        return <CheckCircle2 className="w-4 h-4 text-sky-400" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-50 max-w-sm w-full animate-vibrate transition-all">
      <div className="bg-zinc-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl shadow-amber-500/10 flex items-start gap-3 relative text-left">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
          {getIcon()}
        </div>
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              FCM PUSH
            </span>
            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
              <Smartphone className="w-2.5 h-2.5 text-zinc-500" />
              <span>Vibrated</span>
            </span>
          </div>
          <h4 className="text-xs font-bold text-white line-clamp-1">{displayTitle}</h4>
          <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">{displayBody}</p>
        </div>
        <button
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
