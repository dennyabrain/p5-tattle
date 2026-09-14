export function* zigzagOffset(grid, { axis = 'column', amount, colSize }) {
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
