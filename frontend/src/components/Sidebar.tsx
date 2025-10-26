import React from 'react';
import { SubView } from '@/types';
import './Sidebar.css';

interface SidebarProps {
  view: 'home' | 'diagnostic' | 'analysis' | 'search' | 'community' | 'help' | 'settings';
  setSubView: (subView: SubView) => void;
  activeSubView?: SubView | '';
}

interface MenuItem {
  label: string;
  value: SubView;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setSubView, activeSubView }) => {
  const getMenuItems = (): MenuItem[] => {
    console.log('Sidebar view:', view); // Log pour vérifier la vue
    switch (view) {
      case 'diagnostic':
        return [
          { label: 'Historique des diagnostics', value: 'history' },
          { label: 'Ajouter un diagnostic', value: 'add' },
          { label: 'Scanner (caméra)', value: 'scanner' },
          { label: 'Contrôle & Recherche', value: 'name' },
        ];
      case 'analysis':
        return [
          { label: "Graphique d'évolution", value: 'graph' },
          { label: 'Statistiques', value: 'stats' },
        ];
      case 'search':
        return [
          { label: 'Recherche par nom', value: 'name' },
          { label: 'Recherche par Diagnostic', value: 'diagnostic' },
          { label: 'Recherche par date', value: 'date' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  console.log('Sidebar menuItems:', menuItems); // Log pour vérifier les éléments

  return (
    <div className="sidebar">
      {menuItems.length > 0 ? (
        <ul>
          {menuItems.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => {
                  setSubView(item.value);
                  console.log('Menu item clicked:', item.value); // Log pour vérifier les clics
                }}
                className={activeSubView === item.value ? 'active' : ''}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="sidebar-empty">Aucun menu disponible pour cette vue.</p>
      )}
    </div>
  );
};

export default Sidebar;