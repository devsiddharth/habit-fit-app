import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitProvider, useHabits } from './context/HabitContext';
import Sidebar                   from './components/Sidebar';
import AddHabitModal             from './components/AddHabitModal';
import Toast                     from './components/Toast';
import LoginPage                 from './pages/LoginPage';
import SignupPage                from './pages/SignupPage';
import DashboardPage             from './pages/DashboardPage';
import StatisticsPage            from './pages/StatisticsPage';
import InsightsPage              from './pages/InsightsPage';
import ProfilePage               from './pages/ProfilePage';

const MOB_NAV = [
  { id:'dashboard',  icon:'ti-layout-dashboard', label:'Home'     },
  { id:'statistics', icon:'ti-calendar-stats',   label:'Stats'    },
  { id:'insights',   icon:'ti-brain',            label:'Insights' },
  { id:'profile',    icon:'ti-user',             label:'Profile'  },
];

function AppLayout() {
  const { user, loading } = useAuth();
  const [tab,       setTab]       = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [toast,     setToast]     = useState('');

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner gold" style={{ width:32, height:32, borderWidth:3 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  const page = () => {
    switch (tab) {
      case 'dashboard':  return <DashboardPage  onAddHabit={() => setShowModal(true)} />;
      case 'statistics': return <StatisticsPage />;
      case 'insights':   return <InsightsPage   />;
      case 'profile':    return <ProfilePage    />;
      default:           return <DashboardPage  onAddHabit={() => setShowModal(true)} />;
    }
  };

  return (
    <HabitProvider>
      <div className="app-layout">
        <Sidebar active={tab} onChange={setTab} />
        <main className="main-content">{page()}</main>

        {/* Mobile nav */}
        <nav className="mobile-nav">
          <div className="mobile-nav-inner">
            {MOB_NAV.map(({ id, icon, label }) => (
              <div key={id} className={`mob-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <i className={`ti ${icon}`} /><span>{label}</span>
              </div>
            ))}
            <div className="mob-btn" onClick={() => setShowModal(true)} style={{ color:'var(--gold)' }}>
              <i className="ti ti-circle-plus" /><span>Add</span>
            </div>
          </div>
        </nav>

        {showModal && <AddHabitModal onClose={() => setShowModal(false)} onSuccess={setToast} />}
        <Toast message={toast} onClose={() => setToast('')} />
      </div>
    </HabitProvider>
  );
}

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"  element={<AuthGuard><LoginPage  /></AuthGuard>} />
        <Route path="/signup" element={<AuthGuard><SignupPage /></AuthGuard>} />
        <Route path="/*"      element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  );
}
