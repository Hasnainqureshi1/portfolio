// // ./js/three-scroll.js
// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// (function () {
//   const mount = document.getElementById("three-bg");
//   if (!mount) return;

//   // Respect reduced motion
//   const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
//   if (prefersReducedMotion) return;

//   // GSAP / ScrollTrigger are already included in your <head>
//   if (!window.gsap || !window.ScrollTrigger) return;
//   gsap.registerPlugin(ScrollTrigger);

//   // Scene
//   const scene = new THREE.Scene();

//   // Camera
//   const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
//   camera.position.set(0, 0, 6);

//   // Renderer
//   const renderer = new THREE.WebGLRenderer({
//     antialias: true,
//     alpha: true,
//     powerPreference: "high-performance",
//   });

//   // Keep it light on mobile
//   const isMobile = matchMedia("(max-width: 768px)").matches;
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
//   renderer.setSize(mount.clientWidth, mount.clientHeight);
//   renderer.setClearColor(0x000000, 0); // transparent
//   mount.appendChild(renderer.domElement);

//   // Lights
//   const ambient = new THREE.AmbientLight(0xffffff, 0.6);
//   scene.add(ambient);

//   const dir = new THREE.DirectionalLight(0xffffff, 1.2);
//   dir.position.set(2, 2, 3);
//   scene.add(dir);

//   // Main object (nice-looking & cheap)
//   const geo = new THREE.IcosahedronGeometry(1.2, 2);
//   const mat = new THREE.MeshStandardMaterial({
//     color: 0x6aa6ff,
//     metalness: 0.55,
//     roughness: 0.25,
//     emissive: 0x0a102d,
//     emissiveIntensity: 0.35,
//   });

//   const mesh = new THREE.Mesh(geo, mat);
//   mesh.position.set(2.2, -0.3, 0);
//   scene.add(mesh);

//   // Subtle wire overlay
//   const wire = new THREE.Mesh(
//     geo,
//     new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.08 })
//   );
//   wire.position.copy(mesh.position);
//   scene.add(wire);

//   // Particles (background depth)
//   const pCount = isMobile ? 250 : 600;
//   const positions = new Float32Array(pCount * 3);
//   for (let i = 0; i < pCount; i++) {
//     const i3 = i * 3;
//     positions[i3 + 0] = (Math.random() - 0.5) * 18;
//     positions[i3 + 1] = (Math.random() - 0.5) * 10;
//     positions[i3 + 2] = (Math.random() - 0.5) * 10;
//   }

//   const pGeo = new THREE.BufferGeometry();
//   pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//   const pMat = new THREE.PointsMaterial({ size: isMobile ? 0.02 : 0.03, transparent: true, opacity: 0.6 });
//   const points = new THREE.Points(pGeo, pMat);
//   scene.add(points);

//   // Resize
//   function onResize() {
//     const w = mount.clientWidth;
//     const h = mount.clientHeight;
//     camera.aspect = w / h;
//     camera.updateProjectionMatrix();
//     renderer.setSize(w, h);
//   }
//   window.addEventListener("resize", onResize, { passive: true });
//   onResize();

//   // Scroll-driven animation (whole-page scrub)
//   const state = { t: 0 };

//   gsap.to(state, {
//     t: 1,
//     ease: "none",
//     scrollTrigger: {
//       trigger: document.documentElement,
//       start: "top top",
//       end: "bottom bottom",
//       scrub: 1,
//     },
//     onUpdate: () => {
//       const p = state.t;

//       // Rotate and drift across the page
//       mesh.rotation.y = p * Math.PI * 4;
//       mesh.rotation.x = p * Math.PI * 1.5;
//       wire.rotation.copy(mesh.rotation);

//       // Move from right -> center -> left
//       mesh.position.x = THREE.MathUtils.lerp(2.2, -2.0, p);
//       mesh.position.y = THREE.MathUtils.lerp(-0.3, 0.8, p);
//       wire.position.copy(mesh.position);

//       // Camera parallax
//       camera.position.x = THREE.MathUtils.lerp(0.0, 0.6, p);
//       camera.position.y = THREE.MathUtils.lerp(0.0, -0.4, p);

//       // Particles gentle rotation
//       points.rotation.y = p * 0.8;
//       points.rotation.x = p * 0.35;

//       // Material vibe shift (subtle)
//       mat.emissiveIntensity = THREE.MathUtils.lerp(0.25, 0.65, p);
//       mat.roughness = THREE.MathUtils.lerp(0.35, 0.15, p);
//     },
//   });

//   // Render loop
//   let raf = 0;
//   function animate() {
//     raf = requestAnimationFrame(animate);

//     // Idle micro-motion so it doesn't look frozen between scrolls
//     mesh.rotation.z += 0.001;
//     wire.rotation.z = mesh.rotation.z;

//     renderer.render(scene, camera);
//   }
//   animate();

//   // Cleanup if needed
//   window.addEventListener("beforeunload", () => {
//     cancelAnimationFrame(raf);
//     window.removeEventListener("resize", onResize);
//     renderer.dispose();
//     mat.dispose();
//     geo.dispose();
//     pGeo.dispose();
//     pMat.dispose();
//   });
// })();
// ./js/three-scroll.js

// Improved version with postprocessing and multiple scenes

// import * as THREE from "three";
// import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// (() => {
//   const mount = document.getElementById("three-bg");
//   if (!mount) return;

