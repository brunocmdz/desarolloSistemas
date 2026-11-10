const Exercise = require('../model/exercise');

const EXERCISES_BY_MUSCLE = {
    pecho: [
      { id: 'ex-1', name: 'Press de Banca con Barra', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLRGEReFPd-aonfQFPzidg5cvgww3WGJ2NpkP60_pJTg&s=10' },
      { id: 'ex-2', name: 'Press inclinado con Mancuernas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzoBCcm-qtTTHpCFfw4dPG5R1Wzv_QWeINPBk1rL7lcw&s=10' },
      { id: 'ex-3', name: 'Flexiones de Pecho', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIblMB2742Sx6jSPtV-06vG3O1x6p_UNOLyinBloPF8w&s' },
      { id: 'ex-21', name: 'Press Declinado', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU--5AoAW9VJEuwbEJv5FuC9rrRi76FwhCPUXK9RbFTw&s=10' },
      { id: 'ex-22', name: 'Peck Deck', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN1XiVkuwmdOKlBbsFTqogsFp302ySJA5eRWKiJoD3_A&s=10' },
      { id: 'ex-23', name: 'Press Inclinado con Barra en Smith', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXezxxghLSzmD9h66oTbSWQ6l3yOZuoh3UnC5_wlbh-g&s=10' },
      { id: 'ex-24', name: 'Press de Banca con Mancuernas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxUZg9QyWUU7xzbYDxr2CKicAOg_I15gwO0V44XTMSNA&s=10' }
    ],
    espalda: [
      { id: 'ex-4', name: 'Dominadas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV1_MDcq88HQMWVm2zbqpqr1Oj0zPZ3wpmLViefotU6A&s=10' },
      { id: 'ex-5', name: 'Remo con Barra', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeRJsEFrxevzfT8NU5XOH5ROIccqFtq4kZchPKVjFSuw&s=10' },
      { id: 'ex-6', name: 'Jalon al Pecho', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVuRH931uazqPkhZeWUjX6HADhtH14Jj14LL8O-SIB7w&s=10' },
      { id: 'ex-25', name: 'Remo en T', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeakPXGSc1fYqynL4XF3fvCVLm5kT33KrPGbJ20vwPcg&s=10' },
      { id: 'ex-26', name: 'Remo con Mancuernas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYgszH-oak7rNb5MQUEVuA8HY8fUhcmabLqoVq0AWt2Q&s=10' }
    ],
    hombros: [
      { id: 'ex-7', name: 'Press Militar con Mancuerna', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlM3RowSwIPSH_njsyZ0m51V2-EXQyNc_fxtxvRk5CLw&s=10' },
      { id: 'ex-8', name: 'Elevaciones Laterales con Mancuernas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJihcXlAJ1ug1uLaUi_lgcEarIU03gJV7A7yE5ICODnw&s=10' },
      { id: 'ex-27', name: 'Elevaciones Laterales en Polea', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ8r3rhj7xafaNSvsWPAfixgeggbs6EO5P3yNwizKHmw&s=10' },
      { id: 'ex-28', name: 'Posterior en Maquina', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa0Zhkm7PgBwlC3iVBoatepiPhrvTxVDW2VMi5eZj4NQ&s=10' },
      { id: 'ex-29', name: 'Press Militar con Barra', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyCsofzKaFpU1j5ksUnLQmClMJOxz_OCIFSlG-IZxanA&s=10' }
    ],
    abdominales: [
      { id: 'ex-9', name: 'Crunch Abdominal', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRprYDwAb8RFGOGH_Jf2uDRBW_ClBqy4v07BxCXvYhYeA&s=10' },
      { id: 'ex-10', name: 'Plancha Isometrica', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpP4Elw1IPufEFNOPBhkMPbgxul1PxU6heg8ouaOO_mw&s=10' },
      { id: 'ex-32', name: 'Elevacion de Piernas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpo4NA9KVsNafrRsPhQaCj9GQbsRNrO2EmaKe6lrkR2w&s=10' }
    ],
    biceps: [
      { id: 'ex-11', name: 'Curl de Biceps con Barra', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKqwvDMXfwrVA9WYIOBHGUl9R5fUgrmliMbVeykVcZSg&s=10' },
      { id: 'ex-12', name: 'Curl Martillo', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8YrLZLFyeb9SMybM0fOX0Kb1WN2liERV6kYj9bzaKVw&s=10' },
      { id: 'ex-33', name: 'Curl Bayesian', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm-G3Vb6AECpUhL4HLMMl0QRXbpXLXNwNFsXcRzGM8xw&s=10' },
      { id: 'ex-34', name: 'Curl en Banco Scott', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk6Dg1nwFwiZDPtk7b8gWzr1HpdW301EIFGubwhhDg3A&s=10' },
      { id: 'ex-35', name: 'Curl con Barra W', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj6K18l6Ls1fvUcX3g1rBjbBK8jhB5yGWF4ELdI711uQ&s=10' }
    ],
    triceps: [
      { id: 'ex-13', name: 'Extensiones en Polea', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4zJNvPNjLds1t1c9-92Bgo42epb_4zY_JLLZBhR_bgg&s=10' },
      { id: 'ex-14', name: 'Press Frances', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKWosU7oTtXZV-qCloSlZKNigZrFkfCf7A-fyirw7FHw&s=10' }
    ],
    cuadriceps: [
      { id: 'ex-15', name: 'Sentadilla Libre', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6lmzP4ii8FIzWZLPXLmi_fivgk8zAh6KmjdP0LD1NMw&s=10' },
      { id: 'ex-16', name: 'Prensa de Piernas', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1NAMu-y46DPxV9sBlkyNZEnYrRVItayRPx6d_sncu1g&s=10' }
    ],
    isquiotibiales: [
      { id: 'ex-17', name: 'Peso Muerto Rumano', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIRkvZFP4C8-5Y5sUdaPBo06cnopleOTQH047uyn--xw&s=10' }
    ],
    gluteo: [
      { id: 'ex-18', name: 'Hip Thrust', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxFrdgsb4jsQQlyy-nypdTMyFf9V7s7qJBnpsWAJCKNg&s=10' }
    ],
    pantorrilla: [
      { id: 'ex-19', name: 'Elevacion de Talones', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS59DCVPvihxGU5XBHWN1oEh8JKtEQiJzFaow-r7coswg&s=10' }
    ],
    cardio: [
      { id: 'ex-20', name: 'Cinta de Correr', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2943De_aN6G20rAg-2MP5NIPji2NyRyyJ3y7LXJMZkA&s=10' }
    ]
};

const EXTRA_EXERCISES = [
  ['ex-36', 'Cruce de Poleas', 'pecho'], ['ex-37', 'Fondos en Paralelas', 'pecho'],
  ['ex-38', 'Remo en Polea Baja', 'espalda'], ['ex-39', 'Jalón con Agarre Estrecho', 'espalda'], ['ex-40', 'Peso Muerto Convencional', 'espalda'],
  ['ex-41', 'Face Pull', 'hombros'], ['ex-42', 'Press Arnold', 'hombros'],
  ['ex-30', 'Bicicleta Abdominal', 'abdominales'], ['ex-31', 'Giros Rusos', 'abdominales'],
  ['ex-43', 'Plancha', 'abdominales'], ['ex-44', 'Crunch en Polea', 'abdominales'],
  ['ex-45', 'Curl Inclinado con Mancuernas', 'biceps'],
  ['ex-46', 'Extensión de Tríceps sobre la Cabeza', 'triceps'], ['ex-47', 'Fondos en Banco', 'triceps'],
  ['ex-48', 'Extensión de Cuádriceps', 'cuadriceps'], ['ex-49', 'Sentadilla Goblet', 'cuadriceps'],
  ['ex-50', 'Curl Femoral', 'isquiotibiales'], ['ex-51', 'Buenos Días con Barra', 'isquiotibiales'],
  ['ex-52', 'Patada de Glúteo en Polea', 'gluteo'], ['ex-53', 'Abducción de Cadera', 'gluteo'],
  ['ex-54', 'Elevación de Talones Sentado', 'pantorrilla'],
  ['ex-55', 'Bicicleta Estática', 'cardio'], ['ex-56', 'Máquina de Remo', 'cardio']
].map(([id, name, muscleGroup]) => ({ id, name, muscleGroup, image: null }));

const getExerciseCatalog = () => [
  ...Object.entries(EXERCISES_BY_MUSCLE).flatMap(([muscleGroup, exercises]) =>
    exercises.map(({ id, name, image }) => ({ id, name, image, muscleGroup }))
  ),
  ...EXTRA_EXERCISES
];

const getExercises = async (_req, res, next) => {
  try {
    return res.json(await Exercise.findAll({ order: [['muscleGroup', 'ASC'], ['name', 'ASC']] }));
  } catch (error) {
    return next(error);
  }
};

const getExercisesByMuscle = async (req, res, next) => {
  try {
    return res.json(await Exercise.findAll({
      where: { muscleGroup: req.params.muscle.toLowerCase() },
      order: [['name', 'ASC']]
    }));
  } catch (error) {
    return next(error);
  }
};

module.exports = { getExercises, getExercisesByMuscle, getExerciseCatalog };