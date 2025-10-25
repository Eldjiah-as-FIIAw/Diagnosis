import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <h2>Bienvenue dans Diagnosis</h2>
      <p>
        Cette application vous permet de gérer les diagnostics médicaux, d'analyser les données des patients et de visualiser l'évolution des symptômes à l'aide de modèles mathématiques comme Runge-Kutta.
      </p>
      <p>Utilisez la barre de navigation pour explorer les fonctionnalités :</p>
      <ul>
        <li><strong>Diagnostic</strong> : Ajouter ou consulter l'historique des diagnostics.</li>
        <li><strong>Analyse</strong> : Visualiser l'évolution des scores de gravité.</li>
        <li><strong>Recherche</strong> : Trouver des patients par nom, symptôme ou date.</li>
      </ul>
    </div>
  );
};

export default Home;