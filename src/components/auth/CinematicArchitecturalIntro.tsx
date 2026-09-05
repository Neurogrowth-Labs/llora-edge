import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Compass,
  Layers,
  Cpu,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sun,
  Activity,
} from 'lucide-react';
import { OPENING_LOGO, OPENING_LOGO_STATIC_URL, BRAND_NAME } from '../../assets/logo';
import { ArchitectProfile } from '../../types/auth';

export type SequencePhase = 'draw' | 'structure' | 'form' | 'intelligence' | 'signin';

interface CinematicArchitecturalIntroProps {
  onSignInSuccess: (profile: Partial<ArchitectProfile>) => void;
  onNavigateToSignUp: () => void;
  onEnterAsGuest?: () => void;
  autoPlay?: boolean;
}

export const CinematicArchitecturalIntro: React.FC<CinematicArchitecturalIntroProps> = ({
  onSignInSuccess,
  onNavigateToSignUp,
  onEnterAsGuest,
  autoPlay = true,
}) => {
  // Sequence Timeline State
  const [phase, setPhase] = useState<SequencePhase>(autoPlay ? 'draw' : 'signin');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Form State for Sign In
  const [email, setEmail] = useState('simao.lusimadio@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Mouse Parallax coordinates for 3D depth-of-field
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle Mouse movement for subtle architectural parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard shortcut: ESC to skip intro directly to Sign In
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'signin') {
        setPhase('signin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Master Architectural Sequence Timeline Engine
  // 0.0s – 2.8s: DRAW (CAD drafting lines, coordinate axes, dimensions, crosshairs)
  // 2.8s – 5.5s: STRUCTURE (2D to 3D architectural extrude, nodes, perspective guides, blueprint specs)
  // 5.5s – 8.2s: FORM (Material crystallization, metallic/glass reflections, warm golden light sweep across logo)
  // 8.2s – 11.2s: INTELLIGENCE & BRAND MOMENT (LORA EDGE & ARCHITECTURAL INTELLIGENCE, generative floor plates, solar azimuth, parametric contours)
  // 11.2s+: SIGN IN (Seamless spatial transition into floating architectural sign-in console)
  useEffect(() => {
    if (phase === 'signin' || isPaused) return;

    const interval = 50; // 20 updates per sec
    const timer = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + interval;
        if (next < 2800) {
          if (phase !== 'draw') setPhase('draw');
        } else if (next < 5500) {
          if (phase !== 'structure') setPhase('structure');
        } else if (next < 8200) {
          if (phase !== 'form') setPhase('form');
        } else if (next < 11200) {
          if (phase !== 'intelligence') setPhase('intelligence');
        } else {
          setPhase('signin');
          clearInterval(timer);
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [phase, isPaused]);

  // Direct Replay Sequence Action
  const handleReplay = () => {
    setElapsedMs(0);
    setPhase('draw');
    setIsPaused(false);
  };

  const handleSkipToSignIn = () => {
    setPhase('signin');
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    setTimeout(() => {
      onSignInSuccess({
        email: email || 'simao.lusimadio@gmail.com',
        fullName: email.includes('simao') ? 'Simao Lusimadio' : 'Principal Architectural Director',
        isLoggedIn: true,
      });
      setIsAuthenticating(false);
    }, 600);
  };

  const handleOAuthSignIn = (provider: 'Google' | 'Microsoft') => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onSignInSuccess({
        email: `architect@${provider.toLowerCase()}.com`,
        fullName: 'Principal Design Partner',
        isLoggedIn: true,
      });
      setIsAuthenticating(false);
    }, 550);
  };

  // Phase Progress Calculations
  const phaseProgress = useMemo(() => {
    if (phase === 'draw') return Math.min(100, Math.round((elapsedMs / 2800) * 100));
    if (phase === 'structure') return Math.min(100, Math.round(((elapsedMs - 2800) / 2700) * 100));
    if (phase === 'form') return Math.min(100, Math.round(((elapsedMs - 5500) / 2700) * 100));
    if (phase === 'intelligence') return Math.min(100, Math.round(((elapsedMs - 8200) / 3000) * 100));
    return 100;
  }, [phase, elapsedMs]);

  return (
    <div className="relative min-h-screen w-screen bg-[#030407] text-[#E2E8F0] font-sans flex items-center justify-center overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 00 — ATMOSPHERIC ARCHITECTURAL CANVAS & VOLUMETRIC LIGHTING              */}
      {/* Deepest charcoal/obsidian backdrop with subtle warm gold/titanium glows   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep architectural ambient gradient */}
        <div className="absolute inset-0 bg-radial-gradient from-[#0B101D] via-[#04060B] to-[#020305]" />

        {/* Dynamic Architectural Warm Golden / Champagne Light Cone */}
        <motion.div
          animate={{
            opacity: phase === 'form' || phase === 'intelligence' ? 0.35 : phase === 'signin' ? 0.22 : 0.15,
            x: mousePos.x * 25,
            y: mousePos.y * 20,
            scale: phase === 'signin' ? 1.15 : 1,
          }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[-10%] left-[20%] w-[900px] h-[900px] rounded-full bg-radial from-[#F59E0B]/20 via-[#D4AF37]/10 to-transparent blur-[120px]"
        />

        {/* Cool bioclimatic edge refraction */}
        <div className="absolute bottom-[-15%] right-[10%] w-[800px] h-[800px] rounded-full bg-radial from-[#0D9488]/15 via-[#042F2E]/10 to-transparent blur-[140px]" />

        {/* Precision Fine 1000mm Module CAD Drafting Grid */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: phase === 'signin' ? 0.05 : 0.08,
            backgroundImage: `
              linear-gradient(to right, rgba(212, 175, 55, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 175, 55, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: `perspective(1000px) rotateX(${mousePos.y * 3}deg) rotateY(${mousePos.x * -3}deg)`,
          }}
        />

        {/* Isometric Perspective Vanishing Guide Rays */}
        <svg className="absolute inset-0 w-full h-full opacity-25">
          <defs>
            <linearGradient id="goldBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cyanSweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
              <stop offset="50%" stopColor="#2DD4BF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Perspective grid lines projecting into 3D horizon */}
          <line x1="0%" y1="50%" x2="50%" y2="50%" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="3,9" opacity="0.3" />
          <line x1="100%" y1="50%" x2="50%" y2="50%" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="3,9" opacity="0.3" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="3,9" opacity="0.3" />

          {/* Golden Section datum crosshairs */}
          <line x1="38.2%" y1="0%" x2="38.2%" y2="100%" stroke="#475569" strokeWidth="0.3" strokeDasharray="2,8" />
          <line x1="61.8%" y1="0%" x2="61.8%" y2="100%" stroke="#475569" strokeWidth="0.3" strokeDasharray="2,8" />
          <line x1="0%" y1="38.2%" x2="100%" y2="38.2%" stroke="#475569" strokeWidth="0.3" strokeDasharray="2,8" />
          <line x1="0%" y1="61.8%" x2="100%" y2="61.8%" stroke="#475569" strokeWidth="0.3" strokeDasharray="2,8" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* TOP ARCHITECTURAL STATUS BAR & CONTROLS                                  */}
      {/* Brand mark, real-time stage progress, Skip/Replay controls               */}
      {/* ========================================================================= */}
      <div className="absolute top-0 left-0 right-0 p-5 sm:p-7 flex items-center justify-between z-30 pointer-events-none">
        {/* Left: Studio Identity Telemetry */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          <div className="w-9 h-9 flex items-center justify-center">
            <img
              src={OPENING_LOGO}
              onError={(e) => {
                (e.target as HTMLImageElement).src = OPENING_LOGO_STATIC_URL;
              }}
              alt="Lora Edge Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-[12px] font-medium tracking-[0.25em] text-white uppercase flex items-center gap-2">
              <span>{BRAND_NAME}</span>
              <span className="text-[8px] font-mono tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full">
                AI STUDIO
              </span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-[#94A3B8] uppercase">
              ARCHITECTURAL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Center: Interactive Architectural Sequence Stage Breadcrumb */}
        {phase !== 'signin' && (
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono bg-[#070A12]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl pointer-events-auto">
            <button
              onClick={() => {
                setElapsedMs(800);
                setPhase('draw');
              }}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                phase === 'draw'
                  ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              01 DRAW
            </button>
            <span className="text-gray-700">——</span>
            <button
              onClick={() => {
                setElapsedMs(3500);
                setPhase('structure');
              }}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                phase === 'structure'
                  ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              02 STRUCTURE
            </button>
            <span className="text-gray-700">——</span>
            <button
              onClick={() => {
                setElapsedMs(6200);
                setPhase('form');
              }}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                phase === 'form'
                  ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              03 FORM
            </button>
            <span className="text-gray-700">——</span>
            <button
              onClick={() => {
                setElapsedMs(9200);
                setPhase('intelligence');
              }}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                phase === 'intelligence'
                  ? 'text-[#2DD4BF] font-semibold bg-[#2DD4BF]/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              04 INTELLIGENCE
            </button>
          </div>
        )}

        {/* Right: Skip / Replay Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {phase !== 'signin' ? (
            <button
              onClick={handleSkipToSignIn}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#0A0E17]/80 hover:bg-[#151D2C] border border-[#334155] hover:border-[#D4AF37]/60 text-xs font-mono text-gray-300 hover:text-white transition-all backdrop-blur-md shadow-md"
            >
              <span className="tracking-wider">ENTER STUDIO</span>
              <span className="text-[10px] text-gray-500 group-hover:text-[#D4AF37]">[ESC]</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0A0E17]/80 hover:bg-[#151D2C] border border-[#1E293B] hover:border-[#D4AF37]/50 text-xs font-mono text-gray-400 hover:text-[#D4AF37] transition-all backdrop-blur-md"
              title="Replay Cinematic Opening Sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">REPLAY SEQUENCE</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 01 – 04: THE CINEMATIC ARCHITECTURAL LOGO REVEAL SEQUENCE                 */}
      {/* DRAW → STRUCTURE → FORM → INTELLIGENCE (Active when phase !== 'signin')   */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {phase !== 'signin' && (
          <motion.div
            key="cinematic-sequence"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center justify-center text-center select-none"
            style={{
              transform: `perspective(1200px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg)`,
            }}
          >
            {/* CENTRAL STAGE CONTAINER */}
            <div className="relative w-[340px] sm:w-[460px] h-[340px] sm:h-[420px] flex items-center justify-center">
              {/* ============================================================= */}
              {/* STAGE 01: DRAW — Thin CAD Drafting Lines, Coordinates & Grids */}
              {/* ============================================================= */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {/* Dynamic drafting crosshairs and bounding dimensions */}
                <motion.line
                  x1="-20%"
                  y1="50%"
                  x2="120%"
                  y2="50%"
                  stroke="#D4AF37"
                  strokeWidth="0.7"
                  strokeDasharray="4,8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />
                <motion.line
                  x1="50%"
                  y1="-20%"
                  x2="50%"
                  y2="120%"
                  stroke="#D4AF37"
                  strokeWidth="0.7"
                  strokeDasharray="4,8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.2 }}
                />

                {/* Precision CAD Caliper Circle and Radial Angles */}
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="150"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="0.6"
                  strokeDasharray="2,6"
                  initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 0.45, rotate: 0 }}
                  transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                />

                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="85"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="0.5"
                  strokeDasharray="1,5"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ duration: 1.8, delay: 0.4 }}
                />

                {/* Diagonal Construction Lines Tracing Architectural Angle */}
                <motion.line
                  x1="15%"
                  y1="85%"
                  x2="85%"
                  y2="15%"
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                  strokeDasharray="3,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 1.8, delay: 0.3 }}
                />
                <motion.line
                  x1="85%"
                  y1="85%"
                  x2="15%"
                  y2="15%"
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                  strokeDasharray="3,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 1.8, delay: 0.4 }}
                />

                {/* Dimension Arrows & Real Architectural Annotations */}
                <g className="text-[9px] font-mono fill-[#D4AF37]">
                  <motion.text
                    x="5%"
                    y="47%"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.8 }}
                  >
                    Δx: +18,400mm
                  </motion.text>
                  <motion.text
                    x="51%"
                    y="10%"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 1.0 }}
                  >
                    RL +32.40m [DATUM A]
                  </motion.text>
                  <motion.text
                    x="75%"
                    y="88%"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 1.2 }}
                  >
                    φ = 1.618 [GOLDEN TANGENT]
                  </motion.text>
                </g>

                {/* Snapping Corner Vector Reticles */}
                <rect x="22%" y="22%" width="12" height="12" fill="none" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.6" />
                <rect x="75%" y="22%" width="12" height="12" fill="none" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.6" />
                <rect x="22%" y="75%" width="12" height="12" fill="none" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.6" />
                <rect x="75%" y="75%" width="12" height="12" fill="none" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.6" />
              </svg>

              {/* ============================================================= */}
              {/* STAGE 02: STRUCTURE — 3D Extrusion Wireframe & Nodes          */}
              {/* ============================================================= */}
              {(phase === 'structure' || phase === 'form' || phase === 'intelligence') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <svg className="w-full h-full overflow-visible">
                    {/* Isometric structural lattice facets */}
                    <motion.polygon
                      points="230,70 340,150 230,230 120,150"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="1"
                      strokeDasharray="6,4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 1.8 }}
                    />
                    <motion.polygon
                      points="230,120 310,180 230,280 150,180"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeWidth="0.8"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{ duration: 1.8, delay: 0.3 }}
                    />
                    {/* Structural nodes */}
                    <circle cx="230" cy="70" r="3.5" fill="#D4AF37" />
                    <circle cx="340" cy="150" r="3.5" fill="#D4AF37" />
                    <circle cx="230" cy="230" r="3.5" fill="#2DD4BF" />
                    <circle cx="120" cy="150" r="3.5" fill="#D4AF37" />
                    <circle cx="230" cy="280" r="3" fill="#2DD4BF" />
                  </svg>
                </motion.div>
              )}

              {/* ============================================================= */}
              {/* STAGE 03: FORM — Solid Physical Logo with Light Sweep & 3D    */}
              {/* Uses exact asset: ChatGPT Image Sep 5, 2026, 11_32_47 AM.png */}
              {/* ============================================================= */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
                animate={{
                  opacity: phase === 'draw' ? 0.2 : 1,
                  scale: phase === 'draw' ? 0.9 : 1,
                  filter: phase === 'draw' ? 'blur(6px) grayscale(80%)' : 'blur(0px) grayscale(0%)',
                }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-[240px] sm:w-[320px] max-w-[80vw] flex items-center justify-center pointer-events-none group"
              >
                {/* Exact Specified Opening Logo Asset with Transparent Background and Zero Borders */}
                <img
                  src={OPENING_LOGO}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = OPENING_LOGO_STATIC_URL;
                  }}
                  alt="Lora Edge Architectural Emblem"
                  className="w-full h-auto max-h-[220px] sm:max-h-[260px] object-contain drop-shadow-[0_20px_60px_rgba(212,175,55,0.3)] filter contrast-110 brightness-105"
                />

                {/* Dynamic Warm Architectural Light Sweep Beam across the transparent emblem */}
                {(phase === 'form' || phase === 'intelligence') && (
                  <motion.div
                    initial={{ x: '-150%', opacity: 0 }}
                    animate={{ x: '180%', opacity: [0, 0.85, 0.85, 0] }}
                    transition={{
                      duration: 2.4,
                      ease: [0.25, 1, 0.5, 1],
                      repeat: phase === 'form' ? 0 : Infinity,
                      repeatDelay: 4.5,
                    }}
                    className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-[#FEF3C7]/30 to-transparent skew-x-[-25deg] pointer-events-none mix-blend-screen blur-sm"
                  />
                )}
              </motion.div>

              {/* ============================================================= */}
              {/* STAGE 04: INTELLIGENCE — Radiating Generative Architectural  */}
              {/* Network: Grids, Floor Plans, Building Silhouette, Solar Arc   */}
              {/* ============================================================= */}
              {phase === 'intelligence' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <svg className="w-[740px] h-[740px] overflow-visible">
                    <defs>
                      {/* Concrete / Timber Hatch Material Pattern */}
                      <pattern id="archHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#D4AF37" strokeWidth="0.5" opacity="0.35" />
                      </pattern>
                      <linearGradient id="streamlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
                        <stop offset="50%" stopColor="#2DD4BF" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>

                    {/* 01: ARCHITECTURAL GRIDS (Polar & Cartesian Module) */}
                    <motion.circle
                      cx="370"
                      cy="370"
                      r="310"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="0.4"
                      strokeDasharray="2,8"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.3 }}
                      transition={{ duration: 1.8 }}
                    />
                    <line x1="70" y1="370" x2="670" y2="370" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="3,7" opacity="0.3" />
                    <line x1="370" y1="70" x2="370" y2="670" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="3,7" opacity="0.3" />

                    {/* 02: STRUCTURAL LINES & COLUMN NODES */}
                    <g opacity="0.45">
                      <line x1="210" y1="180" x2="210" y2="560" stroke="#2DD4BF" strokeWidth="0.5" strokeDasharray="4,6" />
                      <line x1="530" y1="180" x2="530" y2="560" stroke="#2DD4BF" strokeWidth="0.5" strokeDasharray="4,6" />
                      {/* Column markers with grid labels */}
                      <rect x="206" y="246" width="8" height="8" fill="#0A0E17" stroke="#2DD4BF" strokeWidth="1" />
                      <rect x="526" y="246" width="8" height="8" fill="#0A0E17" stroke="#2DD4BF" strokeWidth="1" />
                      <rect x="206" y="496" width="8" height="8" fill="#0A0E17" stroke="#2DD4BF" strokeWidth="1" />
                      <rect x="526" y="496" width="8" height="8" fill="#0A0E17" stroke="#2DD4BF" strokeWidth="1" />
                      <text x="195" y="240" fill="#2DD4BF" fontSize="8" fontFamily="monospace">GRID A-01</text>
                      <text x="515" y="240" fill="#2DD4BF" fontSize="8" fontFamily="monospace">GRID B-01</text>
                    </g>

                    {/* 03: FLOOR-PLAN GEOMETRY (Wall lines, partitions, door swing arc) */}
                    <g opacity="0.5">
                      <motion.path
                        d="M 120 480 L 250 480 L 250 560 L 120 560 Z"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="0.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.6 }}
                      />
                      {/* Door swing arc */}
                      <path d="M 210 480 A 30 30 0 0 1 240 510" fill="none" stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="2,3" />
                      <line x1="210" y1="480" x2="210" y2="510" stroke="#D4AF37" strokeWidth="0.8" />
                      <text x="135" y="525" fill="#D4AF37" fontSize="8" fontFamily="monospace">GALLERY ATRIUM // 142m²</text>
                    </g>

                    {/* 04: CONTEMPORARY BUILDING SILHOUETTE & FACADE MULLIONS */}
                    <g opacity="0.35">
                      <motion.path
                        d="M 500 540 L 500 420 L 590 420 L 590 470 L 660 470 L 660 540"
                        fill="none"
                        stroke="#2DD4BF"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2 }}
                      />
                      {/* Vertical facade louvers */}
                      <line x1="520" y1="420" x2="520" y2="540" stroke="#2DD4BF" strokeWidth="0.5" />
                      <line x1="540" y1="420" x2="540" y2="540" stroke="#2DD4BF" strokeWidth="0.5" />
                      <line x1="560" y1="420" x2="560" y2="540" stroke="#2DD4BF" strokeWidth="0.5" />
                      <text x="505" y="410" fill="#2DD4BF" fontSize="8" fontFamily="monospace">MASSING ELEVATION 02</text>
                    </g>

                    {/* 05: SUSTAINABILITY DIAGRAM (Sun-Path Arc & Bioclimatic Wind Vector) */}
                    <motion.path
                      d="M 100 450 A 280 200 0 0 1 640 450"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1"
                      strokeDasharray="4,6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2.2, ease: 'easeInOut' }}
                    />
                    <circle cx="370" cy="250" r="5" fill="#F59E0B" />
                    <text x="382" y="246" fill="#F59E0B" fontSize="9" fontFamily="monospace">
                      SOLAR ZENITH: 64.2° // PASSIVE DAYLIGHT AUTONOMY 86%
                    </text>

                    {/* Aerodynamic cross-ventilation flow streamlines */}
                    <path
                      d="M 80 340 C 180 320, 260 380, 360 350 C 460 320, 540 370, 660 340"
                      fill="none"
                      stroke="url(#streamlineGrad)"
                      strokeWidth="1.2"
                      strokeDasharray="6,4"
                    />
                    <text x="85" y="330" fill="#2DD4BF" fontSize="8" fontFamily="monospace">
                      VENTILATION VECTOR: 2.1 m/s (NATURAL AIR FLUSH)
                    </text>

                    {/* 06: PARAMETRIC ISO-CONTOUR RIBS */}
                    <motion.ellipse
                      cx="370"
                      cy="370"
                      rx="270"
                      ry="135"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="0.6"
                      strokeDasharray="5,7"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.4 }}
                      transition={{ duration: 1.8, ease: 'easeOut' }}
                    />
                    <motion.ellipse
                      cx="370"
                      cy="370"
                      rx="320"
                      ry="160"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeWidth="0.5"
                      strokeDasharray="2,6"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.35 }}
                      transition={{ duration: 2.0, delay: 0.2, ease: 'easeOut' }}
                    />

                    {/* 07: ELEVATION DRAWINGS & DATUM MARKERS */}
                    <g opacity="0.6">
                      <line x1="50" y1="140" x2="690" y2="140" stroke="#64748B" strokeWidth="0.5" strokeDasharray="3,8" />
                      <polygon points="50,140 60,135 60,145" fill="#D4AF37" />
                      <text x="70" y="137" fill="#D4AF37" fontSize="8" fontFamily="monospace">ROOF LEVEL +18.500m</text>

                      <line x1="50" y1="590" x2="690" y2="590" stroke="#64748B" strokeWidth="0.5" strokeDasharray="3,8" />
                      <polygon points="50,590 60,585 60,595" fill="#D4AF37" />
                      <text x="70" y="587" fill="#D4AF37" fontSize="8" fontFamily="monospace">FINISHED FLOOR DATUM +0.000m</text>
                    </g>

                    {/* 08: DIGITAL COORDINATES & TELEMETRY */}
                    <g className="text-[8px] font-mono fill-gray-400">
                      <text x="475" y="625">EPSG:3857 [WGS84 WORLD MERCATOR]</text>
                      <text x="475" y="638">LAT: 51.5074° N | LNG: 0.1278° W</text>
                      <text x="475" y="651">AI PARAMETRIC ENGINE: ONLINE</text>
                    </g>

                    {/* 09: MATERIAL PATTERNS (Timber Louver / Architectural Concrete Hashing) */}
                    <rect x="580" y="180" width="70" height="40" fill="url(#archHatch)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="580" y="172" fill="#D4AF37" fontSize="7" fontFamily="monospace">MATERIAL: TIMBER LOUVERS 150mm</text>
                  </svg>
                </motion.div>
              )}
            </div>

            {/* ================================================================= */}
            {/* 02 — FASHION-FORWARD BRAND MOMENT                                 */}
            {/* Breathless negative space, minimal editorial geometric typography */}
            {/* ================================================================= */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{
                opacity: phase === 'draw' ? 0.3 : 1,
                y: 0,
              }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 space-y-3"
            >
              {/* LORA EDGE Hero Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extralight tracking-[0.35em] text-white uppercase font-sans">
                LORA EDGE
              </h1>

              {/* ARCHITECTURAL INTELLIGENCE Sub-Brand */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
                <p className="text-xs sm:text-sm md:text-base font-light tracking-[0.5em] text-[#D4AF37] uppercase font-mono">
                  ARCHITECTURAL INTELLIGENCE
                </p>
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
              </div>

              {/* High-fashion design manifesto */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'intelligence' ? 0.8 : 0.4 }}
                transition={{ duration: 1 }}
                className="text-[11px] sm:text-xs text-gray-400 font-mono tracking-widest uppercase max-w-lg mx-auto mt-2"
              >
                PRECISION CAD · RECURSIVE BIM · EDGE BIOCLIMATIC SIMULATION
              </motion.p>
            </motion.div>

            {/* Sequence Progress Bar (Subtle millimetric hairline) */}
            <div className="w-64 sm:w-80 h-[2px] bg-[#1E293B] mt-9 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FEF3C7] to-[#2DD4BF]"
                style={{ width: `${phaseProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
            <div className="text-[9px] font-mono tracking-widest text-gray-500 mt-2 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
              <span>
                CALIBRATING SYSTEM // {phase.toUpperCase()} PHASE ({phaseProgress}%)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 04 & 05: SEAMLESS TRANSITION & FINAL SIGN-IN ENVIRONMENT                 */}
      {/* Emerges naturally with floating translucent architectural console        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {phase === 'signin' && (
          <motion.div
            key="signin-environment"
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 w-full max-w-md px-4 sm:px-6 py-8"
          >
            {/* The Floating Architectural Sign-In Card — Seamless, Borderless, Ultra-Clean */}
            <div className="relative bg-[#070A12]/90 backdrop-blur-3xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/95">
              {/* Card Header with Exact Prompt Copy: "Welcome back" & "Sign in to continue designing" */}
              <div className="space-y-2 mb-7 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] font-mono">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span className="font-semibold tracking-wider uppercase">ARCHITECTURAL INTELLIGENCE</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight font-sans">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 font-normal">
                  Sign in to continue designing
                </p>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Professional Email */}
                <div>
                  <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                    Professional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="architect@practice.com"
                      className="w-full h-12 pl-11 pr-4 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.10] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition font-sans border-0"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono text-gray-300 uppercase tracking-wider">
                      Studio Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link has been dispatched to your verified architectural practice email.')}
                      className="text-[11px] font-mono text-[#D4AF37] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter studio password"
                      className="w-full h-12 pl-11 pr-11 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.10] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition font-sans border-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Session */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/[0.08] border-0 text-[#D4AF37] focus:ring-0 cursor-pointer accent-[#D4AF37]"
                    />
                    <span className="text-xs text-gray-300 font-sans">Remember this workstation</span>
                  </label>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-BIT ENCRYPTED</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full h-12 mt-2 bg-gradient-to-r from-[#D4AF37] via-[#E2B872] to-[#D4AF37] hover:brightness-110 text-[#070A12] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer font-mono border-0"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#070A12] border-t-transparent rounded-full animate-spin" />
                      <span>INITIALIZING STUDIO ACCESS...</span>
                    </>
                  ) : (
                    <>
                      <span>ENTER LORA EDGE STUDIO</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Single Sign-On Architectural Providers — Borderless & Clean */}
              <div className="mt-7 pt-2">
                <div className="text-[10px] font-mono text-gray-500 text-center uppercase tracking-widest mb-3.5">
                  Or Authenticate Via Practice SSO
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('Google')}
                    className="h-10 px-4 bg-white/[0.05] hover:bg-white/[0.09] rounded-xl text-xs text-gray-300 flex items-center justify-center gap-2 transition border-0 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                      />
                    </svg>
                    <span className="font-mono text-[11px]">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('Microsoft')}
                    className="h-10 px-4 bg-white/[0.05] hover:bg-white/[0.09] rounded-xl text-xs text-gray-300 flex items-center justify-center gap-2 transition border-0 cursor-pointer"
                  >
                    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                      <div className="bg-[#F25022]" />
                      <div className="bg-[#7FBA00]" />
                      <div className="bg-[#00A4EF]" />
                      <div className="bg-[#FFB900]" />
                    </div>
                    <span className="font-mono text-[11px]">Microsoft</span>
                  </button>
                </div>
              </div>

              {/* Registration Link */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  New architectural practice?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToSignUp}
                    className="text-[#D4AF37] hover:text-[#FEF3C7] font-medium underline underline-offset-4 transition"
                  >
                    Create your architectural identity
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* BOTTOM TELEMETRY FOOTER                                                   */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 left-6 right-6 hidden md:flex items-center justify-between text-[10px] font-mono text-gray-500 z-20 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="text-[#D4AF37]">SYSTEM ACTIVE</span>
          <span>•</span>
          <span>LAT/LONG: 51.5074° N, 0.1278° W</span>
          <span>•</span>
          <span>KÖPPEN: Cfb (TEMPERATE OCEANIC)</span>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <span>EDGE STANDARD 2026</span>
          <span>•</span>
          <span>IFC 4.3 BIM INTEROPERABILITY</span>
          <span>•</span>
          <span className="text-gray-400">LORA EDGE BUILD 4.8.2</span>
        </div>
      </div>
    </div>
  );
};
