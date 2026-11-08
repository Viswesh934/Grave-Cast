# 🕯️ Grave UI — 3D & Shader Horror Component Specification
> **From 90's Arcade Vectors to Cinematic, Visceral Folklore Horror**  
> *Architectural Blueprint & Component Overhaul Proposal*

---

## 1. Executive Summary & Problem Diagnosis

### The Diagnosis
The initial prototype of Grave UI verified the component architecture, TypeScript contracts, and documentation layout. However, visually, the components currently feel like **90s arcade video game icons** (flat 2D vector SVGs, bright cartoonish gradients, and emoji glyphs like `🐔`, `⚰️`, `🩸`, `🌑`). 

They evoke retro *Castlevania* or a lighthearted Halloween mobile game rather than genuine **dread, claustrophobia, and dark gothic folklore**.

### The Objective
Transform Grave UI into a **photorealistic, shader-driven, 3D horror component library** inspired by the visual language of *Diablo IV, Bloodborne, Elden Ring, and A24 folk horror (The Witch, The Lighthouse)*.

Components must remain **radically reusable React primitives**, but each element will feature real depth, normal-mapped decay, dynamic lighting, liquid physics, and organic micro-interactions.

---

## 2. Core Horror Design Pillars

```
+-------------------------------------------------------------------------+
|                        VISCERAL HORROR DESIGN PILLARS                  |
+-------------------------------------------------------------------------+
| 1. Dynamic Torchlight  | Cursor acts as a flickering lantern in a crypt  |
| 2. Organic Decay       | Normal-mapped basalt, damp moss, chiseled rock  |
| 3. Tangible Physics    | Sloshing blood, elastic spider silk, bone clack |
| 4. Volumetric Shadows  | Creeping ground fog, raymarched mist, darkness  |
| 5. Zero-Asset Audio    | Real-time Web Audio API procedural synthesis    |
+-------------------------------------------------------------------------+
```

1. **Light is a Precious Resource**: The UI lives in near pitch darkness. Moving the mouse acts as holding a flickering lantern or torch, casting dynamic shadows across stone bevels and cracks.
2. **Tactile Imperfection**: No clean rounded rectangles. Elements feature eroded stone edges, chipped granite, dried bloodstains on vellum, and organic skeletal asymmetry.
3. **Physical Resistance & Weight**: Modals don't just fade in; heavy stone sarcophagi grind open with low-frequency audio rumble. Drawers feel heavy. Spider silk resists when pulled.
4. **Subtle Uncanny Motion**: Components are never completely static. Candles flicker unpredictably, fluids have meniscus tension, and chicken talons twitch subtly when idle.

---

## 3. Component Transformation Matrix

| Component | Current Prototype (2D Arcade) | Target 3D & Shader Transformation |
|---|---|---|
| **TombstoneCard** | Flat grey rectangle with dashed border and static SVG cross | **Interactive 3D Basalt Headstone**: A 3D stone slab with normal maps and roughness maps. Moving the cursor shifts a virtual point-light, casting long creeping shadows across chiseled commit epitaphs. Damp moss patches at the base react to humidity shaders. |
| **ExcavationLoader** | Rotating 2D bone with dot particles | **3D Trench Excavation**: A top-down 3D viewport of disturbed grave soil. A skeletal hand claws its way upward through displaced earth particles as loading progresses, with real-time dirt deformation shaders. |
| **BoneOssuaryDivider** | Flat SVG bone drawings with text | **3D Interlocked Skeletal Femurs & Ribcage**: Photorealistic 3D bone structures with porous ivory texture and hollow skull posts that house flickering candle flames. |
| **CoffinModal / Drawer** | Standard slide-over panel | **3D Gothic Sarcophagus with Velvet Interior**: An ornate 3D casket modeled with brass studs and iron latches. Unsealing it plays a 3D lid rotation with rusted hinge friction and reveals contents inside crimson crushed velvet. |
| **CauldronBrew** | 2D circle with CSS pinging bubbles | **Volumetric 3D Cast-Iron Cauldron**: Real-time Raymarched fluid surface with swirling convection currents, glowing embers beneath, and rising volumetric GPU particle smoke that illuminates surrounding page elements. |
| **BloodVialProgress** | Rounded horizontal progress bar | **Raymarched 3D Apothecary Glass Vial**: Physical glass refraction (Fresnel + chromatic dispersion). Dark, coagulated red fluid sloshes with viscous inertia when dragged or adjusted, leaving a clinging red meniscus film on the glass walls. |
| **LunarPhaseSelector** | Row of flat emoji buttons (`🌑` to `🌕`) | **Photorealistic 3D Moon Sphere**: Fully textured 3D celestial sphere with crater topography. A dynamic directional light smoothly sweeps across the surface to cast true lunar terminator shadows. At Full Moon, shifts into a pulsing Blood Moon eclipse. |
| **ChickenLegStepper** | Progress line with chicken emojis (`🐔`, `🐾`) | **Baba Yaga's 3D Walking Hut**: Knotted dark timber hut supported by 3D scaly avian talons. When advancing steps, the talons physically lift, step forward, and plant down with a subtle camera jolt. |
| **CobwebCorner** | Flat 2D vector line strands | **Verlet Physics Elastic Spider Silk**: Procedural spring-rope web strands that physically sag under gravity. Hovering over the web causes strands to stick to the cursor, stretching elastically before snapping back. |
| **RunicButton** | Flat button with unicode runes | **Carved Obsidian Rune Tablet**: Volumetric volcanic glass button where Elder Futhark runes are etched deep into the stone, igniting from within with pulsating eldritch lava or spectral blue flame upon hover. |

