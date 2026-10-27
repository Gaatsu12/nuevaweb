(() => {
  'use strict';

  const { questions, pokemon, traits } = QUIZ;
  const KEYS = ['V', 'C', 'I', 'A', 'L', 'D'];
  const SHINY_CHANCE = 0.10; // 10 %
  const BASE = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait';

  const $ = id => document.getElementById(id);
  const screens = { intro: $('intro'), quiz: $('quiz'), result: $('result') };
  const el = {
    start: $('start'), back: $('back'), again: $('again'),
    count: $('q-count'), bar: $('q-bar'), text: $('q-text'), options: $('q-options'),
    rName: $('r-name'), rText: $('r-text'), rImg: $('r-img'), rLoading: $('r-loading'),
    rFrame: $('r-frame'), rShiny: $('r-shiny'), rSparkles: $('r-sparkles'),
    rTraits: $('r-traits'), rSecond: $('r-second'), portraitWrap: document.querySelector('.portrait-wrap')
  };

  let current = 0;
  let answers = [];       // answers[i] = número de la opción elegida en la pregunta i
  let advancing = false;  // evita dobles clics mientras pasa a la siguiente pregunta

  /* ---------------- Pantallas ---------------- */
  function show(name) {
    Object.entries(screens).forEach(([k, s]) => { s.hidden = k !== name; });
    window.scrollTo({ top: 0 });
  }

  /* ---------------- Preguntas ---------------- */
  function renderQuestion() {
    const q = questions[current];
    el.count.textContent = `Pregunta ${current + 1} de ${questions.length}`;
    el.bar.max = questions.length;
    el.bar.value = current + 1;
    el.text.textContent = q.q;
    el.back.disabled = current === 0;

    el.options.replaceChildren();
    q.o.forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (answers[current] === i ? ' chosen' : '');
      const n = document.createElement('span');
      n.className = 'num';
      n.textContent = i + 1;
      b.append(n, opt[0]);
      b.addEventListener('click', () => choose(i));
      el.options.append(b);
    });
    el.text.focus({ preventScroll: true });
  }

  function choose(i) {
    if (advancing) return;
    advancing = true;
    answers[current] = i;
    [...el.options.children].forEach((b, k) => b.classList.toggle('chosen', k === i));
    setTimeout(() => {
      advancing = false;
      if (current < questions.length - 1) {
        current += 1;
        renderQuestion();
      } else {
        showResult();
      }
    }, 280);
  }

  /* ---------------- Cálculo del resultado ----------------
     1) Sumamos los puntos de cada rasgo según tus respuestas.
     2) Comparamos tu "forma de ser" con el perfil de cada Pokémon
        (correlación: cuanto más se parecen las formas, más puntos). */
  const center = v => { const m = v.reduce((a, b) => a + b, 0) / v.length; return v.map(x => x - m); };

  function scoreAnswers() {
    const s = [0, 0, 0, 0, 0, 0];
    answers.forEach((a, qi) => {
      const pts = questions[qi].o[a][1];
      Object.entries(pts).forEach(([k, v]) => { s[KEYS.indexOf(k)] += v; });
    });
    return s;
  }

  function rank(user) {
    const u = center(user);
    const un = Math.hypot(...u) || 1;
    return pokemon
      .map(p => {
        const pc = center(p.p);
        const pn = Math.hypot(...pc) || 1;
        return { p, sim: pc.reduce((a, x, i) => a + x * u[i], 0) / (pn * un) };
      })
      .sort((a, b) => b.sim - a.sim);
  }

  /* ---------------- Resultado ---------------- */
  function portraitUrl(id, shiny) {
    const n = String(id).padStart(4, '0');
    return shiny ? `${BASE}/${n}/0000/0001/Normal.png` : `${BASE}/${n}/Normal.png`;
  }

  function showResult() {
    const user = scoreAnswers();
    const ranked = rank(user);
    const best = ranked[0].p;
    const second = ranked[1].p;
    const shiny = Math.random() < SHINY_CHANCE;

    show('result');
    screens.result.classList.toggle('shiny', shiny);
    el.rShiny.hidden = !shiny;
    el.rName.textContent = best.name + (shiny ? ' ✨' : '');
    el.rText.textContent = best.text;
    el.rSecond.textContent = `También te pareces un poco a ${second.name}.`;

    // Retrato sacado de Pokémon Mundo Misterioso
    el.rImg.hidden = true;
    el.rLoading.hidden = false;
    el.rLoading.textContent = 'Cargando retrato…';
    el.rImg.className = 'pix';
    el.rImg.alt = `Retrato de ${best.name}${shiny ? ' shiny' : ''} en Pokémon Mundo Misterioso`;
    el.rImg.onload = () => {
      el.rLoading.hidden = true;
      el.rImg.hidden = false;
      el.rImg.classList.add('reveal');
    };
    el.rImg.onerror = () => {
      el.rLoading.hidden = false;
      el.rLoading.textContent = 'No se pudo cargar el retrato. Revisa tu conexión.';
    };
    el.rImg.src = portraitUrl(best.id, shiny);

    sparkles(shiny);
    renderTraits(user);
    el.rName.focus({ preventScroll: true });
  }

  function renderTraits(user) {
    const max = Math.max(...user, 1);
    el.rTraits.replaceChildren();
    const bars = [];
    KEYS.map((k, i) => ({ name: traits[k], v: user[i] }))
      .sort((a, b) => b.v - a.v)
      .forEach(t => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = t.name;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.setAttribute('role', 'img');
        bar.setAttribute('aria-label', `${t.name}: ${Math.round(100 * t.v / max)} %`);
        const fill = document.createElement('i');
        bar.append(fill);
        li.append(label, bar);
        el.rTraits.append(li);
        bars.push([fill, Math.round(100 * t.v / max)]);
      });
    requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach(([f, w]) => { f.style.width = w + '%'; })));
  }

  function sparkles(on) {
    el.rSparkles.replaceChildren();
    if (!on) return;
    const spots = [[-14, 6], [92, 2], [-8, 78], [96, 70], [48, -8], [50, 96]];
    spots.forEach(([x, y], i) => {
      const s = document.createElement('span');
      s.textContent = '✨';
      s.style.left = x + '%';
      s.style.top = y + '%';
      s.style.animationDelay = (i * 0.3) + 's';
      el.rSparkles.append(s);
    });
    el.rSparkles.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  }

  /* ---------------- Botones y teclado ---------------- */
  function startQuiz() {
    current = 0;
    answers = [];
    advancing = false;
    show('quiz');
    renderQuestion();
  }

  el.start.addEventListener('click', startQuiz);
  el.again.addEventListener('click', () => { show('intro'); el.start.focus(); });
  el.back.addEventListener('click', () => {
    if (advancing || current === 0) return;
    current -= 1;
    renderQuestion();
  });

  document.addEventListener('keydown', e => {
    if (screens.quiz.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 4) choose(n - 1);
  });
})();
