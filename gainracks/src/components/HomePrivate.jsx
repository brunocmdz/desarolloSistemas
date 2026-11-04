import React, { useRef, useState, useEffect } from 'react';
import './styles/homePrivate.css';

const MUSCLE_GROUPS = [
  { id: 'pecho', title: 'Pecho' },
  { id: 'espalda', title: 'Espalda' },
  { id: 'hombros', title: 'Hombros' },
  { id: 'abdominales', title: 'Abdominales' },
  { id: 'biceps', title: 'Bíceps' },
  { id: 'triceps', title: 'Tríceps' },
  { id: 'cuadriceps', title: 'Cuádriceps' },
  { id: 'isquiotibiales', title: 'Isquiotibiales' },
  { id: 'gluteo', title: 'Glúteo' },
  { id: 'pantorrilla', title: 'Pantorrilla' },
  { id: 'cardio', title: 'Cardio' },
];

const MuscleCarousel = ({ title, muscleId }) => {
  const trackRef = useRef(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/exercises/${muscleId}`);
        const data = await res.json();
        setExercises(data);
      } catch (err) {
        console.error(`Error cargando ${title}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [muscleId, title]);

  const handleScroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-private-section">
      <h2>{title}</h2>

      <div className="carousel-wrapper">
        <button
          className="carousel-btn left"
          onClick={() => handleScroll('left')}
          aria-label="Anterior"
        >
          &#10094;
        </button>

        <div className="carousel-track" ref={trackRef}>
          {loading ? (
            <div className="card">Cargando...</div>
          ) : exercises.length > 0 ? (
            exercises.map((item, index) => (
              <div key={item.id || index} className="exercise-card">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name || 'Ejercicio'}
                    className="exercise-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="exercise-image-placeholder">
                    Sin imagen
                  </div>
                )}

                <span className="exercise-name">
                  {item.name || 'Ejercicio sin nombre'}
                </span>
              </div>
            ))
          ) : (
            <div className="card">Sin ejercicios</div>
          )}
        </div>

        <button
          className="carousel-btn right"
          onClick={() => handleScroll('right')}
          aria-label="Siguiente"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
};

const HomePrivate = () => {
  return (
    <div className="home-private-container">
      <h1 className="main-title">Ejercicios para cada grupo muscular</h1>

      {MUSCLE_GROUPS.map((group) => (
        <MuscleCarousel key={group.id} muscleId={group.id} title={group.title} />
      ))}
    </div>
  );
};

export default HomePrivate;