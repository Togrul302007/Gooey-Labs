import React, { useState } from 'react';
import { FilterParams } from '../types';
import { Copy, Check, FileCode, HelpCircle, ArrowRight } from 'lucide-react';

interface CodeExporterProps {
  params: FilterParams;
}

export const CodeExporter: React.FC<CodeExporterProps> = ({ params }) => {
  const [copiedSVG, setCopiedSVG] = useState<boolean>(false);
  const [copiedCSS, setCopiedCSS] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'svg' | 'css' | 'docs'>('svg');

  const { blur, multiplier, offset } = params;

  const svgCode = `<!-- Paste this SVG anywhere in your HTML DOM (preferably near the <body> start) -->
<svg style="visibility: hidden; position: absolute;" width="0" height="0" aria-hidden="true">
  <defs>
    <!-- Option A: Pure Gooey (perfect for fluids, blobs, and particles) -->
    <filter id="gooey-pure" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${multiplier} ${offset}" result="goo" />
    </filter>

    <!-- Option B: Composite Gooey (keeps center content/text crisp, only gooey-fying overlaps) -->
    <filter id="gooey-composite" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${multiplier} ${offset}" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
    </filter>
  </defs>
</svg>`;

  const cssCode = `/* 1. Class for pure fluids/blobs (apply to the PARENT container) */
.gooey-container-pure {
  filter: url('#gooey-pure');
  /* Note: Ensure container has a background or children are heavily colored */
}

/* 2. Class for UI menus/buttons (apply to the PARENT container) */
.gooey-container-composite {
  filter: url('#gooey-composite');
}

/* 3. Essential: Children elements MUST NOT have independent 3D acceleration or transitions that break the SVG buffer. Avoid high CSS scale values unless needed. */
.gooey-child {
  transform: translate3d(0, 0, 0); /* forces hardware acceleration rendering layer */
}`;

  const copyToClipboard = (text: string, type: 'svg' | 'css') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'svg') {
        setCopiedSVG(true);
        setTimeout(() => setCopiedSVG(false), 2000);
      } else {
        setCopiedCSS(true);
        setTimeout(() => setCopiedCSS(false), 2000);
      }
    });
  };

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl" id="code-exporter-root">
      
      {/* Exporter Tabs */}
      <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-neutral-300">CODE GENERATOR</span>
        </div>

        <div className="flex gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          {[
            { id: 'svg', label: 'SVG Filter' },
            { id: 'css', label: 'CSS Classes' },
            { id: 'docs', label: 'Implementation Tips' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'svg' | 'css' | 'docs')}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-emerald-400 font-mono shadow-md'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              id={`code-exporter-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5 bg-neutral-950/25">
        
        {/* SVG FILTER TAB */}
        {activeTab === 'svg' && (
          <div className="space-y-3" id="tab-svg-content">
            <div className="flex justify-between items-center text-[11px] font-mono text-neutral-500">
              <span>ACTIVE SVG MARKUP WITH CALIBRATED COEFFICIENTS</span>
              <button
                onClick={() => copyToClipboard(svgCode, 'svg')}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-emerald-400 hover:text-emerald-300 transition-all active:scale-95"
                id="copy-svg-btn"
              >
                {copiedSVG ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500 animate-bounce" />
                    <span className="text-[10px] text-emerald-500">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-[10px]">COPY CODE</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-neutral-950 text-neutral-300 font-mono text-xs rounded-xl overflow-x-auto border border-neutral-800 max-h-[320px] scrollbar-thin">
              <code>{svgCode}</code>
            </pre>
          </div>
        )}

        {/* CSS CLASSES TAB */}
        {activeTab === 'css' && (
          <div className="space-y-3" id="tab-css-content">
            <div className="flex justify-between items-center text-[11px] font-mono text-neutral-500">
              <span>REQUIRED CSS STYLESHEET CLASSIFICATIONS</span>
              <button
                onClick={() => copyToClipboard(cssCode, 'css')}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-emerald-400 hover:text-emerald-300 transition-all active:scale-95"
                id="copy-css-btn"
              >
                {copiedCSS ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500 animate-bounce" />
                    <span className="text-[10px] text-emerald-500">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-[10px]">COPY CODE</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-neutral-950 text-neutral-300 font-mono text-xs rounded-xl overflow-x-auto border border-neutral-800 max-h-[320px] scrollbar-thin">
              <code>{cssCode}</code>
            </pre>
          </div>
        )}

        {/* IMPLEMENTATION TIPS / DOCS TAB */}
        {activeTab === 'docs' && (
          <div className="space-y-4 text-xs text-neutral-400 leading-relaxed" id="tab-docs-content">
            <div className="flex items-start gap-2.5 bg-neutral-900/50 border border-neutral-800 p-3.5 rounded-xl">
              <HelpCircle className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h5 className="font-bold text-neutral-300">The 2 golden rules of gooey layouts:</h5>
                <p className="text-[11px] text-neutral-400">
                  1. <strong className="text-neutral-300">Color is key:</strong> The background of the filtered container should be completely transparent, and the overlapping child blobs must have solid colors. If you apply the filter to a container with a solid background, the entire background will blur and melt!
                </p>
                <p className="text-[11px] text-neutral-400">
                  2. <strong className="text-neutral-300">GPU Layers:</strong> Apply <code className="text-emerald-300 font-mono bg-neutral-950 px-1 py-0.2">transform: translate3d(0,0,0)</code> or <code className="text-emerald-300 font-mono bg-neutral-950 px-1 py-0.2">will-change: transform</code> to your gooey child elements. This forces browsers to composite on the GPU, avoiding pixel lag and dirty repaint areas.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold text-neutral-300 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                Step-by-Step Porting Instructions
              </h5>
              
              <ul className="list-decimal pl-5 space-y-1.5 text-[11px]">
                <li>
                  Copy the <strong className="text-neutral-300">SVG Filter</strong> markup and paste it near the bottom of your `index.html` file.
                </li>
                <li>
                  Copy the <strong className="text-neutral-300">CSS Classes</strong> into your global CSS styles.
                </li>
                <li>
                  Create a container block (such as a <code className="bg-neutral-900 font-mono px-1 rounded">&lt;div class="gooey-container-pure"&gt;</code>).
                </li>
                <li>
                  Place overlapping moving shapes inside that container. Watch them melt and merge in beautiful organic harmony!
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
