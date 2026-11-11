const Exercise = require('../model/exercise');
const crypto = require('crypto');

const MUSCLE_GUIDES = {
  pecho: { description: 'Movimiento de empuje que trabaja principalmente el pecho. Ajusta la variante y el equipo a tu nivel.', instructions: ['Coloca los pies firmes y estabiliza el tronco antes de empezar.', 'Empuja de forma controlada, sin rebotar ni bloquear bruscamente los codos.', 'Baja con control hasta un rango cómodo y repite manteniendo la postura.'] },
  espalda: { description: 'Movimiento de tracción para espalda. Prioriza el control escapular antes de aumentar la carga.', instructions: ['Coloca el torso estable y empieza con los brazos extendidos sin encorvar la espalda.', 'Lleva los codos hacia atrás o hacia abajo según el agarre, juntando suavemente las escápulas.', 'Vuelve despacio a la posición inicial sin dejar caer el peso.'] },
  hombros: { description: 'Ejercicio de hombros. Usa un rango cómodo y evita compensar arqueando la zona lumbar.', instructions: ['Adopta una postura estable, con abdomen firme y hombros relajados.', 'Mueve la carga con control, sin impulso y dentro de un rango sin dolor.', 'Regresa lentamente a la posición inicial y mantén el cuello relajado.'] },
  abdominales: { description: 'Trabajo de zona media. Mantén la respiración y el tronco controlados durante todo el movimiento.', instructions: ['Activa el abdomen antes de iniciar y mantén la zona lumbar en una posición cómoda.', 'Haz el movimiento lentamente, sin tirar del cuello ni usar balanceo.', 'Respira de forma continua y detén la serie si aparece dolor.'] },
  biceps: { description: 'Ejercicio de flexión del codo enfocado en bíceps. Evita balancear el cuerpo para mover la carga.', instructions: ['Mantén el torso estable y los codos cerca de los costados cuando la variante lo permita.', 'Flexiona los codos sin adelantar los hombros y sin impulso.', 'Baja lentamente hasta extender los brazos de forma cómoda.'] },
  triceps: { description: 'Ejercicio de extensión del codo enfocado en tríceps. Controla la posición de los hombros.', instructions: ['Estabiliza el torso y coloca los codos según el equipo o la variante elegida.', 'Extiende los codos de forma controlada sin bloquearlos con fuerza.', 'Regresa despacio, manteniendo el control de la carga.'] },
  cuadriceps: { description: 'Movimiento de extensión de rodilla que enfatiza los cuádriceps. Ajusta la profundidad a tu movilidad.', instructions: ['Apoya los pies de forma estable y alinea las rodillas con la dirección de los pies.', 'Desciende o flexiona las rodillas de manera controlada, sin perder el equilibrio.', 'Empuja el suelo o extiende las piernas sin bloquear las rodillas bruscamente.'] },
  isquiotibiales: { description: 'Ejercicio para la parte posterior del muslo. Mantén la cadera y la espalda bajo control.', instructions: ['Coloca la carga ligera al principio y prepara una postura estable.', 'Realiza la flexión de rodilla o bisagra de cadera correspondiente a la variante.', 'Controla la vuelta y evita redondear la espalda o usar rebotes.'] },
  gluteo: { description: 'Movimiento de extensión o abducción de cadera enfocado en glúteos.', instructions: ['Ajusta el apoyo y estabiliza el abdomen antes de mover la cadera.', 'Empuja o separa la pierna sin arquear excesivamente la zona lumbar.', 'Regresa despacio y conserva la tensión durante toda la repetición.'] },
  pantorrilla: { description: 'Ejercicio de flexión plantar para los músculos de la pantorrilla.', instructions: ['Apoya la parte delantera de los pies y estabiliza el cuerpo.', 'Eleva los talones con control y pausa brevemente arriba.', 'Desciende lentamente hasta un estiramiento cómodo, sin rebotes.'] },
  cardio: { description: 'Actividad cardiovascular. Ajusta la velocidad y la resistencia a tu condición física.', instructions: ['Ajusta el equipo y empieza con una intensidad suave.', 'Mantén un ritmo sostenible y una postura natural.', 'Reduce la intensidad gradualmente al terminar y detente si sientes malestar.'] }
};