---

## 4. Technical Architecture & 3D Pipeline

### Stack Recommendation
* **3D Engine**: `three` + `@react-three/fiber` (R3F)
* **3D Primitives & Helpers**: `@react-three/drei`
* **Shaders**: Custom GLSL (Vertex & Fragment) via `three/tsl` or `shaderMaterial`
* **Post-processing**: `@react-three/postprocessing` (Vignette, Chromatic Aberration, Noise/Film Grain)
* **Physics & Springs**: `@react-spring/three` or lightweight Verlet integration
* **Audio**: Native procedural Web Audio API (zero hosted MP3 dependencies)

### Single WebGL Context Architecture (`drei/View`)
Creating a separate `<canvas>` for every single component degrades performance. Instead, we implement a **Single Canvas Architecture**:

```
+-------------------------------------------------------------------+
|                        Single Background Canvas                    |
|                (Main WebGL Renderer + Post-processing)            |
+-------------------------------------------------------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|   <View.Port>    |     |   <View.Port>    |     |   <View.Port>    |
|   TombstoneCard  |     |   BloodVial      |     |   CauldronBrew   |
+------------------+     +------------------+     +------------------+
```

Using `@react-three/drei`'s `<View>` component, multiple HTML elements across the documentation page bind to regions of a **single underlying WebGL canvas**. This delivers **60 FPS** performance even with 10+ 3D components on screen simultaneously.

---

## 5. Procedural Shaders Breakdown

### 1. `VolumetricFogShader` (Crypt Atmosphere)
- **Technique**: Raymarching with fractional Brownian motion (fBm) 3D simplex noise.
- **Behavior**: Drifts horizontally across cards, dissipating where cursor torchlight shines.

### 2. `BloodFluidShader` (Vampire Liquid)
- **Technique**: 2D/3D metaball raymarching with surface tension and Navier-Stokes viscosity simulation.
- **Behavior**: Liquid lags behind mouse movement, sloshing against glass walls with high damping.

### 3. `ChiseledStoneShader` (Tombstone & Runes)
- **Technique**: Procedural Voronoi crack displacement + triplanar mapping for stone grain and moss growth.
- **Behavior**: Catches dynamic specular glints from point lights; runes emissively bloom when activated.

---

## 6. Implementation Roadmap

### Phase 1: Core 3D Infrastructure & Global Torchlight
- [ ] Install Three.js, React Three Fiber, Drei, and Post-processing.
- [ ] Implement `GlobalCanvasProvider` with `<View>` scissor-testing.
- [ ] Build `TorchlightCursor`: Dynamic mouse-following 3D point light that casts shadows across cards.
- [ ] Add atmospheric film grain, subtle chromatic aberration, and crawling ground fog.

### Phase 2: The Crypt & Sanguine Overhaul
- [ ] Build **3D TombstoneCard**: Procedural basalt slab with normal-mapped epitaph engraving and moss slider.
- [ ] Build **3D BloodVialProgress**: Glass refraction cylinder with sloshing coagulated liquid physics.
- [ ] Build **3D BoneOssuaryDivider**: Ribcage & femur 3D geometry with hollow candle-lit skulls.

### Phase 3: The Coven & Slavic Lore Overhaul
- [ ] Build **3D CauldronBrew**: Cast-iron 3D vessel with volumetric boiling liquid and rising smoke particles.
- [ ] Build **3D ChickenLegStepper**: Walking timber hut with articulated avian talons that plant on step change.
- [ ] Build **3D LunarPhaseSelector**: Crater-textured 3D moon sphere with dynamic directional terminator shadow.

### Phase 4: Elastic Physics & Polish
- [ ] Implement Verlet spring physics for **CobwebCorner** (interactive elastic spider silk).
- [ ] Synthesize matched procedural audio for all 3D transitions (stone grind, liquid slosh, claw stomp).
- [ ] Update Animate-UI docs playground to support 3D canvas inspection and camera rotation.

---

## 7. Architectural Decisions — LOCKED ✅

### 1. **Asset Strategy: Hybrid Approach** ✅
- **Procedural Geometry**: Simple shapes (tombstone slab, bone dividers, blood vial cylinder) generated in code with Three.js primitives
- **Lightweight GLB Models**: Complex organic forms (chicken leg talons, cauldron ornate ironwork, skull anatomical detail) as Draco-compressed models (~30-80KB each)
- **Rationale**: Balance between bundle size, artistic control, and development speed

### 2. **Accessibility Fallback** ✅
- Automatic detection: `prefers-reduced-motion` or WebGL unavailable
- Fallback: High-fidelity 2D CSS-rendered components with baked shadows and gradients
- Performance: `<noscript>` fallback for SSR/SSG compatibility

### 3. **Horror Intensity Prop** ✅
All 3D components support an `intensity` prop:
```typescript
type HorrorIntensity = "ghastly" | "cursed" | "abyssal";
```
- **`"ghastly"`**: Clean stone, minimal cracks, gentle flickering (corporate-safe)
- **`"cursed"`**: Moderate decay, viscous fluids, shadows (default, authentic horror)
- **`"abyssal"`**: Deep gore, aggressive audio, maximum dread (opt-in extreme)

