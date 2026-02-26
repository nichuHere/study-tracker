import React, { useEffect, useState, useCallback } from 'react';
import MotherDefault from '../image/Mother-Default.png';
import FatherDefault from '../image/Father-Default.png';
import BadgeIcon from './BadgeIcon';
import { BADGE_ID_MAP } from '../utils/badgeIcons';

// Confetti particle colors — bright candy palette
const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#D2B4DE',
  '#FF69B4', '#00CED1', '#FFD700', '#7B68EE', '#FF4500'
];

// Fun sparkle/emoji shapes
const SPARKLE_CHARS = ['✨', '⭐', '🌟', '💫', '🎉', '🎊', '🥳', '🏆', '🎯', '💪', '🌈', '🦄', '🍭', '🎈', '🎀'];

// Fun, childish congratulatory messages — name is inserted dynamically
const getCongratsMessages = (name) => [
  `${name} is SO SO proud of you, my little superstar!! 🥰🌟`,
  `YAYYY!! That's my champion!! You did it!! 💪🎉`,
  `Oh WOW!! You're absolutely AMAZING, sweetheart!! 🌟✨`,
  `Brilliant work!! ${name} KNEW you could do it!! 🎯🏆`,
  `WOOHOO!! Way to go, superstar!! You're on FIRE!! 🚀🔥`,
  `You make ${name}'s heart SO happy!! Keep shining!! 🥹💖`,
  `INCREDIBLE!! Nothing can stop you now!! ⚡🦸`,
  `My little genius!! ${name} is doing a happy dance!! 💃🎊`,
];

// Generate random confetti particles
const generateConfetti = (count = 70) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2 + Math.random() * 3,
    size: 8 + Math.random() * 14,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    shape: Math.random() > 0.6 ? 'circle' : Math.random() > 0.3 ? 'rect' : 'star',
  }));
};

// Generate floating sparkle emojis
const generateSparkles = (count = 18) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
    left: 5 + Math.random() * 90,
    top: 5 + Math.random() * 90,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 2,
    size: 22 + Math.random() * 30,
  }));
};

// Generate floating hearts around Mamma
const generateHearts = (count = 8) => {
  const hearts = ['❤️', '💜', '💖', '💗', '💕', '🩷', '🧡', '💛'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    char: hearts[i % hearts.length],
    angle: (i / count) * 360,
    delay: i * 0.3,
    size: 16 + Math.random() * 16,
  }));
};

