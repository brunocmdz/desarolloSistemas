import { useCallback, useEffect, useState } from 'react';
import './styles/accountArea.css';

const API_URL = 'http://localhost:3000';
const emptyExercise = () => ({ name: '', muscle: '', sets: 3, reps: 10, weightKg: '' });

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la solicitud.');
  return data;
}

function AccountArea({ section }) {
  const [profile, setProfile] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [history, setHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [profileData, routineData, historyData] = await Promise.all([
        apiRequest('/api/profile'), apiRequest('/api/routines'), apiRequest('/api/history')
      ]);
      setError('');
      setProfile(profileData);
      setRoutines(routineData);
      setHistory(historyData);
      if (section === 'admin' && localStorage.getItem('isAdmin') === 'true') {
        setDashboard(await apiRequest('/api/admin/dashboard'));
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [section]);

  useEffect(() => {
    const timer = window.setTimeout(() => { refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const updateExercise = (index, key, value) => {
    setExercises((current) => current.map((exercise, exerciseIndex) => exerciseIndex === index
      ? { ...exercise, [key]: value }
      : exercise));
  };

  const saveRoutine = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await apiRequest('/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: routineName,
          description,
          exercises: exercises.map((exercise) => ({
            ...exercise,
            sets: Number(exercise.sets),
            reps: Number(exercise.reps),
            weightKg: exercise.weightKg === '' ? null : Number(exercise.weightKg)
          }))
        })
      });
      setRoutineName('');
      setDescription('');
      setExercises([emptyExercise()]);
      setMessage('Rutina guardada.');
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const logWorkout = async (event, routine) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const formData = new FormData(event.currentTarget);
    try {
      await apiRequest('/api/workouts', {
        method: 'POST',
        body: JSON.stringify({
          routineId: routine.id,
          durationMinutes: Number(formData.get('durationMinutes')),
          notes: formData.get('notes')
        })
      });
      setMessage(`Sesión de ${routine.name} registrada en tu historial.`);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const updatedProfile = await apiRequest('/api/profile', {
        method: 'PUT', body: JSON.stringify(profile)
      });
      setProfile(updatedProfile);
      localStorage.setItem('userName', updatedProfile.firstName);
      setMessage('Perfil actualizado.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const toggleUser = async (user) => {
    setError('');
    try {
      await apiRequest('/api/admin/users/state', {
        method: 'PUT',
        body: JSON.stringify({ id: user.id_usuario, state: !user.state })
      });
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const sectionTitles = {
    routines: 'Mis rutinas', history: 'Historial de entrenamientos',
    profile: 'Mi perfil', admin: 'Panel de control'
  };

  return (
    <div className="account-page">
      <header className="account-heading">
        <div>
          <span className="account-eyebrow">GAINRACKS / CUENTA</span>
          <h1>{sectionTitles[section]}</h1>
        </div>
        <p>{profile ? `${profile.firstName} ${profile.lastName}` : 'Cargando cuenta...'}</p>
      </header>

      {(error || message) && <div className={`account-notice ${error ? 'is-error' : ''}`} role="status">{error || message}</div>}

      {section === 'routines' && <div className="account-columns">
        <section className="account-section routine-editor">
          <div className="section-title-row"><div><span className="account-eyebrow">PLANIFICACIÓN</span><h2>Nueva rutina</h2></div></div>
          <form onSubmit={saveRoutine} className="account-form">
            <label>Nombre de la rutina<input required maxLength="100" value={routineName} onChange={(event) => setRoutineName(event.target.value)} placeholder="Ej. Tren superior A" /></label>
            <label>Descripción<input maxLength="500" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Enfoque o notas" /></label>
            <div className="exercise-builder-heading"><h3>Ejercicios</h3><button type="button" className="text-action" onClick={() => setExercises((current) => [...current, emptyExercise()])}>＋ Añadir ejercicio</button></div>
            {exercises.map((exercise, index) => <fieldset className="exercise-builder" key={index}>
              <legend>Ejercicio {index + 1}</legend>
              <label>Nombre<input required value={exercise.name} onChange={(event) => updateExercise(index, 'name', event.target.value)} placeholder="Press de banca" /></label>
              <label>Grupo muscular<input value={exercise.muscle} onChange={(event) => updateExercise(index, 'muscle', event.target.value)} placeholder="Pecho" /></label>
              <div className="exercise-numbers">
                <label>Series<input type="number" min="1" max="30" required value={exercise.sets} onChange={(event) => updateExercise(index, 'sets', event.target.value)} /></label>
                <label>Reps<input type="number" min="1" max="100" required value={exercise.reps} onChange={(event) => updateExercise(index, 'reps', event.target.value)} /></label>
                <label>Kg<input type="number" min="0" max="1000" step="0.5" value={exercise.weightKg} onChange={(event) => updateExercise(index, 'weightKg', event.target.value)} placeholder="--" /></label>
              </div>
              {exercises.length > 1 && <button type="button" className="remove-exercise" onClick={() => setExercises((current) => current.filter((_, exerciseIndex) => exerciseIndex !== index))}>Quitar ejercicio</button>}
            </fieldset>)}
            <button type="submit" className="primary-action" disabled={saving}>{saving ? 'Guardando...' : 'Guardar rutina'}</button>
          </form>
        </section>

        <section className="account-section">
          <div className="section-title-row"><div><span className="account-eyebrow">TU BIBLIOTECA</span><h2>Rutinas guardadas <span className="count-badge">{routines.length}</span></h2></div></div>
          {routines.length ? <div className="routine-list">{routines.map((routine) => <article className="routine-entry" key={routine.id}>
            <div className="routine-entry-top"><div><h3>{routine.name}</h3><p>{routine.description || 'Sin descripción'}</p></div></div>
            <ul>{routine.exercises.map((exercise, index) => <li key={`${routine.id}-${index}`}><span>{exercise.name}</span><span>{exercise.sets} × {exercise.reps}{exercise.weightKg ? ` · ${exercise.weightKg} kg` : ''}</span></li>)}</ul>
            <form className="workout-log-form" onSubmit={(event) => logWorkout(event, routine)}>
              <label>Duración (min)<input required name="durationMinutes" type="number" min="1" max="1440" placeholder="Ej. 50" /></label>
              <label>Notas<input name="notes" maxLength="500" placeholder="Opcional" /></label>
              <button type="submit" className="primary-action compact-action">Registrar sesión</button>
            </form>
          </article>)}</div> : <p className="empty-state">Todavía no tienes rutinas. Crea la primera aquí.</p>}
        </section>
      </div>}

      {section === 'history' && <section className="account-section history-section">
        <div className="section-title-row"><div><span className="account-eyebrow">ACTIVIDAD</span><h2>Sesiones completadas</h2></div><span className="count-badge">{history.length}</span></div>
        {history.length ? <div className="history-list">{history.map((session) => <article className="history-entry" key={session.id}>
          <div className="history-date"><strong>{new Date(session.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</strong><span>{new Date(session.completedAt).toLocaleDateString('es-ES', { year: 'numeric' })}</span></div>
          <div className="history-details"><h3>{session.routineName}</h3><p>{session.exercises.map((exercise) => exercise.name).join(' · ')}</p></div>
          <div className="history-duration">{session.durationMinutes ? `${session.durationMinutes} min` : 'Sesión'}<small>{session.exercises.length} ejercicios</small></div>
        </article>)}</div> : <p className="empty-state">Aún no hay sesiones. Registra una desde tus rutinas.</p>}
      </section>}

      {section === 'profile' && profile && <section className="account-section profile-section">
        <div className="section-title-row"><div><span className="account-eyebrow">DATOS PERSONALES</span><h2>Tu información</h2></div></div>
        <form className="account-form profile-form" onSubmit={saveProfile}>
          <label>Nombre<input required value={profile.firstName || ''} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} /></label>
          <label>Apellido<input required value={profile.lastName || ''} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} /></label>
          <label>Correo electrónico<input value={profile.email || ''} disabled /></label>
          <label>Peso (kg)<input type="number" min="1" max="500" step="0.1" value={profile.weightKg || ''} onChange={(event) => setProfile({ ...profile, weightKg: event.target.value })} placeholder="Por ejemplo, 72.5" /></label>
          <label>Altura (cm)<input type="number" min="50" max="300" step="0.5" value={profile.heightCm || ''} onChange={(event) => setProfile({ ...profile, heightCm: event.target.value })} placeholder="Por ejemplo, 175" /></label>
          <label className="profile-goal">Objetivo<input maxLength="120" value={profile.goal || ''} onChange={(event) => setProfile({ ...profile, goal: event.target.value })} placeholder="Ej. Ganar fuerza" /></label>
          <button type="submit" className="primary-action">Guardar cambios</button>
        </form>
      </section>}

      {section === 'admin' && <>
        {!profile?.isAdmin && <div className="account-notice is-error">Esta cuenta no tiene permisos de administrador.</div>}
        {dashboard && profile?.isAdmin && <>
          <div className="admin-stats">{[
            ['Usuarios', dashboard.stats.users], ['Rutinas', dashboard.stats.routines], ['Sesiones', dashboard.stats.sessions]
          ].map(([label, value]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <section className="account-section admin-users"><div className="section-title-row"><div><span className="account-eyebrow">GESTIÓN</span><h2>Usuarios</h2></div></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>
              {dashboard.users.map((user) => <tr key={user.id_usuario}><td>{user.firstName} {user.lastName}</td><td>{user.email}</td><td>{user.isAdmin ? 'Admin' : 'Miembro'}</td><td><span className={`user-state ${user.state ? 'active' : 'inactive'}`}>{user.state ? 'Activo' : 'Inactivo'}</span></td><td><button className="text-action" disabled={user.isAdmin || user.id_usuario === profile.id_usuario} onClick={() => toggleUser(user)}>{user.state ? 'Desactivar' : 'Activar'}</button></td></tr>)}
            </tbody></table></div>
          </section>
          <section className="account-section"><div className="section-title-row"><div><span className="account-eyebrow">REGISTRO RECIENTE</span><h2>Últimas sesiones</h2></div></div>
            {dashboard.recentSessions.length ? <div className="history-list">{dashboard.recentSessions.map((session) => <article className="history-entry" key={session.id}><div className="history-date"><strong>{new Date(session.completedAt).toLocaleDateString('es-ES')}</strong></div><div className="history-details"><h3>{session.routineName}</h3><p>{session.owner?.firstName} {session.owner?.lastName} · {session.owner?.email}</p></div></article>)}</div> : <p className="empty-state">Aún no hay sesiones registradas.</p>}
          </section>
        </>}
      </>}
    </div>
  );
}

export default AccountArea;