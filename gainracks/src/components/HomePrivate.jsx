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

const EXERCISE_GUIDES = {
  'Press de Banca con Barra': 'Para ejecutarlo correctamente, acuesta la espalda en el banco, toma la barra con un agarre ligeramente más ancho que los hombros, baja controlando hasta el pecho y empuja con fuerza hasta volver a la posición inicial sin arquear la columna.',
  'Press inclinado con Mancuernas': 'Para ejecutarlo correctamente, coloca las mancuernas a la altura del pecho, baja con control hasta que los codos formen un ángulo cercano a 90 grados y empuja hacia arriba manteniendo la espalda apoyada en el banco.',
  'Flexiones de Pecho': 'Para ejecutarlo correctamente, coloca las manos más anchas que los hombros, baja el torso controlando el movimiento hasta que el pecho casi toque el suelo y empuja con fuerza para volver a la posición inicial sin perder la alineación del cuerpo.',
  'Press Declinado': 'Para ejecutarlo correctamente, acuéstate en un banco declinado, baja la barra hasta el esternón con control y empuja con fuerza para volver a la posición inicial manteniendo el abdomen activado y la espalda pegada al banco.',
  'Peck Deck': 'Para ejecutarlo correctamente, lleva los brazos en arco hacia el centro, aprieta el pecho al cerrar las manos y vuelve lentamente a la posición inicial sin bloquear los codos.',
  'Dominadas': 'Para ejecutarlo correctamente, toma la barra con agarre amplio, eleva la barbilla por encima de la barra tirando con la espalda y baja con control sin balancearte ni usar impulso.',
  'Remo con Barra': 'Para ejecutarlo correctamente, mantén la espalda neutra, empuja el pecho hacia adelante y tira de la barra hacia el abdomen sin encorvar la zona lumbar ni mover los hombros hacia arriba.',
  'Jalón al Pecho': 'Para ejecutarlo correctamente, senta la cadera, tira de la barra hacia el pecho manteniendo la mirada hacia delante y baja de forma controlada hasta que los brazos queden casi extendidos.',
  'Remo en T': 'Para ejecutarlo correctamente, toma la manija con los brazos extendidos y tira hacia el torso manteniendo la espalda baja, activando el dorsal y evitando el balance del cuerpo.',
  'Remo con Mancuernas': 'Para ejecutarlo correctamente, inclina ligeramente el tronco hacia adelante, lleva las mancuernas hacia la parte baja del torso y vuelve lentamente a la posición inicial sin forzar la espalda.',
  'Press Militar con Mancuerna': 'Para ejecutarlo correctamente, levanta la carga a la altura de los hombros, empuja hacia arriba sin archar la espalda y baja con control para mantener el trabajo en los deltoides.',
  'Elevaciones Laterales con Mancuernas': 'Para ejecutarlo correctamente, mantiene los brazos ligeramente flexionados, levanta las mancuernas hasta la altura de los hombros y baja despacio para sentir la contracción lateral del hombro.',
  'Press Frances': 'Para ejecutarlo correctamente, mantén los codos apuntando al frente, baja la barra detrás de la cabeza con control y empuja de vuelta sin abrir demasiado los brazos.',
  'Sentadilla Libre': 'Para ejecutarlo correctamente, apoya los pies a la altura de los hombros, baja flexionando rodillas y cadera y empuja con fuerza a través de los talones para volver a la posición inicial.',
  'Prensa de Piernas': 'Para ejecutarlo correctamente, coloca la espalda firme en el asiento, baja la plataforma controlando el movimiento y empuja de forma poderosa sin bloquear las rodillas.',
  'Peso Muerto Rumano': 'Para ejecutarlo correctamente, coge la barra con los brazos extendidos, empuja la cadera hacia atrás y lleva la carga hacia abajo manteniendo la espalda neutra y los glúteos activos.',
  'Hip Thrust': 'Para ejecutarlo correctamente, apoya la espalda en el banco, lleva la carga hacia arriba empujando con los glúteos y baja con control sin perder la alineación de la columna.',
  'Elevacion de Talones': 'Para ejecutarlo correctamente, eleva el talón con fuerza y baja lentamente para mantener la tensión en la pantorrilla durante todo el rango de movimiento.',
  'Cinta de Correr': 'Para ejecutarlo correctamente, mantén un paso constante, controla la respiración y ajusta la velocidad para trabajar resistencia sin perder la postura corporal.'
};

