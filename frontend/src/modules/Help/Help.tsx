import React from 'react';
import './Help.css';

const Help: React.FC = () => {
  return (
    <div className="help">
      <h2>Aide</h2>
      <p>Consultez les ressources suivantes pour utiliser Diagnosis :</p>
      <ul>
        <li><a href="#">Guide de l'utilisateur</a></li>
        <li><a href="#">FAQ</a></li>
        <li><a href="#">Contacter le support</a></li>
      </ul>
      <p>Fonctionnalité en cours de développement. Les liens seront activés prochainement.</p>
    </div>
  );
};

export default Help;