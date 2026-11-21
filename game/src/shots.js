// The screenshot scenes behind ?shot=start|play|play2|end. Each one sets the
// world to a fixed, honest state — the same state a real player reaches — and
// the renderer paints it, so the frame is what a short game really looks like
// and the same seed always gives the same frame.

import { DIFFERENCES, POINTS_PER_FIND, TIME_BONUS_PER_SECOND } from './config.js';
import { PHASE_OVER, PHASE_PLAY, PHASE_TITLE, PHASE_WIN } from './world.js';

function applyFound(world, ids, timeLeft) {
  world.phase = PHASE_PLAY;
  world.found = new Set(ids);
  world.foundOrder = [...ids];
  world.score = ids.length * POINTS_PER_FIND;
  world.timeLeft = timeLeft;
  world.hintsLeft = 3;
  world.hintId = null;
  world.marks = [];
  world.pops = [];
  world.misses = 0;
  world.message = '';
  world.messageUntil = 0;
}

/**
 * Set `world` to the named scene (start, play, play2 or end; any other name is
 * start) and return the screen to draw over it.
 */
export function stageShot(name, world) {
  world.now = 0;
  if (name === 'play') {
    applyFound(world, ['sunglasses', 'curtain', 'flower'], 84);
    return { screen: PHASE_PLAY };
  }
  if (name === 'play2') {
    applyFound(world, ['sunglasses', 'bird', 'curtain', 'apple', 'flower'], 52);
    return { screen: PHASE_PLAY };
  }
  if (name === 'end') {
    applyFound(world, DIFFERENCES.map((d) => d.id), 41);
    world.score += Math.round(world.timeLeft) * TIME_BONUS_PER_SECOND;
    world.phase = PHASE_WIN;
    return { screen: PHASE_WIN };
  }
  if (name === 'over') {
    applyFound(world, ['sunglasses', 'curtain'], 0);
    world.phase = PHASE_OVER;
    return { screen: PHASE_OVER };
  }
  world.phase = PHASE_TITLE;
  world.found = new Set();
  world.foundOrder = [];
  world.score = 0;
  world.timeLeft = 120;
  world.hintsLeft = 3;
  world.hintId = null;
  world.marks = [];
  world.pops = [];
  world.misses = 0;
  world.message = '';
  world.messageUntil = 0;
  return { screen: PHASE_TITLE };
}