//   const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
//   if (prefersReducedMotion) return;

//   if (!window.gsap || !window.ScrollTrigger) return;
//   gsap.registerPlugin(ScrollTrigger);

//   const isMobile = matchMedia("(max-width: 768px)").matches;
//   const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);

//   // ---------- Core setup
//   const scene = new THREE.Scene();
//   scene.fog = new THREE.Fog(0x000000, 7, 26);

//   const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
//   camera.position.set(0, 0.2, 10);

//   const renderer = new THREE.WebGLRenderer({
//     antialias: true,
//     alpha: true,
//     powerPreference: "high-performance",
//   });
//   renderer.setPixelRatio(DPR);
//   renderer.setClearColor(0x000000, 0);
//   renderer.outputColorSpace = THREE.SRGBColorSpace;
//   mount.appendChild(renderer.domElement);

//   // Postprocessing (glow)
//   const composer = new EffectComposer(renderer);
//   composer.addPass(new RenderPass(scene, camera));
//   const bloom = new UnrealBloomPass(
//     new THREE.Vector2(1, 1),
//     isMobile ? 0.55 : 0.85,
//     0.65,
//     0.22
//   );
//   composer.addPass(bloom);

//   // Lights
//   scene.add(new THREE.AmbientLight(0xffffff, 0.55));

//   const key = new THREE.DirectionalLight(0xffffff, 1.1);
//   key.position.set(4, 3, 5);
//   scene.add(key);

//   const rim = new THREE.DirectionalLight(0x6aa6ff, 1.0);
//   rim.position.set(-6, 1.5, 3);
//   scene.add(rim);

//   const pulse = new THREE.PointLight(0x6aa6ff, 1.0, 25);
//   pulse.position.set(0, 0.7, 7);
//   scene.add(pulse);

//   // Resize
//   function resize() {
//     const w = mount.clientWidth || window.innerWidth;
//     const h = mount.clientHeight || window.innerHeight;
//     camera.aspect = w / h;
//     camera.updateProjectionMatrix();
//     renderer.setSize(w, h);
//     composer.setSize(w, h);
//     bloom.setSize(w, h);
//   }
//   addEventListener("resize", resize, { passive: true });
//   resize();

//   // Helpers
//   const tmp = new THREE.Object3D();
//   function setGroupAlpha(group, a) {
//     group.traverse((o) => {
//       if (!o.material) return;
//       const mats = Array.isArray(o.material) ? o.material : [o.material];
//       mats.forEach((m) => {
//         if (m.opacity === undefined) return;
//         m.transparent = true;
//         m.opacity = a;
//         m.depthWrite = a > 0.35;
//       });
//     });
//   }

//   // ---------- Background particles (subtle, always)
//   const starCount = isMobile ? 700 : 1400;
//   const starPos = new Float32Array(starCount * 3);
//   for (let i = 0; i < starCount; i++) {
//     const i3 = i * 3;
//     starPos[i3 + 0] = (Math.random() - 0.5) * 30;
//     starPos[i3 + 1] = (Math.random() - 0.5) * 18;
//     starPos[i3 + 2] = -Math.random() * 28;
//   }
//   const starsGeo = new THREE.BufferGeometry();
//   starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
//   const starsMat = new THREE.PointsMaterial({
//     size: isMobile ? 0.018 : 0.022,
//     transparent: true,
//     opacity: 0.55,
//     depthWrite: false,
//   });
//   const stars = new THREE.Points(starsGeo, starsMat);
//   scene.add(stars);

//   // ---------- Scene A: HERO (halo + orbit)
//   const hero = new THREE.Group();
//   scene.add(hero);

//   const heroCoreGeo = new THREE.IcosahedronGeometry(1.6, 3);
//   const heroCoreMat = new THREE.MeshPhysicalMaterial({
//     color: 0x2f6bff,
//     metalness: 0.65,
//     roughness: 0.16,
//     clearcoat: 0.65,
//     clearcoatRoughness: 0.25,
//     emissive: new THREE.Color(0x0a102d),
//     emissiveIntensity: 0.55,
//     transparent: true,
//     opacity: 0.18, // keep it subtle
//   });
//   const heroCore = new THREE.Mesh(heroCoreGeo, heroCoreMat);
//   hero.add(heroCore);

//   const heroWire = new THREE.Mesh(
//     heroCoreGeo,
//     new THREE.MeshBasicMaterial({ color: 0x9bbcff, wireframe: true, transparent: true, opacity: 0.26 })
//   );
//   hero.add(heroWire);

//   const heroRing = new THREE.Mesh(
//     new THREE.TorusGeometry(2.35, 0.03, 14, 220),
//     new THREE.MeshBasicMaterial({ color: 0x6aa6ff, transparent: true, opacity: 0.22 })
//   );
//   heroRing.rotation.x = Math.PI / 2.35;
//   heroRing.rotation.y = Math.PI / 9;
//   hero.add(heroRing);

//   // Position hero object to the RIGHT behind portrait
//   hero.position.set(2.7, -0.1, 0);

//   // ---------- Scene B: SKILLS (floating tiles wall)
//   const skills = new THREE.Group();
//   scene.add(skills);

//   const tileCount = isMobile ? 70 : 140;
//   const tileGeo = new THREE.BoxGeometry(0.55, 0.35, 0.06);
//   const tileMat = new THREE.MeshStandardMaterial({
//     color: 0x6aa6ff,
//     metalness: 0.25,
//     roughness: 0.35,
//     transparent: true,
//     opacity: 0.0,
//   });

