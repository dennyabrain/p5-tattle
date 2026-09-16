/**
 * Generates a grid of points fitted inside a region using bilinear interpolation
 * across the region's corners. The output is a standard enhanced-iterable grid,
 * compatible with all walkers, modifiers, and renderers.
 *
 * @param {Region} region       - A region object with `.corners` (TL, TR, BR, BL).
 * @param {object} config
 * @param {number} config.cols  - Number of columns of cells (points = cols + 1).
 * @param {number} config.rows  - Number of rows of cells (points = rows + 1).
 * @returns {EnhancedIterable}
 *
 * @example
 * // Fill a region with a sub-grid and walk it
 * const localGrid = regionGrid(brushRegion, { cols: 6, rows: 4 })
 * for (const cell of linearWalker(localGrid)) {
 *   drawDots(sketch, cell, 6)
 * }
 *
 * @example
 * // Clip to the region boundary and draw a nested pattern
 * sketch.beginClip()
 * drawPolygon(sketch, region)
 * sketch.endClip()
 * drawLines(sketch, regionGrid(region, { cols: 8, rows: 5 }), 6)
 * sketch.resetClip()
 */
export function regionGrid(region, { cols, rows }) {
  const [c0, c1, c2, c3] = region.corners

  const map = (u, v) => [
    (1 - u) * (1 - v) * c0[0] + u * (1 - v) * c1[0] + u * v * c2[0] + (1 - u) * v * c3[0],
    (1 - u) * (1 - v) * c0[1] + u * (1 - v) * c1[1] + u * v * c2[1] + (1 - u) * v * c3[1],
  ]

  const xs = [c0[0], c1[0], c2[0], c3[0]]
  const ys = [c0[1], c1[1], c2[1], c3[1]]

  return {
    colSize: rows + 1,
    width:   Math.max(...xs) - Math.min(...xs),
    height:  Math.max(...ys) - Math.min(...ys),
    origin:  region.center,
    [Symbol.iterator]: function* () {
      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row <= rows; row++) {
          yield map(col / cols, row / rows)
        }
      }
    }
  }
}
