# How GLITCH works

A plain-English, in-depth tour of the engine: how the character moves and jumps,
how every element moves, how dying and winning work, how it stays smooth at
60 fps, and how to add your own levels and mechanics.

No prior game-engine knowledge needed. Code paths are linked so you can dig in.

---

## 1. The big picture

Three layers, kept strictly separate:

```
  LEVEL DATA            THE ENGINE (no React)            THE SCREEN (React + Skia)
  ----------            ---------------------            -------------------------
  plain objects   →     reads data, runs physics    →    draws shapes from
  (levels/defs)         every 1/60 s, decides what       "shared values" the
                        is where, what kills you         engine writes each frame
```

- **Data** is just numbers and types (`src/levels/`). A level says "a platform here, a saw there, the goal at the end."
- **The engine** (`src/engine/`, `src/physics/`, `src/entities/`) is plain TypeScript. It never imports React. It simulates the world.
- **The screen** (`src/components/game/`) is React + [Skia](https://shopify.github.io/react-native-skia/). It only *draws*; it doesn't decide anything.

The bridge between the engine and the screen is the clever part — see [§8](#8-how-it-stays-at-60-fps-the-render-bridge).

---

## 2. The heartbeat: the game loop

A game is just this, many times per second: **read input → move the world a tiny
bit → draw**. The tricky bit is doing the "move" part *consistently* on phones
with different screen refresh rates (60 Hz, 90 Hz, 120 Hz).

GLITCH uses a **fixed timestep** ([`GameLoop.ts`](../src/engine/GameLoop.ts)).
Think of the simulation as a clock that *only* ticks in exact **1/60-second**
steps. The screen might want to draw at odd moments, so we keep a little "time
budget" (an accumulator):

```
every animation frame:
  budget += time since last frame
  while budget >= 1/60 s:
      step the world by exactly 1/60 s      // physics: always the same size
      budget -= 1/60 s
  draw(blend = budget / (1/60 s))           // see interpolation below
```

Why this matters:

- **Determinism** — physics always advances in identical chunks, so jumps feel
  the same on every device.
- **No "spiral of death"** — if the phone stalls, we cap how much time we add and
  how many steps we run, then drop the rest instead of trying to catch up forever.

### Interpolation (why it's smooth)

On a 120 Hz screen the loop often runs **0 or 1** physics steps per draw. If we
drew the raw physics position, the character would visibly stutter (move, wait,
move, wait). So `draw(blend)` renders the character **between** its previous and
current physics positions:

```
shown position = lerp(previous, current, blend)
```

That single trick turns "move, wait, move, wait" into smooth gliding. It lives in
[`GameEngine.render`](../src/engine/GameEngine.ts).

---

## 3. How the character moves

You press buttons; the character accelerates. Here's the exact chain:

```
Button press → InputState → (each 1/60 s) Player.update → Matter.js → new position
```

1. **Buttons write to a shared notebook.** The on-screen buttons
   ([`Controls.tsx`](../src/components/game/Controls.tsx)) don't move anything
   directly. They just set flags on a tiny plain object,
   [`InputState`](../src/input/InputState.ts): `left`, `right`, `jumpHeld`, and a
   one-shot `jumpPressed`. (Using a plain object — not React state — means
   pressing a button never causes a slow React re-render.)

2. **The engine reads the notebook every step.** In
   [`Player.update`](../src/entities/player/Player.ts):
   - **Horizontal:** we compute a *target* speed from the buttons
     (`±MOVE_MAX_SPEED`) and ease the current speed toward it. On the ground you
     accelerate quickly (`GROUND_ACCEL`); in the air you have less control
     (`AIR_ACCEL`) so jumps feel committed. With no button held, speed decays via
     friction.
   - We set the body's velocity and let the physics engine move it.

3. **Physics applies it.** [Matter.js](https://brm.io/matter-js/) integrates
   velocity + gravity and resolves collisions with platforms, producing the new
   position.

All tuning numbers (speed, accel, friction, gravity) live in
[`constants/gameplay.ts`](../src/constants/gameplay.ts) so "game feel" is one file.

---

## 4. How jumping feels good

A naive jump (just "set upward velocity when grounded") feels stiff. GLITCH adds
three classic tricks, all in [`Player.update`](../src/entities/player/Player.ts):

- **Variable height** — tap for a short hop, **hold** to go higher. While you
  hold *and* are still rising, we keep adding a little upward force
  (`JUMP_HOLD_FORCE`) up to a time limit. Let go early while rising and we *cut*
  the upward speed (`JUMP_CUT_FACTOR`) → a small hop.
- **Coyote time** — if you walk off a ledge, you can still jump for a few
  milliseconds afterward (`COYOTE_TIME_MS`). This forgives "I pressed jump a hair
  too late."
- **Jump buffering** — if you press jump just *before* landing
  (`JUMP_BUFFER_MS`), the jump fires the instant you touch down, instead of being
  ignored.

Together these make the controls feel like they "read your mind."

---

## 5. How the elements move (the traps)

Every trap and platform is an **entity** — a small class with the same shape
([`LevelEntity`](../src/engine/entities/LevelEntity.ts)). Each entity can:

- own a **solid body** (something you stand on / bump into),
- report a **hazard rectangle** (the area that kills you *right now*),
- expose a **carry** (how much it should drag a rider this step),
- and **update** itself every 1/60 s.

The level runtime calls `update` on every entity each step, then checks the
results. Here's what each one does, in simple terms:

| Element | What it does | File |
| --- | --- | --- |
| **Platform** | Just a solid floor. | `platforms.ts` |
| **Moving platform** | Slides along a path and **carries you** while you stand on it (your feet stick). | `platforms.ts` + `PathFollower.ts` |
| **Crumbling platform** | The moment you stand on it, a timer starts; a beat later it disappears. Keep moving. | `platforms.ts` |
| **Fake platform** | Looks solid, but vanishes the **instant** you touch it. You drop. | `platforms.ts` |
| **Conveyor** | A floor that constantly drags you sideways (reuses the "carry" mechanism). | `platforms.ts` |
| **Bounce pad** | Landing on it launches you upward. | `platforms.ts` |
| **Phase platform** | Blinks solid ↔ empty on a timer. Cross on the beat. | `platforms.ts` |
| **Spike** | Always deadly to touch. | `hazards.ts` |
| **Hidden spike** | Flush with the floor until you get near — then it snaps up and stays. | `hazards.ts` |
| **Falling block** | Hangs above; when you cross an invisible trigger line it drops (deadly while falling), then lands as a platform. | `hazards.ts` |
| **Saw** | A spinning blade, optionally moving along a path. Deadly to touch. | `hazards.ts` |
| **Laser** | A beam that turns on/off on a timer; deadly only while on. | `hazards.ts` |
| **Crusher** | A heavy block that slams down on a timer; its leading edge crushes you. | `hazards.ts` |
| **Ice floor** | Solid, but near-frictionless — you slide (the player picks up `onIce`). | `mechanics2.ts` |
| **Wind zone** | A field that constantly pushes you sideways while you're inside it. | `mechanics2.ts` |
| **Gravity zone** | While inside, gravity flips — you fall *up* and walk the ceiling. | `mechanics2.ts` |
| **Portal** | Paired teleporters; enter one, exit its partner (logic in the runtime). | `mechanics2.ts` |
| **Dash pad** | A pass-through gate that flings you horizontally. | `mechanics2.ts` |
| **Pendulum** | A blade swinging on an arc from a fixed pivot (real pendulum motion). | `mechanics2.ts` |
| **Chaser** | A wall of spikes that advances from behind — keep moving or it catches you. | `mechanics2.ts` |

**Two reusable helpers do a lot of the work:**

- **Path following** ([`PathFollower.ts`](../src/engine/entities/PathFollower.ts))
  moves a point back and forth along a list of waypoints at a fixed speed, with
  pauses at the ends. Moving platforms and saws both use it.
- **Carry** — if an entity sets `carry = { dx, dy }` and you're standing on it,
  the runtime nudges *you* by that amount too. Moving platforms set it to their
  own movement; conveyors set a constant value (so they push you even when they
  don't move).

### Environment effects (ice / wind / gravity / portals)

Some mechanics don't kill or block — they bend the rules. Each step the runtime
looks at what's around the player and builds an **environment snapshot**
(`{ onIce, windX, gravitySign }`) which `Player.update` reads: ice swaps in
slippery acceleration/friction, wind adds a constant sideways push, and a
gravity zone flips `gravitySign` so jumping, falling and "what counts as the
ground" all invert — the same controls work upside-down. Portals are resolved
separately: after physics, if you overlap one you're teleported to its partner
(with a short cooldown so you don't bounce straight back).

### Hazards are checked by overlap, not physics

Deadly things are **not** Matter bodies. Each step the runtime asks every entity
"what's your deadly rectangle right now?" and checks if the player overlaps it
([`aabbOverlap`](../src/utils/math.ts)). This gives precise control over *when*
something kills — a hidden spike is only deadly once raised; a laser only while
on; a falling block only while falling. Solid collision (standing/bumping) is
separate and handled by Matter.

---

## 6. Collisions, dying and winning

All of this lives in [`LevelRuntime.fixedStep`](../src/engine/LevelRuntime.ts).
The order each step is deliberate:

```
1. update every entity            (platforms move, timers tick, spikes pop up)
2. carry the player               (if standing on a moving/conveyor surface)
3. apply player input + gravity   (Player.update)
4. integrate physics              (Matter resolves standing/bumping)
5. check death:  fell out of the world?  OR  overlapped any hazard?
6. check win:    reached the goal rectangle?
```

- **Standing on things ("grounded")** is detected from Matter's collision events
  ([`CollisionSystem.ts`](../src/collision/CollisionSystem.ts)) — a contact only
  counts as ground if the player is *above* the surface, so scraping a wall
  doesn't count as standing.
- **Death → instant respawn.** On death the level freezes briefly (a short death
  animation plays), then everything resets to the start and you go again — the
  fast "one more try" loop. Your death counter keeps climbing.
- **Win** shows the clear screen and unlocks the next level.

---

## 6b. Haptics

A small plain module ([`services/haptics.ts`](../src/services/haptics.ts))
provides semantic taps (light/medium/heavy/success/error/selection) gated by a
global on/off flag (the menu toggle). The engine and entities call it directly
(it's not React): light on jump/land, medium on bounce/dash/teleport/gravity
flip, error on death, success on level complete; the UI calls selection on every
button/node press.

## 7. The camera

The camera ([`Camera.ts`](../src/camera/Camera.ts)) smoothly follows the player,
looks slightly ahead in the direction you're facing, and **clamps to the level
bounds** so you never see past the edges. On death it adds a quick **shake**. The
smoothing is frame-rate-independent, so it feels identical on any phone.

---

## 8. How it stays at 60 fps (the render bridge)

Re-rendering React 60 times a second would be slow. GLITCH avoids it entirely.

- The engine owns a set of **shared values** (from Reanimated, created with
  `makeMutable`) — e.g. the player's `x`, `y`, facing, animation state, and each
  entity's position/opacity. These live on both the JS and UI threads.
- Each frame the engine just **writes numbers** into those shared values.
- Skia components ([`LevelRenderer.tsx`](../src/components/game/LevelRenderer.tsx),
  [`EntityNode.tsx`](../src/components/game/EntityNode.tsx),
  [`Character.tsx`](../src/components/game/Character.tsx)) **read** those shared
  values via `useDerivedValue` and redraw on the **UI thread**.

So the 60 fps path is: *engine writes numbers → Skia redraws*. React is only
involved for big moments (level start, death, win) via a small
[zustand store](../src/store/gameStore.ts) — never per frame.

The **character** is drawn purely from shapes (no images): a body, a dark visor
with eyes, an antenna, feet, and a glow. Its squash-&-stretch, facing flip, run
bob and death burst are all driven by those shared values.

---

## 9. The level data format

A level is a plain object ([`LevelDef`](../src/levels/types.ts)). Coordinates are
world pixels, origin top-left, **Y points down**. Rectangles are
`{ x, y, width, height }` from the top-left corner.

```ts
export const level01: LevelDef = {
  id: '1',                       // unique id (used by save data + routing)
  index: 1,                      // position in the journey (for the map)
  name: 'First Steps',
  hint: 'Watch your step.',      // one-liner shown in the HUD
  theme: makeTheme('CIRCUIT', '#3BA0FF', '#04070F', '#0C1E38', '#15243C', '#2E6098'),
  spawn: { x: 60, y: 320 },      // player's top-left at start
  size: { width: 1640, height: 440 },  // world bounds (camera clamps to this)
  goal: { x: 1470, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 440, height: 120 },
    { type: 'spike', x: 300, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'hiddenSpike', x: 720, y: 332, width: 60, height: 28, triggerPad: 95 },
    // ...
  ],
};
```

Every `entities` item is one of a fixed set of shapes (see the table in §5);
TypeScript autocompletes the exact fields for each `type`. Useful conventions
used by the built-in levels:

- Floor top sits at **y = 360**; the player is ~30×34 px.
- A comfortable jump clears a **~130 px gap** and reaches **~100 px** up.
- Falling into a gap (no platform) drops you below `size.height` → death.

---

## 10. Add a level in 2 steps (no core changes)

1. **Create the data file.** Copy `src/levels/defs/level10.ts` to a new file,
   change `id`/`index`/`name`/`theme`, design `spawn`, `goal`, `size` and the
   `entities` list.
2. **Register it.** Add one import + one entry to the `LEVELS` array in
   [`registry.ts`](../src/levels/registry.ts).

Done. The level-select map, unlocking, "next level" and the engine all read from
`LEVELS`, so your level shows up everywhere — no other code changes.

> Tip: keep difficulty rising and give each level **one** signature idea so it
> feels distinct.

---

## 11. Add a *new mechanic* (when data isn't enough)

Mechanics are the only thing that needs code. To add one (say, a "wind zone"):

1. **Describe it** — add a variant to the `EntityDef` union in
   [`levels/types.ts`](../src/levels/types.ts) and a render kind in
   [`engine/types.ts`](../src/engine/types.ts).
2. **Build it** — add a class in `platforms.ts` (solid-ish) or `hazards.ts`
   (deadly) extending `BaseEntity`; implement `update` and, if relevant,
   `hazardRect` / `carry`.
3. **Register it** — one `case` in
   [`entities/factory.ts`](../src/engine/entities/factory.ts).
4. **Draw it** — one branch in
   [`EntityNode.tsx`](../src/components/game/EntityNode.tsx).

After that, the new mechanic is usable from any level's data like the built-in
ones.

---

## File map (quick reference)

| Area | Files |
| --- | --- |
| Loop & orchestration | `engine/GameLoop.ts`, `engine/GameEngine.ts`, `engine/LevelRuntime.ts` |
| Player & physics | `entities/player/Player.ts`, `physics/PhysicsWorld.ts`, `collision/CollisionSystem.ts`, `camera/Camera.ts` |
| Mechanics | `engine/entities/{LevelEntity,PathFollower,platforms,hazards,factory}.ts` |
| Input | `input/InputState.ts`, `components/game/Controls.tsx` |
| Rendering | `components/game/{LevelRenderer,EntityNode,Character,HUD,GameView,LevelCompleteOverlay}.tsx` |
| Level data | `levels/{types,themes,registry}.ts`, `levels/defs/level01..10.ts` |
| Map & screens | `components/levelmap/LevelMapNode.tsx`, `screens/{MainMenu,LevelSelect,Game}Screen.tsx` |
| State & tuning | `store/gameStore.ts`, `constants/{gameplay,physics,controls,theme}.ts` |