const BadgeCelebration = ({ badge, parentPhoto, parentType = 'mother', parentName = 'Mother', onClose }) => {
  const defaultImage = parentType === 'father' ? FatherDefault : MotherDefault;
  const [phase, setPhase] = useState('entering');
  const [confetti] = useState(() => generateConfetti(70));
  const [sparkles] = useState(() => generateSparkles(18));
  const [hearts] = useState(() => generateHearts(8));
  const [message] = useState(() => {
    const messages = getCongratsMessages(parentName);
    return messages[Math.floor(Math.random() * messages.length)];
  });

  // Tier display config — childish colors
  const tierConfig = {
    common: { gradient: 'from-emerald-300 to-teal-400', glow: 'shadow-emerald-300/60', label: 'Common', bg: 'from-emerald-100 to-teal-100', text: 'text-emerald-700' },
    rare: { gradient: 'from-sky-300 to-blue-500', glow: 'shadow-sky-300/60', label: 'Rare', bg: 'from-sky-100 to-blue-100', text: 'text-blue-700' },
    epic: { gradient: 'from-fuchsia-400 to-purple-600', glow: 'shadow-fuchsia-300/60', label: 'Epic', bg: 'from-fuchsia-100 to-purple-100', text: 'text-purple-700' },
    legendary: { gradient: 'from-amber-300 to-orange-500', glow: 'shadow-amber-300/60', label: 'Legendary', bg: 'from-amber-100 to-orange-100', text: 'text-orange-700' },
  };
  const tier = tierConfig[badge.tier] || tierConfig.common;

  // Auto-dismiss after 7 seconds (a bit longer to enjoy)
  useEffect(() => {
    const showTimer = setTimeout(() => setPhase('showing'), 100);
    const exitTimer = setTimeout(() => setPhase('exiting'), 6500);
    const closeTimer = setTimeout(() => onClose(), 7200);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const handleDismiss = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => onClose(), 700);
  }, [onClose]);

  if (!badge) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ${
        phase === 'entering' ? 'opacity-0' : phase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleDismiss}
      style={{ cursor: 'pointer' }}
    >
      {/* Colorful blurred overlay — playful, not dark */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        phase === 'showing' ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(255,182,193,0.85) 0%, rgba(173,216,230,0.8) 30%, rgba(255,218,185,0.75) 60%, rgba(221,160,221,0.7) 100%)',
        backdropFilter: 'blur(8px)',
      }} />

      {/* Confetti Particles */}
      {phase === 'showing' && confetti.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            zIndex: 10000,
          }}
        >
          {p.shape === 'star' ? (
            <div style={{ fontSize: p.size * 0.8, lineHeight: 1 }}>
              {['⭐', '🌟', '✦', '✧'][Math.floor(Math.random() * 4)]}
            </div>
          ) : (
            <div
              style={{
                width: p.shape === 'circle' ? p.size : p.size * 0.6,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : '3px',
                transform: `rotate(${p.rotation}deg)`,
                animation: `confettiSway ${p.duration * 0.5}s ease-in-out infinite alternate`,
              }}
            />
          )}
        </div>
      ))}

      {/* Floating Sparkle Emojis — scattered across screen */}
      {phase === 'showing' && sparkles.map(s => (
        <div
          key={`sparkle-${s.id}`}
          className="absolute pointer-events-none"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            animation: `sparkleFloat ${s.duration}s ${s.delay}s ease-in-out infinite`,
            zIndex: 10001,
          }}
        >
          {s.char}
        </div>
      ))}

      {/* ===== MAIN CONTENT — centered, full-screen layout ===== */}
      <div
        className={`relative z-[10002] w-full max-w-lg mx-4 flex flex-col items-center transition-all duration-700 ease-out ${
          phase === 'showing'
            ? 'translate-y-0 scale-100'
            : phase === 'entering'
            ? 'translate-y-[60vh] scale-90'
            : 'translate-y-[60vh] scale-90'
        }`}
      >
        {/* Close hint */}
        <div className="text-center mb-3 animate-celebration-bubble-pop">
          <span className="text-white/70 text-xs font-bold bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            tap anywhere to close ✕
          </span>
        </div>

        {/* ===== MAMMA + SPEECH BUBBLE — side by side like a comic ===== */}
        <div className="w-full flex items-center gap-3 mb-4">
          
          {/* Mamma Image — circular crop, no rectangle */}
          <div className="relative flex-shrink-0 animate-celebration-mamma-entrance">
            {/* Rainbow glow ring behind Mamma */}
            <div className="absolute -inset-5 rounded-full animate-celebration-rainbow-ring opacity-60 blur-lg" 
              style={{
                background: 'conic-gradient(from 0deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B59B6, #FF6B6B)',
              }}
            />

            {/* Orbiting hearts around Mamma */}
            {hearts.map(h => (
              <div
                key={`heart-${h.id}`}
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  fontSize: `${h.size}px`,
                  animation: `celebrationOrbitHeart 3s ${h.delay}s linear infinite`,
                  transformOrigin: '0 0',
                  '--orbit-angle': `${h.angle}deg`,
                  '--orbit-radius': '85px',
                }}
              >
                {h.char}
              </div>
            ))}

            {/* Mamma Image — circular, no background rectangle */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden border-[5px] border-white shadow-2xl relative z-10 animate-celebration-wobble"
                style={{
                  boxShadow: '0 0 30px rgba(255, 105, 180, 0.5), 0 0 60px rgba(255, 215, 0, 0.25), 0 8px 20px rgba(0,0,0,0.15)',
                }}
              >
                <img
                  src={parentPhoto || defaultImage}
                  alt={parentName}
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              {/* Sparkle bursts around Mamma */}
              <div className="absolute -top-3 -right-1 text-2xl animate-celebration-heart-float" style={{ animationDelay: '0s' }}>✨</div>
              <div className="absolute -top-1 -left-3 text-xl animate-celebration-heart-float" style={{ animationDelay: '0.6s' }}>🌟</div>
              <div className="absolute -bottom-1 -right-4 text-xl animate-celebration-heart-float" style={{ animationDelay: '1.0s' }}>💖</div>
              <div className="absolute -bottom-3 left-2 text-xl animate-celebration-heart-float" style={{ animationDelay: '1.4s' }}>🎀</div>
            </div>
          </div>

          {/* Speech Bubble — to the right, like Mamma is speaking */}
          <div className="flex-1 min-w-0 animate-celebration-bubble-pop">
            <div className="relative bg-white rounded-3xl rounded-bl-lg p-4 shadow-2xl border-4 border-pink-300"
              style={{ boxShadow: '0 10px 40px rgba(255, 105, 180, 0.3), 0 0 0 3px rgba(255,255,255,0.6)' }}
            >
              {/* Bubble tail pointing left toward Mamma */}
              <div className="absolute top-8 -left-4 w-0 h-0" 
                style={{
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderRight: '16px solid white',
                  filter: 'drop-shadow(-3px 0 0 rgb(249, 168, 212))',
                }}
              />
              
              <p className="relative text-gray-800 font-extrabold text-base leading-relaxed animate-celebration-wobble-text">
                {message}
              </p>
              <p className="relative mt-2">
                <span className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-black text-xs tracking-wide">
                  — with love, {parentName} 💕
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ===== BADGE & TIER INFO — shown below bubble ===== */}
        <div className="animate-celebration-badge-bounce">
          <div className={`relative bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-xl border-2 border-dashed`}
            style={{ borderColor: badge.tier === 'legendary' ? '#F59E0B' : badge.tier === 'epic' ? '#A855F7' : badge.tier === 'rare' ? '#3B82F6' : '#10B981' }}
          >
            <div className="flex items-center gap-4">
              {/* Badge icon */}
              <div className="relative flex-shrink-0">
                <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${tier.gradient} opacity-30 blur-lg animate-pulse`} />
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <BadgeIcon
                    badgeId={BADGE_ID_MAP[badge.id] || badge.id}
                    state="enabled"
                    size={80}
                    decorative={false}
                  />
                </div>
              </div>
              
              {/* Badge details */}
              <div className="flex-1 min-w-0">
                <div className={`inline-block px-3 py-0.5 rounded-full bg-gradient-to-r ${tier.gradient} text-white text-[10px] font-black uppercase tracking-widest mb-1.5 shadow-md`}>
                  🏅 {tier.label} Unlocked!
                </div>
                <h3 className="text-xl font-black text-gray-800 leading-tight animate-celebration-text-glow">
                  {badge.name}
                </h3>
                <p className="text-sm font-semibold text-gray-500 mt-0.5">
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Fun rainbow bar at bottom */}
            <div className="mt-3 h-2 rounded-full overflow-hidden animate-celebration-rainbow-bar"
              style={{
                background: 'linear-gradient(90deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B59B6, #FF6B6B)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeCelebration;
