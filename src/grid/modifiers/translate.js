export function translate([dx, dy]) {
  return function (grid) {
    return {
      ...grid,
      origin: [grid.origin[0] + dx, grid.origin[1] + dy],
      [Symbol.iterator]: function* () {
        for (const [x, y] of grid) {
          yield [x + dx, y + dy]
        }
      }
    }
  }
}
