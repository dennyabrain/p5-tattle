/**
 * Draws a debug dot at every grid point. When the mouse hovers over a dot,
 * displays its col/row index. Works like drawLines — pass the grid and colSize.
 *
 * In WEBGL mode a loaded font is required for the hover label. Pass it as the
 * last argument (load via sketch.loadFont in preload). If omitted, the dot
 * still renders but no label appears on hover.
 *
 * @param {p5}          sketch  - The p5 instance.
 * @param {object}      grid    - A grid object as returned by a generator or pipe.
 * @param {number}      colSize - Number of points per column (grid.colSize).
 * @param {number}      [size=8] - Diameter of each dot in pixels.
 * @param {p5.Font}     [font]  - A font loaded via loadFont (required in WEBGL).
 */
export function drawDotDebug(sketch, grid, colSize, size = 8, font = null) {
  const points = [...grid]
  const numCols = Math.ceil(points.length / colSize)

  sketch.push()

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < colSize; row++) {
      const pt = points[col * colSize + row]
      if (!pt) continue

      const [x, y] = pt
      const hovered = sketch.dist(sketch.mouseX, sketch.mouseY, x, y) < size / 2

      sketch.noStroke()
      sketch.fill(hovered ? sketch.color(255, 80, 80) : sketch.color(255, 255, 255, 180))
      sketch.circle(x, y, size)

      if (hovered && font) {
        sketch.textFont(font)
        sketch.fill(0)
        sketch.textSize(11)
        sketch.textAlign(sketch.LEFT, sketch.BOTTOM)
        sketch.text(`row:${row}, col:${col}`, x + size, y - 2)
      }
    }
  }

  sketch.pop()
}
