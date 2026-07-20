import React, { useState } from 'react';
import { FilterParams, PlaygroundMode, COLOR_PRESETS, ColorPreset } from './types';
import { GooeyFilterSVG } from './components/GooeyFilterSVG';
import { PlaygroundCanvas } from './components/PlaygroundCanvas';
import { ControlPanel } from './components/ControlPanel';
import { FilterVisualizer } from './components/FilterVisualizer';
import { CodeExporter } from './components/CodeExporter';
import { FlaskConical, Github, Settings, Plus, Play, Info, Sparkles, Sliders, Layers, FileCode, Check } from 'lucide-react';

export default function App() {
  // Master state for filter parameters (calibrated to beautiful classic defaults)
  const [params, setParams] = useState<FilterParams>({
    blur: 18,
    multiplier: 19,
    offset: -9
  });

  // Master state for simulation environment
  const [mode, setMode] = useState<PlaygroundMode>('blobs');

  // Master state for color scheme preset
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>(COLOR_PRESETS[0]);

  // Gooey Action Menu state (Floating widget in corner of screen to show real-world UI usage)
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
  const [clickedAction, setClickedAction] = useState<string | null>(null);

  const triggerAction = (label: string) => {
    setClickedAction(label);
    setTimeout(() => setClickedAction(null), 1500);
    
    // Perform helpful preset calibrations
    if (label === "Soft preset") {
      setParams({ blur: 12, multiplier: 14, offset: -5 });
    } else if (label === "Tension preset") {
      setParams({ blur: 28, multiplier: 32, offset: -14 });
    } else if (label === "Classic preset") {
      setParams({ blur: 18, multiplier: 19, offset: -9 });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-20 relative overflow-x-hidden" id="app-root">
      
      {/* 1. Master SVG Filter Injected */}
      <GooeyFilterSVG params={params} />

      {/* Lab Header Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[40vw] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[35vw] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4" id="lab-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20" id="brand-logo">
              <FlaskConical className="h-5.5 w-5.5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black tracking-tight text-lg text-white">Gooey Labs</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono rounded">
                  v1.2.0
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono">SVG FLUID DYNAMICS RESEARCH SANDBOX</p>
            </div>
          </div>

          {/* Quick Learning Stats */}
          <div className="hidden md:flex items-center gap-6 text-xs text-neutral-400 font-mono" id="header-stat-bar">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-neutral-500">BLUR MATRIX STAGE</span>
              <span className="text-neutral-200 font-semibold">{params.blur}px stdDeviation</span>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-neutral-500">THRESHOLD CALCULATION</span>
              <span className="text-emerald-400 font-bold">{params.multiplier}α + {params.offset}</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT BODY */}
      <main className="max-w-7xl mx-auto px-6 mt-8" id="lab-main-layout">
        
        {/* LANDING INFORMATION & LEARNING OUTCOMES */}
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-xl" id="educational-banner">
          <div className="absolute top-0 right-0 h-full w-[250px] bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] text-emerald-300 font-mono font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Interactive Animation Laboratory</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-white leading-tight">
              Mastering the SVG Gooey Effect
            </h1>
            
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Welcome to Gooey Labs! This application provides a full interactive sandbox to demystify how the <strong className="text-neutral-200">SVG gooey filter</strong> works. By coupling a standard Gaussian blur (<code className="text-emerald-300 font-mono text-xs bg-neutral-950 px-1.5 py-0.5 rounded">feGaussianBlur</code>) with an alpha contrast matrix (<code className="text-emerald-300 font-mono text-xs bg-neutral-950 px-1.5 py-0.5 rounded">feColorMatrix</code>), we can turn standard separate HTML elements into organic, merging metaballs!
            </p>

            {/* Quick objective pills */}
            <div className="flex flex-wrap gap-2 pt-1.5 text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg">✓ SVG Filters</span>
              <span className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg">✓ Dynamic Color Matrix</span>
              <span className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg">✓ Interactive Physics Sandbox</span>
              <span className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg">✓ Text Morphing Transitions</span>
            </div>
          </div>
        </section>

        {/* WORKSPACE BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="sandbox-bento-grid">
          
          {/* LEFT AREA: INTERACTIVE SIMULATION CANVAS & EDUCATIONAL STEPS */}
          <div className="lg:col-span-8 flex flex-col gap-6" id="left-workspace-column">
            
            {/* Conditional view based on tab */}
            {mode === 'visualizer' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    <span>THE GOOEY MECHANICS EXPLORER</span>
                  </h3>
                  <button 
                    onClick={() => setMode('blobs')} 
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    RETURN TO PLAYGROUND →
                  </button>
                </div>
                <FilterVisualizer params={params} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <PlaygroundCanvas 
                  mode={mode} 
                  colorPreset={selectedPreset} 
                  params={params} 
                />
              </div>
            )}

            {/* Floating Quick Action Demo widget attached directly under sandbox */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden" id="gooey-widget-showcase">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="space-y-1.5 max-w-md">
                  <span className="text-[10px] font-mono text-pink-400 font-bold bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                    LIVE PRODUCT COMPONENT DEMO
                  </span>
                  <h4 className="text-sm font-bold text-neutral-200">Gooey UI Floating Action Menu</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Hover or click the glowing plus launcher to watch navigation sub-buttons organically split and peel out using the composite SVG filter. Click sub-buttons to load instant parameter presets!
                  </p>
                  
                  {clickedAction && (
                    <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-md animate-pulse">
                      Executed action: <strong className="text-emerald-300">{clickedAction}</strong>
                    </div>
                  )}
                </div>

                {/* THE FLOATING GOOEY QUICK ACTION HUB */}
                <div className="relative py-8 px-12 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 w-full md:w-auto flex items-center justify-center min-h-[140px]">
                  
                  {/* Container with the COMPOSITE gooey filter applied to keep inner icons crisp */}
                  <div 
                    className="relative flex items-center justify-center w-28 h-28" 
                    style={{ filter: 'url(#gooey-composite)' }}
                  >
                    
                    {/* Floating Action 1 */}
                    <button
                      onClick={() => triggerAction("Classic preset")}
                      className={`absolute h-10 w-10 rounded-full bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center cursor-pointer shadow-md transition-all duration-500 ${
                        isMenuExpanded 
                          ? 'translate-y-[-50px] opacity-100 scale-100' 
                          : 'translate-y-0 opacity-0 scale-50 pointer-events-none'
                      }`}
                      title="Load Classic Preset"
                      id="gooey-sub-btn-1"
                    >
                      <span className="text-[9px] font-mono font-black">CLS</span>
                    </button>

                    {/* Floating Action 2 */}
                    <button
                      onClick={() => triggerAction("Soft preset")}
                      className={`absolute h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center cursor-pointer shadow-md transition-all duration-500 ${
                        isMenuExpanded 
                          ? 'translate-x-[-45px] translate-y-[25px] opacity-100 scale-100' 
                          : 'translate-x-0 translate-y-0 opacity-0 scale-50 pointer-events-none'
                      }`}
                      title="Load Soft Preset"
                      id="gooey-sub-btn-2"
                    >
                      <span className="text-[9px] font-mono font-black">SFT</span>
                    </button>

                    {/* Floating Action 3 */}
                    <button
                      onClick={() => triggerAction("Tension preset")}
                      className={`absolute h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer shadow-md transition-all duration-500 ${
                        isMenuExpanded 
                          ? 'translate-x-[45px] translate-y-[25px] opacity-100 scale-100' 
                          : 'translate-x-0 translate-y-0 opacity-0 scale-50 pointer-events-none'
                      }`}
                      title="Load Tension Preset"
                      id="gooey-sub-btn-3"
                    >
                      <span className="text-[9px] font-mono font-black">TEN</span>
                    </button>

                    {/* Core Launcher Trigger */}
                    <button
                      onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                      className={`h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-neutral-950 flex items-center justify-center shadow-lg transition-transform duration-500 cursor-pointer ${
                        isMenuExpanded ? 'rotate-45' : 'rotate-0'
                      }`}
                      id="gooey-main-launcher"
                      title="Toggle Action Hub"
                    >
                      <Plus className="h-6 w-6 stroke-[3]" />
                    </button>

                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* RIGHT AREA: CALIBRATION SLIDERS, SPECTRUMS & CODE EXPORTER */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="right-workspace-column">
            
            {/* Control Panel */}
            <ControlPanel
              params={params}
              setParams={setParams}
              mode={mode}
              setMode={setMode}
              selectedPreset={selectedPreset}
              setSelectedPreset={setSelectedPreset}
            />

            {/* Code Exporter */}
            <CodeExporter params={params} />

          </div>

        </div>

      </main>

      {/* LAB LABELS / CREDIT TAGS */}
      <footer className="mt-20 border-t border-neutral-900 bg-neutral-950 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Gooey Labs Playground. Crafted with standard SVG Filter Directives and React Physics.</p>
          <div className="flex gap-4">
            <span className="text-emerald-400">● sRGB Color Interpolation</span>
            <span>● feGaussianBlur + feColorMatrix</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
