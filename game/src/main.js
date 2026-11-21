// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between four screens: title, play, win and game over.
//
// ?seed=N fixes the hint's pick. ?shot=start|play|play2|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, FIELD, PANEL, STEP } from './config.js';
import { createRandom } from './random.js';
import { clickAt, createWorld, PHASE_OVER, PHASE_PLAY, PHASE_TITLE, PHASE_WIN, startRound, tick, useHint } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_RESTART, createInput } from './input.js';
import { BUTTONS, createRenderer, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
createRandom(seed); // The scene is fixed; the seed only steadies the hint pick.

// --- Tiny synthesised sounds (WebAudio, no audio files, no network). ---
let audioCtx = null;
function beep(freq, dur, type = 'sine', when = 0, vol = 0.12) {
  try {
    audioCtx = audioCtx ?? new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + when;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // Audio is a garnish; a browser without it still plays.
  }
}
const sfx = {
  found() { beep(660, 0.12); beep(880, 0.18, 'sine', 0.09); },
  miss() { beep(140, 0.18, 'square', 0, 0.06); },
  hint() { beep(520, 0.1, 'triangle'); },
  win() { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.16, 'sine', i * 0.11)); },
  over() { [392, 330, 262].forEach((f, i) => beep(f, 0.2, 'triangle', i * 0.14)); },
};

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Map a canvas-logical point to a panel and panel-local scene coordinates. */
function panelAt(lx, ly) {
  for (const [panel, px] of [['left', PANEL.leftX], ['right', PANEL.rightX]]) {
    if (lx >= px && lx < px + PANEL.width && ly >= PANEL.y && ly < PANEL.y + PANEL.height) {
      const sx = ((lx - px - 6) * 600) / (PANEL.width - 12);
      const sy = ((ly - PANEL.y - 6) * 500) / (PANEL.height - 12);
      if (sx >= 0 && sx < 600 && sy >= 0 && sy < 500) return { panel, x: sx, y: sy };
    }
  }
  return null;
}

function inButton(lx, ly, b) {
  return lx >= b.x && lx < b.x + b.w && ly >= b.y && ly < b.y + b.h;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, readBest());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    startRound(world);
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences.');
  }

  function finish() {
    if (world.phase === PHASE_WIN) {
      screen = SCREEN_WIN;
      sfx.win();
      if (world.score > best) {
        best = world.score;
        saveBest(best);
      }
      announce(`You found them all. Score ${world.score}. Best ${best}.`);
    } else if (world.phase === PHASE_OVER) {
      screen = SCREEN_OVER;
      sfx.over();
      if (world.score > best) {
        best = world.score;
        saveBest(best);
      }
      announce(`Time's up. You found ${world.found.size} of 7. Score ${world.score}.`);
    }
  }

  function handleClicks() {
    const rect = canvas.getBoundingClientRect();
    const scaleX = FIELD.width / rect.width;
    const scaleY = FIELD.height / rect.height;
    for (const click of input.takeClicks()) {
      const lx = click.x * scaleX;
      const ly = click.y * scaleY;
      if (inButton(lx, ly, BUTTONS.restart)) {
        startGame();
        continue;
      }
      if (inButton(lx, ly, BUTTONS.hint)) {
        if (screen === SCREEN_PLAY && useHint(world)) sfx.hint();
        continue;
      }
      if (screen === SCREEN_TITLE || screen === SCREEN_WIN || screen === SCREEN_OVER) {
        startGame();
        continue;
      }
      if (screen !== SCREEN_PLAY) continue;
      const hit = panelAt(lx, ly);
      if (!hit) continue;
      const result = clickAt(world, hit.panel, hit.x, hit.y);
      if (!result) continue;
      if (result.kind === 'found') sfx.found();
      else if (result.kind === 'miss') sfx.miss();
      else if (result.kind === 'win') finish();
      else if (result.kind === 'over') finish();
      if (world.phase === PHASE_WIN || world.phase === PHASE_OVER) finish();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_RESTART) {
      startGame();
      return;
    }
    if (actions & ACTION_HINT) {
      if (screen === SCREEN_PLAY && useHint(world)) sfx.hint();
      return;
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_WIN || screen === SCREEN_OVER)) {
      startGame();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    while (accumulator >= STEP && screen === SCREEN_PLAY) {
      const event = tick(world, STEP);
      accumulator -= STEP;
      if (event === 'over') {
        finish();
        break;
      }
    }
    if (screen !== SCREEN_PLAY) accumulator = 0;
    renderer.draw(world, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      // The clock keeps running; nothing to pause for a timed round.
    }
  });

  announce('Sunny Garden spot the difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
