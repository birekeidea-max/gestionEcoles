import React from 'react';

export const CongoFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 800 600" className={`${className} shadow-sm rounded overflow-hidden`} xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#007FFF" />
    <path d="M 0 600 L 800 0 L 800 100 L 133 600 Z" fill="#F4D03F" />
    <path d="M 0 600 L 800 0 L 800 50 L 66 600 Z" fill="#D32F2F" />
    <path d="M 0 600 L 800 0 L 800 100 L 133 600 Z" fill="#F4D03F" stroke="#F4D03F" strokeWidth="2" />
    {/* Correct diagonal stripe bordered: Yellow-Red-Yellow */}
    <path d="M0 600 L800 0 L800 100 L133 600 Z" fill="#F4D03F" />
    <path d="M0 600 L666 100 L800 0 L133 600 Z" fill="#D32F2F" /> {/* Red core */}
    <path d="M0 500 L133 600 H 0 Z" fill="#007FFF" /> {/* Clear corner */}
    {/* Clean up the stripe construct */}
    <g>
      <polygon points="0,600 800,0 800,100 133,600" fill="#F4D03F" />
      <polygon points="0,600 800,0 800,70 93,600" fill="#D32F2F" />
      <polygon points="0,600 800,0 800,30 40,600" fill="#F4D03F" />
    </g>
    {/* Yellow Star in top-left */}
    <polygon points="120,80 135,120 175,120 142,145 155,185 120,160 85,185 98,145 65,120 105,120" fill="#F4D03F" />
  </svg>
);

export const CongoCoatOfArms: React.FC<{ className?: string; opacityClassName?: string }> = ({
  className = 'w-48 h-48',
  opacityClassName = 'opacity-[0.35]'
}) => (
  <div className={`${className} ${opacityClassName} flex items-center justify-center pointer-events-none select-none transition-all overflow-hidden`}>
    <img 
      src="/src/assets/images/rdc_arms_vector_official_1780580574047.png" 
      alt="Armoiries de la RDC" 
      className="w-full h-full object-contain mix-blend-multiply"
      referrerPolicy="no-referrer"
    />
  </div>
);

export const CongoMapOutline: React.FC<{ className?: string; opacityClassName?: string }> = ({
  className = 'w-96 h-96',
  opacityClassName = 'opacity-[0.06]'
}) => (
  // Visual simplified geographical path representing RDC
  <svg
    viewBox="0 0 500 500"
    className={`${className} ${opacityClassName} text-sky-600 transition-colors duration-500`}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* RDC Geographic Vector Outline (Stylized) */}
    <path d="M 120 80 
             C 140 60, 210 70, 240 65 
             C 270 60, 290 80, 310 90 
             C 330 100, 380 95, 400 110 
             C 420 125, 410 150, 420 180 
             C 430 210, 445 220, 450 250 
             C 455 280, 410 320, 395 350 
             C 380 380, 410 420, 390 440 
             C 370 460, 330 450, 305 450 
             C 280 450, 270 420, 255 400 
             C 240 380, 210 375, 195 390
             C 180 405, 175 425, 160 415
             C 145 405, 140 370, 130 350
             C 120 330, 95 320, 85 300
             C 75 280, 105 270, 105 250
             C 105 230, 65 220, 50 195
             C 35 170, 45 155, 60 160
             C 75 165, 95 140, 90 120
             C 85 100, 100 100, 120 80 Z" />
    
    {/* Major Cities indicators (dashed lines or glowing points) */}
    <g className="opacity-40 text-red-500 fill-current">
      <circle cx="80" cy="180" r="4" /> {/* Kinshasa */}
      <text x="90" y="184" className="text-[10px] font-sans font-semibold tracking-wide fill-gray-600">Kinshasa</text>
      
      <circle cx="410" cy="230" r="3" /> {/* Goma */}
      <text x="375" y="234" className="text-[10px] font-sans font-semibold tracking-wide fill-gray-600">Goma</text>

      <circle cx="360" cy="420" r="3" /> {/* Lubumbashi */}
      <text x="300" y="424" className="text-[10px] font-sans font-semibold tracking-wide fill-gray-600">Lubumbashi</text>
    </g>
  </svg>
);

export const PatrioticBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sky Blue top edge gradient reflecting the Flag of DRC */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#007FFF] via-[#F4D03F] to-[#D32F2F] z-50 animate-pulse" />
      
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Giant Map outline bottom right */}
        <div className="absolute -bottom-16 -right-16 md:-bottom-8 md:-right-8 opacity-45">
          <CongoMapOutline className="w-[30rem] h-[30rem] md:w-[48rem] md:h-[48rem]" opacityClassName="opacity-[0.06]" />
        </div>
        
        {/* Giant Coat of arms inside the background center left */}
        <div className="absolute top-1/4 -left-12 opacity-15">
          <CongoCoatOfArms className="w-80 h-80" opacityClassName="opacity-[0.15]" />
        </div>

        {/* Faint color bands resembling the DRC Flag diagonally spanning screen */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -top-[50%] -left-[20%] w-[150%] h-[200%] bg-gradient-to-bl from-[#007FFF]/20 via-[#F4D03F]/20 to-[#D32F2F]/20 transform -rotate-12" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6">
        {children}
      </div>
    </div>
  );
};
