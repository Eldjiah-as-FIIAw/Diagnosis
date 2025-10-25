// src/modules/PatientSearch/PatientSearchForm.tsx
import React, { useState } from 'react';
import { getPatientHistory, searchBySymptome, searchByDate } from '@/utils/data';
import { Diagnostic } from '@/types';

interface PatientSearchFormProps {
  subView: 'name' | 'symptome' | 'date' | '';
  token: string;
}

const PatientSearchForm: React.FC<PatientSearchFormProps> = ({ subView, token }) => {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<Diagnostic[]>([]);

  const handleSearch = async () => {
    if (!token) {
      alert('Vous devez être connecté.');
      return;
    }
    try {
      let data: Diagnostic[] = [];
      if (subView === 'name') data = await getPatientHistory(searchInput, token);
      else if (subView === 'symptome') data = await searchBySymptome(searchInput, token);
      else if (subView === 'date') data = await searchByDate(searchInput, token);
      setResults(data);
    } catch (error) {
      console.error(error);
      setResults([]);
    }
  };

  return (
    <div className="patient-search-form">
      <h3>Recherche de Patients</h3>
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder={`Rechercher par ${subView || 'nom'}`}
      />
      <button onClick={handleSearch}>Rechercher</button>
      {results.length > 0 ? (
        <ul>
          {results.map((diag) => (
            <li key={diag.id}>
              {diag.patientName} - {diag.symptomes} → {diag.diagnostic} ({diag.severityScore.toFixed(2)}%)
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun résultat trouvé.</p>
      )}
    </div>
  );
};

export default PatientSearchForm;
