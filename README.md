# OUTBREAK — The Last Signal

A browser-based 3D survival-horror prototype built with **Three.js**. Designed for GitHub Pages and playable on desktop and mobile browsers.

## Play online with GitHub Pages

1. Create a new public repository on GitHub named `OUTBREAK` (or any name you prefer).
2. Upload **all files and folders** from this project. Make sure `index.html` is in the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to publish. Your game URL will look like:
   `https://YOUR-USERNAME.github.io/OUTBREAK/`

No build step is required. Three.js is loaded from jsDelivr, so the browser needs an internet connection.

## Controls

### PC
| Action | Control |
|---|---|
| Move | W A S D / Arrow keys |
| Look | Mouse |
| Aim / Fire | Left mouse button |
| Sprint | Shift |
| Reload | R |
| Pick up / Extract | E |
| Pause | Esc |

Click the game to capture the mouse. Press Esc to release it and pause.

### Mobile
- Left virtual stick: move
- Drag on the game view: look around
- FIRE: shoot
- R: reload
- RUN: sprint
- USE: pick up items / extract

## Mission

Recover all **3 signal parts** scattered around the quarantine district, then reach the extraction gate at the far end of the street. Collect ammunition and medical supplies, and avoid the infected.

## Project structure

```text
OUTBREAK/
├── index.html
├── style.css
├── README.md
├── src/
│   └── main.js
└── assets/
```

## Notes

- This is an original, playable vertical-slice prototype. It uses procedural primitive geometry rather than licensed Resident Evil assets.
- Visual quality and performance depend on the player's device and browser.
- For best desktop experience, use a recent Chromium, Firefox, or Safari browser with WebGL enabled.
- For mobile, use a modern browser and landscape orientation.
- Three.js is imported as an ES module from jsDelivr. For fully offline hosting, vendor the Three.js library into the repository and update the import path.

## Roadmap

- Character and infected animation rigs
- Improved pathfinding and enemy archetypes
- More detailed environment and interior locations
- Audio design, ambience, and spatial sound
- Inventory screen, weapon switching, and save checkpoints
- Story scenes and additional chapters

## License

Code in this repository may be adapted for personal and educational projects. Third-party libraries and assets retain their respective licenses.
