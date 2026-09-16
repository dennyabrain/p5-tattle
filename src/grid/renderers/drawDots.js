/**
 * Draws a circle at the centroid of a region.
 *
 * @param {p5}     sketch    - The p5 instance.
 * @param {Region} region    - A region object from a walker.
 * @param {number} [size=4]  - Diameter of the dot in pixels.
 *
 * @example
 * for (const region of linearWalker(gridObj)) {
 *   sketch.fill(colors[region.index.col % colors.length])
 *   drawDots(sketch, region, 8)
 * }
 *
 * @example
 * // Use inside a clipped regionGrid for polka-dot patterns
 * const localGrid = regionGrid(brushRegion, { cols: 8, rows: 5 })
 * for (const cell of linearWalker(localGrid)) drawDots(sketch, cell, 12)
 */
export function drawDots(sketch, region, size = 4) {
  sketch.circle(region.center[0], region.center[1], size)
}
