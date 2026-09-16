/**
 * Displaces each grid point by a Perlin noise value sampled at its own
 * coordinates. Both axes are shifted by the same noise sample, producing a
 * diagonal warp. Larger `level` values create more visible distortion.
 *
 * @param {p5}    sketch        - The p5 instance (provides `sketch.noise`).
 * @param {object} [options]
 * @param {number} [options.level=4] - Maximum displacement in pixels.
 * @returns {function(grid): EnhancedIterable}
 *
 * @example
 * // Subtle warp on a square grid
 * pipe(squareGrid(config), gridWithPerlin(sketch, { level: 8 }))
 *
 * @example
 * // Heavy distortion inside a region sub-grid
 * pipe(regionGrid(brushRegion, { cols: 10, rows: 6 }), gridWithPerlin(sketch, { level: 30 }))
 */
export function gridWithPerlin(sketch, { level = 4 } = {}) {
  return function (grid) {
    return {
      ...grid,
      [Symbol.iterator]: function* () {
        for (const [cellX, cellY] of grid) {
          var n = sketch.noise(cellX, cellY)
          var x = sketch.map(n, 0, 1, cellX - level, cellX + level, true)
          var y = sketch.map(n, 0, 1, cellY - level, cellY + level, true)
          yield [x, y]
        }
      }
    }
  }
}
