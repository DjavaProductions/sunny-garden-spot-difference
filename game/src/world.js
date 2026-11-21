// The game state: what has been found, the clock, the score, hints and misses.
// A round is one scene (the same garden, left and right pictures) with seven
// differences. The world is pure data; rendering reads it, input writes to it.

import { DIFFERENCES, HINTS, HIT_RADIUS, MISS_PENALTY, POINTS_PER_FIND, TIME_BONUS_PER_SECOND, TIME_LIMIT } from './config.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_WIN = 'win';
export const PHASE_OVER = 'over';

export function createWorld() {
  return {
    phase: PHASE_TITLE,
    found: new Set(),
    foundOrder: [],
    score: 0,
    best: 0,
    timeLeft: TIME_LIMIT,
    hintsLeft: HINTS,
    hintId: null,
    hintUntil: 0,
    misses: 0,
    /** Wrong-click marks: {x, y, panel, until} in panel-local coords. */
    marks: [],
    /** Floating "+100" popups: {x, y, panel, text, until}. */
    pops: [],
    message: '',
    messageUntil: 0,
    now: 0,
  };
}

export function startRound(world) {
  world.phase = PHASE_PLAY;
  world.found = new Set();
  world.foundOrder = [];
  world.score = 0;
  world.timeLeft = TIME_LIMIT;
  world.hintsLeft = HINTS;
  world.hintId = null;
  world.marks = [];
  world.pops = [];
  world.misses = 0;
  world.message = 'Find 7 differences — click one in either picture.';
  world.messageUntil = world.now + 4;
}

/** Advance the clock and expire transient marks. Returns 'over' when time runs out. */
export function tick(world, dt) {
  world.now += dt;
  if (world.phase !== PHASE_PLAY) return null;
  world.timeLeft -= dt;
  if (world.hintId && world.now >= world.hintUntil) world.hintId = null;
  world.marks = world.marks.filter((m) => world.now < m.until);
  world.pops = world.pops.filter((p) => world.now < p.until);
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.phase = PHASE_OVER;
    return 'over';
  }
  return null;
}

function nearestDifference(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const d of DIFFERENCES) {
    const dx = x - d.at.x;
    const dy = y - d.at.y;
    const dist = Math.hypot(dx, dy);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return bestD <= HIT_RADIUS ? best : null;
}

/** A click inside a panel (panel-local x, y; panel is 'left' or 'right'). */
export function clickAt(world, panel, x, y) {
  if (world.phase !== PHASE_PLAY) return null;
  const d = nearestDifference(x, y);
  if (d && !world.found.has(d.id)) {
    world.found.add(d.id);
    world.foundOrder.push(d.id);
    world.score += POINTS_PER_FIND;
    world.pops.push({ x: d.at.x, y: d.at.y, panel, text: `+${POINTS_PER_FIND}`, until: world.now + 1.1 });
    world.message = `Found: ${d.label}! ${DIFFERENCES.length - world.found.size} to go.`;
    world.messageUntil = world.now + 3;
    if (world.found.size === DIFFERENCES.length) {
      const bonus = Math.round(world.timeLeft) * TIME_BONUS_PER_SECOND;
      world.score += bonus;
      world.phase = PHASE_WIN;
      return { kind: 'win', bonus };
    }
    return { kind: 'found', id: d.id };
  }
  if (d && world.found.has(d.id)) return { kind: 'already' };
  world.misses += 1;
  world.timeLeft = Math.max(0, world.timeLeft - MISS_PENALTY);
  world.marks.push({ x, y, panel, until: world.now + 0.7 });
  world.message = `Not a difference — minus ${MISS_PENALTY}s.`;
  world.messageUntil = world.now + 2;
  if (world.timeLeft <= 0) {
    world.phase = PHASE_OVER;
    return { kind: 'over' };
  }
  return { kind: 'miss' };
}

/** Spend one hint: pulse a ring on an unfound difference for a few seconds. */
export function useHint(world) {
  if (world.phase !== PHASE_PLAY || world.hintsLeft <= 0) return null;
  const remaining = DIFFERENCES.filter((d) => !world.found.has(d.id));
  if (remaining.length === 0) return null;
  world.hintsLeft -= 1;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  world.hintId = pick.id;
  world.hintUntil = world.now + 2.5;
  world.message = `Hint: look near "${pick.label}".`;
  world.messageUntil = world.now + 2.5;
  return pick.id;
}

export function foundCount(world) {
  return world.found.size;
}
