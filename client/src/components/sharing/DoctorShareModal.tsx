import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  X,
  ExternalLink,
  QrCode,
  Lock
} from 'lucide-react';
import { api } from '../../api/client';

interface DoctorShareModalProps {
  woundId: string;
  woundName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorShareModal: React.FC<DoctorShareModalProps> = ({
  woundId,
  woundName,
  isOpen,
  onClose
}) => {
  const [durationHours, setDurationHours] = useState<number>(48);
  const [passcode, setPasscode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [shareData, setShareData] = useState<{
    token: string;
    expires_at: string;
    share_url: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerateShareLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await api.createDoctorShare(
        woundId,
        durationHours,
        passcode.trim() || undefined
      );
      setShareData(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate doctor share token');
    } finally {
      setLoading(false);
    }
  };

  const fullShareUrl = shareData
    ? `${window.location.origin}/share/${shareData.token}`
    : '';

  const handleCopy = () => {
    if (!fullShareUrl) return;
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Physician Share Portal
              </h3>
              <p className="text-xs text-slate-400">
                Tokenized zero-knowledge access for {woundName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5">
          {!shareData ? (
            <form onSubmit={handleGenerateShareLink} className="space-y-4">
              {/* Duration Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Access Token Validity Period</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '6 Hours', hours: 6 },
                    { label: '24 Hours', hours: 24 },
                    { label: '48 Hours', hours: 48 },
                    { label: '7 Days', hours: 168 }
                  ].map((opt) => (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setDurationHours(opt.hours)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        durationHours === opt.hours
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Passcode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Optional Passcode Protection (PIN)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4821 (leave blank for open QR access)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  maxLength={12}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              {/* Security Banner */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Knowledge Security:</strong> Consulting clinicians access only sanitized longitudinal telemetry and physician SBAR memos. Patient account credentials and unrelated records remain strictly isolated.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Generating Expiring Link...' : 'Create Secure Doctor Link'}
                </button>
              </div>
            </form>
          ) : (
            /* Share Generated View */
            <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto">
                <QRCodeSVG
                  value={fullShareUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Valid until: </span>
                <span className="text-teal-300 font-mono">
                  {new Date(shareData.expires_at).toLocaleString()}
                </span>
              </div>

              {/* Copy URL input box */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={fullShareUrl}
                  className="bg-transparent flex-1 text-xs text-slate-300 px-2.5 outline-none font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <a
                  href={fullShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>Preview Doctor Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setShareData(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Generate Another Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
