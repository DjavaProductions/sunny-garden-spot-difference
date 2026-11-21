// Draws the Sunny Garden scene into one panel. `variant` is 'left' or 'right':
// the left picture has all seven differences in their "original" state and the
// right picture has them changed (sunglasses off, bird gone, curtain gone, one
// apple gone, one flower re-coloured, duck gone, one fence post gone). Everything
// else is identical, so the two pictures are near-identical by construction.
// All coordinates are panel-local (600x500). `found` is a Set of difference ids
// already found; those get a red ring on both panels. `hintId` is the difference
// a hint is currently pulsing on (or null).

import { DIFFERENCES, PALETTE } from './config.js';

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = PALETTE.cloud;
  ellipse(ctx, x, y, 34 * s, 20 * s);
  ellipse(ctx, x - 24 * s, y + 6 * s, 24 * s, 15 * s);
  ellipse(ctx, x + 26 * s, y + 6 * s, 26 * s, 16 * s);
}

function bird(ctx, x, y, s) {
  ctx.strokeStyle = '#3a3226';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 12 * s, y);
  ctx.stroke();
}

function flower(ctx, x, y, petal, s = 1) {
  // Stem and leaves.
  ctx.strokeStyle = PALETTE.flowerStem;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 26 * s);
  ctx.stroke();
  ctx.fillStyle = PALETTE.flowerStem;
  ellipse(ctx, x - 7 * s, y + 16 * s, 7 * s, 3.5 * s);
  ellipse(ctx, x + 7 * s, y + 20 * s, 7 * s, 3.5 * s);
  // Petals around a yellow centre.
  ctx.fillStyle = petal;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 7 * s, 7 * s);
  }
  ctx.fillStyle = '#ffd93b';
  circle(ctx, x, y, 5 * s);
}

