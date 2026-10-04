// Pure layout helpers shared by the 3D stage. No imports, so they can be unit-tested in plain Node.

/**
 * Left edge for a callout pill: just past the plate (`x`), but never so far right that the
 * pill leaves the mount. `gutter` is the minimum space kept at the mount's right edge.
 */
export function calloutLeft(x, pillWidth, mountWidth, gutter = 16) {
    return Math.max(0, Math.min(x, mountWidth - gutter - pillWidth));
}
