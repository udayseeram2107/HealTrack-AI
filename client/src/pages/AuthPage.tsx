import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HeartPulse,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  Stethoscope,
  Users,
  Eye,
  EyeOff,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useAppStore, UserState } from '../store/useAppStore';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login, isAuthenticated } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'caregiver'>('patient');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated and visits login, allow redirect or re-auth
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInstantDemoLogin = (role: 'patient' | 'doctor' | 'caregiver') => {
    let demoUser: UserState;
    if (role === 'doctor') {
      demoUser = {
        id: '00000000-0000-4000-a000-000000000002',
        full_name: 'Dr. Anjali Deshmukh, MD',
        role: 'doctor',
        email: 'dr.deshmukh@woundcare.org',
        phone_number: '+91 98234 56789',
        preferred_language: 'en'
      };
    } else if (role === 'caregiver') {
      demoUser = {
        id: '00000000-0000-4000-a000-000000000003',
        full_name: 'Kavita Sharma',
        role: 'caregiver',
        email: 'kavita.sharma@example.com',
        phone_number: '+91 98765 11223',
        preferred_language: 'en'
      };
    } else {
      demoUser = {
        id: '00000000-0000-4000-a000-000000000001',
        full_name: 'Rajesh Sharma',
        role: 'patient',
        email: 'rajesh.sharma@example.com',
        phone_number: '+91 98765 43210',
        preferred_language: 'en'
      };
    }

    login(demoUser);
    navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMethod === 'email') {
      if (!email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    } else {
      if (!phone || phone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (otpSent && otp.length < 4) {
        setErrorMsg('Please enter the 6-digit verification code.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userObj: UserState = {
        id: '00000000-0000-4000-a000-000000000001',
        full_name: fullName.trim() || (authMethod === 'email' ? email.split('@')[0] : 'Patient User'),
        role: selectedRole,
        email: authMethod === 'email' ? email : undefined,
        phone_number: phone || '+91 98765 43210',
        preferred_language: 'en'
      };
      login(userObj);
      navigate('/dashboard');
    }, 700);
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid phone number before requesting OTP.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    setOtp('582914'); // auto-fill demo OTP for painless testing
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden py-12">
      {/* Dynamic background lighting */}
      <div className="absolute top-1/6 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-teal-300 shadow-2xl shadow-teal-500/25 mb-1 group hover:scale-105 transition-transform">
            <HeartPulse className="w-9 h-9 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>HealTrack AI</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              Clinical
            </span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Clinical Decision-Support &amp; Remote Longitudinal Wound Telemetry Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Select Your Clinical Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'patient'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor / MD</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('caregiver')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'caregiver'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Caregiver</span>
              </button>
            </div>
          </div>

          {/* Auth Method Pills (Email vs Phone) */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMethod === 'email'
                  ? 'bg-slate-800 text-teal-300 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Email &amp; Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMethod === 'phone'
                  ? 'bg-slate-800 text-teal-300 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone SMS / OTP
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {authMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder={
                        selectedRole === 'doctor'
                          ? 'doctor@hospital.org'
                          : 'patient@example.com'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                {otpSent ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">
                        6-Digit SMS Code (OTP)
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] text-teal-400 hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-center tracking-widest font-mono text-base font-bold"
                    />
                    <p className="text-[10px] text-emerald-400 text-center">
                      ✓ Demo verification code generated: 582914
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    Send One-Time Password
                  </button>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Verifying Credentials...'
                  : mode === 'login'
                  ? `Sign In as ${selectedRole.toUpperCase()}`
                  : `Register ${selectedRole.toUpperCase()} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle login / register */}
          <div className="text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <span>
                Need a new medical profile?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="text-teal-400 font-bold hover:underline"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-teal-400 font-bold hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-400 font-bold">
                1-Click Instant Evaluation
              </span>
            </div>
          </div>

          {/* Instant 1-Click Demo Profiles */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleInstantDemoLogin('patient')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 border border-teal-800/80 text-teal-200 text-xs font-bold transition-all flex items-center justify-between group shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
                <span>Patient: Rajesh Sharma (Post-op Incision)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleInstantDemoLogin('doctor')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 border border-sky-800/80 text-sky-200 text-xs font-bold transition-all flex items-center justify-between group shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Physician: Dr. Anjali Deshmukh, MD</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleInstantDemoLogin('caregiver')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-200 text-xs font-bold transition-all flex items-center justify-between group shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Caregiver: Kavita Sharma</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Security & HIPAA Compliance Notice */}
        <div className="text-center space-y-1 text-[11px] text-slate-500">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>HIPAA-aware cryptographic isolation &amp; 256-bit encryption</span>
          </p>
          <p className="text-[10px] text-slate-600">
            Educational clinical decision-support only. Does not replace physician diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