function drawScene(ctx, variant) {
  const right = variant === 'right';

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 500);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 500);

  // Sun with rays.
  ctx.fillStyle = PALETTE.sunRay;
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const x1 = 88 + Math.cos(a) * 44;
    const y1 = 70 + Math.sin(a) * 44;
    const x2 = 88 + Math.cos(a) * 56;
    const y2 = 70 + Math.sin(a) * 56;
    ctx.strokeStyle = PALETTE.sunRay;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.sun;
  circle(ctx, 88, 70, 36);
  // Sunglasses only on the left picture.
  if (!right) {
    ctx.fillStyle = '#22252a';
    ellipse(ctx, 76, 66, 11, 9);
    ellipse(ctx, 100, 66, 11, 9);
    ctx.strokeStyle = '#22252a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(87, 66);
    ctx.lineTo(89, 66);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(65, 64);
    ctx.lineTo(58, 58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(111, 64);
    ctx.lineTo(118, 58);
    ctx.stroke();
  }
  // A smile under the glasses (left) / plain smile (right).
  ctx.strokeStyle = '#8a6d00';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(88, 78, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Clouds.
  cloud(ctx, 300, 55, 1);
  cloud(ctx, 470, 100, 0.8);
  cloud(ctx, 180, 122, 0.7);

  // Birds: two on the left, one on the right.
  bird(ctx, 350, 82, 1);
  if (!right) bird(ctx, 392, 104, 0.9);

  // Rolling hills.
  ctx.fillStyle = PALETTE.hillBack;
  ctx.beginPath();
  ctx.ellipse(140, 520, 320, 130, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.hillFront;
  ctx.beginPath();
  ctx.ellipse(480, 540, 340, 120, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(0, 420, 600, 80);

  // House.
  ctx.fillStyle = PALETTE.houseWall;
  ctx.strokeStyle = PALETTE.houseTrim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(190, 250, 140, 140);
  ctx.fill();
  ctx.stroke();
  // Roof.
  ctx.fillStyle = PALETTE.roof;
  ctx.beginPath();
  ctx.moveTo(175, 252);
  ctx.lineTo(260, 182);
  ctx.lineTo(345, 252);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b03a32';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Chimney + smoke.
  ctx.fillStyle = '#b03a32';
  ctx.fillRect(305, 192, 20, 44);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  circle(ctx, 318, 178, 8);
  circle(ctx, 324, 164, 11);
  circle(ctx, 332, 148, 14);
  // Door.
  ctx.fillStyle = PALETTE.door;
  ctx.fillRect(245, 320, 40, 70);
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 278, 356, 4);
  // Left window.
  ctx.fillStyle = PALETTE.windowGlass;
  ctx.fillRect(205, 275, 30, 30);
  ctx.strokeStyle = PALETTE.houseTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(205, 275, 30, 30);
  ctx.beginPath();
  ctx.moveTo(220, 275);
  ctx.lineTo(220, 305);
  ctx.moveTo(205, 290);
  ctx.lineTo(235, 290);
  ctx.stroke();
  // Right window, with a curtain on the left picture only.
  ctx.fillStyle = PALETTE.windowGlass;
  ctx.fillRect(295, 275, 30, 30);
  ctx.strokeStyle = PALETTE.houseTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(295, 275, 30, 30);
  ctx.beginPath();
  ctx.moveTo(310, 275);
  ctx.lineTo(310, 305);
  ctx.moveTo(295, 290);
  ctx.lineTo(325, 290);
  ctx.stroke();
  if (!right) {
    ctx.fillStyle = PALETTE.curtain;
    ctx.fillRect(297, 277, 10, 26);
    ctx.fillRect(313, 277, 10, 26);
  }

  // Tree.
  ctx.fillStyle = PALETTE.trunk;
  ctx.beginPath();
  ctx.moveTo(458, 390);
  ctx.lineTo(452, 290);
  ctx.lineTo(488, 290);
  ctx.lineTo(482, 390);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.leaf;
  circle(ctx, 470, 220, 55);
  circle(ctx, 428, 244, 42);
  circle(ctx, 512, 244, 42);
  ctx.fillStyle = PALETTE.leafLight;
  circle(ctx, 452, 200, 30);
  circle(ctx, 492, 208, 26);
  // Apples: five on the left, four on the right (the one at 505,265 is gone).
  ctx.fillStyle = PALETTE.apple;
  const apples = [
    [445, 225],
    [470, 200],
    [495, 235],
    [430, 260],
    [505, 265],
  ];
  for (const [ax, ay] of apples) {
    if (right && ax === 505 && ay === 265) continue;
    circle(ctx, ax, ay, 7);
    ctx.fillStyle = '#ff8fab';
    circle(ctx, ax - 2, ay - 2, 2);
    ctx.fillStyle = PALETTE.apple;
  }

  // Fence: two rails and posts; the post at x=340 is missing on the right.
  ctx.fillStyle = PALETTE.fence;
  ctx.fillRect(20, 396, 560, 8);
  ctx.fillRect(20, 418, 560, 8);
  ctx.fillStyle = PALETTE.fencePost;
  for (let x = 40; x <= 560; x += 52) {
    if (right && x === 352) continue;
    ctx.fillRect(x - 5, 388, 10, 42);
    ctx.beginPath();
    ctx.moveTo(x - 6, 388);
    ctx.lineTo(x, 380);
    ctx.lineTo(x + 6, 388);
    ctx.closePath();
    ctx.fill();
  }

  // Path from the door.
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(248, 390);
  ctx.lineTo(282, 390);
  ctx.lineTo(296, 500);
  ctx.lineTo(234, 500);
  ctx.closePath();
  ctx.fill();

  // Pond.
  ctx.fillStyle = PALETTE.pond;
  ellipse(ctx, 470, 452, 86, 22);
  ctx.fillStyle = PALETTE.pondLight;
  ellipse(ctx, 448, 446, 40, 8);
  // Duck only on the left picture.
  if (!right) {
    ctx.fillStyle = PALETTE.duck;
    ellipse(ctx, 470, 448, 16, 11);
    circle(ctx, 484, 438, 9);
    ctx.fillStyle = PALETTE.duckBeak;
    ctx.beginPath();
    ctx.moveTo(491, 436);
    ctx.lineTo(501, 440);
    ctx.lineTo(491, 443);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#22252a';
    circle(ctx, 486, 435, 1.8);
  }

  // Flower bed along the bottom.
  const bed = [
    [60, 448, PALETTE.petalYellow, 1],
    [120, 440, right ? PALETTE.petalPurple : PALETTE.petalRed, 1.1],
    [170, 452, PALETTE.petalPink, 0.9],
    [210, 442, PALETTE.petalOrange, 1],
    [330, 448, PALETTE.petalWhite, 1],
    [380, 442, PALETTE.petalYellow, 1.05],
    [420, 452, PALETTE.petalPink, 0.9],
    [560, 446, PALETTE.petalOrange, 1],
  ];
  for (const [fx, fy, petal, s] of bed) flower(ctx, fx, fy, petal, s);

  // Cat sitting by the house (same in both pictures).
  ctx.fillStyle = PALETTE.cat;
  ellipse(ctx, 140, 372, 26, 20);
  circle(ctx, 140, 344, 15);
  ctx.beginPath();
  ctx.moveTo(128, 334);
  ctx.lineTo(126, 320);
  ctx.lineTo(136, 330);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(152, 334);
  ctx.lineTo(154, 320);
  ctx.lineTo(144, 330);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.catDark;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(164, 378);
  ctx.quadraticCurveTo(182, 372, 180, 352);
  ctx.stroke();
  ctx.fillStyle = '#22252a';
  circle(ctx, 135, 342, 2);
  circle(ctx, 146, 342, 2);

  // Butterfly near the flowers (same in both pictures).
  ctx.fillStyle = '#ff8fab';
  ellipse(ctx, 196, 424, 7, 10);
  ellipse(ctx, 208, 424, 7, 10);
  ctx.fillStyle = '#3a3226';
  ellipse(ctx, 202, 426, 2, 9);
}

/** Draw one panel: the scene, then a red ring on every difference already
 *  found, then (when `hintId` is set) a pulsing gold ring on that difference. */
export function drawPanel(ctx, variant, found, hintId, pulse) {
  drawScene(ctx, variant);
  for (const d of DIFFERENCES) {
    if (found.has(d.id)) {
      ctx.strokeStyle = PALETTE.ringFound;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(d.at.x, d.at.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(230,57,70,0.35)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(d.at.x, d.at.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (hintId) {
    const d = DIFFERENCES.find((x) => x.id === hintId);
    if (d) {
      const r = d.r + 6 + Math.sin(pulse * 6) * 4;
      ctx.strokeStyle = PALETTE.hintRing;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(d.at.x, d.at.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}
