export function drawLines(sketch, grid, colSize) {
  const points = [...grid]

  if (!colSize) {
    for (let i = 0; i < points.length - 1; i++) {
      sketch.line(...points[i], ...points[i + 1])
    }
    return
  }

  const numCols = Math.ceil(points.length / colSize)

  // vertical lines: connect points within each column
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < colSize - 1; row++) {
      const a = points[col * colSize + row]
      const b = points[col * colSize + row + 1]
      if (a && b) sketch.line(...a, ...b)
    }
  }

  // horizontal lines: connect same row across columns
  for (let row = 0; row < colSize; row++) {
    for (let col = 0; col < numCols - 1; col++) {
      const a = points[col * colSize + row]
      const b = points[(col + 1) * colSize + row]
      if (a && b) sketch.line(...a, ...b)
    }
  }
}
