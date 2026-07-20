import React from 'react';
import { FilterParams } from '../types';

interface GooeyFilterSVGProps {
  params: FilterParams;
}

export const GooeyFilterSVG: React.FC<GooeyFilterSVGProps> = ({ params }) => {
  const { blur, multiplier, offset } = params;

  return (
    <svg 
      className="pointer-events-none absolute h-0 w-0" 
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Filter 1: Pure Gooey Filter - Perfect for organic liquid motion, blobs, particles */}
        <filter id="gooey-pure" colorInterpolationFilters="sRGB">
          <feGaussianBlur 
            in="SourceGraphic" 
            stdDeviation={blur} 
            result="blur" 
          />
          <feColorMatrix 
            in="blur" 
            mode="matrix" 
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${multiplier} ${offset}`} 
            result="goo" 
          />
        </filter>

        {/* Filter 2: Composite Gooey Filter - Keeps the source text/buttons sharp, only gooey-fying their overlapping regions */}
        <filter id="gooey-composite" colorInterpolationFilters="sRGB">
          <feGaussianBlur 
            in="SourceGraphic" 
            stdDeviation={blur} 
            result="blur" 
          />
          <feColorMatrix 
            in="blur" 
            mode="matrix" 
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${multiplier} ${offset}`} 
            result="goo" 
          />
          <feComposite 
            in="SourceGraphic" 
            in2="goo" 
            operator="atop" 
          />
        </filter>
      </defs>
    </svg>
  );
};
