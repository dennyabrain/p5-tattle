export function offset({ axis = 'column', amount }) {
  return function (grid) {
    const colSize = grid.colSize
    return {
      ...grid,
      [Symbol.iterator]: function* () {
        let i = 0
        for (const [x, y] of grid) {
          const col = Math.floor(i / colSize)
          const row = i % colSize
          yield axis === 'column'
            ? [x, y + col * amount]
            : [x + row * amount, y]
          i++
        }
      }
    }
  }
}
