import { useEffect, useState } from 'react';
import './styles/exercisesPage.css';

const MUSCLE_GROUPS = [
  ['pecho', 'Pecho'], ['espalda', 'Espalda'], ['hombros', 'Hombros'],
  ['abdominales', 'Abdominales'], ['biceps', 'Bíceps'], ['triceps', 'Tríceps'],
  ['cuadriceps', 'Cuádriceps'], ['isquiotibiales', 'Isquiotibiales'],
  ['gluteo', 'Glúteos'], ['pantorrilla', 'Pantorrillas'], ['cardio', 'Cardio']
];

const EXERCISE_GIFS = {
  'ex-1': 'pectorals/barbell-bench-press',
  'ex-2': 'pectorals/dumbbell-incline-bench-press',
  'ex-3': 'pectorals/push-up',
  'ex-4': 'lats/pull-up',
  'ex-8': 'delts/dumbbell-lateral-raise',
  'ex-11': 'biceps/barbell-curl',
  'ex-12': 'biceps/dumbbell-hammer-curl',
  'ex-13': 'triceps/cable-pushdown'
};
const EXERCISE_GIF_BASE = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0';

function ExerciseImage({ exercise, alt, className }) {
  const gifPath = EXERCISE_GIFS[exercise.id];
  const gifUrl = gifPath ? `${EXERCISE_GIF_BASE}/${gifPath}.gif` : '';
  const fallbackUrl = exercise.image || '';
  const imageUrl = gifUrl || fallbackUrl;

  if (!imageUrl) return null;

  return <img
    src={imageUrl}
    alt={alt}
    className={className}
    loading="lazy"
    onError={(event) => {
      if (gifUrl && fallbackUrl && event.currentTarget.dataset.fallbackAttempted !== 'true') {
        event.currentTarget.dataset.fallbackAttempted = 'true';
        event.currentTarget.src = fallbackUrl;
      } else {
        event.currentTarget.hidden = true;
      }
    }}
  />;
}

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('pecho');
  const [customDescription, setCustomDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    fetch('http://localhost:3000/api/exercises', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el catálogo de ejercicios.');
        return response.json();
      })
      .then((data) => { if (active) setExercises(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedExercise) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedExercise(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedExercise]);

  const saveCustomExercise = async (event) => {
    event.preventDefault();
    setSavingCustom(true);
    setFeedback('');
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/exercises/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          name: customName,
          muscleGroup: customMuscle,
          description: customDescription,
          instructions: customInstructions
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo guardar el ejercicio.');
      setExercises((current) => [...current, data]);
      setSelectedExercise(data);
      setCustomName('');
      setCustomDescription('');
      setCustomInstructions('');
      setShowCustomForm(false);
      setFeedback('Ejercicio personalizado guardado.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <div className="account-page exercises-page">
      <header className="account-heading">
        <div><span className="account-eyebrow">CATÁLOGO</span><h1>Ejercicios</h1></div>
        <div className="exercise-heading-actions"><p>{exercises.length} movimientos</p><button className="primary-action compact-action" onClick={() => setShowCustomForm((visible) => !visible)}>{showCustomForm ? 'Cerrar formulario' : '＋ Ejercicio personalizado'}</button></div>
      </header>
      {error && <div className="account-notice is-error" role="alert">{error}</div>}
      {feedback && <div className="account-notice" role="status">{feedback}</div>}
      {showCustomForm && <form className="custom-exercise-form" onSubmit={saveCustomExercise}>
        <div className="custom-form-title"><span className="account-eyebrow">TU CATÁLOGO</span><h2>Agregar ejercicio personalizado</h2></div>
        <label>Nombre<input required minLength="2" maxLength="120" value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Ej. Press unilateral en polea" /></label>
        <label>Grupo muscular<select value={customMuscle} onChange={(event) => setCustomMuscle(event.target.value)}>{MUSCLE_GROUPS.map(([muscle, title]) => <option value={muscle} key={muscle}>{title}</option>)}</select></label>
        <label className="custom-description">Descripción<textarea required minLength="10" maxLength="500" rows="2" value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} placeholder="Qué trabaja y cuál es su objetivo" /></label>
        <label className="custom-instructions">Pasos, uno por línea<textarea required minLength="20" maxLength="1800" rows="4" value={customInstructions} onChange={(event) => setCustomInstructions(event.target.value)} placeholder={'Ajusta el equipo y colócate en posición.\nRealiza el movimiento con control.\nVuelve lentamente al inicio.'} /></label>
        <button type="submit" className="primary-action" disabled={savingCustom}>{savingCustom ? 'Guardando...' : 'Guardar ejercicio'}</button>
      </form>}
      {loading ? <p className="empty-state">Cargando ejercicios...</p> : MUSCLE_GROUPS.map(([muscle, title]) => {
        const groupExercises = exercises.filter((exercise) => exercise.muscleGroup === muscle);
        if (groupExercises.length === 0) return null;
        return <section className="exercise-group" key={muscle}>
          <div className="exercise-group-heading"><h2>{title}</h2><span>{groupExercises.length}</span></div>
          <div className="exercise-catalog-grid">{groupExercises.map((exercise) => <button className="exercise-catalog-item" key={exercise.id} onClick={() => setSelectedExercise(exercise)} aria-haspopup="dialog">
            {exercise.image || EXERCISE_GIFS[exercise.id]
              ? <ExerciseImage exercise={exercise} alt="" />
              : <div className="exercise-image-placeholder">{title}</div>}
            <div><h3>{exercise.name}</h3><span>{exercise.isCustom ? 'Personalizado' : title}</span></div>
          </button>)}</div>
        </section>;
      })}
      {selectedExercise && <div className="exercise-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedExercise(null); }}>
        <section className="exercise-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-modal-title">
          <button className="exercise-modal-close" onClick={() => setSelectedExercise(null)} aria-label="Cerrar ficha">×</button>
          <span className="account-eyebrow">{MUSCLE_GROUPS.find(([muscle]) => muscle === selectedExercise.muscleGroup)?.[1] || selectedExercise.muscleGroup}</span>
          <h2 id="exercise-modal-title">{selectedExercise.name}</h2>
          {(EXERCISE_GIFS[selectedExercise.id] || selectedExercise.image) && <ExerciseImage exercise={selectedExercise} alt={`Animación de ${selectedExercise.name}`} className="exercise-modal-animation" />}
          <p className="exercise-modal-description">{selectedExercise.description}</p>
          <h3>Cómo hacerlo</h3>
          <ol>{(selectedExercise.instructions || []).map((instruction, index) => <li key={`${selectedExercise.id}-${index}`}>{instruction}</li>)}</ol>
          {selectedExercise.isCustom && <p className="exercise-author">Ejercicio personalizado</p>}
        </section>
      </div>}
    </div>
  );
}

export default ExercisesPage;