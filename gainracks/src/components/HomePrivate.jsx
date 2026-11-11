import { useEffect, useState } from 'react';
import './styles/homePrivate.css';

const API_URL = 'http://localhost:3000';

const getWeekStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
};

const getSessionVolume = (session) => (session.exercises || []).reduce((total, exercise) => {
  if (Array.isArray(exercise.sets)) {
    return total + exercise.sets.reduce((exerciseTotal, set) => exerciseTotal + (Number(set.weightKg) || 0) * (Number(set.reps) || 0), 0);
  }
  const setCount = Number(exercise.sets) || 1;
  return total + setCount * (Number(exercise.weightKg) || 0) * (Number(exercise.reps) || 0);
}, 0);

const HomePrivate = ({ onNavigate }) => {
  const [dashboard, setDashboard] = useState({ routines: [], sessions: [] });
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    const headers = { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` };
    Promise.all([
      fetch(`${API_URL}/api/routines`, { headers }).then((response) => response.ok ? response.json() : Promise.reject(new Error('No se pudieron cargar tus rutinas.'))),
      fetch(`${API_URL}/api/history`, { headers }).then((response) => response.ok ? response.json() : Promise.reject(new Error('No se pudo cargar tu historial.')))
    ]).then(([routines, sessions]) => {
      if (active) setDashboard({ routines, sessions });
    }).catch((error) => {
      if (active) setLoadError(error.message);
    });
    return () => { active = false; };
  }, []);

  const weekStart = getWeekStart();
  const weekSessions = dashboard.sessions.filter((session) => new Date(session.completedAt) >= weekStart);
  const weekVolume = weekSessions.reduce((total, session) => total + getSessionVolume(session), 0);
  const recentSessions = dashboard.sessions.slice(0, 4);
  const firstName = localStorage.getItem('userName') || 'atleta';

  return (
    <div className="home-private-container home-dashboard">
      <header className="dashboard-welcome">
        <div><span className="dashboard-kicker">TU ESPACIO DE ENTRENAMIENTO</span><h1>Buen día, {firstName}.</h1><p>El progreso se construye sesión a sesión. Este es tu resumen.</p></div>
        <button className="dashboard-primary" onClick={() => onNavigate('routines')}>Empezar entrenamiento</button>
      </header>

      {loadError && <p className="dashboard-error" role="alert">{loadError}</p>}

      <section className="dashboard-metrics" aria-label="Resumen semanal">
        <article className="dashboard-metric"><span>Sesiones esta semana</span><strong>{weekSessions.length}</strong><small>desde el lunes</small></article>
        <article className="dashboard-metric"><span>Volumen esta semana</span><strong>{Math.round(weekVolume).toLocaleString('es-ES')} <small>kg</small></strong><small>peso × repeticiones</small></article>
        <article className="dashboard-metric"><span>Rutinas guardadas</span><strong>{dashboard.routines.length}</strong><small>listas para entrenar</small></article>
        <article className="dashboard-metric"><span>Sesiones registradas</span><strong>{dashboard.sessions.length}</strong><small>en tu historial</small></article>
      </section>

      <div className="dashboard-lower-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span className="dashboard-kicker">ACTIVIDAD</span><h2>Entrenamientos recientes</h2></div><button className="dashboard-text-button" onClick={() => onNavigate('history')}>Ver estadísticas</button></div>
          {recentSessions.length ? <div className="dashboard-session-list">{recentSessions.map((session) => <article className="dashboard-session" key={session.id}>
            <div className="dashboard-session-date">{new Date(session.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
            <div className="dashboard-session-info"><h3>{session.routineName}</h3><p>{session.exercises.map((exercise) => exercise.name).join(' · ')}</p></div>
            <span className="dashboard-session-volume">{Math.round(getSessionVolume(session)).toLocaleString('es-ES')} kg</span>
          </article>)}</div> : <div className="dashboard-empty"><p>Todavía no registraste entrenamientos.</p><button className="dashboard-text-button" onClick={() => onNavigate('routines')}>Abrir mis rutinas</button></div>}
        </section>

        <section className="dashboard-panel dashboard-quick-links">
          <div><span className="dashboard-kicker">ACCESOS</span><h2>¿Qué vas a entrenar hoy?</h2></div>
          <button onClick={() => onNavigate('routines')}><span>01</span><strong>Mis rutinas</strong><span aria-hidden="true">↗</span></button>
          <button onClick={() => onNavigate('exercises')}><span>02</span><strong>Explorar ejercicios</strong><span aria-hidden="true">↗</span></button>
          <button onClick={() => onNavigate('profile')}><span>03</span><strong>Actualizar mi perfil</strong><span aria-hidden="true">↗</span></button>
        </section>
      </div>
    </div>
  );
};

export default HomePrivate;