//   const tiles = new THREE.InstancedMesh(tileGeo, tileMat, tileCount);
//   tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//   skills.add(tiles);

//   // Arrange tiles in a gentle arc (feels designed)
//   const radius = 4.8;
//   for (let i = 0; i < tileCount; i++) {
//     const t = i / tileCount;
//     const angle = (t - 0.5) * 1.2;     // arc
//     const y = (Math.sin(t * Math.PI * 2) * 1.2) + (Math.random() - 0.5) * 0.35;

//     tmp.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius - 5.5);
//     tmp.rotation.set((Math.random() - 0.5) * 0.35, angle + Math.PI, (Math.random() - 0.5) * 0.25);
//     tmp.updateMatrix();
//     tiles.setMatrixAt(i, tmp.matrix);
//   }
//   tiles.instanceMatrix.needsUpdate = true;

//   skills.position.set(0.2, 0.2, 0);

//   // ---------- Scene C: PROJECTS (portal + screen cards)
//   const projects = new THREE.Group();
//   scene.add(projects);

//   const portal = new THREE.Mesh(
//     new THREE.TorusGeometry(2.9, 0.07, 18, 260),
//     new THREE.MeshBasicMaterial({ color: 0x6aa6ff, transparent: true, opacity: 0.0 })
//   );
//   portal.rotation.x = Math.PI / 2.3;
//   portal.rotation.y = Math.PI / 7;
//   projects.add(portal);

//   // “Screen cards” (like product shots floating)
//   const cardGeo = new THREE.PlaneGeometry(1.6, 1.0, 1, 1);
//   const cardMat = new THREE.MeshBasicMaterial({
//     color: 0xffffff,
//     transparent: true,
//     opacity: 0.0,
//   });

//   const cards = [];
//   for (let i = 0; i < 5; i++) {
//     const c = new THREE.Mesh(cardGeo, cardMat.clone());
//     c.position.set(-1.6 + i * 0.8, -0.1 + (i % 2 ? 0.25 : -0.25), -2.2 - i * 0.35);
//     c.rotation.y = (i - 2) * 0.18;
//     c.rotation.x = -0.08;
//     projects.add(c);
//     cards.push(c);
//   }

//   projects.position.set(0, 0.1, 0);

//   // Initial visibility
//   setGroupAlpha(hero, 1);
//   setGroupAlpha(skills, 0);
//   setGroupAlpha(projects, 0);

//   // ---------- Scroll choreography (THIS is what makes it “senior”)
//   // HOME: hero alive, then fades as you leave home
//   gsap.timeline({
//     scrollTrigger: {
//       trigger: "#home",
//       start: "top top",
//       end: "bottom top",
//       scrub: 1,
//     },
//     onUpdate: (self) => {
//       const p = self.progress;
//       const alpha = 1 - p;
//       setGroupAlpha(hero, 1);
//       heroCoreMat.opacity = 0.12 + 0.10 * alpha;
//       heroWire.material.opacity = 0.18 + 0.10 * alpha;
//       heroRing.material.opacity = 0.14 + 0.10 * alpha;
//     },
//   })
//     .to(hero.position, { x: 2.4, y: 0.35, ease: "none" }, 0)
//     .to(hero.rotation, { y: Math.PI * 0.75, x: Math.PI * 0.18, ease: "none" }, 0);

//   // SKILLS + SERVICES: tiles appear and drift (feels like “systems”)
//   gsap.timeline({
//     scrollTrigger: {
//       trigger: "#skills",
//       start: "top 75%",
//       end: "#services bottom 40%",
//       scrub: 1,
//     },
//     onUpdate: (self) => {
//       const p = self.progress;
//       setGroupAlpha(skills, 1);
//       // Fade tiles in/out smoothly
//       tileMat.opacity = 0.02 + 0.22 * Math.sin(Math.PI * p);
//       // hero fades down while skills are active
//       setGroupAlpha(hero, 0.25);
//     },
//   })
//     .to(skills.rotation, { y: Math.PI * 0.55, ease: "none" }, 0)
//     .to(skills.position, { x: -0.2, y: 0.0, ease: "none" }, 0);

//   // PROJECTS + SHOWCASE: portal + cards “enter”
//   gsap.timeline({
//     scrollTrigger: {
//       trigger: "#projects",
//       start: "top 80%",
//       end: "#showcase bottom 40%",
//       scrub: 1,
//     },
//     onUpdate: (self) => {
//       const p = self.progress;
//       setGroupAlpha(projects, 1);
//       portal.material.opacity = 0.02 + 0.28 * Math.sin(Math.PI * p);
//       cards.forEach((c, i) => (c.material.opacity = 0.03 + 0.30 * Math.sin(Math.PI * p) * (0.7 + i * 0.06)));
//       setGroupAlpha(skills, 0.22);
//       setGroupAlpha(hero, 0.18);
//     },
//   })
//     .to(portal.rotation, { z: Math.PI * 0.8, ease: "none" }, 0)
//     .to(projects.position, { y: 0.25, ease: "none" }, 0)
//     .to(cards[0].position, { x: -2.0, ease: "none" }, 0)
//     .to(cards[4].position, { x: 2.0, ease: "none" }, 0);

