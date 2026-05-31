import React from 'react';

interface DestinyDirectorProps {
  expression: 'observing' | 'analyzing' | 'writing' | 'guiding';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withBubble?: boolean;
  bubbleText?: string;
}

export const DestinyDirectorCartoon: React.FC<DestinyDirectorProps> = ({
  expression,
  size = 'md',
  className = '',
  withBubble = false,
  bubbleText
}) => {
  // Size mappings
  const sizeMap = {
    xs: 'h-16 w-16',
    sm: 'h-24 w-24',
    md: 'h-40 w-40',
    lg: 'h-52 w-52',
    xl: 'h-64 w-64'
  };

  // Expression-based dialogue
  const defaultBubbleText = {
    observing: '天梁天相，星辰合璧。待我探查星盘之玄妙！',
    analyzing: '星曜运转，福自天来。正在精算本周大运吉凶！',
    writing: '运数如墨，书尽浮生。写下您的压力困扰，我替您勾消！',
    guiding: '茫茫命途，指路星河。戏命书笺，演绎属于您的璀璨人生！'
  };

  const activeBubbleText = bubbleText || defaultBubbleText[expression];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 3D Fuzzy Felt Character Container */}
      <div className={`relative ${sizeMap[size]} select-none transition-transform duration-300 hover:scale-105 active:scale-95`}>
        
        {/* Soft magical background aura matching the purple aesthetic */}
        <div className="absolute inset-2 bg-purple-500/15 blur-2xl rounded-full scale-110 animate-pulse" />

        <svg 
          viewBox="0 0 240 240" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(88,28,135,0.35)]"
        >
          <defs>
            {/* Real 3D Handmade Felt (羊毛毡) Texture Filter */}
            <filter id="felt-fuzzy" x="-10%" y="-10%" width="120%" height="120%">
              {/* Fine wool fiber micro-turbulences */}
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" result="noise" />
              {/* Push edges into organic fleece fuzz */}
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="fuzzyEdge" />
              {/* Create warm shadows for standard 3D doll parts */}
              <feBlend mode="multiply" in="SourceGraphic" in2="fuzzyEdge" />
            </filter>

            {/* Skin radial gradient (warm beige organic felt) */}
            <radialGradient id="feltSkin" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fff2e6" />
              <stop offset="85%" stopColor="#ffd8bd" />
              <stop offset="100%" stopColor="#f3b890" />
            </radialGradient>

            {/* Royal Obsidian black felt for hat and hair */}
            <radialGradient id="woolObsidian" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#2c2a3d" />
              <stop offset="70%" stopColor="#181523" />
              <stop offset="100%" stopColor="#0a0812" />
            </radialGradient>

            {/* Deep Lavender-Violet Felt Imperial Dress */}
            <linearGradient id="feltViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b21b6" />
              <stop offset="50%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#1e003a" />
            </linearGradient>

            {/* Warm camel brown felt for detailing/table/borders */}
            <linearGradient id="feltKhaki" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Soft gold thread lining */}
            <linearGradient id="feltGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Beautiful galaxy eye depth */}
            <radialGradient id="cosmicEye" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#f5d0fe" />
              <stop offset="35%" stopColor="#d946ef" />
              <stop offset="70%" stopColor="#701a75" />
              <stop offset="100%" stopColor="#2e0854" />
            </radialGradient>

            {/* Parchment scroll paper background */}
            <linearGradient id="feltParchment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fefaf3" />
              <stop offset="100%" stopColor="#eedcbd" />
            </linearGradient>
            
            {/* Shadows for individual overlapping elements */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#080210" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* BACKGROUND TEXTURED BODY GLOW */}
          <circle cx="120" cy="120" r="100" fill="#6b21a8" fillOpacity="0.08" />

          <g filter="url(#felt-fuzzy)">
            {/* 1. LOWER BODY / IMPERIAL ROBES */}
            <g filter="url(#softShadow)">
              {/* Back Collar base */}
              <path d="M 65 155 Q 120 170, 175 155 L 205 230 L 35 230 Z" fill="url(#feltViolet)" />
              {/* Felt Bias Tape Collar Borders (Golden Camel Tone) */}
              <path d="M 64 154 Q 120 171, 176 154" stroke="url(#feltGold)" strokeWidth="6" strokeLinecap="round" />
              {/* Secondary deep purple bias tape */}
              <path d="M 70 157 Q 120 172, 170 157" stroke="#4c1d95" strokeWidth="2.5" />
              {/* Traditional White inner silk lining */}
              <path d="M 100 162 L 120 195 L 140 162 Z" fill="#fafaf9" />
              <path d="M 106 162 L 120 183 L 134 162 Z" fill="#ebede4" />
            </g>

            {/* 2. CHUTES OF HAIR (SIDE BUNS WITH PURPLE TASSELS) */}
            {/* Left side hair bundle */}
            <g filter="url(#softShadow)">
              <circle cx="56" cy="116" r="14" fill="url(#woolObsidian)" />
              <circle cx="56" cy="116" r="11" fill="#1e1b4b" />
              <circle cx="56" cy="116" r="8" stroke="url(#feltGold)" strokeWidth="2" fill="none" />
              {/* Left hanging tassel string and tassel */}
              <path d="M 56 127 L 51 144" stroke="#a21caf" strokeWidth="3" />
              <path d="M 56 127 L 51 144" stroke="url(#feltGold)" strokeWidth="1" />
              <ellipse cx="50" cy="148" rx="6" ry="8" fill="#701a75" />
              <path d="M 44 148 L 44 159 M 50 148 L 50 162 M 56 148 L 56 159" stroke="#581c87" strokeWidth="1.5" />
            </g>

            {/* Right side hair bundle */}
            <g filter="url(#softShadow)">
              <circle cx="184" cy="116" r="14" fill="url(#woolObsidian)" />
              <circle cx="184" cy="116" r="11" fill="#1e1b4b" />
              <circle cx="184" cy="116" r="8" stroke="url(#feltGold)" strokeWidth="2" fill="none" />
              {/* Right hanging tassel string and tassel */}
              <path d="M 184 127 L 189 144" stroke="#a21caf" strokeWidth="3" />
              <path d="M 184 127 L 189 144" stroke="url(#feltGold)" strokeWidth="1" />
              <ellipse cx="190" cy="148" rx="6" ry="8" fill="#701a75" />
              <path d="M 184 148 L 184 159 M 190 148 L 190 162 M 196 148 L 196 159" stroke="#581c87" strokeWidth="1.5" />
            </g>

            {/* 3. HEAD & CHIBI FACE (Plump plush proportions, stitched ears) */}
            <g filter="url(#softShadow)">
              {/* Left Ear */}
              <path d="M 68 115 C 56 115, 56 130, 68 130 Z" fill="url(#feltSkin)" stroke="#e4a883" strokeWidth="1" />
              <circle cx="63" cy="122" r="2.5" fill="none" stroke="url(#feltGold)" strokeWidth="1.5" />
              {/* Right Ear */}
              <path d="M 172 115 C 184 115, 184 130, 172 130 Z" fill="url(#feltSkin)" stroke="#e4a883" strokeWidth="1" />
              <circle cx="177" cy="122" r="2.5" fill="none" stroke="url(#feltGold)" strokeWidth="1.5" />

              {/* Main Face Oval */}
              <path d="M 65 110 C 65 160, 175 160, 175 110 C 175 75, 65 75, 65 110 Z" fill="url(#feltSkin)" />
            </g>

            {/* Plump felt pink cheeks */}
            <ellipse cx="88" cy="133" rx="13" ry="8" fill="#f43f5e" fillOpacity="0.22" filter="blur(2px)" />
            <ellipse cx="152" cy="133" rx="13" ry="8" fill="#f43f5e" fillOpacity="0.22" filter="blur(2px)" />

            {/* 4. EXQUISITE WOOLEN EYES & NOSE */}
            {expression === 'guiding' ? (
              <>
                {/* Winking left eye */}
                <ellipse cx="94" cy="116" rx="14" ry="17" fill="#fafaf9" stroke="#1c1917" strokeWidth="1.5" />
                <ellipse cx="94" cy="116" rx="11" ry="13" fill="url(#cosmicEye)" />
                <ellipse cx="94" cy="116" rx="6" ry="8" fill="#1e152a" />
                {/* Big shiny stars and bubbles inside the eye (classic doll highlight) */}
                <circle cx="89" cy="110" r="4.5" fill="#ffffff" />
                <circle cx="99" cy="122" r="2.5" fill="#ffffff" />
                <circle cx="90" cy="121" r="1.5" fill="url(#feltGold)" />
                {/* Dense black plush eyelashes */}
                <path d="M 76 112 Q 94 92, 112 112" stroke="#1c0f24" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <path d="M 74 115 L 79 110" stroke="#1c0f24" strokeWidth="2.5" />
                <path d="M 114 115 L 109 110" stroke="#1c0f24" strokeWidth="2.5" />

                {/* Right eye - cute charming wink */}
                <path d="M 132 118 Q 146 132, 160 118" stroke="#1c0f24" strokeWidth="5" strokeLinecap="round" fill="none" />
                <line x1="130" y1="116" x2="134" y2="123" stroke="#1c0f24" strokeWidth="3" strokeLinecap="round" />
                <line x1="162" y1="116" x2="158" y2="123" stroke="#1c0f24" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Dual vibrant fully open expressive felt doll eyes */}
                {/* Left eye */}
                <ellipse cx="94" cy="116" rx="13" ry="16" fill="#fafaf9" stroke="#1c1917" strokeWidth="1" />
                <ellipse cx="94" cy="116" rx="10" ry="12" fill="url(#cosmicEye)" />
                <ellipse cx="94" cy="115" rx="5" ry="7" fill="#1e152a" />
                <circle cx="90" cy="110" r="4" fill="#ffffff" />
                <circle cx="98" cy="120" r="2" fill="#ffffff" />
                <path d="M 78 114 Q 94 96, 110 114" stroke="#1c0f24" strokeWidth="4" strokeLinecap="round" fill="none" />
                
                {/* Right eye */}
                <ellipse cx="146" cy="116" rx="13" ry="16" fill="#fafaf9" stroke="#1c1917" strokeWidth="1" />
                <ellipse cx="146" cy="116" rx="10" ry="12" fill="url(#cosmicEye)" />
                <ellipse cx="146" cy="115" rx="5" ry="7" fill="#1e152a" />
                <circle cx="142" cy="110" r="4" fill="#ffffff" />
                <circle cx="150" cy="120" r="2" fill="#ffffff" />
                <path d="M 130 114 Q 146 96, 162 114" stroke="#1c0f24" strokeWidth="4" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Nose and tiny adorable smiling embroidered mouth */}
            <path d="M 118 126 L 122 126" stroke="#da8b54" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 113 133 Q 120 139, 127 133" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Expressive felt eyebrows */}
            <path d="M 78 98 Q 92 90, 104 98" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 136 98 Q 148 90, 162 98" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* 5. BLACK FELTED HAIR FRINGES CUTOUT */}
            <path d="M 65 100 Q 120 75, 175 100 Q 170 115, 160 120 Q 155 105, 120 102 Q 85 105, 80 120 Q 70 115, 65 100 Z" fill="url(#woolObsidian)" />
            {/* Soft hair detail strands */}
            <path d="M 116 102 M 116 102 L 124 116 L 128 102" stroke="#2e1065" strokeWidth="2" strokeLinecap="round" />

            {/* 6. MAJESTIC IMPERIAL OFFICIAL TALL BLACK CROWN */}
            <g filter="url(#softShadow)">
              {/* Tall crown body */}
              <path d="M 75 76 L 165 76 L 155 30 L 85 30 Z" fill="url(#woolObsidian)" />
              {/* Horizontal golden felt thread ornaments */}
              <path d="M 76 72 Q 120 74, 164 72" stroke="url(#feltKhaki)" strokeWidth="3" />
              <path d="M 81 50 Q 120 52, 159 50" stroke="url(#feltGold)" strokeWidth="1.5" />
              <path d="M 83 34 Q 120 36, 157 34" stroke="url(#feltGold)" strokeWidth="2" />
              {/* Crown side golden knot knobs */}
              <circle cx="76" cy="46" r="4.5" fill="url(#feltGold)" />
              <circle cx="164" cy="46" r="4.5" fill="url(#feltGold)" />

              {/* Central Felt Name Plaque: "戏命师" */}
              <rect x="104" y="38" width="32" height="42" rx="3" fill="#fafaf9" stroke="url(#feltKhaki)" strokeWidth="3" />
              <rect x="105" y="39" width="30" height="40" rx="2" fill="#fafaf9" />
              <text x="120" y="49" fill="#78350f" fontSize="7.2" fontWeight="bold" textAnchor="middle" fontFamily="serif" letterSpacing="0.5">戏</text>
              <text x="120" y="59" fill="#78350f" fontSize="7.2" fontWeight="bold" textAnchor="middle" fontFamily="serif" letterSpacing="0.5">命</text>
              <text x="120" y="69" fill="#78350f" fontSize="7.2" fontWeight="bold" textAnchor="middle" fontFamily="serif" letterSpacing="0.5">师</text>
            </g>

            {/* 7. YIN-YANG FELT AMULET PENDANT */}
            <g filter="url(#softShadow)">
              {/* Golden hanging braided cords */}
              <path d="M 112 165 L 115 186 M 128 165 L 125 186" stroke="url(#feltGold)" strokeWidth="2.5" />
              {/* Large circular Yin-Yang base */}
              <circle cx="120" cy="194" r="15" fill="#fafaf9" stroke="url(#feltGold)" strokeWidth="3" />
              {/* Dual Yin-Yang swirls */}
              <path d="M 120 179 A 7.5 7.5 0 0 0 120 194 A 7.5 7.5 0 0 1 120 209 A 15 15 0 0 0 120 179 Z" fill="#1c1917" />
              <circle cx="120" cy="186.5" r="3" fill="#ffffff" />
              <circle cx="120" cy="201.5" r="3" fill="#1c1917" />
              {/* Bottom purple thread tassel */}
              <path d="M 120 209 L 120 219" stroke="#c084fc" strokeWidth="4" />
              <ellipse cx="120" cy="221" rx="4" ry="5" fill="#701a75" />
            </g>

            {/* ======================================================== */}
            {/* DYNAMIC POSE / SCROLL / ACCESSORY RENDERINGS BY STATE */}
            {/* ======================================================== */}

            {/* POSE 1: GUIDING (Image 1 - Charming Pointer & Wink) */}
            {expression === 'guiding' && (
              <g filter="url(#softShadow)" className="animate-pulse">
                {/* Golden star sparkles next to cheek */}
                <polygon points="40,172 43,178 49,179 45,183 46,189 40,186 34,189 35,183 31,179 37,178" fill="url(#feltGold)" />
                <polygon points="205,172 208,178 214,179 210,183 211,189 205,186 199,189 200,183 196,179 202,178" fill="#ec4899" />
                {/* Pointer Hand Custom Layer */}
                <path d="M 50 175 C 38 175, 30 195, 45 205 C 55 210, 65 190, 50 175 Z" fill="url(#feltSkin)" stroke="#e4a883" strokeWidth="1" />
                {/* Pointing finger */}
                <path d="M 40 190 L 22 191" stroke="url(#feltSkin)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 40 190 L 22 191" stroke="#e4a883" strokeWidth="1" strokeLinecap="round" />
              </g>
            )}

            {/* POSE 2: WRITING (Image 2 - Classical Scholar Writing at Desk) */}
            {expression === 'writing' && (
              <g filter="url(#softShadow)">
                {/* Desk Base */}
                <path d="M 15 215 L 225 215 L 215 240 L 25 240 Z" fill="url(#feltKhaki)" stroke="#451a03" strokeWidth="2.5" />
                {/* Open Paper scroll on desk */}
                <path d="M 65 218 L 175 218 L 170 238 L 70 238 Z" fill="url(#feltParchment)" />
                {/* Scroll handles */}
                <rect x="58" y="215" width="6" height="23" rx="2" fill="url(#feltGold)" />
                <rect x="176" y="215" width="6" height="23" rx="2" fill="url(#feltGold)" />
                
                {/* Calligraphy text "命" on scroll */}
                <text x="120" y="233" fill="#1c1917" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">命</text>

                {/* Hand holding calligraphic brush */}
                <circle cx="152" cy="205" r="7.5" fill="url(#feltSkin)" />
                {/* Traditional Bamboo Brush */}
                <path d="M 158 180 L 140 224" stroke="url(#feltKhaki)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 140 224 L 137 232" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" />
              </g>
            )}

            {/* POSE 3: OBSERVING (Image 4 - Touching Chin & Analyzing Star Chart) */}
            {expression === 'observing' && (
              <g filter="url(#softShadow)">
                {/* Left hand touching chin */}
                <circle cx="106" cy="148" r="7.5" fill="url(#feltSkin)" stroke="#e4a883" strokeWidth="1" />
                <path d="M 106 148 Q 112 144, 120 144" stroke="url(#feltSkin)" strokeWidth="5.5" strokeLinecap="round" />

                {/* Standing parchment scroll with Astro system reading "天梁 天相 紫微" */}
                <path d="M 172 135 L 224 135 C 228 135, 228 195, 224 195 L 172 195 Z" fill="url(#feltParchment)" stroke="#b45309" strokeWidth="2" />
                {/* Constellation lines on scroll */}
                <circle cx="188" cy="155" r="2.5" fill="#581c87" />
                <circle cx="210" cy="152" r="2.5" fill="#581c87" />
                <circle cx="202" cy="178" r="2.5" fill="#581c87" />
                <line x1="188" y1="155" x2="210" y2="152" stroke="#701a75" strokeWidth="1" />
                <line x1="210" y1="152" x2="202" y2="178" stroke="#701a75" strokeWidth="1" />
                {/* Astrological names on scroll */}
                <text x="198" y="190" fill="#78350f" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="serif">紫微星盘</text>
              </g>
            )}

            {/* POSE 4: ANALYZING (Image 3 - Happily pointing up with scroll "紫微斗数") */}
            {expression === 'analyzing' && (
              <g filter="url(#softShadow)">
                {/* Happily raised pointing up left finger */}
                <circle cx="55" cy="145" r="7" fill="url(#feltSkin)" />
                <path d="M 55 145 L 53 130" stroke="url(#feltSkin)" strokeWidth="5" strokeLinecap="round" />
                <path d="M 55 145 L 53 130" stroke="#e4a883" strokeWidth="1" strokeLinecap="round" />

                {/* Vertical hanging scroll "紫微斗数 批命·解析" */}
                <path d="M 170 130 L 225 130 L 225 210 L 170 210 Z" fill="url(#feltParchment)" stroke="#78350f" strokeWidth="2" />
                {/* Scroll golden roller handles */}
                <rect x="166" y="127" width="63" height="4" rx="1.5" fill="url(#feltGold)" />
                <rect x="166" y="210" width="63" height="4" rx="1.5" fill="url(#feltGold)" />
                {/* Inscribed Chinese Characters */}
                <text x="197" y="146" fill="#451a03" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="serif">紫微斗数</text>
                <line x1="178" y1="154" x2="217" y2="154" stroke="#d97706" strokeWidth="1.2" />
                <text x="197" y="167" fill="#701a75" fontSize="7" fontWeight="medium" textAnchor="middle" fontFamily="sans-serif">批命 · 调理</text>
                <text x="197" y="179" fill="#701a75" fontSize="7" fontWeight="medium" textAnchor="middle" fontFamily="sans-serif">避凶 · 化煞</text>
                <text x="197" y="191" fill="#701a75" fontSize="7" fontWeight="medium" textAnchor="middle" fontFamily="sans-serif">星流九曜</text>
              </g>
            )}

          </g>
        </svg>

      </div>

      {/* 8. ELBOW CORNER DECORATIVE SPEECH DIALOG BUBBLE */}
      {withBubble && (
        <div className="mt-4 max-w-xs md:max-w-md w-full relative z-10">
          <div className="bg-[#12081d]/95 text-[#f5eefc] border-2 border-[#b07df0]/70 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(168,85,247,0.25)] relative text-center">
            
            {/* Real felt stitching look to matching the visual concept */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-yellow-400/90 rounded-tl" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-yellow-400/90 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-yellow-400/90 rounded-bl" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-yellow-400/90 rounded-br" />

            {/* Balloon bubble pointer apex */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#12081d] border-t-2 border-l-2 border-[#b07df0]/70 rotate-45" />

            <p className="text-xs font-semibold leading-relaxed font-sans">{activeBubbleText}</p>
          </div>
        </div>
      )}

    </div>
  );
};
