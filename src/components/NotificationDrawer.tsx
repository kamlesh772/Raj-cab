import React from 'react';
import {
  Bell,
  X,
  Trash2,
  Car,
  CheckCircle2,
  DollarSign,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { FCMNotification, Language } from '../types';
import { translations } from '../translations';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  notifications: FCMNotification[];
  onClearAll: () => void;
  onSimulatePush: (type: 'ride_booked' | 'ride_accepted' | 'driver_arrived' | 'payment_received') => void;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  language,
  notifications,
  onClearAll,
  onSimulatePush,
  triggerAudio
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const getIcon = (type: FCMNotification['type']) => {
    switch (type) {
      case 'ride_booked':
      case 'ride_accepted':
        return <Car className="w-3.5 h-3.5 text-amber-400" />;
      case 'driver_arrived':
        return <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />;
      case 'payment_received':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t.notificationsTitle}</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono">
                  {notifications.length}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">{t.notificationsSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Simulator Buttons */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-zinc-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Push Events:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                triggerAudio('alert');
                onSimulatePush('ride_booked');
              }}
              className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-amber-400 rounded-lg border border-zinc-800 text-left transition-colors flex items-center gap-1.5"
            >
              <Car className="w-3 h-3 text-amber-400" />
              <span>Ride Booked</span>
            </button>
            <button
              onClick={() => {
                triggerAudio('alert');
                onSimulatePush('ride_accepted');
              }}
              className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-amber-400 rounded-lg border border-zinc-800 text-left transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-sky-400" />
              <span>Ride Accepted</span>
            </button>
            <button
              onClick={() => {
                triggerAudio('alert');
                onSimulatePush('driver_arrived');
              }}
              className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-sky-400 rounded-lg border border-zinc-800 text-left transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3 h-3 text-sky-400" />
              <span>Driver Arrived</span>
            </button>
            <button
              onClick={() => {
                triggerAudio('alert');
                onSimulatePush('payment_received');
              }}
              className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-800 text-left transition-colors flex items-center gap-1.5"
            >
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>Payment Done</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-zinc-950/20">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">{t.noNotifications}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const title = language === 'hi' && n.titleHi ? n.titleHi : n.title;
              const body = language === 'hi' && n.bodyHi ? n.bodyHi : n.body;

              return (
                <div
                  key={n.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-800">
                        {getIcon(n.type)}
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{title}</h5>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed pl-9">{body}</p>
                  <div className="mt-2 pl-9 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {n.recipient}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Delivered via FCM</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono">{notifications.length} alerts logged</span>
            <button
              onClick={() => {
                triggerAudio('click');
                onClearAll();
              }}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg border border-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAllNotifications}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
