import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Car,
  CheckCheck,
  Sparkles,
  ArrowDownCircle
} from 'lucide-react';
import { Language, ChatMessage } from '../types';
import { translations } from '../translations';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  messages: ChatMessage[];
  onSendMessage: (text: string, sender: 'customer' | 'driver') => void;
  defaultRole?: 'customer' | 'driver';
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  language,
  messages,
  onSendMessage,
  defaultRole = 'customer',
  triggerAudio
}) => {
  const t = translations[language];
  const [currentRole, setCurrentRole] = useState<'customer' | 'driver'>(defaultRole);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync role when defaultRole changes
  useEffect(() => {
    if (defaultRole) {
      setCurrentRole(defaultRole);
    }
  }, [defaultRole]);

  // Scroll to bottom on new message or when opened
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText) return;

    onSendMessage(messageText, currentRole);
    setInputMessage('');
    triggerAudio('ping');
  };

  const handleQuickChipClick = (chipText: string) => {
    handleSend(chipText);
  };

  const customerQuickChips = [
    t.quickCustomer1,
    t.quickCustomer2,
    t.quickCustomer3
  ];

  const driverQuickChips = [
    t.quickDriver1,
    t.quickDriver2,
    t.quickDriver3
  ];

  const activeQuickChips = currentRole === 'customer' ? customerQuickChips : driverQuickChips;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Chat Drawer Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentRole === 'customer' ? t.chatWithDriver : t.chatWithCustomer}</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {currentRole === 'customer'
                  ? 'Driver: Ramesh Patel (RJ 09 AB 4521)'
                  : 'Customer: Aarav Sharma (Pickup: Civil Lines)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perspective Switcher (Simulate customer vs driver interaction) */}
        <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">Active Persona:</span>
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => {
                triggerAudio('click');
                setCurrentRole('customer');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === 'customer'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3 h-3 text-amber-400" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => {
                triggerAudio('click');
                setCurrentRole('driver');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === 'driver'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>Driver</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/20">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No messages yet. Use the quick chips below or type a message.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender === currentRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {msg.sender === 'customer' ? 'Customer (Aarav)' : 'Driver (Ramesh)'}
                    </span>
                    <span className="text-[9px] text-zinc-500">{msg.time}</span>
                  </div>
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-medium rounded-br-none shadow-md shadow-amber-500/10'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700/80 shadow-md'
                    }`}
                  >
                    <p className="break-words">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[9px]">
                      <span>{msg.time}</span>
                      {isMine && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Chips */}
        <div className="px-3.5 py-2.5 bg-zinc-950 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-zinc-400 font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{t.quickResponses}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeQuickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickChipClick(chip)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-amber-300 text-[11px] rounded-lg border border-zinc-800 hover:border-amber-500/40 transition-all text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={t.chatInputPlaceholder}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim()}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.sendBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
