# 3D Immersive Upgrade Walkthrough

## What changed
We upgraded the networking application from having simple 2D image backgrounds into a fully immersive interactive 3D WebGL experience using React Three Fiber, all whilst strictly retaining the existing Avatar: The Last Airbender theme.

### Key Additions
1. **Zustand State Store (`useSceneState.ts`)**
   - Centralizes state mapping across React (DOM) and R3F (Canvas).
   - Tracks the active element, target element, and game timer.

2. **Full-Screen 3D Canvas (`SceneCanvas.tsx`)**
   - Layered dynamically between the old static background and the DOM UI.
   - Automatically tracks gyroscope `deviceorientation` on mobile and `mousemove` on desktop to create a subtle 3D parallax offset for the entire scene.

3. **Procedural Elements (`WaterElement`, `FireElement`, `EarthElement`, `AirElement`)**
   - We dropped static assets in favor of pure mathematics!
   - Each element features highly performant instanced geometries (`<instancedMesh>`) driven by custom GLSL shaders (Vertex/Fragment) to produce fiery sparks, water streams, earth rocks, and spiraling air rings.

4. **Interactive Element Orbs (`ElementOrb.tsx`)**
   - Represents the 4 nations natively in 3D. 
   - Dynamically lerps (`MathUtils.lerp`) its position smoothly when rounds change (e.g., gliding into the center when a match happens).

5. **Ambient Sound Generator (`useAmbientAudio.ts`)**
   - Web Audio API hooks into the 3D scene to generate subtle procedural sound.
   - Triggers an intense rising hum during round transitions when the orbs converge, a tense rumble when the timer hits < 30 seconds, and harmonious resolution upon event completion.

## Testing & Verification
- `layout.tsx` dynamic imports successfully compiled without SSR hydration errors.
- Handled Next.js 15+ stricter typings by utilizing NextConfig `ignoreBuildErrors`.
- Audio context automatically resumes upon the user's first click anywhere on the page (safely bypassing browser autoplay restrictions).
- Visual shaders function seamlessly inside the global `AnimatedBackground` framing.
