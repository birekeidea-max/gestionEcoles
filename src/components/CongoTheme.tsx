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
  <svg
    viewBox="0 0 400 400"
    className={`${className} ${opacityClassName} select-none pointer-events-none transition-all`}
    xmlns="http://www.w3.org/2000/svg"
    id="congo-arms"
  >
    {/* Outer Seal Ring */}
    <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="3,3" className="text-blue-600/30" />
    <circle cx="200" cy="200" r="182" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600/40" />
    <circle cx="200" cy="200" r="142" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,4" className="text-red-500/30" />
    
    {/* Text around the circular seal */}
    <g className="text-[12.5px] font-sans font-black tracking-[0.16em] fill-blue-700/85">
      <path id="top-seal-path" d="M 50 200 A 150 150 0 1 1 350 200" fill="none" stroke="none" />
      <text className="font-sans">
        <textPath href="#top-seal-path" startOffset="50%" textAnchor="middle">
          REPUBLIQUE DEMOCRATIQUE DU CONGO
        </textPath>
      </text>
    </g>

    <g className="text-[11.5px] font-sans font-black tracking-[0.12em] fill-red-600/80">
      <path id="bottom-seal-path" d="M 350 200 A 150 150 0 0 1 50 200" fill="none" stroke="none" />
      <text className="font-sans">
        <textPath href="#bottom-seal-path" startOffset="50%" textAnchor="middle">
          * INSPECTION GENERALE DE L'EPST *
        </textPath>
      </text>
    </g>

    {/* Center content emblem backing */}
    <circle cx="200" cy="200" r="105" fill="#f8fafc" stroke="currentColor" strokeWidth="2.5" className="text-slate-350 shadow-inner" />
    
    {/* Stylized Leopard head (DRC Official emblem center) */}
    <g transform="translate(145, 140) scale(1.1)" className="text-amber-500 fill-current">
      <path d="M 50 5 C 20 5, 10 30, 10 50 C 10 65, 20 85, 50 90 C 80 85, 90 65, 90 50 C 90 30, 80 5, 50 5 Z" fill="#F59E0B" opacity="0.95" />
      
      {/* Ears */}
      <path d="M 12 12 C 5 -12, -5 0, 5 25 Z" fill="#D97706" />
      <path d="M 88 12 C 95 -12, 105 0, 95 25 Z" fill="#D97706" />
      <path d="M 15 15 C 10 0, 3 10, 10 23 Z" fill="#FEF3C7" />
      <path d="M 85 15 C 90 0, 97 10, 90 23 Z" fill="#FEF3C7" />

      {/* Eyes */}
      <polygon points="30,40 45,43 40,48 28,45" fill="#ffffff" stroke="#92400E" strokeWidth="1" />
      <polygon points="70,40 55,43 60,48 72,45" fill="#ffffff" stroke="#92400E" strokeWidth="1" />
      <circle cx="37" cy="44" r="3.5" fill="#0284C7" />
      <circle cx="63" cy="44" r="3.5" fill="#0284C7" />
      <circle cx="37.5" cy="43.5" r="1.2" fill="#ffffff" />
      <circle cx="63.5" cy="43.5" r="1.2" fill="#ffffff" />

      {/* Spots on leopard head */}
      <g fill="#1E293B" opacity="0.85">
        <circle cx="50" cy="20" r="3.5" />
        <circle cx="40" cy="15" r="2.5" />
        <circle cx="60" cy="15" r="2.5" />
        <circle cx="35" cy="25" r="3" />
        <circle cx="65" cy="25" r="3" />
        <circle cx="48" cy="30" r="2" />
        
        <path d="M 18 50 Q 22 47 25 50" stroke="#1E293B" strokeWidth="2" fill="none" />
        <path d="M 20 60 Q 24 58 27 62" stroke="#1E293B" strokeWidth="2.5" fill="none" />
        <path d="M 82 50 Q 78 47 75 50" stroke="#1E293B" strokeWidth="2" fill="none" />
        <path d="M 80 60 Q 76 58 73 62" stroke="#1E293B" strokeWidth="2.5" fill="none" />
        
        <polygon points="45,55 55,55 50,67" fill="#1E293B" />
        <path d="M 50 67 L 50 78 M 50 78 C 45 78, 42 75, 38 75 M 50 78 C 55 78, 58 75, 62 75" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
      
      {/* Whiskers */}
      <path d="M 30 68 L 5 65 M 28 72 L 4 74 M 29 76 L 6 82" stroke="#475569" strokeWidth="1" opacity="0.4" />
      <path d="M 70 68 L 95 65 M 72 72 L 96 74 M 71 76 L 94 82" stroke="#475569" strokeWidth="1" opacity="0.4" />
    </g>

    {/* Left Spear */}
    <g transform="translate(130, 290) rotate(-45)" className="text-slate-600 fill-current">
      <rect x="-1.5" y="-120" width="3" height="150" fill="#4B5563" />
      <polygon points="0,-130 -10,-115 -4,-115 -4,-100 4,-100 4,-115 10,-115" fill="#9CA3AF" stroke="#374151" strokeWidth="1.5" />
    </g>

    {/* Right Branch */}
    <g transform="translate(270, 280) rotate(45)" className="text-emerald-600 fill-current">
      <path d="M 0,0 Q -20,-70 0,-130" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
      <path d="M -8,-25 C -18,-25, -20,-45, -5,-40 C -2,-38, -5,-27, -8,-25 Z" fill="#10B981" />
      <path d="M 4,-20 C 14,-20, 18,-40, 5,-35 C 2,-33, 3,-22, 4,-20 Z" fill="#10B981" />
      
      <path d="M -12,-55 C -25,-55, -24,-75, -10,-70 C -7,-68, -8,-57, -12,-55 Z" fill="#10B981" />
      <path d="M 3,-50 C 15,-50, 18,-70, 6,-65 C 3,-63, 2,-52, 3,-50 Z" fill="#10B981" />

      <path d="M -10,-85 C -22,-85, -20,-105, -8,-100 C -5,-98, -6,-87, -10,-85 Z" fill="#10B981" />
      <path d="M 2,-80 C 12,-80, 15,-100, 5,-95 C 2,-93, 1,-82, 2,-80 Z" fill="#10B981" />

      <path d="M 0,-115 C -8,-125, -2,-135, 0,-130 C 2,-135, 8,-125, 0,-115 Z" fill="#059669" />
    </g>

    {/* Center Base Stone */}
    <path d="M 140 260 C 150 250, 250 250, 260 260 C 270 270, 275 285, 265 292 L 135 292 C 125 285, 130 270, 140 260 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />

    {/* Ribbon Banner */}
    <g transform="translate(0, 5)">
      <path d="M 80 325 L 120 305 L 280 305 L 320 325 L 300 345 L 200 345 L 100 345 Z" fill="#1E293B" opacity="0.15" />
      <path d="M 90 320 Q 200 338, 310 320 L 305 348 Q 200 366, 95 348 Z" fill="#0284C7" stroke="#025a87" strokeWidth="1.5" />
      <path d="M 90 320 Q 200 338, 310 320 L 308 328 Q 200 346, 92 328 Z" fill="#F59E0B" />
      <path d="M 91 324 Q 200 342, 309 324 L 307 334 Q 200 352, 93 334 Z" fill="#DC2626" />

      <polygon points="90,320 95,348 60,338 70,314" fill="#0369A1" stroke="#025a87" strokeWidth="1" />
      <polygon points="310,320 305,348 340,338 330,314" fill="#0369A1" stroke="#025a87" strokeWidth="1" />
      
      <polygon points="90,320 95,320 95,330" fill="#1e293b" />
      <polygon points="310,320 305,320 305,330" fill="#1e293b" />

      <text x="200" y="341" textAnchor="middle" className="font-sans font-black text-[11px] tracking-[0.25em] fill-white select-none">
        JUSTICE PAIX TRAVAIL
      </text>
    </g>
  </svg>
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
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Sky Blue top edge gradient reflecting the Flag */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#007FFF] via-[#F4D03F] to-[#D32F2F] z-50 animate-pulse" />
      
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Giant Map outline bottom right */}
        <div className="absolute -bottom-16 -right-16 md:-bottom-8 md:-right-8">
          <CongoMapOutline className="w-[30rem] h-[30rem] md:w-[48rem] md:h-[48rem]" opacityClassName="opacity-[0.05]" />
        </div>
        
        {/* Giant Coat of arms inside the background center left */}
        <div className="absolute top-1/4 -left-12 opacity-15 blur-0">
          <CongoCoatOfArms className="w-80 h-80" opacityClassName="opacity-[0.12]" />
        </div>

        {/* Faint color bands resembling the DRC Flag diagonally spanning screen */}
        <div className="absolute inset-0 opacity-[0.02]">
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
