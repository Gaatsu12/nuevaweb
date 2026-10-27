(() => {
  'use strict';

  /* ------------------------------------------------------------------
     1. El programa de ejemplo (lo que se ve en el panel de código)
  ------------------------------------------------------------------ */
  const CODE = [
    'public class Main {',
    '    static int doble(int n) {',
    '        int r = n * 2;',
    '        return r;',
    '    }',
    '    public static void main(String[] args) {',
    '        int total = 0;',
    '        for (int i = 1; i <= 3; i++) {',
    '            total = total + doble(i);',
    '        }',
    '        System.out.println(total);',
    '    }',
    '}'
  ];

  /* ------------------------------------------------------------------
     2. La "grabación" de la ejecución: una foto del estado en cada parada
        (línea, pila de llamadas, variables, consola y explicación)
  ------------------------------------------------------------------ */
  function buildTrace() {
    const steps = [];
    let frames = [];
    const out = [];

    const snap = (line, msg, opts = {}) => {
      if (frames.length) frames[frames.length - 1].line = line;
      steps.push({
        line,
        depth: frames.length,
        frames: JSON.parse(JSON.stringify(frames)),
        out: out.slice(),
        msg,
        changed: opts.changed || [],
        ret: !!opts.ret
      });
    };
    const setVar = (frame, n, t, v) => {
      const found = frame.vars.find(x => x.n === n);
      if (found) found.v = String(v);
      else frame.vars.push({ n, t, v: String(v) });
    };

    const main = { name: 'main(String[] args)', line: 7, vars: [{ n: 'args', t: 'String[]', v: '[]' }] };
    frames.push(main);

    snap(7, 'El programa está parado justo ANTES de ejecutar la línea 7 (la línea amarilla). ' +
      'Todavía no existe la variable total: solo ves args.');
    setVar(main, 'total', 'int', 0);
    snap(8, 'La línea 7 ya se ejecutó: total vale 0 (mira el panel Variables). ' +
      'Ahora empieza el for, que creará i con el valor 1.', { changed: ['total'] });

    let total = 0;
    for (let k = 1; k <= 3; k++) {
      if (k > 1) {
        snap(8, `Acabó la vuelta ${k - 1}. El for sube i a ${k} y comprueba que ${k} <= 3.`);
      }
      setVar(main, 'i', 'int', k);
      snap(9, `i vale ${k}. La línea 9 llama al método doble(${k}). ` +
        'Con «Entrar» ves lo que pasa dentro; con «Siguiente línea» se ejecuta de golpe.', { changed: ['i'] });

      const d = { name: 'doble(int n)', line: 3, vars: [{ n: 'n', t: 'int', v: String(k) }] };
      frames.push(d);
      snap(3, `Estamos dentro de doble. Mira la pila de llamadas: hay un escalón nuevo arriba, con n = ${k}.`,
        { changed: ['n'] });

      setVar(d, 'r', 'int', 2 * k);
      snap(4, `r = ${k} * 2 = ${2 * k}. Todavía no hemos vuelto a main.`, { changed: ['r'] });

      frames.pop();
      total += 2 * k;
      setVar(main, 'total', 'int', total);
      snap(9, `doble terminó y devolvió ${2 * k}. Su escalón desaparece de la pila. ` +
        `Ahora total vale ${total}.`, { changed: ['total'], ret: true });
    }

    snap(8, 'Acabó la vuelta 3. i sube a 4 y la condición 4 <= 3 es falsa: el for termina.');
    setVar(main, 'i', 'int', 4);
    snap(11, 'i vale 4 y el for ha terminado. Ahora se imprime total.', { changed: ['i'] });

    out.push(String(total));
    snap(12, `println escribió ${total} en la consola. Ya solo queda salir de main.`, { changed: ['console'] });

    frames = [];
    snap(0, '¡Fin! El programa terminó y la JVM se cerró. Pulsa «Reiniciar» para repetirlo.');
    return steps;
  }

  const steps = buildTrace();
  const LAST = steps.length - 1;
  const EXEC = new Set(steps.map(s => s.line).filter(n => n > 0));

  /* ------------------------------------------------------------------
     3. Estado de la aplicación
  ------------------------------------------------------------------ */
  const $ = id => document.getElementById(id);
  const el = {
    code: $('code'), vars: $('vars'), varsOwner: $('vars-owner'), stack: $('stack'),
    console: $('console'), explain: $('explain'), status: $('status'), wire: $('wire'),
    track: $('track'), packet: $('packet'), ide: $('box-ide'), jvm: $('box-jvm'), demo: $('b-demo')
  };
  const buttons = {};
  document.querySelectorAll('.toolbar [data-act]').forEach(b => { buttons[b.dataset.act] = b; });

  const breakpoints = new Set([7]);
  let idx = -1;          // -1 = programa sin iniciar
  let stops = 0;         // número de paradas
  let sel = null;        // escalón de la pila elegido (null = el de arriba)
  let note = '';         // aviso extra bajo la explicación
  let busy = false;
  let auto = false;
  let prevDepth = 0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const atEnd = () => idx === LAST;

  /* ------------------------------------------------------------------
     4. Dibujar el código con colores y los botones de breakpoint
  ------------------------------------------------------------------ */
  function highlight(text) {
    const frag = document.createDocumentFragment();
    const re = /(\/\/.*)|("[^"]*")|\b(public|class|static|int|void|for|return)\b|\b(\d+)\b|\b(String|System|Main)\b/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.append(text.slice(last, m.index));
      const sp = document.createElement('span');
      sp.className = m[1] ? 'tk-c' : m[2] ? 'tk-s' : m[3] ? 'tk-k' : m[4] ? 'tk-n' : 'tk-t';
      sp.textContent = m[0];
      frag.append(sp);
      last = re.lastIndex;
    }
    if (last < text.length) frag.append(text.slice(last));
    return frag;
  }

  const lineEls = CODE.map((text, i) => {
    const n = i + 1;
    const li = document.createElement('li');
    const bp = document.createElement('button');
    bp.type = 'button';
    bp.className = 'bp';
    if (EXEC.has(n)) {
      bp.setAttribute('aria-label', `Breakpoint en la línea ${n}`);
      bp.addEventListener('click', () => toggleBreakpoint(n));
    } else {
      bp.disabled = true;
      bp.setAttribute('aria-label', `Línea ${n}: aquí no se puede poner breakpoint`);
    }
    const ln = document.createElement('span');
    ln.className = 'ln';
    ln.textContent = n;
    const code = document.createElement('code');
    code.style.background = 'none';
    code.style.padding = '0';
    code.append(highlight(text));
    li.append(bp, ln, code);
    el.code.append(li);
    return { li, bp };
  });

  /* ------------------------------------------------------------------
     5. Animación de los mensajes IDE <-> JVM
  ------------------------------------------------------------------ */
  let curAnim = null;

  function addLog(from, text) {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.className = from;
    b.textContent = from === 'ide' ? 'IDE → JVM: ' : 'JVM → IDE: ';
    li.append(b, text);
    el.wire.prepend(li);
    while (el.wire.children.length > 5) el.wire.lastChild.remove();
  }

  async function ping(from, shortText, longText) {
    addLog(from, longText || shortText);
    el.ide.classList.remove('hot');
    el.jvm.classList.remove('hot');
    if (curAnim) curAnim.cancel();
    if (reduceMotion) {
      (from === 'ide' ? el.jvm : el.ide).classList.add('hot');
      return;
    }
    el.packet.textContent = shortText;
    el.packet.dataset.from = from;
    el.packet.style.opacity = 1;
    const w = Math.max(0, el.track.clientWidth - el.packet.offsetWidth);
    const a = from === 'ide' ? 0 : w;
    const b = from === 'ide' ? w : 0;
    curAnim = el.packet.animate(
      [{ transform: `translate(${a}px,-50%)` }, { transform: `translate(${b}px,-50%)` }],
      { duration: 450, easing: 'ease-in-out', fill: 'forwards' }
    );
    try { await curAnim.finished; } catch (e) { return; }
    el.packet.style.opacity = 0;
    (from === 'ide' ? el.jvm : el.ide).classList.add('hot');
  }

  /* ------------------------------------------------------------------
     6. Qué hace cada botón
  ------------------------------------------------------------------ */
  const ASK = {
    start: ['START', 'Arranca el programa en modo depuración y avísame cuando pares.'],
    cont: ['CONTINUE', 'Sigue ejecutando hasta el próximo breakpoint (o hasta el final).'],
    over: ['STEP OVER', 'Ejecuta UNA línea completa (los métodos de esa línea, de golpe).'],
    into: ['STEP INTO', 'Ejecuta una línea y, si llama a un método, entra en él.'],
    out: ['STEP OUT', 'Termina el método actual y párate al volver a quien lo llamó.']
  };

  function firstStop() {
    for (let j = 0; j <= LAST; j++) {
      if (breakpoints.has(steps[j].line) && !steps[j].ret) return { j, bp: true };
    }
    return { j: 0, bp: false, entry: true };
  }

  function findTarget(kind) {
    const cur = steps[idx];
    if (kind === 'into') return { j: Math.min(idx + 1, LAST), bp: false };
    for (let j = idx + 1; j <= LAST; j++) {
      const s = steps[j];
      const isBp = s.line > 0 && breakpoints.has(s.line) && !s.ret;
      if (isBp) return { j, bp: true };
      if (kind === 'over' && s.depth <= cur.depth && !(s.ret && cur.depth <= s.depth)) return { j, bp: false };
      if (kind === 'out' && s.depth < cur.depth) return { j, bp: false };
    }
    return { j: LAST, bp: false };
  }

  async function act(kind) {
    if (busy) return;
    busy = true;
    refreshButtons();

    const target = kind === 'start' ? firstStop() : findTarget(kind);
    const s = steps[target.j];

    await ping('ide', ASK[kind][0], ASK[kind][1]);

    const replyShort = s.line === 0 ? 'FIN' : target.bp ? `BREAKPOINT · línea ${s.line}` : `PARADO · línea ${s.line}`;
    const replyLong = s.line === 0
      ? 'El programa terminó.'
      : `Me paré en la línea ${s.line}. Aquí tienes la pila y las variables.`;
    await ping('jvm', replyShort, replyLong);

    prevDepth = idx >= 0 ? steps[idx].depth : 0;
    idx = target.j;
    sel = null;
    stops += 1;
    note = target.bp ? 'breakpoint' : target.entry ? 'entry' : '';
    render();

    busy = false;
    refreshButtons();
  }

  async function toggleBreakpoint(n) {
    const adding = !breakpoints.has(n);
    if (adding) breakpoints.add(n); else breakpoints.delete(n);
    render();
    await ping('ide', adding ? `BREAKPOINT +${n}` : `BREAKPOINT −${n}`,
      adding ? `Pon un breakpoint en la línea ${n}.` : `Quita el breakpoint de la línea ${n}.`);
    await ping('jvm', 'OK', 'Anotado. Pararé ahí cuando llegue.');
  }

  function reset() {
    if (busy) return;
    auto = false;
    idx = -1; stops = 0; sel = null; note = ''; prevDepth = 0;
    if (curAnim) curAnim.cancel();
    el.packet.style.opacity = 0;
    el.ide.classList.remove('hot');
    el.jvm.classList.remove('hot');
    addLog('ide', 'Termina el programa y desconecta el depurador.');
    render();
    refreshButtons();
  }

  async function toggleDemo() {
    if (auto) { auto = false; refreshButtons(); return; }
    if (busy) return;
    auto = true;
    refreshButtons();
    if (atEnd()) { idx = -1; stops = 0; render(); }
    if (idx < 0) { await act('start'); await sleep(1100); }
    while (auto && !atEnd()) {
      await act('into');
      await sleep(1100);
    }
    auto = false;
    refreshButtons();
  }

  /* ------------------------------------------------------------------
     7. Pintar la pantalla según el estado
  ------------------------------------------------------------------ */
  function refreshButtons() {
    const started = idx >= 0;
    const ended = atEnd();
    const lock = busy || auto;
    buttons.start.disabled = lock || started;
    ['cont', 'over', 'into', 'out'].forEach(k => { buttons[k].disabled = lock || !started || ended; });
    buttons.reset.disabled = busy || auto || !started;
    el.demo.disabled = busy && !auto;
    el.demo.firstChild.nodeValue = auto ? '⏹ Parar demo' : '🎬 Demo automática';
  }

  function cell(tag, text, cls) {
    const c = document.createElement(tag);
    c.textContent = text;
    if (cls) c.className = cls;
    return c;
  }

  function render() {
    const s = idx >= 0 ? steps[idx] : null;
    const ended = s && s.line === 0;
    const top = s ? s.frames.length - 1 : -1;
    const shown = s && s.frames.length ? (sel === null ? top : sel) : -1;
    const viewingTop = shown === top;

    // Estado
    el.status.textContent = !s ? 'Sin iniciar' : ended ? 'Programa terminado' : `En pausa · parada nº ${stops}`;
    el.status.className = 'chip' + (!s ? '' : ended ? ' end' : ' run');

    // Código
    lineEls.forEach(({ li, bp }, i) => {
      const n = i + 1;
      li.classList.toggle('cur', !!s && s.line === n);
      const selLine = s && shown >= 0 && !viewingTop ? s.frames[shown].line : -1;
      li.classList.toggle('sel', selLine === n);
      bp.setAttribute('aria-pressed', breakpoints.has(n) ? 'true' : 'false');
    });

    // Variables
    el.vars.replaceChildren();
    if (shown >= 0) {
      const f = s.frames[shown];
      el.varsOwner.textContent = `de ${f.name}`;
      f.vars.forEach(v => {
        const tr = document.createElement('tr');
        if (viewingTop && s.changed.includes(v.n)) tr.className = 'changed';
        tr.append(cell('td', v.n), cell('td', v.t), cell('td', v.v));
        el.vars.append(tr);
      });
    } else {
      el.varsOwner.textContent = '';
      const tr = document.createElement('tr');
      const td = cell('td', s ? 'No queda ninguna variable: el programa acabó.' : 'El programa aún no se está ejecutando.', 'empty');
      td.colSpan = 3;
      tr.append(td);
      el.vars.append(tr);
    }

    // Pila de llamadas (el escalón de arriba es el método que se está ejecutando)
    el.stack.replaceChildren();
    if (s && s.frames.length) {
      for (let i = top; i >= 0; i--) {
        const f = s.frames[i];
        const li = document.createElement('li');
        if (i === top && s.depth > prevDepth && stops > 1) li.className = 'new';
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-pressed', i === shown ? 'true' : 'false');
        b.append(f.name);
        const small = document.createElement('small');
        small.textContent = `línea ${f.line}` + (i === top ? ' · se está ejecutando' : ' · espera a que termine el de arriba');
        b.append(small);
        b.addEventListener('click', () => { sel = i; render(); });
        li.append(b);
        el.stack.append(li);
      }
    } else {
      const li = cell('li', s ? 'La pila está vacía.' : 'Vacía: nada se está ejecutando.', 'empty');
      el.stack.append(li);
    }

    // Consola
    const text = s ? s.out.join('\n') : '';
    const was = el.console.textContent;
    el.console.textContent = text || (s ? '(sin salida todavía)' : '');
    el.console.classList.remove('changed');
    if (s && s.changed.includes('console') && was !== el.console.textContent) {
      void el.console.offsetWidth;
      el.console.classList.add('changed');
    }

    // Explicación
    el.explain.replaceChildren();
    if (!s) {
      el.explain.append('👋 El programa suma el doble de 1, 2 y 3 (2 + 4 + 6). ' +
        'Hay un 🔴 breakpoint en la línea 7: el depurador parará ahí. Pulsa «Iniciar depuración».');
    } else {
      el.explain.append(s.msg);
      if (note === 'breakpoint') {
        const t = cell('span', '🔴 Breakpoint', 'tag');
        el.explain.append(' ', t, ' Se paró aquí porque pusiste un breakpoint en esta línea.');
      } else if (note === 'entry') {
        el.explain.append(' (No había breakpoints, así que el depurador paró en la primera línea.)');
      }
      if (!viewingTop) el.explain.append(' ℹ️ Estás mirando un escalón anterior de la pila: sus variables y su línea (en azul).');
    }

    refreshButtons();
  }

  /* ------------------------------------------------------------------
     8. Conectar los botones
  ------------------------------------------------------------------ */
  Object.entries(buttons).forEach(([k, b]) => {
    b.addEventListener('click', () => (k === 'reset' ? reset() : act(k)));
  });
  el.demo.addEventListener('click', toggleDemo);

  render();
})();
