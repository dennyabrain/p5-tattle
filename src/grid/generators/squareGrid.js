export function* squareGrid(canvas) {
  for (var i = 0; i < canvas.width + 1; i += canvas.cellSize) {
    for (var j = 0; j < canvas.height + 1; j += canvas.cellSize) {
      yield [i, j]
    }
  }
}
