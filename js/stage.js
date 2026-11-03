// The 3D stage: one renderer, one canvas, three layered plates for the tooling showcase. Everything is procedural
// (no model files, no HDR): reflections come from three's RoomEnvironment.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { calloutLeft, idleAmplitude, pixelRatioFor } from './layout.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (cur, target, rate, dt) => lerp(cur, target, clamp(1 - Math.exp(-rate * dt), 0, 1));

// Plate geometry, in world units.
const W = 3.2, T = 0.16, D = 2.1;
const FOV = 26, CAM_Z = 11;

function gradientTexture(stops) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 512, 512);
    stops.forEach(([at, color]) => grad.addColorStop(at, color));
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

// Top-face art for the plates: the three plugins, top to bottom (Code Review / Review Orchestration / Monitor Loop).
const DECAL_W = 1024, DECAL_H = 672;

function decalTexture(draw) {
    const c = document.createElement('canvas');
    c.width = DECAL_W; c.height = DECAL_H;
    const g = c.getContext('2d');
    g.lineCap = 'round';
    g.lineJoin = 'round';
    draw(g, DECAL_W / 2, DECAL_H / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function inkGradient(g, from, to) {
    const grad = g.createLinearGradient(0, 0, DECAL_W, DECAL_H);
    grad.addColorStop(0, from);
    grad.addColorStop(1, to);
    return grad;
}

// Draws a mark twice, a soft offset first and the ink on top, so it reads as cut into the plate rather than printed on it.
function engrave(g, ink, edge, draw) {
    g.save();
    g.translate(4, 5);
    g.strokeStyle = edge; g.fillStyle = edge;
    draw();
    g.restore();
    g.strokeStyle = ink; g.fillStyle = ink;
    draw();
}

const decals = {
    showcase: [
        // Code Review: code brackets with a check mark, engraved into the titanium
        (g, cx, cy) => {
            engrave(g, inkGradient(g, '#3b5bd6', '#7a4bd6'), 'rgba(255, 255, 255, .6)', () => {
                g.lineWidth = 26;
                g.beginPath(); g.moveTo(cx - 120, cy - 120); g.lineTo(cx - 250, cy); g.lineTo(cx - 120, cy + 120); g.stroke();
                g.beginPath(); g.moveTo(cx + 120, cy - 120); g.lineTo(cx + 250, cy); g.lineTo(cx + 120, cy + 120); g.stroke();
                g.lineWidth = 30;
                g.beginPath(); g.moveTo(cx - 70, cy + 6); g.lineTo(cx - 14, cy + 66); g.lineTo(cx + 80, cy - 70); g.stroke();
            });
        },
        // Review Orchestration: a conductor node routing work to three workers and taking it back
        (g, cx, cy) => {
            engrave(g, 'rgba(70, 64, 200, .85)', 'rgba(255, 255, 255, .55)', () => {
                g.lineWidth = 12;
                const hub = [cx, cy], workers = [[cx - 270, cy - 110], [cx + 270, cy - 110], [cx, cy + 165]];
                workers.forEach(([x, y]) => { g.beginPath(); g.moveTo(hub[0], hub[1]); g.lineTo(x, y); g.stroke(); });
                g.beginPath(); g.arc(cx, cy, 56, 0, Math.PI * 2); g.stroke();
                g.beginPath(); g.arc(cx, cy, 20, 0, Math.PI * 2); g.fill();
                workers.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 38, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fill(); });
            });
        },
        // Monitor Loop: a ring that keeps turning, with a heartbeat inside
        (g, cx, cy) => {
            engrave(g, 'rgba(255, 255, 255, .95)', 'rgba(40, 40, 120, .25)', () => {
                g.lineWidth = 16;
                g.beginPath(); g.arc(cx, cy, 190, Math.PI * 0.15, Math.PI * 1.85); g.stroke();
                const t = Math.PI * 1.85;
                g.beginPath(); g.moveTo(cx + 190 * Math.cos(t) - 34, cy + 190 * Math.sin(t) - 38); g.lineTo(cx + 190 * Math.cos(t), cy + 190 * Math.sin(t)); g.lineTo(cx + 190 * Math.cos(t) + 42, cy + 190 * Math.sin(t) - 22); g.stroke();
                g.lineWidth = 18;
                g.beginPath();
                [[-130, 0], [-60, 0], [-30, -80], [20, 90], [55, -30], [75, 0], [130, 0]].forEach(([x, y], i) => (i ? g.lineTo(cx + x, cy + y) : g.moveTo(cx + x, cy + y)));
                g.stroke();
            });
        },
    ],
};

function radialTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.45, 'rgba(255,255,255,.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
}

export async function createStage({ onLost, onRestored } = {}) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');

    // Throws when WebGL is unavailable; the caller falls back to the CSS stack.
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();

    // Reflections come from a PMREM render target. three re-initialises its own GL state when a lost
    // context is restored, but that target's contents are gone and are not redrawn, so it is rebuilt then.
    let environment = null;
    function buildEnvironment() {
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const target = pmrem.fromScene(room, 0.04);
        pmrem.dispose();
        room.dispose();
        if (environment) environment.dispose();
        environment = target;
        scene.environment = target.texture;
    }
    buildEnvironment();

    // A lost context can come back (common on mobile GPUs under memory pressure): stop rendering and let
    // the page show its CSS stack meanwhile, then rebuild what lived only on the GPU and carry on.
    let lost = false;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; pause(); if (onLost) onLost(); });
    canvas.addEventListener('webglcontextrestored', () => {
        try {
            buildEnvironment();
        } catch (err) {
            console.warn('3D stage could not recover from a lost WebGL context, using the static stack.', err);
            return;
        }
        lost = false;
        snap = true;
        if (onRestored) onRestored();
    });

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
    camera.position.set(0, 0, CAM_Z);

    /* ---- lights: the environment does most of the work; two accents add edge and colour ---- */
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3.5, 5, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x6f8bff, 40, 14, 2);
    rim.position.set(-4.5, 1.5, -3);
    scene.add(rim);
    const glow = new THREE.PointLight(0x4d8dff, 0, 9, 2);
    scene.add(glow);

    /* ---- the stack ---- */
    const group = new THREE.Group();
    group.rotation.order = 'XYZ'; // spin about the plates' own vertical axis, then tilt toward the camera
    scene.add(group);

    const geometry = new RoundedBoxGeometry(W, T, D, 6, 0.075);
    const brandMap = gradientTexture([[0, '#2997ff'], [0.55, '#5e5ce6'], [1, '#bf5af2']]);

    const titanium = new THREE.MeshPhysicalMaterial({
        color: 0xcfd2d8, metalness: 0.88, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.35,
        emissive: 0x4d8dff, emissiveIntensity: 0,
    });
    const glass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.34, depthWrite: false,
        clearcoat: 1, clearcoatRoughness: 0.04,
        iridescence: 0.9, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 520],
        emissive: 0x4d8dff, emissiveIntensity: 0,
    });
    const brand = new THREE.MeshPhysicalMaterial({
        map: brandMap, roughness: 0.34, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12,
        emissive: 0xffffff, emissiveMap: brandMap, emissiveIntensity: 0.14,
    });
    const materials = [titanium, glass, brand];
    const baseEmissive = [0, 0, 0.14];
    const plates = materials.map((mat) => { const m = new THREE.Mesh(geometry, mat); group.add(m); return m; });

    // One decal per plate, its texture swapped with the mode. Transparent surfaces are sorted by renderOrder,
    // not distance, so the stack reads bottom decal < glass < glass decal < top decal however the camera turns.
    const decalTextures = { showcase: decals.showcase.map(decalTexture) };
    const decalMats = plates.map((plate, i) => {
        const mat = new THREE.MeshBasicMaterial({ map: decalTextures.showcase[i], transparent: true, opacity: 0.94, toneMapped: false, depthWrite: false });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.7, D * 0.7), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = T / 2 + 0.003;
        mesh.renderOrder = [4, 3, 1][i];
        plate.add(mesh);
        return mat;
    });
    plates[1].renderOrder = 2;

    // Soft contact shadow on light backgrounds, blue floor glow on dark ones.
    const floorMat = new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false, toneMapped: false, color: 0x000000, opacity: 0.3 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 5.6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    /* ---- state ---- */
    const S = { rotY: 0, rotX: 0.4, explode: 0, scale: 1, posX: 0, posY: 0, active: new Float32Array(3) };
    // `stacked` mirrors the page's own layout switch (see STACKED_QUERY in main.js and the stacked
    // block in styles.css). The canvas aspect cannot stand in for it: in the stacked arrangement the
    // canvas is only the top part of the stage.
    const input = { showcase: 0, step: -1, stacked: false };
    let mode = 'showcase';
    let mount = null;
    let calloutEls = [];
    let calloutW = []; // pill widths in px, measured on show/resize (0 = not measured or not displayed)
    let snap = true;
    let idleAge = 0; // seconds the current mode has been on screen; drives the idle wobble's fade-out
    let width = 1, height = 1;
    const v = new THREE.Vector3();

    function setMode(next) {
        if (mode === next && !snap) return;
        if (mode !== next) idleAge = 0;
        mode = next;
        const dark = next === 'showcase';
        floorMat.color.set(dark ? 0x2f6bff : 0x000000);
        floorMat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        floorMat.opacity = dark ? 0.55 : 0.28;
        floorMat.needsUpdate = true;
        rim.intensity = dark ? 70 : 40;
        snap = true;
    }

    function resize() {
        if (!mount) return;
        width = Math.max(1, mount.clientWidth);
        height = Math.max(1, mount.clientHeight);
        renderer.setPixelRatio(pixelRatioFor(width, height, devicePixelRatio));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        calloutW = calloutEls.map((el) => el.offsetWidth);
    }
    const resizeObserver = new ResizeObserver(resize);

    function targets(t) {
        const visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
        const visW = visH * camera.aspect;
        const wide = !input.stacked;
        const pxPerWorld = height / visH;
        const idle = Math.sin(t * 0.45) * idleAmplitude(idleAge);

        const targetPx = Math.min(width * (wide ? 0.4 : 0.8), 560);
        const fit = clamp(targetPx / pxPerWorld / 3.9, 0.4, 1.2);
        const p = input.showcase;
        return {
            rotY: 0.5 + idle * 0.12 + p * 1.5,
            rotX: lerp(0.5, 0.3, smooth(0.08, 0.5, p)),
            explode: smooth(0.04, 0.34, p),
            scale: fit,
            posX: wide ? visW * 0.125 : 0,
            posY: 0,
        };
    }

    function step(dt, t) {
        const tg = targets(t);
        const k = snap ? 1000 : 1;
        S.rotY = damp(S.rotY, tg.rotY, 5 * k, dt);
        S.rotX = damp(S.rotX, tg.rotX, 5 * k, dt);
        S.explode = damp(S.explode, tg.explode, 6 * k, dt);
        S.scale = damp(S.scale, tg.scale, 6 * k, dt);
        S.posX = damp(S.posX, tg.posX, 5 * k, dt);
        S.posY = damp(S.posY, tg.posY, 5 * k, dt);

        group.rotation.set(S.rotX, S.rotY, 0);
        group.scale.setScalar(S.scale);
        group.position.set(S.posX, S.posY, 0);

        const spacing = T + lerp(0.014, 1.0, S.explode);
        const showing = mode === 'showcase';
        plates.forEach((plate, i) => {
            const on = showing && input.step === i ? 1 : 0;
            S.active[i] = damp(S.active[i], on, 7 * k, dt);
            // A slow float, scaled by the separation so the plates never intersect while stacked.
            plate.position.y = (1 - i) * spacing + Math.sin(t * 0.9 + i * 1.7) * 0.05 * S.explode;
            plate.position.x = S.active[i] * 0.16;
            plate.rotation.y = (i - 1) * 0.2 * S.explode;
            materials[i].emissiveIntensity = baseEmissive[i] + S.active[i] * [0.28, 0.7, 0.45][i];
        });
        glass.opacity = 0.34 + S.active[1] * 0.18;

        // Lowest point of the tilted bottom plate: its centre plus the far corner's drop (about 1.95 * sin(tilt)).
        floor.position.set(S.posX, S.posY - (spacing * Math.cos(S.rotX) + 1.95 * Math.sin(S.rotX) + 0.12) * S.scale, 0);
        floor.scale.setScalar(S.scale * (0.9 + S.explode * 0.25));

        // Coloured light on whichever plate is being described.
        const idx = input.step;
        if (showing && idx >= 0) {
            plates[idx].getWorldPosition(v);
            glow.position.set(v.x + 1.2, v.y + 1.4, 2.4);
            glow.intensity = damp(glow.intensity, 22, 6 * k, dt);
        } else {
            glow.intensity = damp(glow.intensity, 0, 6 * k, dt);
        }

        // DOM callouts: project each plate to screen space. The stacked arrangement hides them.
        if (showing && calloutEls.length && !input.stacked) {
            // Pills sit just past the plates' right edge: half the slab's on-screen width plus a gap,
            // pulled back in when that would push a pill past the right edge of the mount.
            const offset = S.scale * (height / (2 * CAM_Z * Math.tan((FOV * Math.PI) / 360))) * 1.95 + 28;
            plates.forEach((plate, i) => {
                const el = calloutEls[i];
                if (!el) return;
                if (!calloutW[i]) calloutW[i] = el.offsetWidth;
                plate.getWorldPosition(v).project(camera);
                const x = calloutLeft((v.x * 0.5 + 0.5) * width + offset, calloutW[i], width);
                el.style.setProperty('--x', x.toFixed(1) + 'px');
                el.style.setProperty('--y', ((-v.y * 0.5 + 0.5) * height - 16).toFixed(1) + 'px');
            });
        }
        snap = false;
    }

    /* ---- loop ---- */
    let running = false, raf = 0, last = 0;
    function frame(now) {
        raf = requestAnimationFrame(frame);
        // rAF timestamps can precede performance.now() on the first frame: never let dt go negative.
        const elapsed = last ? (now - last) / 1000 : 0.016;
        const dt = clamp(elapsed, 0.001, 0.05);
        last = now;
        idleAge += Math.min(elapsed, 1); // wall-clock seconds on screen, so slow frames do not stretch the wobble
        step(dt, now / 1000);
        renderer.render(scene, camera);
    }
    function resume() { if (running || lost) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function pause() { running = false; cancelAnimationFrame(raf); }

    // Compile the shaders off the main thread (where the browser supports parallel compile) so the first
    // rendered frame does not stall the page while the CSS stack is still showing.
    // Capped at 1.5 s: if a browser never settles this, the stage must still start (the first render compiles instead).
    try { await Promise.race([renderer.compileAsync(scene, camera), new Promise((r) => setTimeout(r, 1500))]); } catch (err) { /* first render compiles instead */ }

    return {
        canvas,
        /** Attach the canvas to a mount point, switch the scene to that mode and start rendering. */
        show(name, el, callouts) {
            if (mount !== el) {
                if (mount) resizeObserver.unobserve(mount);
                mount = el;
                mount.appendChild(canvas);
                resizeObserver.observe(mount);
            }
            calloutEls = Array.from(callouts || []);
            calloutW = [];
            resize();
            setMode(name);
            resume();
        },
        /** Scroll-derived inputs, 0..1 per pinned section plus the active step. */
        update(next) { Object.assign(input, next); },
        pause,
        resume,
    };
}
