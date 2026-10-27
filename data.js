/* Datos del test: rasgos, preguntas y Pokémon.
   Rasgos: V valiente · C calmado · I ingenioso · A amistoso · L libre/juguetón · D disciplinado */
const QUIZ = {
  traits: {
    V: 'Valentía', C: 'Calma', I: 'Ingenio', A: 'Amistad', L: 'Libertad', D: 'Disciplina'
  },

  questions: [
    { q: 'Despiertas en un lugar desconocido y no recuerdas nada. ¿Qué haces?', o: [
      ['Salgo a explorar ahora mismo', { V: 2, L: 1 }],
      ['Me quedo quieto y respiro hondo hasta calmarme', { C: 2, D: 1 }],
      ['Observo todo buscando pistas', { I: 2, D: 1 }],
      ['Busco a alguien con quien hablar', { A: 2, L: 1 }]] },
    { q: 'Un amigo está en peligro dentro de una mazmorra. ¿Qué haces?', o: [
      ['Me lanzo a salvarle sin pensarlo', { V: 2, A: 1 }],
      ['Hago un plan rápido y seguro', { I: 2, D: 1 }],
      ['Mantengo la calma y le ayudo paso a paso', { C: 2, A: 1 }],
      ['Le animo a gritos y pido ayuda', { A: 2, L: 1 }]] },
    { q: '¿Cómo es tu día ideal?', o: [
      ['Una gran aventura nueva', { V: 1, L: 2 }],
      ['Una siesta y una comida riquísima', { C: 2, L: 1 }],
      ['Resolver un buen rompecabezas', { I: 2, D: 1 }],
      ['Pasarlo con todos mis amigos', { A: 2, L: 1 }]] },
    { q: 'En el gremio de exploradores, ¿qué misión eliges?', o: [
      ['La más difícil de todas', { V: 2, D: 1 }],
      ['Ordenar y organizar los avisos', { D: 2, C: 1 }],
      ['Buscar tesoros escondidos', { I: 1, L: 2 }],
      ['Cuidar de los más pequeños', { A: 2, C: 1 }]] },
    { q: 'Encuentras un cofre misterioso. ¿Qué haces?', o: [
      ['Lo abro ya, ¡qué emoción!', { L: 2, V: 1 }],
      ['Lo examino por si es una trampa', { I: 2, D: 1 }],
      ['Se lo enseño a todo el grupo', { A: 2, D: 1 }],
      ['Espero tranquilo a ver qué pasa', { C: 2, I: 1 }]] },
    { q: 'Un rival te reta a un combate. ¿Cómo respondes?', o: [
      ['Acepto, ¡voy a ganar!', { V: 2, L: 1 }],
      ['Le gasto una broma y me río', { L: 2, I: 1 }],
      ['Primero entreno para estar listo', { D: 2, V: 1 }],
      ['Intento hacerme su amigo', { A: 2, C: 1 }]] },
    { q: '¿Cuál es tu mayor virtud?', o: [
      ['Mi valor', { V: 2, D: 1 }],
      ['Mi paciencia', { C: 2, D: 1 }],
      ['Mi ingenio', { I: 2, L: 1 }],
      ['Mi bondad', { A: 2, C: 1 }]] },
    { q: 'Vas a hacer un viaje largo. ¿Cómo lo preparas?', o: [
      ['Con un plan detallado y horarios', { D: 2, I: 1 }],
      ['Improviso sobre la marcha', { L: 2, V: 1 }],
      ['Me da igual el sitio si voy con mis amigos', { A: 2, L: 1 }],
      ['Llevo lo justo y voy a mi ritmo', { C: 2, D: 1 }]] },
    { q: 'Ves una trampa en medio del camino. ¿Qué haces?', o: [
      ['La cruzo corriendo', { V: 2, L: 1 }],
      ['Busco otro camino con ingenio', { I: 2, C: 1 }],
      ['Avanzo con calma, paso a paso', { C: 2, D: 1 }],
      ['La convierto en un juego', { L: 2, A: 1 }]] },
    { q: 'Un compañero se equivoca y fallamos la misión. ¿Qué haces?', o: [
      ['Le digo que no pasa nada, la próxima irá mejor', { A: 2, C: 1 }],
      ['Analizo qué falló para no repetirlo', { I: 1, D: 2 }],
      ['Me lo tomo con humor', { L: 2, C: 1 }],
      ['Lo intento otra vez con más fuerza', { V: 2, D: 1 }]] },
    { q: '¿Cuál es tu rincón favorito?', o: [
      ['La cima de una montaña', { V: 2, L: 1 }],
      ['Un bosque tranquilo', { C: 2, A: 1 }],
      ['Un taller o biblioteca secreta', { I: 2, D: 1 }],
      ['Una plaza llena de gente', { A: 2, L: 1 }]] },
    { q: 'Si pudieras tener un superpoder, ¿cuál elegirías?', o: [
      ['Una fuerza enorme', { V: 2, D: 1 }],
      ['Leer la mente de los demás', { I: 2, A: 1 }],
      ['Volar libremente', { L: 2, V: 1 }],
      ['Curar a todo el mundo', { A: 2, C: 1 }]] },
    { q: 'Todos discuten a tu alrededor. ¿Qué haces?', o: [
      ['Pongo orden con voz firme', { D: 2, V: 1 }],
      ['Me aparto hasta que pase', { C: 2, I: 1 }],
      ['Cambio de tema con una gracia', { L: 2, A: 1 }],
      ['Busco un trato que contente a todos', { I: 1, A: 2 }]] },
    { q: '¿Cómo es tu mochila?', o: [
      ['Llena de cosas para ayudar a otros', { A: 2, D: 1 }],
      ['Perfectamente ordenada', { D: 2, C: 1 }],
      ['Un desastre, pero muy divertido', { L: 2, C: 1 }],
      ['Con trucos y objetos raros', { I: 2, L: 1 }]] },
    { q: 'Te dan un premio. ¿Cómo reaccionas?', o: [
      ['Salto de alegría', { L: 2, A: 1 }],
      ['Lo comparto con todos', { A: 2, C: 1 }],
      ['Doy las gracias y sigo entrenando', { D: 2, V: 1 }],
      ['Sonrío, discreto y feliz', { C: 2, I: 1 }]] },
    { q: 'Estalla una tormenta dentro de la mazmorra.', o: [
      ['¡Me divierto saltando en los charcos!', { L: 2, V: 1 }],
      ['Busco refugio y espero', { C: 2, D: 1 }],
      ['Uso lo que hay alrededor para protegerme', { I: 2, D: 1 }],
      ['Protejo a los demás con mi cuerpo', { V: 2, A: 1 }]] },
    { q: '¿Qué es lo que más te molesta?', o: [
      ['Que me digan lo que tengo que hacer', { L: 2, V: 1 }],
      ['El desorden', { D: 2, I: 1 }],
      ['Estar solo', { A: 2, L: 1 }],
      ['Las prisas', { C: 2, D: 1 }]] },
    { q: 'Eres jefe de un equipo de rescate. ¿Qué tipo de jefe eres?', o: [
      ['El valiente que va delante de todos', { V: 2, A: 1 }],
      ['El estratega que da órdenes desde atrás', { I: 2, D: 1 }],
      ['El entrenador estricto pero justo', { D: 2, V: 1 }],
      ['El amigo que alegra al grupo', { A: 1, L: 2 }]] },
    { q: 'Es la hora del descanso en el campamento.', o: [
      ['Me tumbo a mirar las estrellas', { C: 2, L: 1 }],
      ['Cuento historias a los demás', { A: 2, I: 1 }],
      ['Practico mis movimientos', { D: 2, V: 1 }],
      ['Gasto bromas a mis amigos', { L: 2, I: 1 }]] },
    { q: 'Última pregunta: ¿cuál es tu lema?', o: [
      ['«¡Nunca me rindo!»', { V: 2, D: 1 }],
      ['«Todo llega con calma»', { C: 2, A: 1 }],
      ['«Siempre hay una solución»', { I: 2, L: 1 }],
      ['«Juntos somos más fuertes»', { A: 2, V: 1 }]] }
  ],

  /* p = perfil [V, C, I, A, L, D] (0 a 5) · id = número en la Pokédex */
  pokemon: [
    { id: 25,  name: 'Pikachu',    p: [3, 0, 1, 5, 3, 1], text: 'Eres alegre, leal y lleno de energía. Donde vas tú, el grupo se anima.' },
    { id: 4,   name: 'Charmander', p: [5, 0, 1, 2, 2, 3], text: 'Tienes un corazón de fuego: valiente, apasionado y siempre listo para la aventura.' },
    { id: 7,   name: 'Squirtle',   p: [3, 2, 1, 4, 1, 4], text: 'Eres un compañero fiel y responsable. Proteges a los tuyos y cumples lo que prometes.' },
    { id: 1,   name: 'Bulbasaur',  p: [1, 5, 2, 4, 0, 3], text: 'Eres paciente y cuidas de los demás. Tu calma ayuda a que todo crezca.' },
    { id: 133, name: 'Eevee',      p: [1, 1, 3, 3, 5, 0], text: 'Eres curioso y te adaptas a todo. Todavía no sabes en qué te convertirás, y eso es genial.' },
    { id: 52,  name: 'Meowth',     p: [1, 0, 5, 1, 4, 1], text: 'Eres listo, ambicioso y siempre tienes un plan (o tres). Nadie te deja sin salida.' },
    { id: 54,  name: 'Psyduck',    p: [0, 4, 0, 3, 5, 0], text: 'Vives a tu aire, algo despistado y muy simpático. Cuando menos se espera, ¡sorprendes!' },
    { id: 143, name: 'Snorlax',    p: [2, 5, 0, 2, 3, 0], text: 'Disfrutas de la vida sin prisas. Eres tranquilo, fuerte y gran amante de la comida.' },
    { id: 94,  name: 'Gengar',     p: [2, 0, 5, 0, 5, 0], text: 'Eres travieso y muy ingenioso. Te encanta gastar bromas y salirte con la tuya.' },
    { id: 448, name: 'Lucario',    p: [4, 3, 2, 1, 0, 5], text: 'Eres disciplinado, noble y de palabra. Entrenas duro y te guías por tu sentido de la justicia.' },
    { id: 151, name: 'Mew',        p: [0, 1, 4, 4, 5, 0], text: 'Eres juguetón, curioso y libre. Haces amigos en todas partes y siempre descubres algo nuevo.' },
    { id: 359, name: 'Absol',      p: [3, 3, 3, 0, 0, 4], text: 'Eres reservado y serio. No hablas mucho, pero siempre estás ahí cuando hace falta.' },
    { id: 282, name: 'Gardevoir',  p: [3, 4, 3, 5, 0, 3], text: 'Eres empático y protector. Entiendes lo que sienten los demás y darías todo por ellos.' },
    { id: 150, name: 'Mewtwo',     p: [4, 2, 5, 0, 0, 5], text: 'Eres intenso y perfeccionista. Tienes una mente brillante y metas muy altas.' },
    { id: 158, name: 'Totodile',   p: [4, 0, 0, 3, 5, 1], text: 'Eres divertido, ruidoso y muy atrevido. Con tu energía nadie se aburre.' },
    { id: 252, name: 'Treecko',    p: [2, 3, 5, 0, 1, 3], text: 'Eres sereno, rápido de mente y muy seguro de ti mismo. Siempre mantienes la cabeza fría.' }
  ]
};

if (typeof module !== 'undefined') module.exports = QUIZ;
