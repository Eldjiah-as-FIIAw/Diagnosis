import React, { useState, useEffect } from 'react';
import { getDiagnosticStats } from '@/utils/data';
import { DiagnosticStats } from '@/types';
import './Statistics.css';
interface StatisticsProps {
  token: string | null;
}

const Statistics: React.FC<StatisticsProps> = ({ token }) => {
  const [stats, setStats] = useState<DiagnosticStats[]>([]);
  const [filterDisease, setFilterDisease] = useState<string>('');
  const [filterSex, setFilterSex] = useState<'male' | 'female' | ''>('');
  const [filterAge, setFilterAge] = useState<number | ''>('');

  useEffect(() => {
    const fetchStats = async () => {
      if (token) {
        const data = await getDiagnosticStats(token);
        setStats(data);
      }
    };
    fetchStats();
  }, [token]);

  // Filtrage et tri décroissant
  const filteredStats = stats
    .filter(stat => (filterDisease ? stat.disease.toLowerCase().includes(filterDisease.toLowerCase()) : true))
    .filter(stat => (filterSex ? stat.sex?.toLowerCase() === filterSex.toLowerCase() : true))
    .filter(stat => (filterAge ? stat.age === Number(filterAge) : true))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="statistics">
      <h3>Statistiques des Diagnostics</h3>

      <div className="filters">
        <input
          type="text"
          placeholder="Filtrer par maladie"
          value={filterDisease}
          onChange={(e) => setFilterDisease(e.target.value)}
        />
        <select value={filterSex} onChange={(e) => setFilterSex(e.target.value as any)}>
          <option value="">Tous sexes</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
        </select>
        <input
          type="number"
          placeholder="Filtrer par âge"
          value={filterAge}
          onChange={(e) => setFilterAge(e.target.value ? parseInt(e.target.value) : '')}
        />
      </div>

      <div className="stats-table">
        {filteredStats.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Maladie</th>
                <th>Sexe</th>
                <th>Âge</th>
                <th>Cas</th>
                <th>Score moyen</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat, index) => (
                <tr key={index}>
                  <td>{stat.disease || 'Inconnu'}</td>
                  <td>
                    {stat.sex === 'male'
                      ? 'Homme'
                      : stat.sex === 'female'
                      ? 'Femme'
                      : 'Non précisé'}
                  </td>
                  <td>{stat.age ?? 'Non défini'}</td>
                  <td>{stat.count}</td>
                  <td>
                    {stat.averageSeverity !== undefined
                      ? `${stat.averageSeverity.toFixed(2)}%`
                      : 'Non disponible'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune statistique disponible.</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;
