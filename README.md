# Geometric Visualization — Plus

A standalone HTML/JS canvas app for creating and recording hypnotic geometric animations (Lissajous, Rose, Spirograph, Orbitals). Includes adjustable parameters, PNG export, and 7‑second WEBM capture via `MediaRecorder`.

## Features
- Multiple patterns: Lissajous, Rose (Rhodonea), Spirograph, Orbitals
- Adjustable parameters: line width, speed, symmetry (k), radii (a/b), color modes, background, trails
- Recording: capture the canvas stream to a WEBM video (default 7 seconds, adjustable)
- Export: save current frame as PNG
- Responsive, keyboard shortcuts, seeded randomizer

## Usage
Open `index.html` in a modern browser (Chrome/Edge/Firefox). Click **Record 7s WEBM** to export an animation video.

### Keyboard Shortcuts
- `R` — Record
- `Space` — Randomize parameters
- `S` — Save PNG

## Implementation Notes
- Built with vanilla JS and `<canvas>`
- Recording uses `canvas.captureStream()` + `MediaRecorder`
- For best results, keep the tab active while recording

## License
MIT