const EXERCISE_DETAILS_BY_MUSCLE = {
  pecho: {
    principal: 'Pecho',
    secundaria: 'Tríceps y hombros',
    subtitle: 'Ejercicio para desarrollar fuerza y volumen en el pecho',
    description: 'Para ejecutarlo correctamente, controla la bajada y empuja con el pecho para volver a la posición inicial sin forzar la columna.'
  },
  espalda: {
    principal: 'Espalda',
    secundaria: 'Bíceps y core',
    subtitle: 'Ejercicio para fortalecer la espalda y mejorar la postura',
    description: 'Para ejecutarlo correctamente, mantén la espalda neutra, activa el core y realiza el movimiento con un rango controlado, tirando con la espalda y evitando balancearte.'
  },
  hombros: {
    principal: 'Hombros',
    secundaria: 'Trapecios y tríceps',
    subtitle: 'Ejercicio para trabajar los deltoides con control',
    description: 'Para ejecutarlo correctamente, mantén los codos ligeramente flexionados, levanta la carga sin mover el torso y baja de forma controlada para aislar la zona trabajada.'
  },
  abdominales: {
    principal: 'Abdominales',
    secundaria: 'Core y cadera',
    subtitle: 'Ejercicio para fortalecer el abdomen y la estabilidad',
    description: 'Para ejecutarlo correctamente, contrae el abdomen durante todo el movimiento, mantiene la columna alineada y realiza la elevación sin tirar del cuello ni forzar la zona lumbar.'
  },
  biceps: {
    principal: 'Bíceps',
    secundaria: 'Antebrazos y hombros',
    subtitle: 'Ejercicio para aumentar la fuerza y el tamaño del bíceps',
    description: 'Para ejecutarlo correctamente, mantén los codos pegados al cuerpo, controla la bajada y levanta la carga sin mover los hombros ni compensar con el torso.'
  },
  triceps: {
    principal: 'Tríceps',
    secundaria: 'Hombros y core',
    subtitle: 'Ejercicio para trabajar la parte posterior del brazo',
    description: 'Para ejecutarlo correctamente, mantén los brazos alineados, flexiona los codos con control y evita abrirlos demasiado para concentrar la tensión en el tríceps.'
  },
  cuadriceps: {
    principal: 'Cuádriceps',
    secundaria: 'Glúteos y core',
    subtitle: 'Ejercicio para fuerza y potencia en piernas',
    description: 'Para ejecutarlo correctamente, coloca los pies de forma estable, baja con control y empuja con fuerza a través de los talones para volver a la posición inicial sin arquear la espalda.'
  },
  isquiotibiales: {
    principal: 'Isquiotibiales',
    secundaria: 'Glúteos y core',
    subtitle: 'Ejercicio para fortalecer la parte posterior del muslo',
    description: 'Para ejecutarlo correctamente, mantén la espalda neutra, empuja la cadera hacia atrás con control y vuelve a la posición inicial activando glúteos e isquiotibiales sin perder el equilibrio.'
  },
  gluteo: {
    principal: 'Glúteo',
    secundaria: 'Core y piernas',
    subtitle: 'Ejercicio para activar y fortalecer los glúteos',
    description: 'Para ejecutarlo correctamente, activa el core y empuja con los glúteos para elevar la carga, manteniendo la postura estable y controlando la bajada.'
  },
  pantorrilla: {
    principal: 'Pantorrillas',
    secundaria: 'Gemelos y core',
    subtitle: 'Ejercicio para mejorar fuerza y resistencia en los tobillos',
    description: 'Para ejecutarlo correctamente, sube de puntillas con control, manten la tensión en la pantorrilla y baja lentamente sin bloquear la rodilla ni perder el equilibrio.'
  },
  cardio: {
    principal: 'Sistema cardiovascular',
    secundaria: 'Core y piernas',
    subtitle: 'Ejercicio para mejorar resistencia y salud cardiovascular',
    description: 'Para ejecutarlo correctamente, mantén un ritmo constante, controla la respiración y utiliza una intensidad moderada para mantener la postura sin forzar la zona lumbar.'
  },
};

const normalizeExercises = (muscleId, items = []) => {
  const details = EXERCISE_DETAILS_BY_MUSCLE[muscleId] || {};

  return items.map((item) => ({
    ...item,
    principal: item.principal || details.principal || 'Grupo principal',
    secundaria: item.secundaria || details.secundaria || 'Músculos estabilizadores',
    subtitle: item.subtitle || details.subtitle || 'Ejercicio para fortalecer la zona objetivo',
    description: EXERCISE_GUIDES[item.name] || item.description || details.description || 'Para ejecutarlo correctamente, mantén la postura estable, controla la carga y realiza el movimiento con respiración constante.'
  }));
};

const MuscleCarousel = ({ title, muscleId }) => {
  const trackRef = useRef(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/exercises/${muscleId}`);
        const data = await res.json();
        setExercises(normalizeExercises(muscleId, data));
      } catch (err) {
        console.error(`Error cargando ${title}:`, err);
      } finally {
        setLoading(false);
      }
    };

    setSelectedExercise(null);
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
              <button
                type="button"
                key={item.id || index}
                className={`exercise-card${selectedExercise?.id === item.id ? ' selected' : ''}`}
                onClick={() => setSelectedExercise(item)}
                aria-pressed={selectedExercise?.id === item.id}
              >
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
              </button>
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

      {selectedExercise && (
        <div className="exercise-detail-panel">
          <div className="exercise-detail-header">
            <div className="detail-title-wrap">
              <span className="detail-dot" />
              <span>DETALLE DEL EJERCICIO</span>
            </div>
            <button
              type="button"
              className="detail-close"
              onClick={() => setSelectedExercise(null)}
              aria-label="Cerrar detalle"
            >
              ×
            </button>
          </div>

          <div className="exercise-detail-content">
            <div className="detail-image-card">
              {selectedExercise.image ? (
                <img
                  src={selectedExercise.image}
                  alt={selectedExercise.name}
                  className="detail-image"
                />
              ) : (
                <div className="detail-image placeholder">Sin imagen</div>
              )}

              <div className="detail-caption">DIAGRAMA ANATÓMICAMENTE DESTACADO</div>
            </div>

            <div className="exercise-detail-text">
              <h3>{selectedExercise.name}</h3>
              <p className="detail-subtitle">{selectedExercise.subtitle}</p>

              <div className="detail-rows">
                <div className="detail-pill">
                  <span className="pill-icon">◉</span>
                  <div>
                    <small>Parte principal</small>
                    <strong>{selectedExercise.principal}</strong>
                  </div>
                </div>

                <div className="detail-pill secondary">
                  <span className="pill-icon">◌</span>
                  <div>
                    <small>Parte secundaria</small>
                    <strong>{selectedExercise.secundaria}</strong>
                  </div>
                </div>
              </div>

              <h4>INSTRUCCIONES Y EJECUCIÓN</h4>
              <p className="detail-description">{selectedExercise.description}</p>
            </div>
          </div>
        </div>
      )}
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