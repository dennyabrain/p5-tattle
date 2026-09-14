/**
 * Draws a closed polygon using all boundary points of a region.
 * Uses `region.boundary` when available (multi-point perimeter from randomAccess
 * or arbitraryRegion), falling back to `region.corners` for single cells.
 *
 * @param {p5}     sketch - The p5 instance.
 * @param {Region} region - A region object from a walker.
 *
 * @example
 * // Draw the exact outline of an arbitraryRegion
 * drawPolygon(sketch, arbitraryRegion(gridObj, indices))
 *
 * @example
 * // Works on any region — single cells use the 4 corners
 * for (const region of linearWalker(gridObj)) drawPolygon(sketch, region)
 */
export function drawPolygon(sketch, region) {
  const pts = region.boundary ?? region.corners
  sketch.beginShape()
  for (const [x, y] of pts) sketch.vertex(x, y, 0)
  sketch.endShape(sketch.CLOSE)
}
