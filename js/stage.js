// The 3D stage: one renderer, one canvas, three layered plates. The canvas is moved between the
// hero and the tooling showcase, so only one WebGL context ever exists. Everything is procedural
// (no model files, no HDR): reflections come from three's RoomEnvironment.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { calloutLeft } from './layout.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (cur, target, rate, dt) => lerp(cur, target, clamp(1 - Math.exp(-rate * dt), 0, 1));

// Plate geometry, in world units.
const W = 3.2, T = 0.16, D = 2.1;
const FOV = 26, CAM_Z = 11;
const FONT = '-apple-system, "SF Pro Display", "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif';

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

function monogramTexture() {
    const w = 1024, h = 672;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#23252b');
    grad.addColorStop(1, '#5d616d');
    g.fillStyle = grad;
    g.font = `800 440px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('AR', w / 2, h / 2 + 24);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

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

export async function createStage({ onLost } = {}) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');

    // Throws when WebGL is unavailable; the caller falls back to the CSS stack.
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); pause(); if (onLost) onLost(); });

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

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

    const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(W * 0.7, D * 0.7),
        new THREE.MeshBasicMaterial({ map: monogramTexture(), transparent: true, opacity: 0.94, toneMapped: false, depthWrite: false }),
    );
    decal.rotation.x = -Math.PI / 2;
    decal.position.y = T / 2 + 0.003;
    plates[0].add(decal);

    // Soft contact shadow on light backgrounds, blue floor glow on dark ones.
    const floorMat = new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false, toneMapped: false, color: 0x000000, opacity: 0.3 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 5.6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    /* ---- state ---- */
    const S = { rotY: 0, rotX: 0.4, explode: 0, scale: 1, posX: 0, posY: 0, active: new Float32Array(3), pointerX: 0, pointerY: 0 };
    // `stacked` mirrors the page's own layout switch (see STACKED_QUERY in main.js and the stacked
    // block in styles.css). The canvas aspect cannot stand in for it: in the stacked arrangement the
    // canvas is only the top part of the stage.
    const input = { hero: 0, showcase: 0, step: -1, stacked: false };
    const pointer = { x: 0, y: 0 };
    let mode = 'hero';
    let mount = null;
    let calloutEls = [];
    let calloutW = []; // pill widths in px, measured on show/resize (0 = not measured or not displayed)
    let snap = true;
    let width = 1, height = 1;
    const v = new THREE.Vector3();

    function setMode(next) {
        if (mode === next && !snap) return;
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
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        calloutW = calloutEls.map((el) => el.offsetWidth);
    }
    const resizeObserver = new ResizeObserver(resize);

    // Fine pointers get a gentle parallax on the hero.
    if (matchMedia('(pointer: fine)').matches) {
        addEventListener('pointermove', (e) => {
            pointer.x = (e.clientX / innerWidth) * 2 - 1;
            pointer.y = (e.clientY / innerHeight) * 2 - 1;
        }, { passive: true });
    }

    function targets(t) {
        const visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
        const visW = visH * camera.aspect;
        const wide = !input.stacked;
        const pxPerWorld = height / visH;
        const idle = Math.sin(t * 0.45);

        if (mode === 'hero') {
            const p = input.hero;
            // Fit the slab into the free space under the hero copy (px, measured by the page).
            const L = input.heroLayout || { bottom: height * 0.55, h: height };
            const availH = Math.max(160, L.h - L.bottom - 28);
            const centreFrac = (L.bottom + 10 + availH * 0.46) / L.h; // where the slab sits at rest, 0 = top
            const targetPx = Math.min(width * (wide ? 0.48 : 0.84), availH * 1.5, 680);
            const fit = clamp(targetPx / pxPerWorld / 3.9, 0.35, 1.4);
            return {
                rotY: -0.55 + idle * 0.22 + pointer.x * 0.32 + p * 2.3,
                rotX: 0.42 - p * 0.14 + pointer.y * 0.08,
                explode: smooth(0.1, 0.95, p) * 0.4,
                scale: fit * (1 + p * 0.5),
                posX: 0,
                posY: lerp((0.5 - centreFrac) * visH, 0, smooth(0, 0.95, p)),
            };
        }
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
            plate.position.y = (1 - i) * spacing;
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
        const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 0.016;
        last = now;
        step(dt, now / 1000);
        renderer.render(scene, camera);
    }
    function resume() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function pause() { running = false; cancelAnimationFrame(raf); }

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
