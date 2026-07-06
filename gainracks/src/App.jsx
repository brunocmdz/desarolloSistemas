import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePublic from './components/HomePublic';
import HomePrivate from './components/HomePrivate';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, []);

  let content;
  if (view === 'home') {
    content = isLoggedIn ? <HomePrivate /> : <HomePublic />;
  } else if (view === 'register') {
    content = <Register />;
  } else if (view === 'login') {
    content = <Login />;
  } else if (view === 'admin') {
    content = <AdminPanel />;
  }

  return (
    <div className="layout">
      <Navbar
        onRegisterClick={() => setView('register')}
        onLoginClick={() => setView('login')}
        onHomeClick={() => setView('home')}
        onAdminClick={() => setView('admin')}
      />
      <main className="content">
        {content}
      </main>
      <Footer />
    </div>
  );
}

export default App;
