import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePublic from './components/HomePublic';
import HomePrivate from './components/HomePrivate';
import Login from './components/Login';
import Register from './components/Register';
import AccountArea from './components/AccountArea';
import ExercisesPage from './components/ExercisesPage';
import { useState } from 'react';

function App() {
  const [view, setView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('authToken')));
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');

  const handleLogout = () => {
    // Limpiar almacenamiento local y volver a vista pública
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');
    setView('home');
  };

  let content;
  if (view === 'home') {
    content = isLoggedIn ? <HomePrivate onNavigate={setView} /> : <HomePublic />;
  } else if (view === 'register') {
    content = <Register />;
  } else if (view === 'login') {
    content = <Login />;
  } else if (view === 'exercises') {
    content = <ExercisesPage />;
  } else if (['routines', 'history', 'profile', 'admin'].includes(view) && isLoggedIn) {
    content = <AccountArea section={view} />;
  }

  return (
    <div className="layout">
      <Navbar
        onRegisterClick={() => setView('register')}
        onLoginClick={() => setView('login')}
        onHomeClick={() => setView('home')}
          onExercisesClick={() => setView('exercises')}
        onRoutinesClick={() => setView('routines')}
        onHistoryClick={() => setView('history')}
        onProfileClick={() => setView('profile')}
        onAdminClick={() => setView('admin')}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={userName}
      />
      <main className="content">
        {content}
      </main>
      <Footer />
    </div>
  );
}

export default App;
