export function* offset(grid, { axis = 'column', amount, colSize }) {
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
