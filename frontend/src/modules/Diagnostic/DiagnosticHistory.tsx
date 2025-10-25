// src/modules/Diagnostic/DiagnosticHistory.tsx
import React, { useEffect, useState } from 'react';
import { getDiagnostics, } from '@/services/api';
import { Diagnostic } from '@/types';
import './DiagnosticHistory.css';

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
        // Mapper les valeurs manquantes et convertir symptomes en tableau si nécessaire
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
        <ul>
          {diagnostics.map((diag) => (
            <li key={diag.id}>
              <strong>{diag.patientName}</strong> -{' '}
              {diag.date ? new Date(diag.date).toLocaleDateString() : 'Date inconnue'} :<br />
              Symptômes : {diag.symptomes.length > 0 ? diag.symptomes.join(', ') : 'Aucun'}<br />
              Diagnostic : {diag.diagnostic}<br />
              Score de sévérité : {diag.severityScore.toFixed(2)}%
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun diagnostic trouvé.</p>
      )}
    </div>
  );
};

export default DiagnosticHistory;
