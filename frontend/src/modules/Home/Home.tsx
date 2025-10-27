// src/modules/Home/Home.tsx
import React, { useState, useEffect } from "react";
import { FaStethoscope, FaChartLine, FaSearch } from "react-icons/fa";
import "./Home.css";

interface Feature {
  id: number;
  category: "Diagnostic" | "Analyse" | "Recherche";
  icon: JSX.Element;
  title: string;
  description: string;
}

const allFeatures: Feature[] = [
  { id: 1, category: "Diagnostic", icon: <FaStethoscope />, title: "Ajouter Diagnostic", description: "Ajoutez un diagnostic pour un patient et enregistrez-le." },
  { id: 2, category: "Analyse", icon: <FaChartLine />, title: "Visualiser Scores", description: "Suivez l'évolution des scores de gravité et des symptômes." },
  { id: 3, category: "Recherche", icon: <FaSearch />, title: "Rechercher Patient", description: "Trouvez un patient par nom, symptôme ou date." },
  { id: 4, category: "Diagnostic", icon: <FaStethoscope />, title: "Historique Patient", description: "Consultez l’historique détaillé de chaque patient avec toutes les informations." },
  { id: 5, category: "Analyse", icon: <FaChartLine />, title: "Statistiques Avancées", description: "Analysez les tendances et générez des graphiques dynamiques." },
  { id: 6, category: "Recherche", icon: <FaSearch />, title: "Filtres Avancés", description: "Recherchez rapidement grâce à des filtres intelligents et précis." },
  { id: 7, category: "Analyse", icon: <FaChartLine />, title: "Courbes Dynamiques", description: "Visualisez les courbes de gravité avec animations interactives." },
  { id: 8, category: "Diagnostic", icon: <FaStethoscope />, title: "Scanner IA", description: "Analysez les images des patients avec intelligence artificielle pour un diagnostic rapide." },
];

const categories = ["Tout", "Diagnostic", "Analyse", "Recherche"];

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [visibleFeatures, setVisibleFeatures] = useState<Feature[]>([]);
  const [count, setCount] = useState(4);

  // Filtrage et nombre de cartes visibles
  useEffect(() => {
    const filtered = selectedCategory === "Tout"
      ? allFeatures
      : allFeatures.filter((f) => f.category === selectedCategory);
    setVisibleFeatures(filtered.slice(0, count));
  }, [selectedCategory, count]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
        setCount((prev) => Math.min(prev + 2, allFeatures.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home">
      <header className="home-header">
        <h1>Bienvenue dans <span>Diagnosis</span></h1>
        <p>Gérez les diagnostics, analysez les données et explorez toutes les fonctionnalités.</p>
      </header>

      <div className="home-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="home-masonry">
        {visibleFeatures.map((feature, index) => (
          <div key={feature.id} className="home-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="home-card-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <button>Accéder</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
