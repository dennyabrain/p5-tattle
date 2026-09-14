export function zigzagOffset({ axis = 'column', amount }) {
  return function (grid) {
    const colSize = grid.colSize
    return {
      ...grid,
      [Symbol.iterator]: function* () {
        let i = 0
        for (const [x, y] of grid) {
          const col = Math.floor(i / colSize)
          const row = i % colSize
          const sign = (axis === 'column' ? col : row) % 2 === 0 ? 1 : -1
          yield axis === 'column'
            ? [x, y + sign * amount]
            : [x + sign * amount, y]
          i++
        }
      }
    }
  }
}
