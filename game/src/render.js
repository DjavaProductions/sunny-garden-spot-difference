// Paints the whole game: header, the two pictures, footer, and the title /
// win / game-over overlays. The logical field is 1280x720; the canvas element
// is that size and CSS scales it to the window.

import { DIFFERENCES, FIELD, FONT, FOOTER, HEADER, PALETTE, PANEL } from './config.js';
import { drawPanel } from './scene.js';
import { PHASE_PLAY } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawButton(x, y, w, h, label, enabled) {
    ctx.fillStyle = enabled ? PALETTE.button : '#b9b2a0';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = PALETTE.buttonText;
    ctx.font = `600 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  }

  function drawHeader(world) {
    ctx.fillStyle = PALETTE.page;
    ctx.fillRect(0, 0, FIELD.width, HEADER.height);
    ctx.fillStyle = PALETTE.headerText;
    ctx.font = `700 26px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('☀ Sunny Garden', 24, 33);
    ctx.font = `500 15px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('Spot the Difference', 24, 54);

    // Timer (centre).
    const low = world.phase === PHASE_PLAY && world.timeLeft <= 15;
    ctx.fillStyle = low ? PALETTE.bad : PALETTE.headerText;
    ctx.font = `700 30px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${fmtTime(world.timeLeft)}`, FIELD.width / 2, 30);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 13px ${FONT}`;
    ctx.fillText('time left', FIELD.width / 2, 54);

    // Found counter (right of centre).
    ctx.fillStyle = PALETTE.headerText;
    ctx.font = `700 22px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(`Found ${world.found.size} / ${DIFFERENCES.length}`, 1010, 30);
    // Progress dots.
    for (let i = 0; i < DIFFERENCES.length; i += 1) {
      ctx.fillStyle = i < world.found.size ? PALETTE.good : '#d8d2c0';
      ctx.beginPath();
      ctx.arc(860 + i * 22, 52, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    drawButton(1040, 14, 92, 36, `💡 Hint (${world.hintsLeft})`, world.hintsLeft > 0 && world.phase === PHASE_PLAY);
    drawButton(1144, 14, 112, 36, '↻ Restart (R)', true);
  }

  function drawFooter(world) {
    ctx.fillStyle = PALETTE.page;
    ctx.fillRect(0, FOOTER.y, FIELD.width, FOOTER.height);
    ctx.fillStyle = PALETTE.headerText;
    ctx.font = `500 16px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const msg = world.now < world.messageUntil && world.message ? world.message : 'Click a difference in either picture — it counts on both sides.';
    ctx.fillText(msg, 24, FOOTER.y + 22);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 15px ${FONT}`;
    ctx.fillText(`Score ${world.score}    Best ${world.best}    Misses ${world.misses}    H hint · R restart · click to find`, 24, FOOTER.y + 52);
    ctx.fillText('Two pictures, seven differences. The left and right pictures look the same — they are not.', 24, FOOTER.y + 80);
  }

  function drawPanels(world) {
    for (const [panel, x, variant] of [
      ['left', PANEL.leftX, 'left'],
      ['right', PANEL.rightX, 'right'],
    ]) {
      ctx.save();
      // Soft shadow + white frame.
      ctx.fillStyle = PALETTE.panelShadow;
      roundRect(ctx, x + 4, PANEL.y + 5, PANEL.width, PANEL.height, 10);
      ctx.fill();
      ctx.fillStyle = PALETTE.panelBorder;
      roundRect(ctx, x, PANEL.y, PANEL.width, PANEL.height, 10);
      ctx.fill();
      // Clip the scene to the panel, inset by the frame.
      ctx.beginPath();
      ctx.rect(x + 6, PANEL.y + 6, PANEL.width - 12, PANEL.height - 12);
      ctx.clip();
      ctx.translate(x + 6, PANEL.y + 6);
      // The scene is drawn in a 588x488 box (600x500 scaled down slightly).
      ctx.save();
      ctx.scale((PANEL.width - 12) / 600, (PANEL.height - 12) / 500);
      drawPanel(ctx, variant, world.found, world.hintId, world.now);
      // Wrong-click X marks.
      for (const m of world.marks) {
        if (m.panel !== panel) continue;
        ctx.strokeStyle = PALETTE.bad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const s = 12;
        ctx.beginPath();
        ctx.moveTo(m.x - s, m.y - s);
        ctx.lineTo(m.x + s, m.y + s);
        ctx.moveTo(m.x + s, m.y - s);
        ctx.lineTo(m.x - s, m.y + s);
        ctx.stroke();
      }
      // Floating score popups.
      for (const p of world.pops) {
        if (p.panel !== panel) continue;
        const age = 1.1 - (p.until - world.now);
        ctx.fillStyle = `rgba(47, 125, 50, ${Math.max(0, 1 - age)})`;
        ctx.font = `700 22px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y - age * 34);
      }
      ctx.restore();
      ctx.restore();
      // Panel label.
      ctx.fillStyle = 'rgba(58, 50, 38, 0.75)';
      roundRect(ctx, x + 14, PANEL.y + 14, 34, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 14px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(panel === 'left' ? 'A' : 'B', x + 31, PANEL.y + 27);
    }
  }

  function drawOverlay(title, lines, accent) {
    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = accent;
    ctx.font = `700 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, FIELD.width / 2, 250);
    ctx.fillStyle = PALETTE.headerText;
    ctx.font = `500 20px ${FONT}`;
    lines.forEach((line, i) => {
      ctx.fillText(line, FIELD.width / 2, 310 + i * 32);
    });
  }

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.page;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const world = { ...state, best };
    drawHeader(world);
    drawPanels(world);
    drawFooter(world);
    if (screen === SCREEN_TITLE) {
      drawOverlay('☀ Sunny Garden', [
        'Spot the Difference',
        'Two pictures, seven differences. Click one in either picture.',
        'Wrong clicks cost 3 seconds. Hints (H) show you one. You have 2 minutes.',
        '',
        'Click or press Space to start',
      ], PALETTE.headerText);
    } else if (screen === SCREEN_WIN) {
      drawOverlay('🎉 You found them all!', [
        `All 7 differences found — score ${state.score} (best ${best}).`,
        `Time left: ${fmtTime(state.timeLeft)} · Misses: ${state.misses}`,
        '',
        'Click or press Enter to play again',
      ], PALETTE.good);
    } else if (screen === SCREEN_OVER) {
      drawOverlay("⏰ Time's up!", [
        `You found ${state.found.size} of ${DIFFERENCES.length} differences — score ${state.score}.`,
        'The seven differences were: the sun’s sunglasses, a bird, a curtain,',
        'an apple, a red flower, a duck and a fence post.',
        '',
        'Click or press Enter to try again',
      ], PALETTE.bad);
    }
  }

  return { draw, fmtTime };
}

/** Button hit-boxes (canvas coords) for the header buttons. */
export const BUTTONS = {
  hint: { x: 1040, y: 14, w: 92, h: 36 },
  restart: { x: 1144, y: 14, w: 112, h: 36 },
};
