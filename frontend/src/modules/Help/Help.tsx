// src/modules/Help/Help.tsx
import React from 'react';
import { FaBook, FaQuestionCircle, FaHeadset } from 'react-icons/fa';
import './Help.css';

const Help: React.FC = () => {
  const helpLinks = [
    { icon: <FaBook />, title: "Guide de l'utilisateur", url: "#" },
    { icon: <FaQuestionCircle />, title: "FAQ", url: "#" },
    { icon: <FaHeadset />, title: "Contacter le support", url: "#" },
  ];

  return (
    <div className="help">
      <h2>Besoin d'Aide ?</h2>
      <p>Consultez les ressources suivantes pour bien utiliser <strong>Diagnosis</strong> :</p>
      <div className="help-links">
        {helpLinks.map((link, idx) => (
          <a key={idx} href={link.url} className="help-card">
            <div className="help-icon">{link.icon}</div>
            <span>{link.title}</span>
          </a>
        ))}
      </div>
      <p className="coming-soon">Fonctionnalité en cours de développement. Les liens seront activés prochainement.</p>
    </div>
  );
};

export default Help;
