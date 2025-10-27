// src/modules/Diagnostic/DiagnosticHistory.tsx
import React, { useEffect, useState } from 'react';
import { getDiagnostics } from '@/services/api';
import { Diagnostic } from '@/types';
import './DiagnosticHistory.css';
import { FaUser, FaHeartbeat } from 'react-icons/fa';

interface DiagnosticHistoryProps {
  token: string;
}

const DiagnosticHistory: React.FC<DiagnosticHistoryProps> = ({ token }) => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDiagnostics(token);
        const mapped: Diagnostic[] = data.map((d: any) => ({
          id: d.id,
          patientId: d.patient?.id ?? 0,
          patientName: d.patient?.full_name || 'Inconnu',
          age: d.patient?.age ?? 0,
          symptomes: Array.isArray(d.symptomes) ? d.symptomes : [],
          diagnostic: d.disease || 'N/A',
          severityScore: d.probability != null ? d.probability * 100 : 0,
          disease: d.disease,
          probability: d.probability,
          date: d.date || new Date().toISOString(),
        }));

        setDiagnostics(mapped);
      } catch (err: any) {
        console.error('Erreur récupération diagnostics :', err);
        setError(err.message || 'Impossible de récupérer l’historique des diagnostics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, [token]);

  if (loading) return <p>Chargement de l'historique...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="diagnostic-history">
      <h3>Historique des Diagnostics</h3>
      {diagnostics.length > 0 ? (
        <div className="diagnostic-cards">
          {diagnostics.map((diag) => (
            <div key={diag.id} className="diagnostic-card">
              <div className="card-header">
                <FaUser /> <span>{diag.patientName}</span>
                <span className="age">{diag.age} ans</span>
              </div>
              <div className="card-body">
                <div className="symptomes">
                  {diag.symptomes.length > 0 ? diag.symptomes.map((s, i) => (
                    <span key={i} className="symptome-tag">{s}</span>
                  )) : <span className="no-symptome">Aucun symptôme</span>}
                </div>
                <div className="diagnostic-info">
                  <FaHeartbeat /> <span>{diag.diagnostic}</span>
                  <span className="date">{new Date(diag.date).toLocaleDateString()}</span>
                </div>
                <div className="probability-badge">
                  {diag.severityScore.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun diagnostic trouvé.</p>
      )}
    </div>
  );
};

export default DiagnosticHistory;
