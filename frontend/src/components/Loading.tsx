import React, { useEffect, useState } from 'react';
import './Loading.css';
import logo1 from "@/assets/logoDiagnosis.png";
import logo2 from "@/assets/logoISPM.jpeg";
const Loading: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    //Verification du chargement d'image
    const img1=new Image();
    img1.src = logo1;
    img1.onload = () => console.log('logoDiagnosis chargée avec succès:', img1.src);
    img1.onerror = () => console.error('erreur de chargement d\'image:', img1.src);
    const img2=new Image();
    img2.src = logo2;
    img2.onload = () => console.log('logoDiagnosis chargée avec succès:', img2.src);
    img2.onerror = () => console.error('erreur de chargement d\'image:', img2.src);
    // Masquer l'animation après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <img src={logo1} alt="Logo 1" className="logo logo1" />
        <div className="title">
          {'Diagnosis'.split('').map((letter, index) => (
            <span key={index} className="letter" style={{ animationDelay: `${index * 0.1}s` }}>
              {letter}
            </span>
          ))}
        </div>
        <img src={logo2} alt="Logo 2" className="logo logo2" />
      </div>
    </div>
  );
};

export default Loading;