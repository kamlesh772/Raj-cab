import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  QrCode,
  Banknote,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Check,
  Copy,
  Receipt,
  Download,
  IndianRupee
} from 'lucide-react';
import { Language, PaymentMethod, UPIApp, CabOption, FareSettings } from '../types';
import { translations } from '../translations';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedCab: CabOption;
  fareSettings: FareSettings;
  pickup: string;
  drop: string;
  onPaymentSuccess: (amountPaid: number, method: PaymentMethod) => void;
  triggerAudio: (type: 'ping' | 'success' | 'alert' | 'click') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  language,
  selectedCab,
  fareSettings,
  pickup,
  drop,
  onPaymentSuccess,
  triggerAudio
}) => {
  const t = translations[language];
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [selectedApp, setSelectedApp] = useState<UPIApp>('gpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalAmount = selectedCab.fare;
  const platformFee = Math.round((totalAmount * fareSettings.platformCommissionPercent) / 100);
  const gstTax = Math.round((totalAmount * fareSettings.taxPercent) / 100);
  const baseFare = selectedCab.baseFare;
  const distanceCharges = totalAmount - (baseFare + gstTax + platformFee);

  const handleProcessPayment = () => {
    triggerAudio('ping');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      triggerAudio('success');
      onPaymentSuccess(totalAmount, method);
    }, 1200);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard?.writeText('rajcab.rides@hdfcbank');
    setCopiedUpi(true);
    triggerAudio('click');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">{t.paymentTitle}</h3>
              <p className="text-[11px] text-zinc-400">{t.paymentSubtitle}</p>
            </div>
          </div>
          {!isSuccess && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!isSuccess ? (
            <>
              {/* Total Payable Summary Card */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block font-medium">{t.totalPayable}</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">₹{totalAmount}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-white block">{selectedCab.nameEn}</span>
                  <span className="text-[10px] text-zinc-500">{drop}</span>
                </div>
              </div>

              {/* Method Switcher: UPI vs Cash */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    triggerAudio('click');
                    setMethod('upi');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    method === 'upi'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerAudio('click');
                    setMethod('cash');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    method === 'cash'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash Handover</span>
                </button>
              </div>

              {/* UPI Mode View */}
              {method === 'upi' ? (
                <div className="space-y-4">
                  {/* Dynamic QR Code Card */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-lg flex-shrink-0">
                      {/* Stylized high-contrast vector QR Code representation */}
                      <svg viewBox="0 0 100 100" className="w-28 h-28" fill="#000000">
                        {/* Top-left marker */}
                        <rect x="5" y="5" width="30" height="30" fill="#000" rx="3" />
                        <rect x="10" y="10" width="20" height="20" fill="#fff" rx="2" />
                        <rect x="15" y="15" width="10" height="10" fill="#000" rx="1" />
                        {/* Top-right marker */}
                        <rect x="65" y="5" width="30" height="30" fill="#000" rx="3" />
                        <rect x="70" y="10" width="20" height="20" fill="#fff" rx="2" />
                        <rect x="75" y="15" width="10" height="10" fill="#000" rx="1" />
                        {/* Bottom-left marker */}
                        <rect x="5" y="65" width="30" height="30" fill="#000" rx="3" />
                        <rect x="10" y="70" width="20" height="20" fill="#fff" rx="2" />
                        <rect x="15" y="75" width="10" height="10" fill="#000" rx="1" />
                        {/* QR data matrix bits */}
                        <rect x="42" y="10" width="8" height="8" />
                        <rect x="50" y="24" width="8" height="8" />
                        <rect x="12" y="44" width="8" height="8" />
                        <rect x="26" y="46" width="8" height="8" />
                        <rect x="44" y="44" width="14" height="14" fill="#f59e0b" rx="2" />
                        <rect x="65" y="45" width="8" height="8" />
                        <rect x="80" y="55" width="8" height="8" />
                        <rect x="45" y="68" width="8" height="8" />
                        <rect x="62" y="75" width="12" height="8" />
                        <rect x="82" y="80" width="8" height="12" />
                      </svg>
                      <div className="text-[9px] font-black text-zinc-900 text-center mt-1 uppercase tracking-wider">
                        BHIM UPI • RAJ CAB
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Instant Auto-Verification</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium">{t.scanQrToPay}</p>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        <span className="font-mono text-zinc-300">rajcab.rides@hdfcbank</span>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          title="Copy UPI ID"
                          className="ml-1 text-amber-400 hover:text-amber-300"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct UPI App Selection */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 block">{t.selectUpiApp}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay', color: 'border-blue-500/40 text-blue-400 bg-blue-950/20' },
                        { id: 'phonepe', name: 'PhonePe', color: 'border-purple-500/40 text-purple-400 bg-purple-950/20' },
                        { id: 'paytm', name: 'Paytm UPI', color: 'border-sky-500/40 text-sky-400 bg-sky-950/20' }
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            triggerAudio('click');
                            setSelectedApp(app.id as UPIApp);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                            selectedApp === app.id
                              ? `${app.color} ring-1 ring-amber-400`
                              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 mx-auto mb-1 text-current" />
                          <span>{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Cash Mode View */
                <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.payCash}</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {t.cashInstruction} <span className="text-emerald-400 font-bold font-mono">₹{totalAmount}</span> {t.cashSubtext}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900/80 rounded-xl text-left text-[11px] text-zinc-400 space-y-1">
                    <p>• Driver: <span className="text-zinc-200">Ramesh Patel (White Dzire)</span></p>
                    <p>• Vehicle No: <span className="text-zinc-200 font-mono">RJ 09 AB 4521</span></p>
                    <p>• Status: <span className="text-amber-400 font-semibold">Awaiting Cash Handover</span></p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Digital Itemized Tax Invoice Receipt */
            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-zinc-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">{t.paymentSuccess}</h3>
                <p className="text-xs text-zinc-400">{t.paymentSuccessSub}</p>
              </div>

              {/* Itemized Receipt Breakdown */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400">
                  <span className="font-semibold text-zinc-300">{t.itemizedReceipt}</span>
                  <span className="font-mono text-amber-400">{t.invoiceNumber}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>{t.baseFare}:</span>
                  <span className="text-zinc-200 font-mono">₹{baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t.distanceCharge}:</span>
                  <span className="text-zinc-200 font-mono">₹{distanceCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t.taxes}:</span>
                  <span className="text-zinc-200 font-mono">₹{gstTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t.platformFee} ({fareSettings.platformCommissionPercent}%):</span>
                  <span className="text-zinc-200 font-mono">₹{platformFee.toFixed(2)}</span>
                </div>

                <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>{t.totalPaid}:</span>
                  <span className="text-emerald-400 font-mono text-base">₹{totalAmount}</span>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex justify-between text-[11px] text-zinc-500">
                  <span>{t.paymentModeUsed}</span>
                  <span className="text-amber-400 font-semibold uppercase">{method === 'upi' ? `UPI (${selectedApp.toUpperCase()})` : 'CASH TO DRIVER'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="pt-3 border-t border-zinc-800">
          {!isSuccess ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcessPayment}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Payment...</span>
                </>
              ) : method === 'upi' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.btnVerifyPayment} (₹{totalAmount})</span>
                </>
              ) : (
                <>
                  <Banknote className="w-4 h-4" />
                  <span>{t.btnConfirmCash} (₹{totalAmount})</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl transition-colors"
              >
                {t.closeReceipt}
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerAudio('click');
                  alert('Digital GST invoice downloaded (RC-9842.pdf)');
                }}
                className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
