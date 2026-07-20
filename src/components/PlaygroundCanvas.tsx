import React, { useState, useEffect, useRef } from 'react';
import { PlaygroundMode, BlobData, ParticleData, ColorPreset } from '../types';
import { Sparkles, Move, Type, Flame, Zap, MousePointer } from 'lucide-react';

interface PlaygroundCanvasProps {
  mode: PlaygroundMode;
  colorPreset: ColorPreset;
  params: {
    blur: number;
    multiplier: number;
    offset: number;
  };
}

export const PlaygroundCanvas: React.FC<PlaygroundCanvasProps> = ({
  mode,
  colorPreset,
  params
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Physics parameters
  const [gravity, setGravity] = useState<number>(0); // Bouncing blobs gravity
  const [magnetStrength, setMagnetStrength] = useState<number>(0.2); // Mouse pull force
  const [isMagnetActive, setIsMagnetActive] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>("GOOEY");
  const [morphWordIndex, setMorphWordIndex] = useState<number>(0);
  const [isMorphing, setIsMorphing] = useState<boolean>(true);

  // Dragging states
  const [draggedBlobId, setDraggedBlobId] = useState<string | null>(null);

  // Simulation references (refs prevent stale states in requestAnimationFrame loop)
  const blobsRef = useRef<BlobData[]>([]);
  const particlesRef = useRef<ParticleData[]>([]);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 600, height: 400 });

  // Word list for morph effect
  const morphWords = ["LIQUID", "GOOEY", "METABALL", "FUSION", "MELTING"];

  // Initialize Container Size
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerSizeRef.current = {
          width: rect.width || 600,
          height: rect.height || 400
        };
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Set up word morph interval
  useEffect(() => {
    if (!isMorphing || mode !== 'text') return;

    const interval = setInterval(() => {
      setMorphWordIndex((prev) => (prev + 1) % morphWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isMorphing, mode]);

  // Handle initialization of Blobs based on color preset
  useEffect(() => {
    const { width, height } = containerSizeRef.current;
    
    // Create blobs
    const count = 8;
    const initialBlobs: BlobData[] = Array.from({ length: count }).map((_, i) => {
      const radius = 35 + Math.random() * 30; // 35 to 65 px
      return {
        id: `blob-${i}`,
        x: radius + Math.random() * (width - radius * 2),
        y: radius + Math.random() * (height - radius * 2),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius,
        color: colorPreset.colors[i % colorPreset.colors.length]
      };
    });

    blobsRef.current = initialBlobs;
    particlesRef.current = []; // Clear particles
  }, [colorPreset, mode]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isMouseDownRef.current = true;
    setIsMagnetActive(true);

    if (mode === 'blobs') {
      const { x, y } = mousePosRef.current;
      // Check if clicked near any blob
      const clickedBlob = blobsRef.current.find(b => {
        const dist = Math.hypot(b.x - x, b.y - y);
        return dist < b.radius + 10;
      });

      if (clickedBlob) {
        setDraggedBlobId(clickedBlob.id);
        clickedBlob.isDragging = true;
      }
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setIsMagnetActive(false);

    if (draggedBlobId) {
      const b = blobsRef.current.find(blob => blob.id === draggedBlobId);
      if (b) {
        b.isDragging = false;
      }
      setDraggedBlobId(null);
    }
  };

  // Main Animation Loop
  useEffect(() => {
    const loop = () => {
      const { width, height } = containerSizeRef.current;
      const mouse = mousePosRef.current;

      // ==========================================
      // 1. PHYSICS BLOBS MODE
      // ==========================================
      if (mode === 'blobs') {
        blobsRef.current = blobsRef.current.map((blob) => {
          if (blob.id === draggedBlobId) {
            // Dragging behavior
            return {
              ...blob,
              x: Math.max(blob.radius, Math.min(width - blob.radius, mouse.x)),
              y: Math.max(blob.radius, Math.min(height - blob.radius, mouse.y)),
              vx: 0,
              vy: 0
            };
          }

          let vx = blob.vx;
          let vy = blob.vy;

          // Apply Gravity
          vy += gravity;

          // Apply Magnet Force (pull towards mouse)
          if (isMouseDownRef.current) {
            const dx = mouse.x - blob.x;
            const dy = mouse.y - blob.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
              vx += (dx / dist) * magnetStrength;
              vy += (dy / dist) * magnetStrength;
            }
          }

          // Slow down speed cap
          const speed = Math.hypot(vx, vy);
          const maxSpeed = 8;
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
          }

          let x = blob.x + vx;
          let y = blob.y + vy;

          // Bounce off boundary walls
          if (x - blob.radius < 0) {
            x = blob.radius;
            vx = Math.abs(vx) * 0.85;
          } else if (x + blob.radius > width) {
            x = width - blob.radius;
            vx = -Math.abs(vx) * 0.85;
          }

          if (y - blob.radius < 0) {
            y = blob.radius;
            vy = Math.abs(vy) * 0.85;
          } else if (y + blob.radius > height) {
            y = height - blob.radius;
            vy = -Math.abs(vy) * 0.85;
          }

          return { ...blob, x, y, vx, vy };
        });
      }

      // ==========================================
      // 2. PARTICLE SYSTEM MODE
      // ==========================================
      if (mode === 'particles') {
        // Spawn rate: spawn 1-2 particles per frame
        const spawnCount = 2;
        for (let s = 0; s < spawnCount; s++) {
          if (particlesRef.current.length < 120) {
            const size = 15 + Math.random() * 35; // 15 to 50 px
            const isMouseSource = isMouseDownRef.current;
            
            // Spawn either at mouse cursor or at center fountain
            const spawnX = isMouseSource ? mouse.x : width / 2 + (Math.random() - 0.5) * 40;
            const spawnY = isMouseSource ? mouse.y : height - 20;

            particlesRef.current.push({
              id: `part-${Date.now()}-${Math.random()}`,
              x: spawnX,
              y: spawnY,
              // Float upwards + drift
              vx: (Math.random() - 0.5) * 3,
              vy: isMouseSource ? (Math.random() - 0.5) * 4 : -4 - Math.random() * 5,
              size,
              color: colorPreset.colors[Math.floor(Math.random() * colorPreset.colors.length)],
              life: 1.0,
              maxLife: 80 + Math.random() * 80 // 80 to 160 frames
            });
          }
        }

        // Update particles
        particlesRef.current = particlesRef.current
          .map((p) => {
            // Float upwards drift + fade life
            const decay = 1 / p.maxLife;
            const newLife = p.life - decay;
            
            // Add a bit of wind/buoyancy
            const vy = p.vy + 0.05; // slight slow down of upward speed
            
            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + vy,
              life: newLife,
              size: p.size * (0.985) // shrink slowly
            };
          })
          // Filter out dead or offscreen particles
          .filter(p => p.life > 0 && p.y > -50 && p.x > -50 && p.x < width + 50);
      }

      // ==========================================
      // 3. TEXT LIQUID MODE
      // ==========================================
      if (mode === 'text') {
        // Run a background ambient blob pool behind the text to merge with it
        if (blobsRef.current.length === 0 || blobsRef.current.length > 12) {
          // Reset custom small text blobs
          const count = 5;
          blobsRef.current = Array.from({ length: count }).map((_, i) => ({
            id: `text-blob-${i}`,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 20 + Math.random() * 20,
            color: colorPreset.colors[i % colorPreset.colors.length]
          }));
        }

        // Keep a neat mouse cursor blob that user can use to melt with the text
        const mouseBlobExists = blobsRef.current.some(b => b.id === 'mouse-tracer');
        if (!mouseBlobExists) {
          blobsRef.current.push({
            id: 'mouse-tracer',
            x: mouse.x,
            y: mouse.y,
            vx: 0,
            vy: 0,
            radius: 45,
            color: colorPreset.colors[0]
          });
        }

        blobsRef.current = blobsRef.current.map((blob) => {
          if (blob.id === 'mouse-tracer') {
            return {
              ...blob,
              x: mouse.x,
              y: mouse.y
            };
          }

          // Gentle ambient float
          let x = blob.x + blob.vx;
          let y = blob.y + blob.vy;

          if (x - blob.radius < 0 || x + blob.radius > width) {
            blob.vx *= -1;
            x = Math.max(blob.radius, Math.min(width - blob.radius, x));
          }
          if (y - blob.radius < 0 || y + blob.radius > height) {
            blob.vy *= -1;
            y = Math.max(blob.radius, Math.min(height - blob.radius, y));
          }

          return { ...blob, x, y };
        });
      }

      // Force rerender by updating animation request
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, draggedBlobId, gravity, magnetStrength, colorPreset]);

  // Active word based on morphing or custom text input
  const activeText = mode === 'text' 
    ? (isMorphing ? morphWords[morphWordIndex] : customText.toUpperCase())
    : '';

  return (
    <div className="flex flex-col gap-4 w-full h-full" id="playground-canvas-root">
      
      {/* Playground Header / Controller Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-lg">
        
        {/* Mode Indicators */}
        <div className="flex items-center gap-2">
          {mode === 'blobs' && (
            <>
              <Move className="h-4 w-4 text-pink-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-neutral-300">MODE: COHESIVE METABALLS</span>
            </>
          )}
          {mode === 'particles' && (
            <>
              <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
              <span className="text-xs font-mono font-bold text-neutral-300">MODE: GOOEY PARTICLES</span>
            </>
          )}
          {mode === 'text' && (
            <>
              <Type className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-neutral-300">MODE: LIQUID METAMORPHIC TEXT</span>
            </>
          )}
        </div>

        {/* Dynamic Controls based on selected mode */}
        <div className="flex flex-wrap items-center gap-4">
          {mode === 'blobs' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500 font-mono">GRAVITY</span>
                <input
                  type="range"
                  min="0"
                  max="0.4"
                  step="0.05"
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-24 accent-pink-500 bg-neutral-950 h-1 rounded cursor-pointer"
                  id="gravity-slider"
                />
                <span className="text-neutral-300 font-mono w-8">{gravity > 0 ? `${gravity}g` : 'OFF'}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500 font-mono">MAGNET STRENGTH</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={magnetStrength}
                  onChange={(e) => setMagnetStrength(parseFloat(e.target.value))}
                  className="w-24 accent-pink-500 bg-neutral-950 h-1 rounded cursor-pointer"
                  id="magnet-slider"
                />
                <span className="text-neutral-300 font-mono w-10">{(magnetStrength * 10).toFixed(0)}x</span>
              </div>
            </>
          )}

          {mode === 'particles' && (
            <div className="text-[11px] text-neutral-400 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800">
              <span className="text-orange-400 font-semibold">Tip:</span> Hold down / drag click to emit particles from cursor!
            </div>
          )}

          {mode === 'text' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMorphing(!isMorphing)}
                  className={`px-3 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    isMorphing 
                      ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300 shadow-inner' 
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                  id="morph-toggle-btn"
                >
                  {isMorphing ? "Morph Loop: ON" : "Morph Loop: OFF"}
                </button>
              </div>

              {!isMorphing && (
                <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1">
                  <input
                    type="text"
                    maxLength={10}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter custom text..."
                    className="bg-transparent border-none text-xs text-indigo-300 focus:outline-none w-28 uppercase font-bold font-sans tracking-wider"
                    id="custom-text-input"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Physics Interactive Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[400px] bg-neutral-950 border border-neutral-800/80 rounded-2xl relative overflow-hidden select-none cursor-crosshair shadow-2xl transition-all"
        id="physics-arena-container"
      >
        {/* Subtle grid background for high-tech sandbox lab aesthetic */}
        <div className="absolute inset-0 pointer-events-none opacity-5 grid grid-cols-12 grid-rows-8">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border-t border-l border-white"></div>
          ))}
        </div>

        {/* Instructions Indicator on Center Canvas */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1">
          <div className="flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-sm border border-neutral-800/60 px-2.5 py-1.5 rounded-lg text-[10px] text-neutral-400 font-mono">
            <MousePointer className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>
              {mode === 'blobs' && "DRAG Blobs to merge • CLICK & HOLD empty space to attract"}
              {mode === 'particles' && "HOVER to view • CLICK & DRAG to spawn custom fountains"}
              {mode === 'text' && "DRAG your cursor to melt liquid spheres into the text"}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* THE ACTIVE GOOEY FILTER TREE DISPLAY */}
        {/* ======================================================== */}
        <div 
          className="w-full h-full relative" 
          style={{ filter: 'url(#gooey-pure)' }}
          id="gooey-rendered-layer"
        >
          {/* A. BLOBS DRAW */}
          {mode === 'blobs' && blobsRef.current.map((blob) => (
            <div
              key={blob.id}
              style={{
                position: 'absolute',
                left: blob.x - blob.radius,
                top: blob.y - blob.radius,
                width: blob.radius * 2,
                height: blob.radius * 2,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${blob.color}, ${adjustBrightness(blob.color, -40)})`,
                transform: 'translate3d(0,0,0)',
                boxShadow: `inset -6px -6px 12px rgba(0,0,0,0.4), 0 0 20px ${blob.color}55`,
                willChange: 'transform, left, top',
                transition: blob.isDragging ? 'none' : 'background 0.3s'
              }}
              className="absolute shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
              id={`render-blob-${blob.id}`}
            >
              {/* Optional core sheen for 3D look */}
              <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white/30 rounded-full blur-[1px]" />
            </div>
          ))}

          {/* B. PARTICLES DRAW */}
          {mode === 'particles' && particlesRef.current.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x - p.size / 2,
                top: p.y - p.size / 2,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${p.color}, ${adjustBrightness(p.color, -50)})`,
                opacity: p.life,
                transform: 'translate3d(0,0,0)',
                willChange: 'transform, left, top',
              }}
              className="absolute shrink-0"
              id={`render-part-${p.id}`}
            />
          ))}

          {/* C. LIQUID TEXT & SCATTERED TEXT BLOBS */}
          {mode === 'text' && (
            <>
              {/* Floating ambient blobs */}
              {blobsRef.current.map((blob) => (
                <div
                  key={blob.id}
                  style={{
                    position: 'absolute',
                    left: blob.x - blob.radius,
                    top: blob.y - blob.radius,
                    width: blob.radius * 2,
                    height: blob.radius * 2,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${blob.color}, ${adjustBrightness(blob.color, -40)})`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform, left, top',
                  }}
                  className="absolute shrink-0"
                  id={`render-text-blob-${blob.id}`}
                />
              ))}

              {/* The actual liquid text characters layout */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: 'none' }}
              >
                <div 
                  className="text-center font-sans select-none tracking-widest text-[55px] sm:text-[80px] md:text-[95px] font-extrabold flex items-center justify-center transition-all duration-700 select-none text-white"
                  style={{
                    // Text itself has text-shadow to make it stand out and give it weight inside the filter
                    textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
                  }}
                  id="liquid-text-letters"
                >
                  {activeText.split('').map((char, index) => (
                    <span 
                      key={`${char}-${index}`} 
                      className="inline-block transition-all duration-500 transform scale-110"
                      style={{
                        animation: `waveLetter 3s ease-in-out infinite alternate`,
                        animationDelay: `${index * 0.15}s`
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Standard overlay if magnet is held down */}
        {isMagnetActive && mode === 'blobs' && (
          <div 
            className="absolute pointer-events-none rounded-full border border-pink-500/30 bg-pink-500/5 animate-ping"
            style={{
              left: mousePosRef.current.x - 40,
              top: mousePosRef.current.y - 40,
              width: 80,
              height: 80,
            }}
          />
        )}
      </div>

      {/* Keyframes injection purely for text wave animations inside filter */}
      <style>{`
        @keyframes waveLetter {
          0% { transform: translateY(-3px) scale(1.05) rotate(-1deg); }
          50% { transform: translateY(3px) scale(0.95) rotate(1deg); }
          100% { transform: translateY(-3px) scale(1.05) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

// Helper function to dynamically adjust brightness of preset colors for rich radial gradients
function adjustBrightness(hex: string, percent: number): string {
  // Simple check for hex
  if (!hex.startsWith('#')) return hex;
  
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + (R * percent) / 100));
  G = Math.max(0, Math.min(255, G + (G * percent) / 100));
  B = Math.max(0, Math.min(255, B + (B * percent) / 100));

  const rHex = Math.round(R).toString(16).padStart(2, '0');
  const gHex = Math.round(G).toString(16).padStart(2, '0');
  const bHex = Math.round(B).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
