import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import './styles/accountArea.css';

const ProgressChart = lazy(() => import('./ProgressChart'));

const API_URL = 'http://localhost:3000';
const MUSCLE_LABELS = {
  pecho: 'Pecho', espalda: 'Espalda', hombros: 'Hombros', abdominales: 'Abdominales',
  biceps: 'Bíceps', triceps: 'Tríceps', cuadriceps: 'Cuádriceps',
  isquiotibiales: 'Isquiotibiales', gluteo: 'Glúteos', pantorrilla: 'Pantorrillas', cardio: 'Cardio'
};
const emptyExercise = () => ({ exerciseId: '', setsCount: 3, targetReps: 10, targetWeightKg: '' });
const comparableName = (name) => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const sameExerciseName = (firstName, secondName) => {
  const first = comparableName(firstName);
  const second = comparableName(secondName);
  return first === second || first.startsWith(`${second} `) || second.startsWith(`${first} `);
};
const formatSessionExercise = (exercise) => {
  const performance = Array.isArray(exercise.sets)
    ? exercise.sets.map((set) => `${set.reps ?? set.targetReps} reps${set.weightKg != null ? ` @ ${set.weightKg} kg` : ''}`).join(', ')
    : `${exercise.sets ?? '?'} × ${exercise.reps ?? '?'} reps`;
  return `${exercise.name}: ${performance}`;
};
const ROUTINE_PRESETS = [
  { id: 'ppl-push', group: 'PPL', name: 'Empuje', description: 'Pecho, hombros y tríceps.', exercises: [['ex-1', 4, 8], ['ex-2', 3, 10], ['ex-29', 3, 8], ['ex-8', 3, 12], ['ex-13', 3, 12], ['ex-46', 3, 12]] },
  { id: 'ppl-pull', group: 'PPL', name: 'Tirón', description: 'Espalda y bíceps.', exercises: [['ex-4', 4, 8], ['ex-5', 4, 8], ['ex-6', 3, 10], ['ex-41', 3, 15], ['ex-11', 3, 10], ['ex-12', 3, 12]] },
  { id: 'ppl-legs', group: 'PPL', name: 'Piernas', description: 'Cuádriceps, isquiotibiales y pantorrillas.', exercises: [['ex-15', 4, 8], ['ex-17', 3, 10], ['ex-16', 3, 10], ['ex-50', 3, 12], ['ex-48', 3, 12], ['ex-19', 4, 12], ['ex-9', 3, 12]] },
  { id: 'upper', group: 'Upper / Lower', name: 'Upper', description: 'Tren superior completo.', exercises: [['ex-1', 4, 8], ['ex-5', 4, 8], ['ex-29', 3, 8], ['ex-6', 3, 10], ['ex-2', 3, 10], ['ex-11', 3, 10], ['ex-13', 3, 12]] },
  { id: 'lower', group: 'Upper / Lower', name: 'Lower', description: 'Tren inferior completo.', exercises: [['ex-15', 4, 8], ['ex-17', 4, 8], ['ex-16', 3, 10], ['ex-50', 3, 12], ['ex-52', 3, 12], ['ex-54', 4, 12]] },
  { id: 'full-body', group: 'Full Body', name: 'Full Body', description: 'Una sesión equilibrada de cuerpo completo.', exercises: [['ex-15', 3, 8], ['ex-1', 3, 8], ['ex-5', 3, 10], ['ex-17', 3, 10], ['ex-29', 3, 8], ['ex-9', 3, 12]] }
];

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

