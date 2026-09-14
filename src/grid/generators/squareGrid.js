export function squareGrid(config) {
  return {
    colSize: Math.ceil(config.height / config.cellSize) + 1,
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
