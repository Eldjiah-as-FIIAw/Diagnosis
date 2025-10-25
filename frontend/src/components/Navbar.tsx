import React from 'react';
import './Navbar.css';

interface NavbarProps {
  setView: (view: 'home' | 'diagnostic' | 'analysis' | 'search' | 'community' | 'help' | 'settings') => void;
}

const Navbar: React.FC<NavbarProps> = ({ setView }) => {
  return (
    <div className="navbar">
      <nav>
        <button onClick={() => setView('home')}>Accueil</button>
        <button onClick={() => setView('diagnostic')}>Diagnostic</button>
        <button onClick={() => setView('analysis')}>Analyse</button>
        <button onClick={() => setView('search')}>Recherche</button>
        <button onClick={() => setView('community')}>Communauté</button>
        <button onClick={() => setView('help')}>Aide</button>
        <button onClick={() => setView('settings')}>Paramètres</button>
      </nav>
    </div>
  );
};

export default Navbar;