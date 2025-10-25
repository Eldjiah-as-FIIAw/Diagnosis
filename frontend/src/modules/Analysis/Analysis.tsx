import React, { useState, useEffect } from 'react';
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
  ChartData,
  ChartOptions,
  Filler,
} from 'chart.js';
import { rungeKutta, RKResult } from '@/utils/rungeKutta';
import { getDiagnosticStats } from '@/utils/data';
import { movingAverage } from '@/utils/movingAverage';
import { DiagnosticStats } from '@/types';
import './Analysis.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface AnalysisProps {
  token: string | null;
}

const Analysis: React.FC<AnalysisProps> = ({ token }) => {
  const [rkResult, setRkResult] = useState<RKResult>({ time: [], severity: [] });
  const [stats, setStats] = useState<DiagnosticStats[]>([]);
  const [initialSeverity, setInitialSeverity] = useState<number>(10);
  const [windowSize, setWindowSize] = useState<number>(3); // Taille de la moyenne glissante

  // Charger les données du backend
  useEffect(() => {
    const fetchStats = async () => {
      if (token) {
        const data = await getDiagnosticStats(token);
        setStats(data);
      }
    };
    fetchStats();
  }, [token]);

  // Calculer les données Runge-Kutta (simulation)
  useEffect(() => {
    const rkData = rungeKutta(initialSeverity, 0.1, 100, 10, 0.1);
    setRkResult(rkData);
  }, [initialSeverity]);

  // Données observées (backend)
  const observedLabels = stats.map((s) => s.disease);
  const observedData = stats.map((s) => s.averageSeverity ?? 0);
  // Calculer la moyenne glissante
  const smoothedData = movingAverage(observedData, windowSize);

  // Données du graphique
  const chartData: ChartData<'line'> = {
    labels: rkResult.time.length > 0 ? rkResult.time.map((t) => t.toFixed(1)) : observedLabels,
    datasets: [
      {
        label: 'Simulation (Runge-Kutta)',
        data: rkResult.severity,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Gravité observée (backend)',
        data: observedData,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: `Moyenne glissante (${windowSize})`,
        data: smoothedData,
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        fill: false,
        tension: 0.3,
        borderDash: [5, 5], // Ligne pointillée
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Évolution / maladies' },
      },
      y: {
        title: { display: true, text: 'Gravité (%)' },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="analysis">
      <h2>Analyse et Tendance des Diagnostics</h2>

      <div className="form-group">
        <label>Gravité initiale (simulation)</label>
        <input
          type="number"
          value={initialSeverity}
          onChange={(e) => setInitialSeverity(parseFloat(e.target.value))}
          min="0"
          max="100"
        />
      </div>

      <div className="form-group">
        <label>Taille de la moyenne glissante</label>
        <input
          type="number"
          value={windowSize}
          onChange={(e) => setWindowSize(parseInt(e.target.value))}
          min="2"
          max="10"
        />
      </div>

      <Line data={chartData} options={chartOptions} />

      {stats.length > 0 && (
        <div className="real-stats">
          <h3>Données réelles du backend :</h3>
          <ul>
            {stats.map((s, i) => (
              <li key={i}>
                <strong>{s.disease}</strong> — {s.count} cas — Gravité moyenne :{' '}
                {(s.averageSeverity ?? 0).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analysis;
