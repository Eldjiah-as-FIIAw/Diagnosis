import React, { useState, useEffect } from 'react';
import { symptomes, addSymptome, removeSymptome } from '@/utils/data';
import { Symptome } from '@/types';
import "./Settings.css";

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  token: string | null;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, token }) => {
  const [newSymptomeEn, setNewSymptomeEn] = useState('');
  const [newSymptomeFr, setNewSymptomeFr] = useState('');
  const [newSymptomeSeverity, setNewSymptomeSeverity] = useState(0.5);

  const handleAddSymptome = async () => {
    if (!token) {
      alert('Vous devez être connecté.');
      return;
    }
    try {
      await addSymptome(
        { en: newSymptomeEn, fr: newSymptomeFr, severity: newSymptomeSeverity },
        token
      );
      alert('Symptôme ajouté avec succès.');
      setNewSymptomeEn('');
      setNewSymptomeFr('');
      setNewSymptomeSeverity(0.5);
    } catch (error) {
      alert('Erreur lors de l\'ajout du symptôme.');
    }
  };

  const handleRemoveSymptome = async (symptomeEn: string) => {
    if (!token) {
      alert('Vous devez être connecté.');
      return;
    }
    try {
      await removeSymptome(symptomeEn, token);
      alert('Symptôme supprimé avec succès.');
    } catch (error) {
      alert('Erreur lors de la suppression du symptôme.');
    }
  };

  return (
    <div className="settings">
      <h3>Paramètres</h3>
      <div>
        <h4>Thème</h4>
        <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </div>
      <div>
        <h4>Gérer les Symptômes</h4>
        <input
          type="text"
          value={newSymptomeEn}
          onChange={(e) => setNewSymptomeEn(e.target.value)}
          placeholder="Symptôme en anglais"
        />
        <input
          type="text"
          value={newSymptomeFr}
          onChange={(e) => setNewSymptomeFr(e.target.value)}
          placeholder="Symptôme en français"
        />
        <input
          type="number"
          value={newSymptomeSeverity}
          onChange={(e) => setNewSymptomeSeverity(Number(e.target.value))}
          placeholder="Gravité (0-1)"
          min="0"
          max="1"
          step="0.1"
        />
        <button onClick={handleAddSymptome}>Ajouter Symptôme</button>
        <ul>
          {symptomes.map((s: Symptome) => (
            <li key={s.en}>
              {s.fr} ({s.en}, Gravité: {s.severity})
              <button onClick={() => handleRemoveSymptome(s.en)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;