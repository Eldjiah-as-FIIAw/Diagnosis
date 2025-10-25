import React from 'react';
import { Stethoscope, User, ClipboardList } from 'lucide-react';
import ModuleBox from '../../components/ModuleBox';

function Dashboard() {
  const [active, setActive] = React.useState('diagnostic');

  return (
    <div className={`module-container ${active ? 'active-shift' : ''}`}>
      <ModuleBox
        title="Diagnostic"
        icon={<Stethoscope />}
        isActive={active === 'diagnostic'}
        onClick={() => setActive('diagnostic')}
      >
        <p>Contenu du diagnostic ici...</p>
      </ModuleBox>

      <ModuleBox
        title="Patients"
        icon={<User />}
        isActive={active === 'patients'}
        onClick={() => setActive('patients')}
      >
        <p>Liste des patients, statistiques, etc.</p>
      </ModuleBox>

      <ModuleBox
        title="Rapports"
        icon={<ClipboardList />}
        isActive={active === 'rapports'}
        onClick={() => setActive('rapports')}
      >
        <p>Analyse des rapports médicaux...</p>
      </ModuleBox>
    </div>
  );
}

export default Dashboard;
