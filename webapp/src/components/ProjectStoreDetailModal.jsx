import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Upload, 
  Code, 
  Play, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Sun, 
  Zap, 
  Footprints, 
  BatteryCharging, 
  CheckCircle2, 
  HelpCircle, 
  Trophy, 
  Wrench, 
  Sparkles, 
  Star, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  FileCode,
  Flame,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  ExternalLink,
  SquareCheck,
  RotateCcw
} from 'lucide-react';

export function ProjectStoreDetailModal({ 
  isOpen, 
  project, 
  onClose, 
  onUploadCode, 
  onOpenBlockCode, 
  onOpenSerialMonitor,
  device 
}) {
  if (!isOpen || !project) return null;

  const [activeComponentTab, setActiveComponentTab] = useState(project.components?.[0]?.id || 'uv-sensor');
  const [copiedCode, setCopiedCode] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeNav, setActiveNav] = useState('overview');

  const contentRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const scrollToSection = (sectionId) => {
    setActiveNav(sectionId);
    isProgrammaticScroll.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 850);

    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'safety', label: 'Safety' },
    { id: 'requirements', label: 'BOM Parts' },
    { id: 'components', label: 'Components Lab' },
    { id: 'assembly', label: 'Assembly' },
    { id: 'code', label: 'Firmware' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'faq', label: 'FAQ' }
  ];

  const currentNavIndex = Math.max(0, navLinks.findIndex(n => n.id === activeNav));

  const handlePrevNav = () => {
    if (currentNavIndex > 0) {
      scrollToSection(navLinks[currentNavIndex - 1].id);
    }
  };

  const handleNextNav = () => {
    if (currentNavIndex < navLinks.length - 1) {
      scrollToSection(navLinks[currentNavIndex + 1].id);
    }
  };

  // Auto-detect current visible section while user is manually scrolling (Scroll Spy)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    let isThrottled = false;
    const handleScroll = () => {
      // Ignore scroll-spy events triggered during programmatic smooth clicks
      if (isProgrammaticScroll.current) return;

      if (isThrottled) return;
      isThrottled = true;
      requestAnimationFrame(() => {
        if (isProgrammaticScroll.current) {
          isThrottled = false;
          return;
        }

        const containerTop = container.getBoundingClientRect().top;
        const triggerPoint = containerTop + 180;

        for (let i = navLinks.length - 1; i >= 0; i--) {
          const el = document.getElementById(`section-${navLinks[i].id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= triggerPoint) {
              setActiveNav(navLinks[i].id);
              break;
            }
          }
        }
        isThrottled = false;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-slate-950/65 transition-all duration-300 animate-fade-in">
      
      {/* Main Lunar Light Modal Container */}
      <div className="relative w-full max-w-[1440px] h-[95vh] flex flex-col rounded-[32px] bg-gradient-to-br from-[#FCFDFF] via-[#F8FAFC] to-[#F1F5F9] border border-slate-200/90 shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden text-slate-800 font-sans">
        
        {/* Top Lunar Header Bar */}
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0 z-30 gap-2 sm:gap-4 overflow-hidden shadow-xs">
          
          {/* Top Left: Logo & Project Identity */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-[0_0_12px_rgba(186,230,253,0.8)] border border-sky-200 shrink-0">
              <img 
                src="/assets/lunar_sphere_icon.png" 
                alt="LOF TITAN Lunar" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "/logo.webp"; }}
              />
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="font-heading font-extrabold text-base tracking-wide text-slate-900 truncate">
                {project.name}
              </span>
              <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                {project.badge || 'DIY Kit'}
              </span>
            </div>
          </div>

          {/* Center: Premium Single-Item Stepper Pill with Enlarged Typography */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100/90 rounded-full border border-slate-200/90 shadow-2xs text-slate-700">
            <button
              onClick={handlePrevNav}
              disabled={currentNavIndex === 0}
              className={`p-1.5 rounded-full transition-all ${
                currentNavIndex === 0 
                  ? 'opacity-30 cursor-not-allowed text-slate-400' 
                  : 'hover:bg-white hover:text-indigo-600 active:scale-95 text-slate-700 cursor-pointer shadow-2xs'
              }`}
              title="Previous Section"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => scrollToSection(navLinks[currentNavIndex]?.id)}
              className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/90 transition-all w-[150px] sm:w-[180px] justify-center text-center cursor-pointer shadow-2xs overflow-hidden shrink-0"
              title="Jump to Current Section"
            >
              <span className="text-sm sm:text-base font-extrabold text-indigo-700 tracking-wide truncate">
                {navLinks[currentNavIndex]?.label}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono shrink-0">
                ({currentNavIndex + 1}/{navLinks.length})
              </span>
            </button>

            <button
              onClick={handleNextNav}
              disabled={currentNavIndex === navLinks.length - 1}
              className={`p-1.5 rounded-full transition-all ${
                currentNavIndex === navLinks.length - 1 
                  ? 'opacity-30 cursor-not-allowed text-slate-400' 
                  : 'hover:bg-white hover:text-indigo-600 active:scale-95 text-slate-700 cursor-pointer shadow-2xs'
              }`}
              title="Next Section"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Top Right Actions (Never Overflow) */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => onOpenSerialMonitor?.()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Open Live Serial Monitor"
            >
              <Terminal size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Serial</span>
            </button>

            <button 
              onClick={() => onOpenBlockCode?.()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Open in Block Code Studio"
            >
              <Code size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">Block Studio</span>
            </button>

            <button 
              onClick={() => onUploadCode?.(project.code)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              title="Upload & Run on LOF TITAN"
            >
              <Upload size={14} />
              <span>Upload & Run</span>
            </button>

            <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="Close and Return to Store"
            >
              <X size={19} />
            </button>
          </div>

        </div>

        {/* Scrollable Articulate-Style Body Content with Enhanced Typography */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-12 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          
          {/* ================= 1. HERO COVER SECTION ================= */}
          <div id="section-overview" className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-md p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Main Visual Frame */}
              <div className="md:col-span-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 p-5 flex items-center justify-center relative shadow-inner overflow-hidden">
                <img 
                  src={project.heroImage} 
                  alt={project.name} 
                  className="w-full max-h-[320px] object-contain transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.target.src = '/assets/banners/banner_invisible_diy.png'; }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase bg-indigo-600 text-white shadow-sm">
                    {project.badge || 'Official Kit'}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="md:col-span-6 space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 leading-tight">
                    {project.name}
                  </h1>

                  <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
                    {project.description}
                  </p>
                </div>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-0.5">SENSORS</span>
                    <span className="text-sm font-extrabold text-indigo-700">3x UV Photodiodes</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-0.5">LOCOMOTION</span>
                    <span className="text-sm font-extrabold text-indigo-700">8-Leg 4-Bar Link</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-0.5">MCU</span>
                    <span className="text-sm font-extrabold text-indigo-700">ESP32-S3 TITAN</span>
                  </div>
                </div>

                {/* Ratings, Duration & Difficulty Metadata at Bottom */}
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-500 flex-wrap pt-1">
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 font-bold">
                    <Star size={15} className="fill-current" />
                    <span>{project.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">({project.reviews || 128} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 font-bold">
                    <Clock size={15} className="text-indigo-600" />
                    <span>{project.duration || '45 Mins'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 font-bold">
                    <Layers size={15} className="text-purple-600" />
                    <span>{project.difficulty || 'Intermediate'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ================= 2. SAFETY WARNINGS ================= */}
          <div id="section-safety" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={24} className="text-amber-500" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">1. Product Safety Warnings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Hardware Safety */}
              <div className="p-7 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base border-b border-amber-200/60 pb-3">
                  <Wrench size={18} className="text-amber-600" />
                  <span>Hardware & Mechanical Precautions</span>
                </div>
                <ul className="space-y-3.5 text-sm sm:text-base text-amber-950/90 leading-relaxed font-medium">
                  {project.safetyWarnings?.hardware?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{item.replace(/^⚠️\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Electronics Safety */}
              <div className="p-7 rounded-3xl bg-rose-50/80 border border-rose-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 text-rose-950 font-bold text-base border-b border-rose-200/60 pb-3">
                  <Zap size={18} className="text-rose-600" />
                  <span>Electronics & UV Radiation Safety</span>
                </div>
                <ul className="space-y-3.5 text-sm sm:text-base text-rose-950/90 leading-relaxed font-medium">
                  {project.safetyWarnings?.electronics?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5">{item.startsWith('⚡') ? '⚡' : item.startsWith('🔦') ? '🔦' : '⚠️'}</span>
                      <span>{item.replace(/^[⚡🔦⚠️]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* ================= 3. REQUIREMENTS & BOM ================= */}
          <div id="section-requirements" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Layers size={24} className="text-indigo-600" />
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">2. Product Requirements (Bill of Materials)</h2>
              </div>
              <span className="text-sm text-slate-500 font-medium">Click items to check off parts during unboxing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.requirements?.map((req, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between space-y-3.5 ${
                      isChecked 
                        ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        isChecked ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {req.qty}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 text-transparent'
                      }`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-bold text-base ${isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>{req.name}</h4>
                      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">{req.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= 4. COMPONENTS LAB ================= */}
          <div id="section-components" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Cpu size={24} className="text-cyan-600" />
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">3. Components Introduction & Live Labs</h2>
              </div>
              <span className="text-sm text-slate-500 font-medium">Interactive Hardware Theory & Serial Experiments</span>
            </div>

            {/* Component Selector Tabs */}
            <div className="flex gap-2.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              {project.components?.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setActiveComponentTab(comp.id)}
                  className={`flex-1 py-3 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    activeComponentTab === comp.id 
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/90' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Cpu size={16} className={activeComponentTab === comp.id ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{comp.name.split('(')[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Component Deep Dive Card */}
            {(() => {
              const comp = project.components?.find(c => c.id === activeComponentTab) || project.components?.[0];
              if (!comp) return null;

              return (
                <div className="p-6 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-7">
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Visual & Pinout */}
                    <div className="md:col-span-5 space-y-5">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <img 
                          src={comp.image} 
                          alt={comp.name} 
                          className="max-h-48 object-contain rounded-lg"
                          onError={(e) => { e.target.src = '/assets/banners/banner_invisible_diy.png'; }}
                        />
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-xl text-slate-900">{comp.name}</h3>
                        <span className="inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {comp.pinMapping}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm text-slate-700 leading-relaxed font-normal">
                        <div>
                          <strong className="text-slate-900 block font-bold text-base mb-1">What is it?</strong>
                          <p className="text-slate-600">{comp.whatIsIt}</p>
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-bold text-base mb-1">How it works:</strong>
                          <p className="text-slate-600">{comp.howItWorks}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Experiment Lab */}
                    <div className="md:col-span-7 space-y-5 p-6 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 shadow-inner">
                      <div>
                        <h4 className="font-bold text-base sm:text-lg text-cyan-300 flex items-center gap-2">
                          <Zap size={18} className="text-amber-400" /> {comp.experiment?.title}
                        </h4>
                        <p className="text-sm text-slate-300 mt-2 whitespace-pre-line leading-relaxed font-normal">{comp.experiment?.instruction}</p>
                      </div>

                      {/* Code Snippet Box */}
                      <div className="rounded-xl bg-[#060911] border border-slate-800 overflow-hidden">
                        <div className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono text-cyan-400 text-xs font-semibold">lab_experiment.py</span>
                          <button
                            onClick={() => handleCopy(comp.experiment?.testCode)}
                            className="hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                          >
                            {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        </div>
                        <div className="p-4 font-mono text-xs sm:text-sm text-sky-200 overflow-x-auto max-h-56 scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
                          <pre className="whitespace-pre">{comp.experiment?.testCode}</pre>
                        </div>
                      </div>

                      {/* Experiment Execution Buttons */}
                      <div className="flex flex-wrap gap-2.5 justify-end pt-1">
                        <button
                          onClick={() => onUploadCode?.(comp.experiment?.testCode)}
                          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                        >
                          <Upload size={15} />
                          <span>Run Experiment on TITAN</span>
                        </button>

                        <button
                          onClick={() => onOpenSerialMonitor?.()}
                          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                        >
                          <Terminal size={15} className="text-emerald-400" />
                          <span>Open Serial Monitor</span>
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })()}
          </div>

          {/* ================= 5. ASSEMBLY GUIDE ================= */}
          <div id="section-assembly" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <Wrench size={24} className="text-indigo-600" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">4. 4-Bar Linkage Mechanical Assembly</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {project.assembly?.map(item => (
                <div key={item.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {item.step}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base text-slate-900">{item.title}</h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 6. FIRMWARE CODE ================= */}
          <div id="section-code" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <FileCode size={24} className="text-blue-600" />
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">5. Production MicroPython Firmware</h2>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleCopy(project.code)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-slate-700 border border-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => onUploadCode?.(project.code)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Upload size={15} />
                  <span>Upload & Run on TITAN</span>
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-[#060911] border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-400">
                <span className="font-mono text-cyan-400 font-bold">invisible_rover.py</span>
                <span className="text-xs text-slate-500">MicroPython ESP32-S3 Firmware</span>
              </div>
              <div className="p-5 sm:p-7 font-mono text-xs sm:text-sm text-sky-200 overflow-x-auto max-h-[440px] scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
                <pre className="whitespace-pre">{project.code}</pre>
              </div>
            </div>
          </div>

          {/* ================= 7. CODING CHALLENGES ================= */}
          <div id="section-challenges" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <Trophy size={24} className="text-amber-500" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">6. Robotics Mission Challenges</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {project.challenges?.map(ch => (
                <div key={ch.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-5 hover:border-indigo-300 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        ch.level === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                        ch.level === 'Intermediate' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {ch.level}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900">{ch.title}</h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">{ch.goal}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="text-indigo-700">💡 Hint:</strong> {ch.hint}
                  </div>

                  <button
                    onClick={() => onOpenBlockCode?.()}
                    className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Code size={15} />
                    <span>Solve in Block Studio</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 8. FAQ & TROUBLESHOOTING ================= */}
          <div id="section-faq" className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <HelpCircle size={24} className="text-purple-600" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">7. FAQ & Hardware Troubleshooting</h2>
            </div>

            <div className="space-y-4">
              {project.faq?.map((item, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <h4 className="font-bold text-base sm:text-lg text-indigo-900 flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-extrabold shrink-0">Q</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 pl-8 leading-relaxed font-normal">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Completion & Launch Card */}
          <div className="max-w-5xl mx-auto p-7 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-heading font-extrabold">Ready to Build & Deploy {project.name}?</h3>
              <p className="text-sm text-blue-100 max-w-xl leading-relaxed font-normal">
                Connect your LOF TITAN board via Web Bluetooth, upload the firmware code, or customize the 8-leg walking algorithm in Block Code Studio!
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => onOpenBlockCode?.()}
                className="px-6 py-3 rounded-full text-sm font-bold bg-white text-indigo-700 hover:bg-blue-50 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Code size={16} />
                <span>Open Block Studio</span>
              </button>
              <button
                onClick={() => onUploadCode?.(project.code)}
                className="px-6 py-3 rounded-full text-sm font-bold bg-indigo-950 text-white hover:bg-slate-900 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} />
                <span>Upload to Rover</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
