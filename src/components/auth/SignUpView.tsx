import React, { useState } from 'react';
import { ArchitectProfile } from '../../types/auth';
import { APP_LOGO, APP_LOGO_STATIC_URL, BRAND_NAME } from '../../assets/logo';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Leaf,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Globe,
  Briefcase,
  ChevronRight,
  Building2,
  Maximize2,
} from 'lucide-react';

interface SignUpViewProps {
  onSignUpComplete: (profile: Partial<ArchitectProfile>) => void;
  onNavigateToSignIn: () => void;
  onEnterAsGuest?: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onSignUpComplete,
  onNavigateToSignIn,
  onEnterAsGuest,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [discipline, setDiscipline] = useState('Architect');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSignUpComplete({
        fullName,
        email,
        country,
        primaryDiscipline: discipline,
        studioName: `${fullName.split(' ')[0].toUpperCase()}'S ARCHITECTURAL STUDIO`,
        isLoggedIn: true,
      });
      setIsSubmitting(false);
    }, 600);
  };

  const handleOAuthSignUp = (provider: 'Google' | 'Microsoft') => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSignUpComplete({
        fullName: 'Lead Architectural Director',
        email: `architect@${provider.toLowerCase()}-studio.com`,
        country,
        primaryDiscipline: discipline,
        studioName: 'LORA ARCHITECTURAL & BIM STUDIO',
        isLoggedIn: true,
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-screen bg-[#11141A] text-[#1E242B] font-sans flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* LEFT 60%: IMMERSIVE ARCHITECTURAL COMPETITION PRESENTATION BOARD           */}
      {/* Concept to Reality: Blueprint → Digital Model → Sustainable Building       */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[60%] min-h-[520px] lg:min-h-screen bg-[#07090E] relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-r border-[#1F2937]">
        {/* Subtle Architectural Grid Background & Coordinates */}
        <div
          className="absolute inset-0 opacity-[0.14] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2DD4BF 1px, transparent 1px),
              linear-gradient(to bottom, #2DD4BF 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* High-Resolution Architectural Tri-Phase Transition Visual (Render + Blueprint + Section) */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
            alt="Contemporary Sustainable Architecture"
            className="w-full h-full object-cover object-center opacity-65 mix-blend-luminosity filter contrast-125 brightness-90"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Technical Drawing Overlay: Cyan blueprint wash on the left quadrant */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/80" />
        </div>

        {/* TECHNICAL OVERLAYS & STRUCTURAL CAD LINES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-[1]" aria-hidden="true">
          {/* Elevation Datum Levels */}
          <line x1="8%" y1="28%" x2="92%" y2="28%" stroke="#2DD4BF" strokeWidth="0.75" strokeDasharray="6,4" />
          <line x1="8%" y1="52%" x2="92%" y2="52%" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="3,3" />
          <line x1="8%" y1="76%" x2="92%" y2="76%" stroke="#94A3B8" strokeWidth="0.5" />

          {/* Vertical Grid Axes */}
          <line x1="22%" y1="12%" x2="22%" y2="88%" stroke="#64748B" strokeWidth="0.5" strokeDasharray="4,8" />
          <line x1="55%" y1="12%" x2="55%" y2="88%" stroke="#64748B" strokeWidth="0.5" strokeDasharray="4,8" />
          <line x1="78%" y1="12%" x2="78%" y2="88%" stroke="#2DD4BF" strokeWidth="0.75" strokeDasharray="2,6" />

          {/* Dimension Witness Lines */}
          <circle cx="22%" cy="28%" r="4" fill="#07090E" stroke="#2DD4BF" strokeWidth="1.5" />
          <circle cx="55%" cy="28%" r="4" fill="#07090E" stroke="#2DD4BF" strokeWidth="1.5" />
          <circle cx="78%" cy="28%" r="4" fill="#07090E" stroke="#38BDF8" strokeWidth="1.5" />
        </svg>

        {/* TOP BOARD IDENTIFIER & LOGO */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 flex items-center justify-center">
              <img
                src={APP_LOGO}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                }}
                alt="Lora Edge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-widest uppercase">
                  {BRAND_NAME}
                </span>
                <span className="text-[9px] font-mono text-[#2DD4BF] bg-[#2DD4BF]/15 px-2 py-0.5 rounded border border-[#2DD4BF]/30 font-semibold tracking-wide">
                  Design × BIM × EDGE
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono tracking-wider">
                COMPETITION PRESENTATION SYSTEM
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-gray-400 border border-[#1E293B] bg-[#07090E]/80 px-3 py-1.5 rounded backdrop-blur-md">
            <span>GRID: 500mm</span>
            <span className="text-[#2DD4BF]">DATUM: +14.250m</span>
            <span>SCALE: 1:100 @ A0</span>
          </div>
        </div>

        {/* SUBTLE ARCHITECTURAL ANNOTATIONS PINNED ACROSS BOARD */}
        <div className="relative z-10 my-auto py-12 space-y-8 max-w-xl">
          {/* Architectural Stage Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0F172A]/90 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-mono backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span className="tracking-wider uppercase font-semibold">Stage 01 • Concept → Reality Synthesis</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] font-sans">
              Architecture × Design <br />
              <span className="bg-gradient-to-r from-white via-[#E2E8F0] to-[#2DD4BF] bg-clip-text text-transparent">
                × Sustainability.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-lg">
              Conceive parametric floor plans, run real-time EDGE carbon calculations, and synthesize publication-grade architectural renders inside a unified studio environment.
            </p>
          </div>

          {/* Subtle Technical Annotations Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E293B]">
            <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-[#1E293B] p-2.5 rounded font-mono">
              <span className="text-[9px] text-[#2DD4BF] block font-bold tracking-wider">DESIGN INTENT</span>
              <strong className="text-xs text-white block">Passive Solar Orientation</strong>
              <span className="text-[10px] text-gray-400">Azimuth: 15.4° S/W</span>
            </div>

            <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-[#1E293B] p-2.5 rounded font-mono">
              <span className="text-[9px] text-[#38BDF8] block font-bold tracking-wider">STRUCTURAL LOGIC</span>
              <strong className="text-xs text-white block">Cross-Laminated Timber</strong>
              <span className="text-[10px] text-gray-400">Bay Spacing: 6.0m</span>
            </div>

            <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-[#1E293B] p-2.5 rounded font-mono col-span-2 sm:col-span-1">
              <span className="text-[9px] text-emerald-400 block font-bold tracking-wider">2030 CHALLENGE</span>
              <strong className="text-xs text-white block">-42.8% Embodied CO₂</strong>
              <span className="text-[10px] text-gray-400">EDGE Advanced Ready</span>
            </div>
          </div>
        </div>

        {/* BOTTOM METRIC BAR & JOURNEY SYMBOL */}
        <div className="relative z-10 pt-4 border-t border-[#1E293B]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
              <span>SACAP / AIA / RIBA COMPATIBLE</span>
            </span>
            <span>•</span>
            <span>IFC4.3 & OPEN BIM NATIVE</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#2DD4BF]">
            <span>MATERIAL INTELLIGENCE 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT 40%: REFINED WARM-WHITE REGISTRATION PANEL                           */}
      {/* "Create Your Architectural Identity"                                      */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[40%] bg-[#FAF8F5] text-[#111827] flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top Header / Progress Track */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 font-semibold tracking-wider uppercase">
              <span className="text-[#0D9488] font-bold">IDENTITY</span>
              <span>→</span>
              <span className="text-gray-400">DISCIPLINE</span>
              <span>→</span>
              <span className="text-gray-400">WORKFLOW</span>
              <span>→</span>
              <span className="text-gray-400">STUDIO</span>
            </div>

            {onEnterAsGuest && (
              <button
                type="button"
                onClick={onEnterAsGuest}
                className="text-[11px] font-mono text-gray-500 hover:text-[#0D9488] transition underline underline-offset-2"
              >
                Skip as Guest
              </button>
            )}
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Create your architectural identity.
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Build, visualize, and develop better architecture with intelligent design tools.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1 uppercase tracking-wider font-mono">
                Full Name & Architectural Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Lin, Senior Architect"
                  className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#D1D5DB] focus:border-[#0D9488] rounded-md text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D9488] transition shadow-sm font-sans"
                />
              </div>
            </div>

            {/* Professional Email */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1 uppercase tracking-wider font-mono">
                Professional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@practice.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#D1D5DB] focus:border-[#0D9488] rounded-md text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D9488] transition shadow-sm font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1 uppercase tracking-wider font-mono">
                Studio Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#D1D5DB] focus:border-[#0D9488] rounded-md text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D9488] transition shadow-sm font-sans"
                />
              </div>
            </div>

            {/* Two-column: Country & Primary Discipline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1 uppercase tracking-wider font-mono">
                  Country / Region
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 bg-white border border-[#D1D5DB] focus:border-[#0D9488] rounded-md text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0D9488] transition shadow-sm font-sans"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Japan">Japan</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Other">Other Region</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1 uppercase tracking-wider font-mono">
                  Primary Discipline
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 bg-white border border-[#D1D5DB] focus:border-[#0D9488] rounded-md text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0D9488] transition shadow-sm font-sans"
                  >
                    <option value="Architect">Architect</option>
                    <option value="Architectural Designer">Architectural Designer</option>
                    <option value="Interior Architect">Interior Architect</option>
                    <option value="Urban Designer">Urban Designer</option>
                    <option value="Landscape Architect">Landscape Architect</option>
                    <option value="Architectural Technologist">Architectural Technologist</option>
                    <option value="Structural Engineer">Structural Engineer</option>
                    <option value="Sustainability Consultant">Sustainability Consultant</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms Acknowledgement */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              <label htmlFor="terms" className="text-xs text-[#64748B] leading-tight">
                I agree to the Lora Edge Professional Terms of Service, architectural data sovereignty guidelines, and privacy policy.
              </label>
            </div>

            {/* Primary CTA: Create Account */}
            <button
              type="submit"
              disabled={isSubmitting || !agreeTerms}
              className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 text-white font-bold text-sm rounded-md shadow-md flex items-center justify-center gap-2 transition transform active:scale-[0.99] mt-3"
            >
              <span>{isSubmitting ? 'Configuring Studio...' : 'Create Account & Begin Calibration'}</span>
              <ArrowRight className="w-4 h-4 text-[#2DD4BF]" />
            </button>

            {/* Divider */}
            <div className="relative py-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <span className="relative bg-[#FAF8F5] px-3 text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                or sign up with
              </span>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleOAuthSignUp('Google')}
                className="h-10 bg-white hover:bg-gray-50 border border-[#D1D5DB] rounded-md text-xs font-semibold text-[#1E293B] flex items-center justify-center gap-2 transition shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignUp('Microsoft')}
                className="h-10 bg-white hover:bg-gray-50 border border-[#D1D5DB] rounded-md text-xs font-semibold text-[#1E293B] flex items-center justify-center gap-2 transition shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z" />
                  <path fill="#00A4EF" d="M1 13h10v10H1z" />
                  <path fill="#7FBA00" d="M13 1h10v10H13z" />
                  <path fill="#FFB900" d="M13 13h10v10H13z" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Switcher: Already have an account? Sign In */}
        <div className="pt-6 mt-6 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#64748B]">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="font-bold text-[#0F172A] hover:text-[#0D9488] transition flex items-center gap-1 group"
          >
            <span>Enter Your Studio</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#0D9488] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
