import { useEffect, useState } from 'react';
import './styles/exercisesPage.css';

const MUSCLE_GROUPS = [
  ['pecho', 'Pecho'], ['espalda', 'Espalda'], ['hombros', 'Hombros'],
  ['abdominales', 'Abdominales'], ['biceps', 'Bíceps'], ['triceps', 'Tríceps'],
  ['cuadriceps', 'Cuádriceps'], ['isquiotibiales', 'Isquiotibiales'],
  ['gluteo', 'Glúteos'], ['pantorrilla', 'Pantorrillas'], ['cardio', 'Cardio']
];

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('http://localhost:3000/api/exercises')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el catálogo de ejercicios.');
        return response.json();
      })
      .then((data) => { if (active) setExercises(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="account-page exercises-page">
      <header className="account-heading">
        <div><span className="account-eyebrow">CATÁLOGO</span><h1>Ejercicios</h1></div>
        <p>{exercises.length} movimientos</p>
      </header>
      {error && <div className="account-notice is-error" role="alert">{error}</div>}
      {loading ? <p className="empty-state">Cargando ejercicios...</p> : MUSCLE_GROUPS.map(([muscle, title]) => {
        const groupExercises = exercises.filter((exercise) => exercise.muscleGroup === muscle);
        if (groupExercises.length === 0) return null;
        return <section className="exercise-group" key={muscle}>
          <div className="exercise-group-heading"><h2>{title}</h2><span>{groupExercises.length}</span></div>
          <div className="exercise-catalog-grid">{groupExercises.map((exercise) => <article className="exercise-catalog-item" key={exercise.id}>
            {exercise.image ? <img src={exercise.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} /> : <div className="exercise-image-placeholder">{title}</div>}
            <div><h3>{exercise.name}</h3><span>{title}</span></div>
          </article>)}</div>
        </section>;
      })}
    </div>
  );
}

export default ExercisesPage;