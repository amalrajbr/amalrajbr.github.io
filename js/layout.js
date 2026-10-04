// Pure layout helpers shared by the 3D stage. No imports, so they can be unit-tested in plain Node.

/**
 * Left edge for a callout pill: just past the plate (`x`), but never so far right that the
 * pill leaves the mount. `gutter` is the minimum space kept at the mount's right edge.
 */
export function calloutLeft(x, pillWidth, mountWidth, gutter = 16) {
    return Math.max(0, Math.min(x, mountWidth - gutter - pillWidth));
}

/**
 * Amplitude (1 -> 0) of the stage's idle wobble. It runs for `hold` seconds after a stage comes on
 * screen, then eases out over `fade` seconds so the pose settles; scroll and pointer motion are separate.
 */
export function idleAmplitude(age, hold = 4, fade = 2) {
    const t = Math.min(1, Math.max(0, (age - hold) / fade));
    return 1 - t * t * (3 - 2 * t);
}
