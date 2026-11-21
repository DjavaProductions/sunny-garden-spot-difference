// Keyboard and mouse input. Clicks are reported in canvas pixels; the caller
// maps them to panel-local coordinates. Keys: H hint, R restart, Space/Enter
// confirm (start / play again), P or Esc pause is not needed for a timed round
// (the clock keeps running), so Esc restarts instead.

export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_RESTART = 4;

export function createInput(canvas) {
  let actions = 0;
  const clicks = [];

  function onPointer(event) {
    const rect = canvas.getBoundingClientRect();
    clicks.push({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  function onKey(event) {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (key === 'h') {
      actions |= ACTION_HINT;
    } else if (key === 'r' || key === 'escape') {
      actions |= ACTION_RESTART;
    }
  }

  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);

  return {
    takeActions() {
      const a = actions;
      actions = 0;
      return a;
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
