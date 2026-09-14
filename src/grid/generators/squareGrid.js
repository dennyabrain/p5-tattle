export function* squareGrid(config) {
  for (var i = 0; i < config.width + 1; i += config.cellSize) {
    for (var j = 0; j < config.height + 1; j += config.cellSize) {
      yield [i, j]
    }
  }
}
