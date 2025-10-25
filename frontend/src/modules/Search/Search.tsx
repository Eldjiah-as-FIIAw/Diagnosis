// src/modules/Search/Search.tsx
import React, { useState, useEffect } from 'react';
import { DiagnosticPayload, postDiagnostic, fetchWithAuth } from '@/services/api';
import { symptomes as allSymptoms } from '@/utils/data';
import './Search.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SearchProps {
  subView: 'name' | 'symptome' | 'date' | 'diagnostic' | '';
  token: string | null;
}

const API_BASE = "http://127.0.0.1:8000/api";

const Search: React.FC<SearchProps> = ({ subView, token }) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomesInput, setSymptomesInput] = useState(''); // recherche intelligente
  const [results, setResults] = useState<any[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [webResults, setWebResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [controlsCount, setControlsCount] = useState(0);
  const [severityAverage, setSeverityAverage] = useState(0);
  const [loading, setLoading] = useState(false);

  // États pour l’évolution
  const [evolutionData, setEvolutionData] = useState<any>({});
  const [evolutionSummary, setEvolutionSummary] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});

  // ─────────────── Réinitialisation ───────────────
  useEffect(() => {
    resetAll();
  }, [subView]);

  const resetAll = () => {
    setSearchInput('');
    setResults([]);
    setSelectedPatientId(null);
    setSymptoms([]);
    setDiagnosticResult(null);
    setWebResults([]);
    setError('');
    setPatientHistory([]);
    setControlsCount(0);
    setSeverityAverage(0);
    setEvolutionData({});
    setEvolutionSummary([]);
    setChartData({});
    setSymptomesInput('');
    if (token) fetchAllPatients();
  };

  useEffect(() => {
    if (token) fetchAllPatients();
  }, [token]);

  const fetchAllPatients = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`${API_BASE}/patients/`);
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors du chargement des patients.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────── Recherche ───────────────
  const handleSearch = async () => {
    if (!token) {
      alert('Vous devez être connecté.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (!searchInput.trim()) {
        await fetchAllPatients();
        setLoading(false);
        return;
      }

      let url = `${API_BASE}/patients/search/?`;
      if (subView === 'name') url += `search=${encodeURIComponent(searchInput.trim())}`;
      else if (subView === 'diagnostic') url += `diagnostic=${encodeURIComponent(searchInput.trim())}`;
      else if (subView === 'date') url += `date=${searchInput}`;
      else {
        setResults([]);
        setLoading(false);
        return;
      }

      const data = await fetchWithAuth(url);
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setResults([]);
      setError('Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────── Symptômes ───────────────
  const filteredSymptoms = allSymptoms.filter(
    (s) =>
      s.fr.toLowerCase().includes(symptomesInput.toLowerCase()) ||
      s.en.toLowerCase().includes(symptomesInput.toLowerCase())
  );

  const toggleSymptome = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSymptomAdd = (symptom: string) => {
    const s = symptom.trim();
    if (s && !symptoms.includes(s)) setSymptoms([...symptoms, s]);
  };
  const handleSymptomRemove = (index: number) =>
    setSymptoms(symptoms.filter((_, i) => i !== index));

  // ─────────────── Historique & évolution ───────────────
  const analyzeEvolution = (history: any[]) => {
    const evolution: any = {};
    history.forEach((h: any) => {
      const disease = h.disease;
      if (!evolution[disease]) evolution[disease] = [];
      evolution[disease].push({ date: new Date(h.date).toLocaleDateString(), probability: h.probability });
    });

    Object.keys(evolution).forEach((disease) => {
      evolution[disease].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return evolution;
  };

  const getEvolutionSummary = (evolutionData: any) => {
    const summary: any[] = [];
    Object.entries(evolutionData).forEach(([disease, data]: any) => {
      if (data.length >= 2) {
        const diff = data[data.length - 1].probability - data[0].probability;
        summary.push({
          disease,
          status: diff > 0 ? '⚠️ Aggravation' : '✅ Amélioration',
          change: (diff * 100).toFixed(2),
        });
      }
    });
    return summary;
  };

  const handleViewHistory = async (patientId: number) => {
    if (!token) return;
    try {
      const history = await fetchWithAuth(`${API_BASE}/patients/${patientId}/history/`);
      const histArray = Array.isArray(history) ? history : [];

      const sortedHistory = histArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPatientHistory(sortedHistory);
      setControlsCount(sortedHistory.length);
      const avg = sortedHistory.reduce((acc, h) => acc + (h.probability || 0), 0) / (sortedHistory.length || 1);
      setSeverityAverage(avg);

      const evo = analyzeEvolution(sortedHistory);
      setEvolutionData(evo);
      setEvolutionSummary(getEvolutionSummary(evo));

      const chartDataByDisease: any = {};
      Object.entries(evo).forEach(([disease, data]: any) => {
        chartDataByDisease[disease] = {
          labels: data.map((d: any) => d.date),
          datasets: [
            {
              label: 'Probabilité (%)',
              data: data.map((d: any) => d.probability * 100),
              borderColor: '#0088FE',
              backgroundColor: '#0088FE33',
              tension: 0.3,
            },
          ],
        };
      });
      setChartData(chartDataByDisease);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Impossible de récupérer l’historique.');
    }
  };

  const computeEvolutionStatus = (history: any[], currentSymptoms: string[]) => {
    if (history.length === 0) return 'Aucun historique pour ce patient';
    const last = history[0];
    const diff = currentSymptoms.length - (last.symptomes?.length || 0);
    if (diff > 0) return '⚠️ État aggravé (plus de symptômes)';
    if (diff < 0) return '✅ Amélioration (moins de symptômes)';
    return 'ℹ️ État stable';
  };

  // ─────────────── Soumission diagnostic ───────────────
  const handleSubmitSymptoms = async () => {
    if (!token || !selectedPatientId) {
      alert('Veuillez sélectionner un patient et vous connecter.');
      return;
    }

    const selectedPatient = results.find((r) => r.id === selectedPatientId) || {};
    const patientData = selectedPatient.patient || selectedPatient;

    const payload: DiagnosticPayload = {
      patientId: selectedPatientId,
      patientName: patientData.full_name,
      age: patientData.age ?? 0,
      sex: patientData.sex,
      symptomes: symptoms,
    };

    try {
      const data = await postDiagnostic(payload, token);
      setDiagnosticResult(data.diagnostic);
      setWebResults(data.web_results || []);
      setSymptoms([]);
      alert('Diagnostic soumis avec succès.');
      handleViewHistory(selectedPatientId);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erreur lors de la soumission.');
    }
  };

  // ─────────────── Suppression diagnostic ───────────────
  const handleDeleteDiagnostic = async (patientId: number, historyId: number) => {
    if (!token) return;
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce diagnostic ?");
    if (!confirmDelete) return;

    try {
      await fetchWithAuth(`${API_BASE}/diagnostics/${historyId}/`, { method: 'DELETE' });
      alert('Diagnostic supprimé.');
      handleViewHistory(patientId);
    } catch (err: any) {
      alert('Erreur lors de la suppression.');
    }
  };

  const searchLabel =
    subView === 'name' ? 'Nom'
      : subView === 'diagnostic' ? 'Diagnostic'
      : subView === 'date' ? 'Date'
      : 'Critère';

  return (
    <div className="search-container">
      <h3>🔍 Recherche par {searchLabel}</h3>

      <div className="search-box">
        <input
          type={subView === 'date' ? 'date' : 'text'}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Rechercher par ${searchLabel}`}
        />
        <button onClick={handleSearch}>Rechercher</button>
      </div>

      {loading && <p className="loading">⏳ Chargement...</p>}
      {error && <div className="error">{error}</div>}
      {!loading && results.length === 0 && <p className="no-results">Aucun patient trouvé.</p>}

      {!loading && results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Âge</th>
              <th>Sexe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const p = r.patient || r;
              return (
                <tr key={r.id}>
                  <td>{p.full_name}</td>
                  <td>{p.age}</td>
                  <td>{p.sex}</td>
                  <td>
                    <button onClick={() => setSelectedPatientId(r.id)}>🎯 Sélectionner</button>
                    <button onClick={() => handleViewHistory(r.id)}>📈 Évolution</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedPatientId && (
        <div className="patient-details">
          <h4>🧍 Patient sélectionné</h4>
          <p>Contrôles : {controlsCount}</p>
          <p>Sévérité moyenne : {(severityAverage * 100).toFixed(2)}%</p>
          <p>État actuel : {computeEvolutionStatus(patientHistory, symptoms)}</p>

          {patientHistory.length > 0 && (
            <div className="patient-history">
              <h5>🩺 Historique</h5>
              {patientHistory.map((h, i) => (
                <div key={i} className="history-item">
                  <p><strong>{h.disease}</strong> ({(h.probability * 100).toFixed(2)}%) - {new Date(h.date).toLocaleDateString()}</p>
                  <button onClick={() => handleDeleteDiagnostic(selectedPatientId, h.id)}>🗑️ Supprimer</button>
                </div>
              ))}
            </div>
          )}

          {Object.keys(chartData).length > 0 && (
            <div className="evolution-section">
              <h4>📊 Évolution des maladies</h4>
              {Object.keys(chartData).map((disease) => (
                <div key={disease} className="evolution-chart">
                  <h5>{disease}</h5>
                  <Line data={chartData[disease]} />
                </div>
              ))}

              {evolutionSummary.length > 0 && (
                <div className="evolution-summary">
                  <h4>📈 Résumé de l'évolution</h4>
                  {evolutionSummary.map((s, idx) => (
                    <p key={idx}>
                      {s.disease} : {s.status} ({s.change}%)
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <h4>➕ Ajouter un diagnostic</h4>
          <div className="symptom-input">
            <input
              type="text"
              value={symptomesInput}
              placeholder="Rechercher ou ajouter un symptôme"
              onChange={(e) => setSymptomesInput(e.target.value)}
            />
            <button onClick={handleSubmitSymptoms}>Soumettre</button>
          </div>

          {symptomesInput && filteredSymptoms.length > 0 && (
            <div className="suggestions">
              {filteredSymptoms.map((s) => (
                <div key={s.en} className="suggestion-item">
                  <input
                    type="checkbox"
                    checked={symptoms.includes(s.en)}
                    onChange={() => toggleSymptome(s.en)}
                  />
                  <span>{s.fr} ({s.en})</span>
                </div>
              ))}
            </div>
          )}

          <ul className="symptom-list">
            {symptoms.map((s, i) => (
              <li key={i}>
                {s} <button onClick={() => handleSymptomRemove(i)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;