//   // ---------- Subtle mouse parallax (tiny = premium)
//   const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
//   addEventListener("pointermove", (e) => {
//     const nx = (e.clientX / innerWidth) * 2 - 1;
//     const ny = (e.clientY / innerHeight) * 2 - 1;
//     mouse.tx = nx;
//     mouse.ty = ny;
//   }, { passive: true });

//   // Render loop
//   let raf = 0;
//   function tick() {
//     raf = requestAnimationFrame(tick);

//     // soften parallax
//     mouse.x += (mouse.tx - mouse.x) * 0.05;
//     mouse.y += (mouse.ty - mouse.y) * 0.05;

//     // camera parallax (small)
//     camera.position.x = mouse.x * 0.35;
//     camera.position.y = 0.2 + mouse.y * 0.18;
//     camera.lookAt(0, 0, 0);

//     // ambient motion
//     const t = performance.now() * 0.00045;
//     stars.rotation.y += 0.00035;
//     stars.rotation.x = Math.sin(t) * 0.02;

//     hero.rotation.z = Math.sin(t) * 0.05;
//     heroRing.rotation.y += 0.0015;

//     skills.rotation.x = Math.cos(t * 0.7) * 0.03;

//     projects.rotation.y = Math.sin(t * 0.6) * 0.05;

//     pulse.position.x = Math.sin(t * 2.2) * 0.7;
//     pulse.position.y = 0.7 + Math.cos(t * 1.6) * 0.25;

//     composer.render();
//   }
//   tick();

//   // pause when tab hidden
//   document.addEventListener("visibilitychange", () => {
//     if (document.visibilityState === "hidden") cancelAnimationFrame(raf);
//     else tick();
//   });
// })();

// ./js/three-scroll.js
//  import * as THREE from "three";
// import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// (() => {
//   const mount = document.getElementById("three-bg");
//   if (!mount) return;

//   const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
//   if (prefersReducedMotion) return;

//   if (!window.gsap || !window.ScrollTrigger) return;
//   gsap.registerPlugin(ScrollTrigger);

//   const isMobile = matchMedia("(max-width: 768px)").matches;
//   const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);

//   // ---- helpers
//   const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

//   function readAccentFromCSS() {
//     const cs = getComputedStyle(document.documentElement);
//     // try a few common vars; keep fallback
//     const candidates = [
//       cs.getPropertyValue("--skin-color"),
//       cs.getPropertyValue("--accent"),
//       cs.getPropertyValue("--primary"),
//       cs.getPropertyValue("--color-primary"),
//     ]
//       .map((s) => (s || "").trim())
//       .filter(Boolean);

//     const v = candidates[0] || "#5A8CFF";
//     // Normalize rgb(...) to hex-ish by letting THREE parse it
//     try {
//       return new THREE.Color(v);
//     } catch {
//       return new THREE.Color("#5A8CFF");
//     }
//   }

//   // ---------------- scene / camera / renderer
//   const scene = new THREE.Scene();
//   scene.fog = new THREE.Fog(0x000000, 6, 22);

//   const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
//   camera.position.set(0, 0.05, 8.4);

//   const renderer = new THREE.WebGLRenderer({
//     antialias: true,
//     alpha: true,
//     powerPreference: "high-performance",
//   });
//   renderer.setPixelRatio(DPR);
//   renderer.setClearColor(0x000000, 0);
//   renderer.outputColorSpace = THREE.SRGBColorSpace;
//   mount.appendChild(renderer.domElement);

//   // ---------------- post
//   const composer = new EffectComposer(renderer);
//   composer.addPass(new RenderPass(scene, camera));
//   const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), isMobile ? 0.52 : 0.66, 0.7, 0.25);
//   composer.addPass(bloom);

//   function resize() {
//     const w = mount.clientWidth || innerWidth;
//     const h = mount.clientHeight || innerHeight;
//     camera.aspect = w / h;
//     camera.updateProjectionMatrix();
//     renderer.setSize(w, h, false);
//     composer.setSize(w, h);
//     bloom.setSize(w, h);
//   }
//   addEventListener("resize", resize, { passive: true });
//   resize();

//   // ---------------- art-direction state
//   const state = {
//     scroll: 0,
//     accent: readAccentFromCSS(),
//     // network feel
//     nodeStrength: 1.0,
//     linkDistance: isMobile ? 1.15 : 1.42,
//     linkOpacity: 0.20,
//     // nebula
//     nebulaStrength: 0.75,
//     nebulaScale: 1.0,
//     spotX: 0.72,
//     spotY: 0.35,
//     // grid
//     gridStrength: 0.4,
//     warp: 0.35,
//     // post
//     bloomStrength: isMobile ? 0.48 : 0.64,
//   };

//   // master scroll 0..1
//   gsap.to(state, {
//     scroll: 1,
//     ease: "none",
//     scrollTrigger: {
//       trigger: document.documentElement,
//       start: "top top",
//       end: "bottom bottom",
//       scrub: 1,
//     },
//   });

//   // ---------------- subtle ambient light (just enough)
//   const ambient = new THREE.AmbientLight(0xffffff, 0.15);
//   scene.add(ambient);

//   // ---------------- stars (small, deep)
//   const starCount = isMobile ? 900 : 1700;
//   const starPos = new Float32Array(starCount * 3);
//   const starCol = new Float32Array(starCount * 3);

