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
