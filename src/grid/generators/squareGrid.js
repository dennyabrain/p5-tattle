/**
 * Generates a uniform rectangular grid of points spaced `cellSize` apart.
 * Points are yielded column-major (all rows of column 0, then column 1, etc.).
 *
 * @param {object} config
 * @param {number} config.width    - Canvas width in pixels.
 * @param {number} config.height   - Canvas height in pixels.
 * @param {number} config.cellSize - Spacing between adjacent grid points in pixels.
 * @returns {EnhancedIterable}
 *
 * @example
 * const grid = squareGrid({ width: 600, height: 600, cellSize: 40 })
 * drawLines(sketch, grid, grid.colSize)
 *
 * @example
 * // Combine with modifiers via pipe
 * const grid = pipe(
 *   squareGrid({ width: 600, height: 600, cellSize: 40 }),
 *   gridWithPerlin(sketch, { level: 8 })
 * )
 */
export function squareGrid(config) {
  return {
    colSize: Math.floor(config.height / config.cellSize) + 1,
    width: config.width,
    height: config.height,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      for (var i = 0; i < config.width + 1; i += config.cellSize) {
        for (var j = 0; j < config.height + 1; j += config.cellSize) {
          yield [i, j]
        }
      }
    }
  }
}