//   for (let i = 0; i < starCount; i++) {
//     const i3 = i * 3;
//     starPos[i3 + 0] = (Math.random() - 0.5) * 36;
//     starPos[i3 + 1] = (Math.random() - 0.5) * 18;
//     starPos[i3 + 2] = -Math.random() * 34;

//     const c = 0.55 + Math.random() * 0.45;
//     starCol[i3 + 0] = c;
//     starCol[i3 + 1] = c;
//     starCol[i3 + 2] = c;
//   }

//   const starsGeo = new THREE.BufferGeometry();
//   starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
//   starsGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));

//   const starsMat = new THREE.PointsMaterial({
//     size: isMobile ? 0.018 : 0.022,
//     transparent: true,
//     opacity: 0.32,
//     depthWrite: false,
//     vertexColors: true,
//   });

//   const stars = new THREE.Points(starsGeo, starsMat);
//   scene.add(stars);

//   // ---------------- premium nebula spotlight (shader plane)
//   const nebulaUniforms = {
//     uTime: { value: 0 },
//     uScroll: { value: 0 },
//     uAccent: { value: state.accent.clone() },
//     uStrength: { value: state.nebulaStrength },
//     uScale: { value: state.nebulaScale },
//     uSpot: { value: new THREE.Vector2(state.spotX, state.spotY) },
//     uNoise: { value: 0.55 },
//   };

//   const nebula = new THREE.Mesh(
//     new THREE.PlaneGeometry(22, 12, 1, 1),
//     new THREE.ShaderMaterial({
//       uniforms: nebulaUniforms,
//       transparent: true,
//       depthWrite: false,
//       blending: THREE.AdditiveBlending,
//       vertexShader: `
//         varying vec2 vUv;
//         void main(){
//           vUv = uv;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         varying vec2 vUv;

//         uniform float uTime;
//         uniform float uScroll;
//         uniform vec3 uAccent;
//         uniform float uStrength;
//         uniform float uScale;
//         uniform vec2 uSpot;
//         uniform float uNoise;

//         // fbm noise (lightweight)
//         float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
//         float noise(vec2 p){
//           vec2 i = floor(p), f = fract(p);
//           float a = hash(i);
//           float b = hash(i + vec2(1.0,0.0));
//           float c = hash(i + vec2(0.0,1.0));
//           float d = hash(i + vec2(1.0,1.0));
//           vec2 u = f*f*(3.0-2.0*f);
//           return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
//         }
//         float fbm(vec2 p){
//           float v = 0.0;
//           float a = 0.55;
//           for(int i=0;i<4;i++){
//             v += a * noise(p);
//             p *= 2.0;
//             a *= 0.5;
//           }
//           return v;
//         }

//         void main(){
//           vec2 uv = vUv;
//           float t = uTime * 0.06;
//           float s = uScroll;

//           // cinematic “spotlight” mask
//           float d = distance(uv, uSpot);
//           float spot = 1.0 - smoothstep(0.0, 0.85, d);
//           spot = pow(spot, 1.6);

//           // keep readability (don’t wash whole page)
//           float vignette = smoothstep(1.1, 0.35, distance(uv, vec2(0.5)));
//           vignette *= 0.85;

//           // flowing nebula texture
//           vec2 p = (uv - 0.5) * vec2(1.25, 1.0);
//           p *= (1.2 + uScale * 0.6);
//           p.x += sin(t*2.0) * 0.18;
//           p.y += cos(t*1.6) * 0.12;

//           float n = fbm(p + vec2(t*2.2, -t*1.8));
//           float n2 = fbm(p*1.5 + vec2(-t*1.2, t*2.0));
//           float flow = mix(n, n2, 0.5);

//           // subtle light bands
//           float bands = sin((uv.y * 7.5 + flow*2.2 + t*8.0)) * 0.5 + 0.5;
//           bands = smoothstep(0.25, 0.92, bands);

//           float energy = (flow * (0.55 + uNoise) + bands * 0.35) * spot;
//           energy *= (0.55 + s * 0.35);
//           energy *= vignette;

//           // color grade (accent + violet hint)
//           vec3 violet = vec3(0.55, 0.45, 1.0);
//           vec3 col = mix(violet, uAccent, 0.65);
//           col *= (0.65 + energy * 1.35);

//           float alpha = energy * uStrength * 0.55;
//           gl_FragColor = vec4(col, alpha);
//         }
//       `,
//     })
//   );
//   nebula.position.set(0, 0.25, -6.4);
//   scene.add(nebula);

//   // ---------------- subtle holo grid plane (much calmer)
//   const gridUniforms = {
//     uTime: { value: 0 },
//     uScroll: { value: 0 },
//     uAccent: { value: state.accent.clone() },
//     uGrid: { value: state.gridStrength },
//     uWarp: { value: state.warp },
//     uOpacity: { value: 0.55 },
//   };

//   const gridPlane = new THREE.Mesh(
//     new THREE.PlaneGeometry(18, 10, isMobile ? 120 : 220, isMobile ? 80 : 150),
//     new THREE.ShaderMaterial({
//       uniforms: gridUniforms,
//       transparent: true,
//       depthWrite: false,
//       blending: THREE.AdditiveBlending,
//       vertexShader: `
//         uniform float uTime;
//         uniform float uScroll;
//         uniform float uWarp;
//         varying vec2 vUv;
//         varying float vLift;

