import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import HeaderLogo from '@/components/HeaderLogo';
import Loading from '@/components/Loading';
import Home from '@/modules/Home/Home';
import DiagnosticForm from '@/modules/Diagnostic/DiagnosticForm';
import DiagnosticHistory from '@/modules/Diagnostic/DiagnosticHistory';
import Scanner from '@/modules/Diagnostic/Scanner';
import Search from '@/modules/Search/Search';
import Analysis from '@/modules/Analysis/Analysis';
import Statistics from '@/modules/Analysis/Statistics';
import Community from '@/modules/Community/Community';
import Help from '@/modules/Help/Help';
import Settings from '@/modules/Settings/Settings';
import axios from 'axios';
import './App.css';
import { SubView } from '@/types';
import {
  Stethoscope,
  History,
  ScanLine,
  BarChart,
  PieChart,
  Search as SearchIcon,
  Users,
  HelpCircle,
  Settings as Cog,
} from 'lucide-react';

interface Module {
  title: string;
  icon: React.ReactNode;
  id: string;
  content: React.ReactNode;
  onClick?: () => void;
}

const App: React.FC = () => {
  const [view, setView] = useState<
    'home' | 'diagnostic' | 'analysis' | 'search' | 'community' | 'help' | 'settings' | 'login'
  >('login');
  const [subView, setSubView] = useState<SubView | ''>('');
  const [activeModule, setActiveModule] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!subView) return;
    const map: { [key in SubView]?: string } = {
      add: 'diagnostic-add',
      history: 'diagnostic-history',
      scanner: 'diagnostic-scanner',
      graph: 'analysis-graph',
      stats: 'analysis-stats',
      name: 'search-name',
      symptome: 'search-symptome',
      date: 'search-date',
      diagnostic: 'search-diagnostic',
    };
    setActiveModule(map[subView] || '');
    setIsSidebarOpen(false);
    console.log('subView changed:', subView, 'isSidebarOpen:', isSidebarOpen);
  }, [subView]);

  useEffect(() => {
    setIsSidebarOpen(false);
    console.log('view changed:', view, 'isSidebarOpen:', isSidebarOpen);
  }, [view]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { username, password });
      setToken(response.data.access);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setView('home');
      setLoginError(null);
    } catch (err) {
      setLoginError('Échec de la connexion. Vérifiez vos identifiants.');
      console.error(err);
    }
  };

  const modules: { [key in 'diagnostic' | 'analysis' | 'search' | 'community' | 'help' | 'settings']: Module[] } = {
    diagnostic: [
      {
        title: 'Ajouter Diagnostic',
        icon: <Stethoscope />,
        id: 'diagnostic-add',
        content: token && <DiagnosticForm token={token} />,
      },
      {
        title: 'Historique',
        icon: <History />,
        id: 'diagnostic-history',
        content: token && <DiagnosticHistory token={token} />,
      },
      {
        title: 'Scanner',
        icon: <ScanLine />,
        id: 'diagnostic-scanner',
        content: <Scanner />,
      },
      {
        title: 'Contrôle & Recherche',
        icon: <SearchIcon />,
        id: 'search',
        onClick: () => setView('search'),
        content: <p>Cliquez pour aller à la recherche complète.</p>,
      },
    ],
    analysis: [
      {
        title: 'Graphiques',
        icon: <BarChart />,
        id: 'analysis-graph',
        content: <Analysis token={token} />,
      },
      {
        title: 'Statistiques',
        icon: <PieChart />,
        id: 'analysis-stats',
        content: <Statistics token={token} />,
      },
    ],
    search: [
      {
        title: `Recherche par ${subView ? { name: 'Nom', symptome: 'Symptôme', date: 'Date', diagnostic: 'Diagnostic' }[subView as 'name' | 'symptome' | 'date' | 'diagnostic'] || 'Nom' : 'Nom'}`,
        icon: <SearchIcon />,
        id: 'search',
        content: token && <Search subView={subView as 'name' | 'symptome' | 'date' | 'diagnostic' | ''} token={token} />,
      },
    ],
    community: [
      {
        title: 'Communauté',
        icon: <Users />,
        id: 'community',
        content: <Community />,
      },
    ],
    help: [
      {
        title: 'Aide',
        icon: <HelpCircle />,
        id: 'help',
        content: <Help />,
      },
    ],
    settings: [
      {
        title: 'Paramètres',
        icon: <Cog />,
        id: 'settings',
        content: <Settings theme={theme} setTheme={setTheme} token={token} />,
      },
    ],
  };

  const renderModules = () => {
    if (view === 'home') {
      return <Home />;
    }

    if (view === 'login') {
      return (
        <div className="login">
          <h2>Connexion</h2>
          <div className="login-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
            />
            <button onClick={handleLogin}>Se connecter</button>
            {loginError && <p className="error">{loginError}</p>}
          </div>
        </div>
      );
    }

    const currentModules = modules[view] || [];

    return (
      <div className="module-container">
        <div className="tabs-bar">
          {currentModules.map((mod) => (
            <div
              key={mod.id}
              className={`module-header ${activeModule === mod.id ? 'active' : ''}`}
              onClick={() => (mod.onClick ? mod.onClick() : setActiveModule(mod.id))}
            >
              <div className={`module-icon ${activeModule === mod.id ? 'active' : ''}`}>
                {mod.icon}
              </div>
              <div className="module-title">{mod.title}</div>
            </div>
          ))}
        </div>
        <div className="content-area">
          {activeModule && currentModules.find((mod) => mod.id === activeModule)?.content}
        </div>
      </div>
    );
  };

  return (
    <div className={`app ${theme}`}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <HeaderLogo />
          <button
            className="burger-button"
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              console.log('Burger clicked, isSidebarOpen:', !isSidebarOpen);
            }}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <Navbar setView={setView} />
          <div className="main-container">
            {view !== 'login' && (
              <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar view={view} setSubView={setSubView} activeSubView={subView} />
              </aside>
            )}
            <main className={`content ${view === 'login' ? 'full-width' : ''}`}>
              <div className="content-box">{renderModules()}</div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;