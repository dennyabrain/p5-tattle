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