//         float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
//         float noise(vec2 p){
//           vec2 i=floor(p), f=fract(p);
//           float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
//           vec2 u=f*f*(3.-2.*f);
//           return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
//         }

//         void main(){
//           vUv = uv;
//           vec3 pos = position;
//           float t = uTime * 0.55;
//           float s = uScroll;

//           float n = noise(pos.xy*0.25 + vec2(t, t*0.7));
//           float w = sin(pos.x*0.7 + t*1.5)*0.18 + cos(pos.y*1.1 - t*1.0)*0.14;

//           float lift = (n + w) * (0.25 + uWarp) * (0.25 + s*0.55);
//           pos.z += lift;
//           vLift = lift;

//           gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
//         }
//       `,
//       fragmentShader: `
//         uniform vec3 uAccent;
//         uniform float uGrid;
//         uniform float uOpacity;
//         varying vec2 vUv;
//         varying float vLift;

//         float line(float x, float w){
//           float fx = abs(fract(x)-0.5);
//           return 1.0 - smoothstep(0.0, w, fx);
//         }

//         void main(){
//           float v = smoothstep(0.95, 0.25, distance(vUv, vec2(0.5)));
//           v *= 0.75;

//           float gx = line(vUv.x*18.0 + vLift*0.6, 0.06);
//           float gy = line(vUv.y*12.0 - vLift*0.45, 0.06);
//           float grid = (gx+gy) * uGrid;

//           vec3 col = uAccent * (0.12 + grid * 0.9);
//           col += vec3(1.0) * grid * 0.06;

//           float alpha = grid * uOpacity * v;
//           gl_FragColor = vec4(col, alpha);
//         }
//       `,
//     })
//   );
//   gridPlane.position.set(0, 0.05, -5.9);
//   scene.add(gridPlane);

//   // ---------------- neon node network (upgraded: distance-faded links)
//   const nodeCount = isMobile ? 120 : 180;
//   const nodes = new Float32Array(nodeCount * 3);
//   const vel = new Float32Array(nodeCount * 3);

//   for (let i = 0; i < nodeCount; i++) {
//     const i3 = i * 3;
//     nodes[i3 + 0] = (Math.random() - 0.5) * 12;
//     nodes[i3 + 1] = (Math.random() - 0.5) * 6;
//     nodes[i3 + 2] = -2.2 - Math.random() * 10.5;

//     vel[i3 + 0] = (Math.random() - 0.5) * 0.006;
//     vel[i3 + 1] = (Math.random() - 0.5) * 0.006;
//     vel[i3 + 2] = (Math.random() - 0.5) * 0.004;
//   }

//   const nodeGeo = new THREE.BufferGeometry();
//   nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodes, 3));

//   const nodeMat = new THREE.PointsMaterial({
//     size: isMobile ? 0.055 : 0.07,
//     transparent: true,
//     opacity: 0.95,
//     depthWrite: false,
//     blending: THREE.AdditiveBlending,
//     color: state.accent.clone(),
//   });

//   const nodePoints = new THREE.Points(nodeGeo, nodeMat);
//   scene.add(nodePoints);

//   // line geometry with vertexColors for distance fade
//   const maxLinks = isMobile ? 750 : 1400;
//   const linePos = new Float32Array(maxLinks * 2 * 3);
//   const lineCol = new Float32Array(maxLinks * 2 * 3);

//   const lineGeo = new THREE.BufferGeometry();
//   lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
//   lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
//   lineGeo.setDrawRange(0, 0);

//   const lineMat = new THREE.LineBasicMaterial({
//     transparent: true,
//     opacity: 0.24, // base, we fade with vertex colors too
//     depthWrite: false,
//     blending: THREE.AdditiveBlending,
//     vertexColors: true,
//   });

//   const links = new THREE.LineSegments(lineGeo, lineMat);
//   scene.add(links);

//   // ---------------- section presets (strong art direction)
//   function applyPreset(p) {
//     const c = new THREE.Color(p.accent);

//     gsap.to(state, {
//       nodeStrength: p.nodeStrength,
//       linkDistance: p.linkDistance,
//       linkOpacity: p.linkOpacity,
//       nebulaStrength: p.nebulaStrength,
//       nebulaScale: p.nebulaScale,
//       spotX: p.spotX,
//       spotY: p.spotY,
//       gridStrength: p.gridStrength,
//       warp: p.warp,
//       bloomStrength: p.bloomStrength,
//       duration: 0.8,
//       ease: "power2.out",
//       onUpdate: () => {
//         nebulaUniforms.uStrength.value = state.nebulaStrength;
//         nebulaUniforms.uScale.value = state.nebulaScale;
//         nebulaUniforms.uSpot.value.set(state.spotX, state.spotY);

//         gridUniforms.uGrid.value = state.gridStrength;
//         gridUniforms.uWarp.value = state.warp;
//         bloom.strength = state.bloomStrength;
//         lineMat.opacity = state.linkOpacity;
//       },
//     });

//     gsap.to(state.accent, { r: c.r, g: c.g, b: c.b, duration: 0.8, ease: "power2.out" });
//     gsap.to(nodeMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.8, ease: "power2.out" });
//     gsap.to(nebulaUniforms.uAccent.value, { r: c.r, g: c.g, b: c.b, duration: 0.8, ease: "power2.out" });
//     gsap.to(gridUniforms.uAccent.value, { r: c.r, g: c.g, b: c.b, duration: 0.8, ease: "power2.out" });
//   }

