const getExercisesByMuscle = async (req, res) => {
  const { muscle } = req.params;

  // IDs ajustados de categorías en wger
  const muscleMap = {
    biceps: 8,
    hombros: 13,
    pecho: 11,
    espalda: 12,
    cuadriceps: 10,
    abdominales: 10,
    triceps: 8,
    isquiotibiales: 10,
    gluteo: 10,
    pantorrilla: 14, // ID actualizado para gemelos/pantorrilla
    cardio: 15
  };

  const categoryId = muscleMap[muscle.toLowerCase()] || 10;

  try {
    const response = await fetch(
      `https://wger.de/api/v2/exerciseinfo/?category=${categoryId}&limit=20`
    );

    if (!response.ok) {
      return res.status(200).json([]);
    }

    const data = await response.json();

    // Validación segura de los datos devueltos
    if (!data || !Array.isArray(data.results)) {
      return res.status(200).json([]);
    }

    const exercises = data.results.map((item) => {
      const translation = item.translations?.find((t) => t.language === 2) || item.translations?.[0];
      return {
        id: item.id,
        name: translation?.name || item.name || 'Ejercicio'
      };
    });

    return res.status(200).json(exercises);
  } catch (error) {
    console.error(`Error al obtener ejercicios de ${muscle}:`, error);
    // Devolver array vacío en lugar de un error 500 para no romper la app
    return res.status(200).json([]);
  }
};

module.exports = { getExercisesByMuscle };