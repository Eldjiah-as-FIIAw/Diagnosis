// src/modules/Settings/Settings.tsx
import React, { useState, useEffect } from 'react';
import { symptomes as initialSymptomes, addSymptome, removeSymptome } from '@/utils/data';
import { Symptome } from '@/types';
import './Settings.css';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  token: string | null;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, token }) => {
  const [symptomeList, setSymptomeList] = useState<Symptome[]>([]);
  const [newSymptomeEn, setNewSymptomeEn] = useState('');
  const [newSymptomeFr, setNewSymptomeFr] = useState('');
  const [newSymptomeSeverity, setNewSymptomeSeverity] = useState(0.5);

  useEffect(() => {
    setSymptomeList(initialSymptomes);
  }, []);

  const handleAddSymptome = async () => {
    if (!token) return alert('Vous devez être connecté.');
    if (!newSymptomeEn || !newSymptomeFr) return alert('Remplissez tous les champs.');

    try {
      await addSymptome({ en: newSymptomeEn, fr: newSymptomeFr, severity: newSymptomeSeverity }, token);
      setSymptomeList(prev => [...prev, { en: newSymptomeEn, fr: newSymptomeFr, severity: newSymptomeSeverity }]);
      setNewSymptomeEn('');
      setNewSymptomeFr('');
      setNewSymptomeSeverity(0.5);
    } catch {
      alert('Erreur lors de l’ajout du symptôme.');
    }
  };

  const handleRemoveSymptome = async (en: string) => {
    if (!token) return alert('Vous devez être connecté.');
    try {
      await removeSymptome(en, token);
      setSymptomeList(prev => prev.filter(s => s.en !== en));
    } catch {
      alert('Erreur lors de la suppression du symptôme.');
    }
  };

  return (
    <div className={`settings ${theme}`}>
      <h2>Paramètres</h2>

      <div className="theme-selector">
        <h3>Thème</h3>
        <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </div>

      <div className="symptomes-manager">
        <h3>Gérer les Symptômes</h3>
        <div className="symptome-inputs">
          <input
            type="text"
            placeholder="Symptôme (EN)"
            value={newSymptomeEn}
            onChange={(e) => setNewSymptomeEn(e.target.value)}
          />
          <input
            type="text"
            placeholder="Symptôme (FR)"
            value={newSymptomeFr}
            onChange={(e) => setNewSymptomeFr(e.target.value)}
          />
          <input
            type="number"
            placeholder="Gravité (0-1)"
            min={0}
            max={1}
            step={0.1}
            value={newSymptomeSeverity}
            onChange={(e) => setNewSymptomeSeverity(Number(e.target.value))}
          />
          <button className="add-btn" onClick={handleAddSymptome}>Ajouter</button>
        </div>

        <ul className="symptome-list">
          {symptomeList.map((s, index) => (
            <li key={s.en} style={{ animationDelay: `${index * 0.05}s` }} className="fade-in">
              <span>{s.fr} ({s.en}) - Gravité: {s.severity}</span>
              <button className="remove-btn" onClick={() => handleRemoveSymptome(s.en)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