//   ScrollTrigger.create({
//     trigger: "#home",
//     start: "top 70%",
//     end: "bottom 20%",
//     onEnter: () =>
//       applyPreset({
//         accent: "#5A8CFF",
//         nodeStrength: 1.0,
//         linkDistance: isMobile ? 1.20 : 1.45,
//         linkOpacity: 0.22,
//         nebulaStrength: 0.85,
//         nebulaScale: 1.05,
//         spotX: 0.74,
//         spotY: 0.34,
//         gridStrength: 0.14,
//         warp: 0.42,
//         bloomStrength: isMobile ? 0.52 : 0.68,
//       }),
//     onEnterBack: () =>
//       applyPreset({
//         accent: "#5A8CFF",
//         nodeStrength: 1.0,
//         linkDistance: isMobile ? 1.20 : 1.45,
//         linkOpacity: 0.22,
//         nebulaStrength: 0.85,
//         nebulaScale: 1.05,
//         spotX: 0.74,
//         spotY: 0.34,
//         gridStrength: 0.14,
//         warp: 0.42,
//         bloomStrength: isMobile ? 0.52 : 0.68,
//       }),
//   });

//   ScrollTrigger.create({
//     trigger: "#skills",
//     start: "top 75%",
//     end: "#services bottom 40%",
//     onEnter: () =>
//       applyPreset({
//         accent: "#4FD1FF",
//         nodeStrength: 0.85,
//         linkDistance: isMobile ? 1.10 : 1.30,
//         linkOpacity: 0.18,
//         nebulaStrength: 0.55,
//         nebulaScale: 0.95,
//         spotX: 0.55,
//         spotY: 0.42,
//         gridStrength: 0.24,
//         warp: 0.26,
//         bloomStrength: isMobile ? 0.45 : 0.58,
//       }),
//     onEnterBack: () =>
//       applyPreset({
//         accent: "#4FD1FF",
//         nodeStrength: 0.85,
//         linkDistance: isMobile ? 1.10 : 1.30,
//         linkOpacity: 0.18,
//         nebulaStrength: 0.55,
//         nebulaScale: 0.95,
//         spotX: 0.55,
//         spotY: 0.42,
//         gridStrength: 0.24,
//         warp: 0.26,
//         bloomStrength: isMobile ? 0.45 : 0.58,
//       }),
//   });

//   ScrollTrigger.create({
//     trigger: "#projects",
//     start: "top 80%",
//     end: "#showcase bottom 40%",
//     onEnter: () =>
//       applyPreset({
//         accent: "#7C6BFF",
//         nodeStrength: 0.75,
//         linkDistance: isMobile ? 1.05 : 1.22,
//         linkOpacity: 0.16,
//         nebulaStrength: 0.78,
//         nebulaScale: 1.10,
//         spotX: 0.62,
//         spotY: 0.30,
//         gridStrength: 0.12,
//         warp: 0.34,
//         bloomStrength: isMobile ? 0.48 : 0.64,
//       }),
//     onEnterBack: () =>
//       applyPreset({
//         accent: "#7C6BFF",
//         nodeStrength: 0.75,
//         linkDistance: isMobile ? 1.05 : 1.22,
//         linkOpacity: 0.16,
//         nebulaStrength: 0.78,
//         nebulaScale: 1.10,
//         spotX: 0.62,
//         spotY: 0.30,
//         gridStrength: 0.12,
//         warp: 0.34,
//         bloomStrength: isMobile ? 0.48 : 0.64,
//       }),
//   });

//   ScrollTrigger.create({
//     trigger: "#contact",
//     start: "top 80%",
//     end: "bottom 30%",
//     onEnter: () =>
//       applyPreset({
//         accent: "#63FFB0",
//         nodeStrength: 0.55,
//         linkDistance: isMobile ? 0.95 : 1.10,
//         linkOpacity: 0.14,
//         nebulaStrength: 0.45,
//         nebulaScale: 0.90,
//         spotX: 0.45,
//         spotY: 0.55,
//         gridStrength: 0.10,
//         warp: 0.18,
//         bloomStrength: isMobile ? 0.36 : 0.45,
//       }),
//     onEnterBack: () =>
//       applyPreset({
//         accent: "#63FFB0",
//         nodeStrength: 0.55,
//         linkDistance: isMobile ? 0.95 : 1.10,
//         linkOpacity: 0.14,
//         nebulaStrength: 0.45,
//         nebulaScale: 0.90,
//         spotX: 0.45,
//         spotY: 0.55,
//         gridStrength: 0.10,
//         warp: 0.18,
//         bloomStrength: isMobile ? 0.36 : 0.45,
//       }),
//   });

//   // ---------------- mouse parallax (premium, subtle)
//   const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
//   addEventListener(
//     "pointermove",
//     (e) => {
//       mouse.tx = (e.clientX / innerWidth) * 2 - 1;
//       mouse.ty = (e.clientY / innerHeight) * 2 - 1;
//     },
//     { passive: true }
//   );

//   // ---------------- update network
//   function updateNetwork(time) {
//     // drift nodes
//     for (let i = 0; i < nodeCount; i++) {
//       const i3 = i * 3;
//       nodes[i3 + 0] += vel[i3 + 0] * (0.75 + state.nodeStrength);
//       nodes[i3 + 1] += vel[i3 + 1] * (0.75 + state.nodeStrength);
//       nodes[i3 + 2] += vel[i3 + 2] * 0.6;

