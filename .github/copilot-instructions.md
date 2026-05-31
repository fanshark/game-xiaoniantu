# Copilot Instructions for 小黏土走走走 (Little Clay Go Go Go)

## Architecture

This is a pure HTML5/JavaScript RPG game (no build tools, no frameworks). Open `index.html` directly in a browser to play.

### File Structure
- `index.html` — Entry point with DOM structure for all game screens/overlays
- `css/style.css` — All styling including HUD, dialogues, shops, notifications
- `js/assets.js` — Programmatic sprite rendering (Canvas 2D drawing functions)
- `js/world.js` — Zone definitions, tile maps, portals, item/NPC/enemy spawn configs
- `js/player.js` — Player state, movement, growth system, serialization
- `js/npc.js` — NPC types, dialogue trees with branching, keyword matching for typed input
- `js/combat.js` — Combat loop, enemy AI, fungi wave spawning, kill rewards
- `js/shop.js` — Real/fake shop items and purchase effects
- `js/ui.js` — HUD updates, notifications, dialogue rendering, minimap
- `js/animation.js` — Opening cutscene phases (spin, story panels, title)
- `js/main.js` — Game loop, state machine, input handling, camera, save/load

### Game State Machine
`intro` → `playing` ↔ `dialogue` / `shop` / `combat` → `gameover`

The main loop in `Game.gameLoop()` dispatches to `update()` and `render()` based on current state.

### Key Systems
- **Growth**: Player tracks size in millimeters (`Player.sizeMM`). Visual stage is computed from size thresholds (0-4). Goal: reach 15000mm (15m).
- **Zones**: Each zone in `ZONES` object has `generateMap()`, `spawnItems()`, `spawnNPCs()`, `spawnEnemies()`. Portals connect zones at map edges.
- **Dialogue**: Tree-based with `choices` array. Some dialogues support `allowTyping: true` with `keywords` object for regex matching.
- **Combat**: Proximity-triggered. Player attacks with spacebar/Z. Enemies auto-attack on timer. Fungi cave spawns waves until 100 defeated.
- **Desert**: `World.isDesert()` triggers -1mm per step with water drop visual effect.

## Conventions

- All rendering uses Canvas 2D API (no images/sprites loaded externally)
- Global objects: `Game`, `Player`, `World`, `Combat`, `NPCSystem`, `Shop`, `UI`, `Animation`, `Assets`
- Tile size is always `TILE_SIZE` (32px) defined in `world.js`
- Dialogue IDs are string keys in `NPCSystem.dialogues` object
- NPC types: `'good'`, `'bad'`, `'super_good'`, `'spy'` — affects visual rendering and interaction
- Game saves to `localStorage` key `'xiaoniantu_save'` via `Player.serialize()`/`deserialize()`
- Scripts load in dependency order (assets → world → player → npc → combat → shop → ui → animation → main)

## Adding Content

To add a new zone: add entry to `ZONES` in `world.js` with `generateMap()`, `spawnItems()`, `spawnNPCs()`, `spawnEnemies()`, and portal connections.

To add a new NPC dialogue: add dialogue tree entries in `NPCSystem.dialogues` (npc.js), reference the root dialogue ID from the NPC's spawn config.

To add a new enemy type: add rendering in `Assets.drawEnemy()` (assets.js), add spawn config in zone's `spawnEnemies()`, add reward logic in `Combat.getKillRewards()`.
