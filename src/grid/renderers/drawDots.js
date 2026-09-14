export function drawDots(sketch, grid, size = 4) {
  for (const [x, y] of grid) {
    sketch.circle(x, y, size)
  }
}
