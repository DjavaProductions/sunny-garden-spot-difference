# Sunny Garden — Spot the Difference

A complete, original spot-the-difference game that plays offline in a desktop
browser from its own static files. No network requests, no libraries, no build
step: open `game/index.html` (or run `node serve.ts` and open
http://localhost:8080).

## How to play

Two near-identical pictures of a sunny garden sit side by side. There are
**seven differences** between them:

1. the sun wears sunglasses (left only)
2. a second bird in the sky (left only)
3. a curtain in the right window (left only)
4. an apple on the tree (left only)
5. a red flower that is purple on the right
6. a duck on the pond (left only)
7. a fence post (left only)

Click a difference in **either** picture — it counts on both sides and gets a
red ring. Wrong clicks cost 3 seconds. You have 2 minutes; hints (H, 3 per
round) pulse a gold ring around one difference you have not found yet. Found
differences are worth 100 points each, plus a time bonus when you find them
all. R restarts; Space / Enter starts and plays again.

## Files

- `game/index.html` — the page (a 1280x720 canvas, ES modules)
- `game/src/config.js` — tuning numbers, colours, the seven differences
- `game/src/scene.js` — draws the garden; the right picture is the same scene
  with the seven differences changed
- `game/src/world.js` — game state: found set, clock, score, hints, misses
- `game/src/render.js` — header, panels, footer, title / win / time-up screens
- `game/src/input.js` — mouse and keyboard
- `game/src/shots.js` — the deterministic `?shot=` scenes for screenshots
- `game/src/main.js` — boot, the fixed-step loop, click mapping, sounds
- `game/src/random.js` — seeded random (hint pick)
- `main.ts` — hands the game, the screenshots and `dossier.json` to the grader
- `serve.ts` — a tiny static server for local play
- `shots.json` — the four screenshot scenes (`?shot=start|play|play2|end`)
- `vendor/makefun-game.ts` — make.fun's game library, copied unchanged

Sounds are synthesised with WebAudio (no audio files). The best score is kept
in the browser's local storage.

## Screenshots

`?shot=start` (title), `?shot=play` (3 of 7 found), `?shot=play2` (5 of 7
found) and `?shot=end` (all 7 found, win screen) — each a real render of the
game's own code, staged by `game/src/shots.js`.

## License

MIT — see `LICENSE`.