//       if (nodes[i3 + 0] > 6 || nodes[i3 + 0] < -6) vel[i3 + 0] *= -1;
//       if (nodes[i3 + 1] > 3.2 || nodes[i3 + 1] < -3.2) vel[i3 + 1] *= -1;
//       if (nodes[i3 + 2] > -2.0 || nodes[i3 + 2] < -12.5) vel[i3 + 2] *= -1;
//     }
//     nodeGeo.attributes.position.needsUpdate = true;

//     // build links with distance fade
//     const maxD = state.linkDistance;
//     const maxD2 = maxD * maxD;

//     let ptr = 0;
//     let cptr = 0;
//     let segs = 0;

//     // current accent
//     const ar = state.accent.r;
//     const ag = state.accent.g;
//     const ab = state.accent.b;

//     for (let i = 0; i < nodeCount; i++) {
//       const ia = i * 3;
//       const ax = nodes[ia + 0];
//       const ay = nodes[ia + 1];
//       const az = nodes[ia + 2];

//       for (let j = i + 1; j < nodeCount; j++) {
//         const ib = j * 3;
//         const bx = nodes[ib + 0];
//         const by = nodes[ib + 1];
//         const bz = nodes[ib + 2];

//         const dx = ax - bx;
//         const dy = ay - by;
//         const dz = az - bz;
//         const d2 = dx * dx + dy * dy + dz * dz;

//         if (d2 < maxD2) {
//           if (segs >= maxLinks) break;

//           const d = Math.sqrt(d2);
//           // fade by distance (near = brighter)
//           const fade = clamp(1.0 - d / maxD, 0.0, 1.0);
//           const k = fade * fade;

//           // positions
//           linePos[ptr++] = ax;
//           linePos[ptr++] = ay;
//           linePos[ptr++] = az;

//           linePos[ptr++] = bx;
//           linePos[ptr++] = by;
//           linePos[ptr++] = bz;

//           // vertex colors (distance intensity)
//           lineCol[cptr++] = ar * (0.35 + k);
//           lineCol[cptr++] = ag * (0.35 + k);
//           lineCol[cptr++] = ab * (0.35 + k);

//           lineCol[cptr++] = ar * (0.35 + k);
//           lineCol[cptr++] = ag * (0.35 + k);
//           lineCol[cptr++] = ab * (0.35 + k);

//           segs++;
//         }
//       }
//       if (segs >= maxLinks) break;
//     }

//     lineGeo.setDrawRange(0, segs * 2);
//     lineGeo.attributes.position.needsUpdate = true;
//     lineGeo.attributes.color.needsUpdate = true;

//     // soften animation feel
//     nodeMat.opacity = 0.55 + state.nodeStrength * 0.38;
//   }

//   // ---------------- auto-update accent if style switcher changes
//   // (works even if you toggle disabled skins)
//   const mo = new MutationObserver(() => {
//     const c = readAccentFromCSS();
//     state.accent.copy(c);
//   });
//   mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
//   // Also watch link tags changes
//   document.querySelectorAll('link[rel="stylesheet"]').forEach((lnk) => {
//     mo.observe(lnk, { attributes: true, attributeFilter: ["disabled", "href"] });
//   });

//   // ---------------- render loop + light perf adaptation
//   let raf = 0;
//   let last = 0;
//   let avgDt = 0;
//   let perfTimer = 0;

//   function tick(t) {
//     raf = requestAnimationFrame(tick);

//     const time = t * 0.001;
//     const dt = Math.min(0.05, (t - last) * 0.001);
//     last = t;

//     // moving averages for perf
//     avgDt = avgDt * 0.95 + dt * 0.05;
//     perfTimer += dt;

//     // if getting heavy, reduce link distance slightly (cheapest optimization)
//     if (perfTimer > 2.0) {
//       perfTimer = 0;
//       if (avgDt > 0.030) {
//         state.linkDistance = Math.max(isMobile ? 0.95 : 1.05, state.linkDistance * 0.93);
//         lineMat.opacity = Math.max(0.10, lineMat.opacity * 0.92);
//       }
//     }

//     // uniforms
//     nebulaUniforms.uTime.value = time;
//     nebulaUniforms.uScroll.value = state.scroll;

//     gridUniforms.uTime.value = time;
//     gridUniforms.uScroll.value = state.scroll;

//     // color sync
//     nebulaUniforms.uAccent.value.copy(state.accent);
//     gridUniforms.uAccent.value.copy(state.accent);
//     nodeMat.color.copy(state.accent);

//     // mouse parallax camera
//     mouse.x += (mouse.tx - mouse.x) * 0.045;
//     mouse.y += (mouse.ty - mouse.y) * 0.045;

//     camera.position.x = mouse.x * 0.35;
//     camera.position.y = 0.05 + mouse.y * 0.20;
//     camera.lookAt(0, 0.05, -4);

//     // stars drift
//     stars.rotation.y += 0.00022;
//     stars.rotation.x = Math.sin(time * 0.25) * 0.018;

//     updateNetwork(time);

//     composer.render();
//   }

//   tick(0);

//   document.addEventListener("visibilitychange", () => {
//     if (document.visibilityState === "hidden") cancelAnimationFrame(raf);
//     else tick(0);
//   });
// })();
