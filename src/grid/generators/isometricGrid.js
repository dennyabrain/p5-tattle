/**
 * Generates an isometric (diamond) grid that fills the canvas.
 * Tile width equals `cellSize`; tile height is `cellSize / 2`.
 * The grid is horizontally centred and covers the full canvas height.
 *
 * @param {object} config
 * @param {number} config.width    - Canvas width in pixels.
 * @param {number} config.height   - Canvas height in pixels.
 * @param {number} config.cellSize - Width of each diamond tile in pixels.
 * @returns {EnhancedIterable}
 *
 * @example
 * const grid = isometricGrid({ width: 600, height: 600, cellSize: 60 })
 * drawLines(sketch, grid, grid.colSize)
 *
 * @example
 * // Walk cells and colour by column
 * for (const region of linearWalker(isometricGrid(config))) {
 *   sketch.fill(colors[region.index.col % colors.length])
 *   drawRect(sketch, region)
 * }
 */
export function isometricGrid(config) {
  const tileW = config.cellSize
  const tileH = config.cellSize / 2
  const steps = Math.ceil(2 * config.height / tileH)
  const cols = Math.ceil(steps / 2)
  const rows = steps - cols
  const offsetX = rows * (tileW / 2) + (config.width - (cols + rows) * (tileW / 2)) / 2

  return {
    colSize: rows + 1,
    width: config.width,
    height: config.height,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row <= rows; row++) {
          const x = offsetX + (col - row) * (tileW / 2)
          const y = (col + row) * (tileH / 2)
          yield [x, y]
        }
      }
    }
  }
}
