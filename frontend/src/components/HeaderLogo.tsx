import React from 'react';
import './HeaderLogo.css';

// Utilisation de new URL pour Vite + Electron
const logo1 = new URL('@/assets/logoDiagnosis.png', import.meta.url).href;
const logo2 = new URL('@/assets/logoISPM.jpeg', import.meta.url).href;

const HeaderLogo: React.FC = () => {
  // Vérification du chargement d'image
  const img1 = new Image();
  img1.src = logo1;
  img1.onload = () => console.log('logoDiagnosis chargée avec succès:', img1.src);
  img1.onerror = () => console.error('erreur de chargement d\'image:', img1.src);

  const img2 = new Image();
  img2.src = logo2;
  img2.onload = () => console.log('logoISPM chargée avec succès:', img2.src);
  img2.onerror = () => console.error('erreur de chargement d\'image:', img2.src);

  return (
    <div className="header-logo">
      <img src={logo1} alt="Logo 1" className="header-logo-img" />
      <span className="header-logo-title">Diagnosis</span>
      <img src={logo2} alt="Logo 2" className="header-logo-img" />
    </div>
  );
};

export default HeaderLogo;