function AccountArea({ section, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [history, setHistory] = useState([]);
  const [exerciseCatalog, setExerciseCatalog] = useState([]);
  const [selectedStatExercise, setSelectedStatExercise] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [dashboard, setDashboard] = useState(null);
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [profileData, routineData, historyData, catalogData] = await Promise.all([
        apiRequest('/api/profile'), apiRequest('/api/routines'), apiRequest('/api/history'), apiRequest('/api/exercises')
      ]);
      setError('');
      setProfile(profileData);
      setRoutines(routineData.map((routine) => ({
        ...routine,
        exercises: Array.isArray(routine.exercises) ? routine.exercises : []
      })));
      setHistory(historyData);
      setExerciseCatalog(catalogData);
      setSelectedStatExercise((current) => {
        const hasHistory = (exercise) => historyData.some((session) => session.exercises?.some((recorded) =>
          recorded.exerciseId === exercise.id || sameExerciseName(recorded.name, exercise.name)
        ));
        const currentExercise = catalogData.find((exercise) => exercise.id === current);
        if (currentExercise && hasHistory(currentExercise)) return current;
        return catalogData.find(hasHistory)?.id || current || catalogData[0]?.id || '';
      });
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

  const loadRoutinePreset = (presetId) => {
    setSelectedPreset('');
    const preset = ROUTINE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setRoutineName(preset.name);
    setDescription(preset.description);
    setExercises(preset.exercises.map(([exerciseId, setsCount, targetReps]) => ({
      exerciseId,
      setsCount,
      targetReps,
      targetWeightKg: ''
    })));
    setMessage(`Plantilla ${preset.name} cargada. Puedes editarla antes de guardar.`);
    setError('');
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
            exerciseId: exercise.exerciseId,
            setsCount: Number(exercise.setsCount),
            targetReps: Number(exercise.targetReps),
            targetWeightKg: exercise.targetWeightKg === '' ? null : Number(exercise.targetWeightKg)
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

  const startWorkout = (routine) => {
    setActiveRoutineId(routine.id);
    setWorkoutExercises(routine.exercises.map((exercise) => {
      const previousSession = history.find((session) => session.exercises?.some((performed) =>
        performed.exerciseId === exercise.exerciseId || sameExerciseName(performed.name, exercise.name))
      );
      const previousExercise = previousSession?.exercises.find((performed) =>
        performed.exerciseId === exercise.exerciseId || sameExerciseName(performed.name, exercise.name)
      );
      return {
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        muscle: exercise.muscle,
        sets: exercise.sets.map((set, index) => {
          const previousSet = previousExercise?.sets?.[index] || (previousExercise?.sets ? null : previousExercise);
          return {
            targetReps: set.targetReps,
            targetWeightKg: set.targetWeightKg,
            previousReps: previousSet?.reps ?? null,
            previousWeightKg: previousSet?.weightKg ?? null,
            reps: '',
            weightKg: previousSet?.weightKg ?? set.targetWeightKg ?? ''
          };
        })
      };
    }));
    setMessage('');
    setError('');
  };

  const updateWorkoutSet = (exerciseIndex, setIndex, field, value) => {
    setWorkoutExercises((current) => current.map((exercise, currentIndex) => currentIndex !== exerciseIndex ? exercise : {
      ...exercise,
      sets: exercise.sets.map((set, currentSetIndex) => currentSetIndex !== setIndex ? set : { ...set, [field]: value })
    }));
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
          notes: formData.get('notes'),
          exercises: workoutExercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets.map((set) => ({
              reps: Number(set.reps),
              weightKg: set.weightKg === '' ? null : Number(set.weightKg)
            }))
          }))
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

  const selectedExercise = exerciseCatalog.find((exercise) => exercise.id === selectedStatExercise);
  const metricOptions = {
    volume: { label: 'Volumen', unit: 'kg × reps' },
    reps: { label: 'Repeticiones', unit: 'reps' },
    maxWeight: { label: 'Peso máximo', unit: 'kg' },
    calories: { label: 'Calorías estimadas', unit: 'kcal' },
    estimatedRm: { label: '1RM estimado', unit: 'kg' }
  };
  const isCaloriesMetric = selectedMetric === 'calories';
  const progressionData = (isCaloriesMetric || selectedExercise) ? history.slice().reverse().flatMap((session) => {
    if (isCaloriesMetric) {
      const calories = Number(session.estimatedCalories);
      if (!Number.isFinite(calories) || calories <= 0) return [];
      return [{
        sessionId: session.id,
        date: session.completedAt,
        sessionLabel: new Date(session.completedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        calories: Math.round(calories)
      }];
    }
    const recordedExercise = session.exercises?.find((exercise) =>
      exercise.exerciseId === selectedExercise.id || sameExerciseName(exercise.name, selectedExercise.name)
    );
    if (!recordedExercise) return [];
    const sets = Array.isArray(recordedExercise.sets)
      ? recordedExercise.sets
      : Array.from({ length: Math.max(1, Number(recordedExercise.sets) || 1) }, () => ({ reps: recordedExercise.reps, weightKg: recordedExercise.weightKg }));
    const volume = sets.reduce((total, set) => total + (Number(set.weightKg) || 0) * (Number(set.reps ?? set.targetReps) || 0), 0);
    const reps = sets.reduce((total, set) => total + (Number(set.reps ?? set.targetReps) || 0), 0);
    const maxWeight = Math.max(0, ...sets.map((set) => Number(set.weightKg) || 0));
    const estimatedRm = Math.max(0, ...sets.map((set) => {
      const weight = Number(set.weightKg) || 0;
      const setReps = Number(set.reps ?? set.targetReps) || 0;
      return weight > 0 && setReps > 0 ? weight * (1 + setReps / 30) : 0;
    }));
    return [{
      sessionId: session.id,
      date: session.completedAt,
      sessionLabel: new Date(session.completedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      volume: Math.round(volume), reps, maxWeight, estimatedRm: Math.round(estimatedRm * 10) / 10
    }];
  }) : [];
  const metric = metricOptions[selectedMetric];
  const metricValues = progressionData.map((point) => point[selectedMetric]).filter((value) => Number.isFinite(value));
  const bestMetricValue = metricValues.length ? Math.max(...metricValues) : 0;
  const latestMetricValue = metricValues.at(-1) || 0;
  const formatMetric = (value) => `${Number(value).toLocaleString('es-ES', { maximumFractionDigits: 1 })} ${metric.unit}`;

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
          <label className="routine-preset-field">Plantillas de entrenamiento
            <select value={selectedPreset} onChange={(event) => loadRoutinePreset(event.target.value)}>
              <option value="">Elegir una plantilla para cargar</option>
              {['PPL', 'Upper / Lower', 'Full Body'].map((group) => <optgroup label={group} key={group}>
                {ROUTINE_PRESETS.filter((preset) => preset.group === group).map((preset) => <option value={preset.id} key={preset.id}>{preset.name}</option>)}
              </optgroup>)}
            </select>
          </label>
          <p className="routine-preset-help">La plantilla se carga en el editor; puedes modificar ejercicios, series, reps y pesos antes de guardarla.</p>
          <form onSubmit={saveRoutine} className="account-form">
            <label>Nombre de la rutina<input required maxLength="100" value={routineName} onChange={(event) => setRoutineName(event.target.value)} placeholder="Ej. Tren superior A" /></label>
            <label>Descripción<input maxLength="500" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Enfoque o notas" /></label>
            <div className="exercise-builder-heading"><h3>Ejercicios</h3><button type="button" className="text-action" onClick={() => setExercises((current) => [...current, emptyExercise()])}>＋ Añadir ejercicio</button></div>
            {exercises.map((exercise, index) => <fieldset className="exercise-builder" key={index}>
              <legend>Ejercicio {index + 1}</legend>
              <label>Ejercicio
                <select required value={exercise.exerciseId} onChange={(event) => updateExercise(index, 'exerciseId', event.target.value)}>
                  <option value="">Selecciona un ejercicio</option>
                  {Object.entries(MUSCLE_LABELS).map(([muscle, label]) => {
                    const groupExercises = exerciseCatalog.filter((item) => item.muscleGroup === muscle);
                    return groupExercises.length ? <optgroup label={label} key={muscle}>
                      {groupExercises.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                    </optgroup> : null;
                  })}
                </select>
              </label>
              <div className="exercise-numbers">
                <label>Series<input type="number" min="1" max="30" required value={exercise.setsCount} onChange={(event) => updateExercise(index, 'setsCount', event.target.value)} /></label>
                <label>Reps objetivo<input type="number" min="1" max="100" required value={exercise.targetReps} onChange={(event) => updateExercise(index, 'targetReps', event.target.value)} /></label>
                <label>Kg objetivo<input type="number" min="0" max="1000" step="0.5" value={exercise.targetWeightKg} onChange={(event) => updateExercise(index, 'targetWeightKg', event.target.value)} placeholder="--" /></label>
              </div>
              {exercises.length > 1 && <button type="button" className="remove-exercise" onClick={() => setExercises((current) => current.filter((_, exerciseIndex) => exerciseIndex !== index))}>Quitar ejercicio</button>}
            </fieldset>)}
            <button type="submit" className="primary-action" disabled={saving}>{saving ? 'Guardando...' : 'Guardar rutina'}</button>
          </form>
        </section>

        <section className="account-section">
          <div className="section-title-row"><div><span className="account-eyebrow">TU BIBLIOTECA</span><h2>Rutinas guardadas <span className="count-badge">{routines.length}</span></h2></div></div>
          {routines.length ? <div className="routine-list">{routines.map((routine) => <article className="routine-entry" key={routine.id}>
            <div className="routine-entry-top"><div><h3>{routine.name}</h3><p>{routine.description || 'Sin descripción'}</p></div><button type="button" className="primary-action compact-action" onClick={() => startWorkout(routine)}>Entrenar</button></div>
            <ul>{routine.exercises.map((exercise, index) => <li key={`${routine.id}-${index}`}><span>{exercise.name}</span><span>{exercise.sets.length} × {exercise.sets[0]?.targetReps} reps{exercise.sets[0]?.targetWeightKg ? ` · ${exercise.sets[0].targetWeightKg} kg` : ''}</span></li>)}</ul>
            {activeRoutineId === routine.id && <form className="session-editor" onSubmit={(event) => logWorkout(event, routine)}>
              {workoutExercises.map((exercise, exerciseIndex) => <fieldset className="session-exercise" key={exercise.exerciseId}>
                <legend>{exercise.name}</legend>
                <div className="session-set-head"><span>Serie</span><span>Anterior</span><span>Reps hechas</span><span>Kg</span></div>
                {exercise.sets.map((set, setIndex) => <div className="session-set" key={`${exercise.exerciseId}-${setIndex}`}>
                  <span className="session-set-number">{setIndex + 1}<small>Objetivo {set.targetReps}</small></span>
                  <span className="previous-set">{set.previousReps ? `${set.previousReps} reps · ${set.previousWeightKg ?? '-'} kg` : 'Sin registro'}</span>
                  <label><span className="visually-hidden">Repeticiones de la serie {setIndex + 1}</span><input required type="number" min="1" max="100" value={set.reps} onChange={(event) => updateWorkoutSet(exerciseIndex, setIndex, 'reps', event.target.value)} /></label>
                  <label><span className="visually-hidden">Peso de la serie {setIndex + 1}</span><input type="number" min="0" max="1000" step="0.5" value={set.weightKg} onChange={(event) => updateWorkoutSet(exerciseIndex, setIndex, 'weightKg', event.target.value)} placeholder="--" /></label>
                </div>)}
              </fieldset>)}
              <div className="workout-log-form">
                <label>Duración (min)<input required name="durationMinutes" type="number" min="1" max="1440" placeholder="Ej. 50" /></label>
                <label>Notas<input name="notes" maxLength="500" placeholder="Opcional" /></label>
              </div>
              <div className="session-actions"><button type="button" className="text-action" onClick={() => setActiveRoutineId(null)}>Cancelar</button><button type="submit" className="primary-action">Guardar entrenamiento</button></div>
            </form>}
          </article>)}</div> : <p className="empty-state">Todavía no tienes rutinas. Crea la primera aquí.</p>}
        </section>
      </div>}

      {section === 'history' && <section className="account-section history-section">
        <div className="section-title-row"><div><span className="account-eyebrow">ACTIVIDAD</span><h2>Sesiones completadas</h2></div><span className="count-badge">{history.length}</span></div>
        <section className="progress-panel">
          <div className="progress-panel-heading"><div><span className="account-eyebrow">SOBRECARGA PROGRESIVA</span><h3>Evolución por ejercicio</h3></div></div>
          <div className={`progress-controls ${isCaloriesMetric ? 'calorie-controls' : ''}`}>
            {isCaloriesMetric ? <div className="progress-scope"><span>Alcance</span><strong>Sesión completa</strong></div> : <label>Ejercicio<select value={selectedStatExercise} onChange={(event) => setSelectedStatExercise(event.target.value)}>
              {exerciseCatalog.map((exercise) => <option value={exercise.id} key={exercise.id}>{exercise.name}</option>)}
            </select></label>}
            <label>Métrica<select value={selectedMetric} onChange={(event) => setSelectedMetric(event.target.value)}>
              {Object.entries(metricOptions).map(([key, option]) => <option value={key} key={key}>{option.label}</option>)}
            </select></label>
          </div>
          {progressionData.length ? <>
            <div className="progress-highlights">
              <div><span>Mejor marca</span><strong>{formatMetric(bestMetricValue)}</strong></div>
              <div><span>Último registro</span><strong>{formatMetric(latestMetricValue)}</strong></div>
              <div><span>{isCaloriesMetric ? 'Sesiones contabilizadas' : 'Sesiones con este ejercicio'}</span><strong>{progressionData.length}</strong></div>
            </div>
            <Suspense fallback={<div className="progress-chart-loading">Preparando gráfico...</div>}>
              <ProgressChart data={progressionData} metricKey={selectedMetric} metricLabel={metric.label} formatValue={formatMetric} />
            </Suspense>
            {selectedMetric === 'estimatedRm' && <p className="progress-caption">Estimación Epley: peso × (1 + repeticiones / 30). Es una referencia, no un test máximo.</p>}
            {isCaloriesMetric && <p className="progress-caption">Estimación para fuerza moderada (5 MET), basada en duración y peso corporal. Si no cargaste tu peso en el perfil, se asumen 70 kg.</p>}
          </> : <p className="empty-state">Registra este ejercicio en una sesión para empezar a ver su evolución.</p>}
        </section>
        {history.length ? <div className="history-list">{history.map((session) => <article className="history-entry" key={session.id}>
          <div className="history-date"><strong>{new Date(session.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</strong><span>{new Date(session.completedAt).toLocaleDateString('es-ES', { year: 'numeric' })}</span></div>
          <div className="history-details"><h3>{session.routineName}</h3><p>{session.exercises.map(formatSessionExercise).join(' · ')}</p></div>
          <div className="history-duration">{session.durationMinutes ? `${session.durationMinutes} min` : 'Sesión'}<small>{session.estimatedCalories ? `${Math.round(session.estimatedCalories)} kcal aprox.` : 'Sin estimación kcal'}</small><small>{session.exercises.length} ejercicios</small></div>
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
          <div className="profile-actions">
            <button type="submit" className="primary-action">Guardar cambios</button>
            <button type="button" className="profile-logout" onClick={onLogout}>Cerrar sesión</button>
          </div>
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