const MUSCLE_GROUPS = new Set(Object.keys(MUSCLE_GUIDES));
const normalizeName = (name) => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const EXERCISE_GUIDES = new Map(Object.entries({
  'press de banca con barra': ['Empuje horizontal con barra para pecho, tríceps y deltoides anterior.', ['Recuéstate con ojos bajo la barra, pies firmes y escápulas apoyadas y retraídas.', 'Desengancha la barra y bájala con control hacia la parte media del pecho, con muñecas sobre los codos.', 'Empuja la barra hacia arriba manteniendo los pies apoyados; usa un ayudante si entrenas cerca del límite.']],
  'press de banca con mancuernas': ['Empuje horizontal unilateral con mancuernas para pecho y brazos.', ['Apoya espalda y pies en el banco; comienza con las mancuernas a los lados del pecho.', 'Baja con control hasta un rango cómodo y conserva las muñecas alineadas con los antebrazos.', 'Empuja hacia arriba sin chocar las mancuernas ni arquear excesivamente la espalda.']],
  'press inclinado con mancuernas': ['Empuje en banco inclinado para la porción superior del pecho y hombros.', ['Ajusta el respaldo a una inclinación moderada y apoya bien los pies.', 'Baja las mancuernas a los lados de la parte alta del pecho con control.', 'Empuja hacia arriba siguiendo una trayectoria estable, sin bloquear los codos bruscamente.']],
  'sentadilla libre': ['Sentadilla con barra para cuádriceps, glúteos y musculatura del tronco.', ['Apoya la barra de forma estable, toma aire y coloca los pies aproximadamente al ancho de hombros.', 'Lleva la cadera atrás y abajo mientras las rodillas siguen la línea de los pies.', 'Empuja el suelo para volver arriba, conservando el tronco firme y una profundidad cómoda.']],
  'sentadilla goblet': ['Sentadilla sosteniendo una mancuerna o pesa rusa delante del pecho.', ['Sostén la carga cerca del pecho y adopta una base estable.', 'Desciende entre las piernas con las rodillas siguiendo la dirección de los pies.', 'Empuja el suelo para subir sin dejar que la carga se separe del cuerpo.']],
  dominadas: ['Tracción vertical con el peso corporal para espalda y brazos.', ['Cuelga de la barra con un agarre cómodo y activa suavemente los hombros.', 'Lleva los codos hacia abajo y eleva el cuerpo sin balancearte.', 'Desciende con control hasta extender los brazos sin perder la tensión del hombro.']],
  'remo con barra': ['Tracción horizontal con barra para espalda y brazos.', ['Inclina la cadera y mantén la espalda neutra, con rodillas ligeramente flexionadas.', 'Lleva la barra hacia el abdomen acercando los codos al cuerpo.', 'Baja la barra despacio y conserva el torso estable, sin impulsarte.']],
  'remo en polea baja': ['Tracción horizontal en polea para espalda media.', ['Siéntate con el torso erguido y las rodillas ligeramente flexionadas.', 'Tira del agarre hacia el abdomen y junta suavemente las escápulas.', 'Extiende los brazos lentamente sin redondear la espalda.']],
  'jalon al pecho': ['Tracción vertical en polea para espalda y brazos.', ['Sujeta la barra algo más abierta que los hombros y fija los muslos bajo el apoyo.', 'Lleva la barra hacia la parte alta del pecho guiando el movimiento con los codos.', 'Deja subir la barra lentamente sin encoger los hombros ni balancear el tronco.']],
  'peso muerto rumano': ['Bisagra de cadera para isquiotibiales y glúteos.', ['Sostén la barra cerca de los muslos y flexiona ligeramente las rodillas.', 'Lleva la cadera atrás mientras la barra baja pegada a las piernas y la espalda permanece neutra.', 'Empuja la cadera hacia delante para volver arriba, sin hiperextender la espalda.']],
  'peso muerto convencional': ['Levantamiento desde el suelo que involucra piernas, cadera y espalda.', ['Coloca los pies bajo la barra y acerca las tibias; toma aire y fija el tronco.', 'Empuja el suelo y extiende rodillas y cadera mientras la barra sube pegada al cuerpo.', 'Baja la barra con control doblando la cadera primero y después las rodillas.']],
  'hip thrust': ['Extensión de cadera con apoyo de espalda para glúteos.', ['Apoya la parte alta de la espalda en un banco y coloca la carga sobre la cadera con protección.', 'Empuja con los pies y eleva la cadera hasta alinear torso y muslos.', 'Desciende controladamente; evita arquear la zona lumbar al final.']],
  'elevaciones laterales con mancuernas': ['Elevación lateral para deltoides, con mancuernas ligeras.', ['Mantén una postura estable y las mancuernas a los lados del cuerpo.', 'Eleva los brazos hacia los lados hasta una altura cómoda, con codos levemente flexionados.', 'Baja despacio y evita impulsarte o encoger los hombros.']],
  'press militar con barra': ['Empuje vertical con barra para hombros y tríceps.', ['Coloca la barra a la altura de los hombros y fija el abdomen y los glúteos.', 'Empuja la barra sobre la cabeza manteniéndola cerca del rostro.', 'Baja con control hasta la posición inicial sin arquear excesivamente la espalda.']],
  'curl de biceps con barra': ['Flexión de codo con barra para bíceps.', ['Sujeta la barra con las palmas hacia delante y los codos cerca del torso.', 'Flexiona los codos para acercar la barra sin balancear la espalda.', 'Baja la barra lentamente hasta extender los brazos de forma cómoda.']],
  'curl martillo': ['Flexión de codo con agarre neutro para bíceps y braquial.', ['Sujeta las mancuernas con pulgares hacia arriba y torso estable.', 'Flexiona los codos manteniendo las palmas enfrentadas.', 'Desciende lentamente sin mover los hombros hacia delante.']],
  'extensiones en polea': ['Extensión de codo en polea para tríceps.', ['Colócate frente a la polea y mantén los codos cerca del cuerpo.', 'Empuja el agarre hacia abajo hasta extender los codos sin mover los hombros.', 'Regresa lentamente hasta una flexión cómoda y repite.']]
}).map(([name, [description, instructions]]) => [normalizeName(name), { description, instructions }]));

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
    exercises.map(({ id, name, image }) => {
      const guide = EXERCISE_GUIDES.get(normalizeName(name)) || MUSCLE_GUIDES[muscleGroup];
      return { id, name, image, muscleGroup, description: guide.description, instructions: guide.instructions, isCustom: false };
    })
  ),
  ...EXTRA_EXERCISES.map((exercise) => {
    const guide = EXERCISE_GUIDES.get(normalizeName(exercise.name)) || MUSCLE_GUIDES[exercise.muscleGroup];
    return { ...exercise, description: guide.description, instructions: guide.instructions, isCustom: false };
  })
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

const createCustomExercise = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const muscleGroup = String(req.body.muscleGroup || '').trim().toLowerCase();
    const description = String(req.body.description || '').trim();
    const instructions = String(req.body.instructions || '').split('\n').map((step) => step.trim()).filter(Boolean);
    if (name.length < 2 || name.length > 120 || !MUSCLE_GROUPS.has(muscleGroup) || description.length < 10 || description.length > 500 || instructions.length < 2 || instructions.length > 8 || instructions.some((step) => step.length > 240)) {
      return res.status(400).json({ message: 'Completa el nombre, grupo, descripción y entre 2 y 8 pasos breves.' });
    }

    const existing = await Exercise.findAll({ attributes: ['name'] });
    if (existing.some((exercise) => normalizeName(exercise.name) === normalizeName(name))) {
      return res.status(409).json({ message: 'Ya existe un ejercicio con ese nombre.' });
    }

    const exercise = await Exercise.create({
      id: `custom-${crypto.randomUUID()}`,
      name,
      muscleGroup,
      description,
      instructions,
      isCustom: true,
      createdBy: req.user.id_usuario
    });
    return res.status(201).json(exercise);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getExercises, getExercisesByMuscle, getExerciseCatalog, createCustomExercise };