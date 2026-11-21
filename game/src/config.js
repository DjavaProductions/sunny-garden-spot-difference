// Sunny Garden — Spot the Difference.
// Every tuning number, colour and difference in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below
// depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** One panel (one picture) is 600x500 in its own local coordinates. */
export const PANEL = { width: 600, height: 500, leftX: 20, rightX: 660, y: 76 };

export const HEADER = { height: 64 };
export const FOOTER = { y: 592, height: 120 };

/** Seconds on the clock when a round starts. */
export const TIME_LIMIT = 120;

/** Seconds a wrong click costs. */
export const MISS_PENALTY = 3;

/** Hints per round. */
export const HINTS = 3;

/** Points per difference found, plus a time bonus on a win. */
export const POINTS_PER_FIND = 100;
export const TIME_BONUS_PER_SECOND = 5;

/** Click radius (panel-local px) that counts as hitting a difference. */
export const HIT_RADIUS = 30;

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'sunny-garden-spot.best';

/** The seven differences. `at` is the panel-local centre of the difference;
 *  `r` is the radius of the red ring drawn when it is found. `label` is the
 *  plain-language name the dossier and the win screen use. */
export const DIFFERENCES = [
  { id: 'sunglasses', label: 'the sun wears sunglasses', at: { x: 88, y: 70 }, r: 44 },
  { id: 'bird', label: 'a second bird in the sky', at: { x: 392, y: 104 }, r: 26 },
  { id: 'curtain', label: 'a curtain in the right window', at: { x: 310, y: 290 }, r: 30 },
  { id: 'apple', label: 'an apple on the tree', at: { x: 505, y: 265 }, r: 22 },
  { id: 'flower', label: 'a red flower (purple on the right)', at: { x: 120, y: 440 }, r: 26 },
  { id: 'duck', label: 'a duck on the pond', at: { x: 470, y: 450 }, r: 34 },
  { id: 'fence', label: 'a fence post', at: { x: 352, y: 408 }, r: 26 },
];

export const PALETTE = {
  page: '#f2ede0',
  pageEdge: '#e3dcc6',
  headerText: '#3a3226',
  muted: '#7a7263',
  panelBorder: '#ffffff',
  panelShadow: 'rgba(58, 50, 38, 0.25)',
  skyTop: '#6ec1f5',
  skyBottom: '#d8f0ff',
  sun: '#ffd93b',
  sunRay: '#f5b301',
  cloud: '#ffffff',
  hillBack: '#8fd07a',
  hillFront: '#5cb85c',
  houseWall: '#fff3d6',
  houseTrim: '#8b5a2b',
  roof: '#e5534b',
  door: '#8b5a2b',
  windowGlass: '#bfe8ff',
  curtain: '#ff8c42',
  trunk: '#7a4a21',
  leaf: '#3e9e4d',
  leafLight: '#57b368',
  apple: '#e63946',
  fence: '#f5efe0',
  fencePost: '#d9c9a3',
  pond: '#6ec6f5',
  pondLight: '#a8dcf7',
  duck: '#ffd93b',
  duckBeak: '#ff8c42',
  cat: '#9aa0a6',
  catDark: '#6b7178',
  flowerStem: '#2f7d32',
  petalRed: '#e63946',
  petalPurple: '#9b5de5',
  petalYellow: '#ffd93b',
  petalPink: '#ff8fab',
  petalOrange: '#ff8c42',
  petalWhite: '#ffffff',
  ring: '#e63946',
  ringFound: '#e63946',
  hintRing: '#f5b301',
  text: '#3a3226',
  good: '#2f7d32',
  bad: '#c62828',
  button: '#2f7d32',
  buttonText: '#ffffff',
  overlay: 'rgba(242, 237, 224, 0.92)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
