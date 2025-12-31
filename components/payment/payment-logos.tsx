// Composant pour afficher les logos de paiement officiels
// Utilise des SVG inline pour éviter les problèmes de CORS

export function OrangeMoneyLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fond orange officiel Orange Money */}
      <rect width="200" height="200" rx="24" fill="#FF6600"/>
      {/* Flèche blanche pointant vers le haut-droite */}
      <path 
        d="M 60 60 L 140 60 L 140 80 L 100 80 L 100 140 L 80 140 L 80 100 L 60 100 Z" 
        fill="white" 
        opacity="0.95"
      />
      {/* Flèche orange pointant vers le bas-gauche */}
      <path 
        d="M 140 140 L 60 140 L 60 120 L 100 120 L 100 60 L 120 60 L 120 100 L 140 100 Z" 
        fill="#FF8533" 
        opacity="0.9"
      />
    </svg>
  );
}

export function WaveLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fond bleu clair officiel Wave (#00B2FF ou similaire) */}
      <rect width="200" height="200" rx="24" fill="#00B2FF"/>
      {/* Pingouin Wave - Corps principal noir */}
      <ellipse cx="100" cy="115" rx="48" ry="58" fill="#1A1A1A"/>
      {/* Ventre blanc ovale caractéristique */}
      <ellipse cx="100" cy="120" rx="30" ry="38" fill="white"/>
      {/* Tête du pingouin */}
      <ellipse cx="100" cy="55" rx="42" ry="48" fill="#1A1A1A"/>
      {/* Bec orange */}
      <ellipse cx="128" cy="68" rx="10" ry="7" fill="#FF6600"/>
      {/* Œil blanc */}
      <circle cx="108" cy="62" r="3.5" fill="white"/>
      {/* Aile gauche levée (geste de la main) */}
      <ellipse cx="68" cy="105" rx="14" ry="22" fill="#1A1A1A" transform="rotate(-25 68 105)"/>
      {/* Pieds orange */}
      <ellipse cx="82" cy="168" rx="11" ry="7" fill="#FF6600"/>
      <ellipse cx="118" cy="168" rx="11" ry="7" fill="#FF6600"/>
      {/* Texte "wave" en bas - style officiel */}
      <text x="100" y="190" fontSize="22" fill="white" fontWeight="600" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="1.5">wave</text>
    </svg>
  );
}

export function VisaLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" rx="10" fill="#1434CB"/>
      <text x="100" y="120" fontSize="80" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="Arial">VISA</text>
    </svg>
  );
}

export function MastercardLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" rx="10" fill="#EB001B"/>
      <circle cx="70" cy="100" r="40" fill="#F79E1B"/>
      <circle cx="130" cy="100" r="40" fill="#FF5F00"/>
      <circle cx="100" cy="100" r="35" fill="#EB001B"/>
    </svg>
  );
}
