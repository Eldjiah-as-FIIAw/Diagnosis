// src/modules/PatientSearch/PatientSearchForm.tsx
import React, { useState } from 'react';
import { getPatientHistory, searchBySymptome, searchByDate } from '@/utils/data';
import { Diagnostic } from '@/types';
import './PatientSearchForm.css';

interface PatientSearchFormProps {
  subView: 'name' | 'symptome' | 'date' | '';
  token: string;
}

const PatientSearchForm: React.FC<PatientSearchFormProps> = ({ subView, token }) => {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!token) {
      alert('Vous devez être connecté.');
      return;
    }
    if (!searchInput.trim()) {
      alert('Veuillez saisir un critère de recherche.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: Diagnostic[] = [];
      if (subView === 'name') data = await getPatientHistory(searchInput, token);
      else if (subView === 'symptome') data = await searchBySymptome(searchInput, token);
      else if (subView === 'date') data = await searchByDate(searchInput, token);

      setResults(data);
    } catch (err: any) {
      console.error(err);
      setResults([]);
      setError('Erreur lors de la recherche. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-search-form">
      <h3>Recherche de Patients</h3>
      <div className="search-controls">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Rechercher par ${subView || 'nom'}`}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {results.length > 0 ? (
        <ul className="results-list">
          {results.map((diag) => (
            <li key={diag.id} className="result-item fade-in">
              <div className="result-header">
                <strong>{diag.patientName}</strong>
                <span>Score: {diag.severityScore.toFixed(2)}%</span>
              </div>
              <div className="result-body">
                <p>Diagnostic: {diag.diagnostic}</p>
                {diag.symptomes.length > 0 && (
                  <div className="symptomes">
                    {diag.symptomes.map((s, i) => (
                      <span key={i} className="symptome-badge">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p className="no-results">Aucun résultat trouvé.</p>
      )}
    </div>
  );
};

export default PatientSearchForm;
