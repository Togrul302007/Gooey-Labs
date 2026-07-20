import React, { useState, useEffect, useRef } from 'react';
import { FilterParams } from '../types';
import { Play, Pause, RefreshCw, Info, HelpCircle } from 'lucide-react';

interface FilterVisualizerProps {
  params: FilterParams;
}

export const FilterVisualizer: React.FC<FilterVisualizerProps> = ({ params }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [distance, setDistance] = useState<number>(0); // 0 (merged) to 1 (separated)
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      timeRef.current += 0.02;
      // Oscillate distance between -20px and 120px to show merge and split
      const norm = (Math.sin(timeRef.current) + 1) / 2; // 0 to 1
      setDistance(norm);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Calculations for circle positions in the visualizers
  // Container is width 240px, height 160px. Center is 120, 80.
  const r1 = 40;
  const r2 = 30;
  const maxSep = 80; // maximum separation in pixels
  const currentSep = distance * maxSep;

  // Circle 1 center: x1 = 120 - currentSep / 2
  // Circle 2 center: x2 = 120 + currentSep / 2
  const cx1 = 120 - currentSep / 2;
  const cx2 = 120 + currentSep / 2;
  const cy = 80;

  return (
    <div className="flex flex-col gap-6" id="filter-visualizer">
      {/* Visualizer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1: Raw Overlapping Shapes */}
        <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl" id="step-1-card">
          <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 font-mono">STEP 1: RAW VECTOR SHAPES</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded">
              Original Elements
            </span>
          </div>
          
          <div className="h-44 bg-neutral-950 flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full">
              <circle cx={cx1} cy={cy} r={r1} fill="#ff007f" />
              <circle cx={cx2} cy={cy} r={r2} fill="#7b2cbf" />
            </svg>
            
            {/* Overlay grid lines for laboratory feel */}
            <div className="absolute inset-0 pointer-events-none opacity-5 grid grid-cols-6 grid-rows-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-t border-l border-white"></div>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">The Base Geometry</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Standard CSS or vector objects overlapping in normal space. The edges are crisp and separated by hard, solid boundaries.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/50 text-[10px] font-mono text-neutral-500">
              Output: Clear overlapping paths
            </div>
          </div>
        </div>

        {/* Step 2: Gaussian Blur */}
        <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl" id="step-2-card">
          <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 font-mono">STEP 2: GAUSSIAN BLUR</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded">
              feGaussianBlur
            </span>
          </div>

          <div className="h-44 bg-neutral-950 flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full">
              <g style={{ filter: `blur(${params.blur}px)` }}>
                <circle cx={cx1} cy={cy} r={r1} fill="#ff007f" />
                <circle cx={cx2} cy={cy} r={r2} fill="#7b2cbf" />
              </g>
            </svg>

            {/* Overlay grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-5 grid grid-cols-6 grid-rows-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-t border-l border-white"></div>
              ))}
            </div>
            
            {/* Highlight standard deviation blur in action */}
            <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-500 bg-neutral-950/80 px-2 py-1 rounded border border-neutral-800">
              blur-radius: {params.blur}px
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">The Diffused Overlap</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Applying standard deviation blur. The shapes merge into a smooth gradient of alpha values. Notice how a "bridge" of alpha forms between them.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/50 text-[10px] font-mono text-neutral-500">
              Output: High-radius Gaussian blur
            </div>
          </div>
        </div>

        {/* Step 3: Color Matrix Threshold */}
        <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl" id="step-3-card">
          <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 font-mono">STEP 3: SHARP GOOEY MATRIX</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded">
              feColorMatrix
            </span>
          </div>

          <div className="h-44 bg-neutral-950 flex items-center justify-center relative overflow-hidden">
            {/* We apply our actual pure gooey filter here */}
            <svg className="w-full h-full" style={{ filter: 'url(#gooey-pure)' }}>
              <circle cx={cx1} cy={cy} r={r1} fill="#ff007f" />
              <circle cx={cx2} cy={cy} r={r2} fill="#7b2cbf" />
            </svg>

            {/* Overlay grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-5 grid grid-cols-6 grid-rows-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-t border-l border-white"></div>
              ))}
            </div>

            {/* Matrix parameters indicator */}
            <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-500 bg-neutral-950/80 px-2 py-1 rounded border border-neutral-800">
              matrix: {params.multiplier}α + {params.offset}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">The Gooey Metaball</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                The matrix increases the alpha channel's contrast. By multiplying and applying a negative offset, blurry gradients are sharpened into a fluid bridge.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/50 text-[10px] font-mono text-neutral-500">
              Output: Liquid organic fusion
            </div>
          </div>
        </div>

      </div>

      {/* Control Strip & Interactive Explainer */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center h-11 w-11 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all shadow-md border border-neutral-700/50"
            id="visualizer-play-btn"
            title={isPlaying ? "Pause Simulation" : "Play Simulation"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
          </button>

          <button
            onClick={() => {
              timeRef.current = 0;
              setDistance(0);
            }}
            className="flex items-center justify-center h-11 w-11 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 active:scale-95 transition-all shadow-md border border-neutral-700/50"
            id="visualizer-reset-btn"
            title="Reset Position"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <div className="flex-1 md:flex-none">
            <div className="text-xs text-neutral-500 font-mono">SIMULATION DISTANCE</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={distance}
              disabled={isPlaying}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full md:w-44 accent-emerald-500 bg-neutral-950 h-1.5 rounded-lg cursor-pointer disabled:opacity-50 mt-1"
            />
          </div>
        </div>

        <div className="text-xs text-neutral-400 max-w-md bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 leading-relaxed">
          <span className="font-semibold text-neutral-300">How it works:</span> In the final stage, pixels with alpha below standard threshold are discarded, while pixels above standard are turned solid. This cuts off the soft outer blur, revealing the cohesive gooey shape!
        </div>
      </div>

      {/* Educational Math Matrix */}
      {showExplanation && (
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-6" id="educational-matrix-info">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-200">Understanding the Color Matrix Math</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                The gooey effect relies on standard SVG <code className="text-emerald-300 font-mono bg-neutral-900 px-1 py-0.5 rounded">feColorMatrix</code>. This matrix maps the Red, Green, Blue, and Alpha channel of each pixel using a custom linear combination. The specific row for the Alpha (A) channel calculation looks like this:
              </p>
              
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl font-mono text-xs overflow-x-auto text-neutral-300">
                <div className="text-neutral-500 mb-1">// RGBA Matrix values grid</div>
                <div>{`values="1 0 0 0 0`} <span className="text-neutral-600">// Red channel remains unchanged</span></div>
                <div>{`        0 1 0 0 0`} <span className="text-neutral-600">// Green channel remains unchanged</span></div>
                <div>{`        0 0 1 0 0`} <span className="text-neutral-600">// Blue channel remains unchanged</span></div>
                <div className="text-emerald-400 font-bold">{`        0 0 0 ${params.multiplier} ${params.offset}"`} <span className="text-emerald-500">// Output Alpha = (Alpha * ${params.multiplier}) + ${params.offset}</span></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-neutral-300">The Multiplier ({params.multiplier})</div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Acts as the contrast booster. By multiplying the soft, blurry alpha values, it makes the transition from transparent (0) to opaque (1) extremely steep, sharpening the blurred edge.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-neutral-300">The Offset ({params.offset})</div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Acts as the threshold cutoff. A negative offset shifts the alpha values down, carving away the outer edge of the blur. It decides exactly where the liquid "breaks" apart or "fuses" together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
