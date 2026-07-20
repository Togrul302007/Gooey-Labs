import React from 'react';
import { FilterParams, PlaygroundMode, ColorPreset, COLOR_PRESETS } from '../types';
import { Sliders, RefreshCw, Palette, Layers, HelpCircle } from 'lucide-react';

interface ControlPanelProps {
  params: FilterParams;
  setParams: React.Dispatch<React.SetStateAction<FilterParams>>;
  mode: PlaygroundMode;
  setMode: (mode: PlaygroundMode) => void;
  selectedPreset: ColorPreset;
  setSelectedPreset: (preset: ColorPreset) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  mode,
  setMode,
  selectedPreset,
  setSelectedPreset
}) => {
  const { blur, multiplier, offset } = params;

  // Custom standard presets
  const handleQuickPreset = (type: 'classic' | 'soft' | 'tension') => {
    switch (type) {
      case 'classic':
        setParams({ blur: 18, multiplier: 19, offset: -9 });
        break;
      case 'soft':
        setParams({ blur: 12, multiplier: 14, offset: -5 });
        break;
      case 'tension':
        setParams({ blur: 28, multiplier: 32, offset: -14 });
        break;
    }
  };

  const handleSliderChange = (key: keyof FilterParams, value: number) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex flex-col gap-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl" id="control-panel-root">
      
      {/* 1. PLAYGROUND MODES */}
      <div className="space-y-3" id="modes-selection-block">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-400">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>SELECT SIMULATION ENVIRONMENT</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'blobs', label: 'Cohesive Blobs' },
            { id: 'particles', label: 'Gooey Fountain' },
            { id: 'text', label: 'Liquid Text' },
            { id: 'visualizer', label: 'Step Explainer' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as PlaygroundMode)}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium font-sans border transition-all ${
                mode === m.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-lg'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
              id={`mode-tab-${m.id}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-neutral-800/60" />

      {/* 2. REAL-TIME FILTER ADJUSTMENTS */}
      <div className="space-y-5" id="filter-sliders-block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-400">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <span>FILTER CALIBRATION (SVG DIRECTIVES)</span>
          </div>
          
          <button
            onClick={() => handleQuickPreset('classic')}
            className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Reset to default classic gooey coefficients"
          >
            <RefreshCw className="h-3 w-3" />
            <span>RESET</span>
          </button>
        </div>

        {/* SLIDER A: Blur stdDeviation */}
        <div className="space-y-1.5" id="blur-slider-container">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1">
              Blur Radius <code className="text-[10px] text-pink-400">(stdDeviation)</code>
            </span>
            <span className="text-emerald-400 font-bold">{blur}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            step="1"
            value={blur}
            onChange={(e) => handleSliderChange('blur', parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-neutral-950 h-2 rounded-lg cursor-pointer"
            id="slider-std-deviation"
          />
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            Sets the blur distance. Larger values allow blobs to merge across wider gaps, creating a larger "glue" bridge.
          </p>
        </div>

        {/* SLIDER B: Contrast Alpha Multiplier */}
        <div className="space-y-1.5" id="contrast-slider-container">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1">
              Contrast Multiplier <code className="text-[10px] text-pink-400">(multiplier)</code>
            </span>
            <span className="text-emerald-400 font-bold">{multiplier}x</span>
          </div>
          <input
            type="range"
            min="2"
            max="60"
            step="1"
            value={multiplier}
            onChange={(e) => handleSliderChange('multiplier', parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-neutral-950 h-2 rounded-lg cursor-pointer"
            id="slider-multiplier"
          />
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            Amplifies alpha channel gradients. High multiplier sharpens blurred boundaries into clean solid lines.
          </p>
        </div>

        {/* SLIDER C: Alpha Offset */}
        <div className="space-y-1.5" id="offset-slider-container">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1">
              Alpha Offset <code className="text-[10px] text-pink-400">(offset)</code>
            </span>
            <span className="text-emerald-400 font-bold">{offset}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="-2"
            step="1"
            value={offset}
            onChange={(e) => handleSliderChange('offset', parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-neutral-950 h-2 rounded-lg cursor-pointer"
            id="slider-offset"
          />
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            Subtracts alpha density. A negative offset carves away the weak outer blur. A larger negative offset increases liquid tension.
          </p>
        </div>
      </div>

      <hr className="border-neutral-800/60" />

      {/* 3. QUICK CALIBRATION PRESETS */}
      <div className="space-y-3" id="quick-presets-block">
        <div className="text-xs font-mono font-bold text-neutral-400">
          QUICK TENSION PRESETS
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickPreset('classic')}
            className="py-1.5 px-2 bg-neutral-950 border border-neutral-800 text-[11px] font-mono hover:text-emerald-300 hover:border-emerald-500/30 rounded-lg text-neutral-400 transition-all"
            id="preset-btn-classic"
          >
            Classic Liquid
          </button>
          <button
            onClick={() => handleQuickPreset('soft')}
            className="py-1.5 px-2 bg-neutral-950 border border-neutral-800 text-[11px] font-mono hover:text-emerald-300 hover:border-emerald-500/30 rounded-lg text-neutral-400 transition-all"
            id="preset-btn-soft"
          >
            Soft Organic
          </button>
          <button
            onClick={() => handleQuickPreset('tension')}
            className="py-1.5 px-2 bg-neutral-950 border border-neutral-800 text-[11px] font-mono hover:text-emerald-300 hover:border-emerald-500/30 rounded-lg text-neutral-400 transition-all"
            id="preset-btn-tension"
          >
            High Tension
          </button>
        </div>
      </div>

      <hr className="border-neutral-800/60" />

      {/* 4. COLOR SCHEMES */}
      <div className="space-y-3" id="color-schemes-block">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-400">
          <Palette className="h-4 w-4 text-emerald-400" />
          <span>COLOR SPECTRUMS</span>
        </div>
        
        <div className="flex flex-col gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-all ${
                selectedPreset.id === preset.id
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
                  : 'bg-neutral-950/40 border-transparent hover:border-neutral-800 text-neutral-400 hover:text-neutral-300'
              }`}
              id={`color-preset-${preset.id}`}
            >
              <span className="font-sans">{preset.name}</span>
              <div className="flex gap-1.5">
                {preset.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
