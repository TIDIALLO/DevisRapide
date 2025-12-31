import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DevisRapideLogo({ className = '', iconOnly = false, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: 'text-sm' },
    md: { icon: 32, text: 'text-lg' },
    lg: { icon: 48, text: 'text-2xl' },
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Document icon with lightning bolt */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Document shape with folded corner */}
        <path
          d="M8 4C8 2.89543 8.89543 2 10 2H30C30.5523 2 31 2.44772 31 3V15C31 15.5523 31.4477 16 32 16H42C42.5523 16 43 16.4477 43 17V44C43 45.1046 42.1046 46 41 46H10C8.89543 46 8 45.1046 8 44V4Z"
          fill="#2563eb"
        />
        {/* Folded corner */}
        <path
          d="M32 16L42 6V15C42 15.5523 41.5523 16 41 16H32Z"
          fill="#1e40af"
        />
        {/* Text lines */}
        <line x1="14" y1="24" x2="34" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="28" x2="30" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="32" x2="28" y2="32" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="36" x2="32" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Lightning bolt */}
        <path
          d="M24 12L20 20H24L22 28L28 20H24L24 12Z"
          fill="white"
        />
      </svg>
      
      {/* Text */}
      {!iconOnly && (
        <span className={`font-bold text-[#2563eb] ${textSize} tracking-tight`}>
          DevisRapide
        </span>
      )}
    </div>
  );
}

// Logo icon only (for PDF and small spaces)
export function DevisRapideLogoIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document shape with folded corner */}
      <path
        d="M8 4C8 2.89543 8.89543 2 10 2H30C30.5523 2 31 2.44772 31 3V15C31 15.5523 31.4477 16 32 16H42C42.5523 16 43 16.4477 43 17V44C43 45.1046 42.1046 46 41 46H10C8.89543 46 8 45.1046 8 44V4Z"
        fill="#2563eb"
      />
      {/* Folded corner */}
      <path
        d="M32 16L42 6V15C42 15.5523 41.5523 16 41 16H32Z"
        fill="#1e40af"
      />
      {/* Text lines */}
      <line x1="14" y1="24" x2="34" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="28" x2="30" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="32" x2="28" y2="32" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="36" x2="32" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Lightning bolt */}
      <path
        d="M24 12L20 20H24L22 28L28 20H24L24 12Z"
        fill="white"
      />
    </svg>
  );
}
