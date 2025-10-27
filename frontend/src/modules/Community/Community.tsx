import React, { useState } from 'react';
import { FaUsers, FaComments, FaChalkboardTeacher, FaLightbulb } from 'react-icons/fa';
import './Community.css';

interface SubCommunity {
  name: string;
  description: string;
  members: number;
  joined: boolean;
  icon: JSX.Element;
  active?: boolean;
  new?: boolean;
}

const Community: React.FC = () => {
  const [subCommunities, setSubCommunities] = useState<SubCommunity[]>([
    { name: 'Forum général', description: 'Discussions ouvertes sur la santé et le diagnostic.', members: 124, joined: false, icon: <FaComments />, active: true },
    { name: 'Cas cliniques', description: 'Partage et analyse de cas cliniques.', members: 87, joined: false, icon: <FaUsers /> },
    { name: 'Webinaires & formations', description: 'Sessions en direct et en replay.', members: 56, joined: false, icon: <FaChalkboardTeacher />, new: true },
    { name: 'Conseils pratiques', description: 'Échanges de bonnes pratiques et astuces.', members: 102, joined: false, icon: <FaLightbulb /> },
  ]);

  const toggleJoin = (index: number) => {
    setSubCommunities(prev =>
      prev.map((c, i) =>
        i === index ? { ...c, joined: !c.joined } : c
      )
    );
  };

  return (
    <div className="community">
      <h2>Rejoignez notre Communauté</h2>
      <p>
        Faites partie de la communauté <strong>Diagnosis</strong> et échangez avec d'autres utilisateurs passionnés par la santé et l'analyse des données.
      </p>

      <div className="sub-communities">
        {subCommunities.map((c, i) => (
          <div className="sub-community-card" key={i}>
            <div className="sub-community-icon">{c.icon}</div>
            <div className="sub-community-info">
              <h3>{c.name}</h3>
              {c.active && <span className="badge active">Actif</span>}
              {c.new && <span className="badge new">Nouveau</span>}
              <p>{c.description}</p>
              <span className="members"><FaUsers /> {c.members} membres</span>
            </div>
            <button
              className={c.joined ? 'joined' : 'join'}
              onClick={() => toggleJoin(i)}
            >
              {c.joined ? 'Rejoint ✅' : 'Rejoindre'}
            </button>
          </div>
        ))}
      </div>

      <p className="coming-soon">✨ De nouvelles fonctionnalités communautaires arrivent bientôt !</p>
    </div>
  );
};

export default Community;
