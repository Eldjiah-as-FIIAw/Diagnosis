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
import ModuleBox from '@/components/ModuleBox';
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

  // 🟢 Gestion du menu burger
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
    };
    setActiveModule(map[subView] || '');
  }, [subView]);

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

  const renderModules = () => {
    switch (view) {
      case 'diagnostic':
        return (
          <div className="module-container">
            <ModuleBox
              title="Ajouter Diagnostic"
              icon={<Stethoscope />}
              isActive={activeModule === 'diagnostic-add'}
              onClick={() => setActiveModule('diagnostic-add')}
            >
              {token && <DiagnosticForm token={token} />}
            </ModuleBox>

            <ModuleBox
              title="Historique"
              icon={<History />}
              isActive={activeModule === 'diagnostic-history'}
              onClick={() => setActiveModule('diagnostic-history')}
            >
              {token && <DiagnosticHistory token={token} />}
            </ModuleBox>

            <ModuleBox
              title="Scanner"
              icon={<ScanLine />}
              isActive={activeModule === 'diagnostic-scanner'}
              onClick={() => setActiveModule('diagnostic-scanner')}
            >
              <Scanner />
            </ModuleBox>

            <ModuleBox
              title="Contrôle & Recherche"
              icon={<SearchIcon />}
              isActive={false}
              onClick={() => setView('search')}
            >
              <p>Cliquez pour aller à la recherche complète.</p>
            </ModuleBox>
          </div>
        );

      case 'analysis':
        return (
          <div className="module-container">
            <ModuleBox
              title="Graphiques"
              icon={<BarChart />}
              isActive={activeModule === 'analysis-graph'}
              onClick={() => setActiveModule('analysis-graph')}
            >
              <Analysis token={token} />
            </ModuleBox>

            <ModuleBox
              title="Statistiques"
              icon={<PieChart />}
              isActive={activeModule === 'analysis-stats'}
              onClick={() => setActiveModule('analysis-stats')}
            >
              <Statistics token={token} />
            </ModuleBox>
          </div>
        );

      case 'search':
        const searchLabelMap: { [key in SubView]?: string } = {
          name: 'Nom',
          symptome: 'Symptôme',
          date: 'Date',
        };
        const searchLabel = subView ? searchLabelMap[subView] || 'Nom' : 'Nom';

        return (
          <ModuleBox title={`Recherche par ${searchLabel}`} icon={<SearchIcon />} isActive={true}>
            {token && <Search subView={subView as any} token={token} />}
          </ModuleBox>
        );

      case 'community':
        return (
          <ModuleBox title="Communauté" icon={<Users />} isActive={true}>
            <Community />
          </ModuleBox>
        );

      case 'help':
        return (
          <ModuleBox title="Aide" icon={<HelpCircle />} isActive={true}>
            <Help />
          </ModuleBox>
        );

      case 'settings':
        return (
          <ModuleBox title="Paramètres" icon={<Cog />} isActive={true}>
            <Settings theme={theme} setTheme={setTheme} token={token} />
          </ModuleBox>
        );

      default:
        return <Home />;
    }
  };

  return (
    <div className={`app ${theme}`}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <HeaderLogo />

          {/* 🟢 Bouton burger */}
          <button className="burger-button" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <Navbar setView={setView} />

          <div className="main-container">
            {view !== 'login' && (
              <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar view={view} setSubView={setSubView} />
              </aside>
            )}

            <main className={`content ${view === 'login' ? 'full-width' : ''}`}>
              <div className="content-box">
                {view === 'login' ? (
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
                ) : (
                  renderModules()
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
