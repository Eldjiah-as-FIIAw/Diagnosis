// //Diagnosis/frontend/src/components/ChartchartComponent.tsx
// import React from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// import type { RKResult } from '@/utils/rungeKutta';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// interface ChartComponentProps {
//   data: RKResult | { times: string[]; values: number[] };
//   title: string;
// }

// const ChartComponent: React.FC<ChartComponentProps> = ({ data, title }) => {
//   const chartData = {
//     labels: data.times.map(String), // Convertir number[] en string[]
//     datasets: [
//       {
//         label: title,
//         data: data.values,
//         borderColor: '#007bff',
//         backgroundColor: 'rgba(0, 123, 255, 0.1)',
//         fill: true,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Score de gravité',
//         },
//       },
//       x: {
//         title: {
//           display: true,
//           text: 'Temps (jours)',
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: title,
//       },
//     },
//   };

//   return <Line data={chartData} options={options} />;
// };

// export default ChartComponent;