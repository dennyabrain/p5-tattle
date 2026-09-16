/**
 * Draws the grid as a mesh of lines. With a valid `colSize`, draws both
 * within-column (vertical) and across-column (horizontal) connections,
 * producing a proper grid mesh. Without `colSize`, falls back to connecting
 * points sequentially.
 *
 * @param {p5}     sketch  - The p5 instance.
 * @param {object} grid    - A grid object from a generator or pipe.
 *
 * @example
 * // Draw a standard square grid
 * drawLines(sketch, gridObj)
 *
 * @example
 * // Draw a perspective grid — within-column lines converge, cross-lines arc
 * drawLines(sketch, perspectiveGrid1(config))
 */
export function drawLines(sketch, grid) {
  const colSize = grid.colSize
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
