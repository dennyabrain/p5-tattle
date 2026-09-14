export function* gridWithPerlin(sketch, grid, level = 4) {
  for (const [cellX, cellY] of grid) {
    var n = sketch.noise(cellX, cellY)
    var x = sketch.map(n, 0, 1, cellX - level, cellX + level, true)
    var y = sketch.map(n, 0, 1, cellY - level, cellY + level, true)
    yield [x, y]
  }
}
