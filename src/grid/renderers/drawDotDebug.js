/**
 * Draws a debug dot at every grid point. Hover a dot to see its col/row index.
 * Pass a captureState from createCapture() to enable interactive selection.
 *
 * In WEBGL mode a loaded font is required for hover labels. If omitted, dots
 * still render but no label appears on hover.
 *
 * @param {p5}           sketch       - The p5 instance.
 * @param {object}       grid         - A grid object from a generator or pipe.
 * @param {number}       colSize      - Number of points per column (grid.colSize).
 * @param {number}       [size=8]     - Diameter of each dot in pixels.
 * @param {p5.Font}      [font]       - Font loaded via loadFont (required in WEBGL).
 * @param {CaptureState} [captureState] - State object from createCapture().state.
 *
 * @example
 * // Basic usage
 * drawDotDebug(sketch, gridObj, gridObj.colSize, 8, font)
 *
 * @example
 * // With interactive capture
 * const capture = createCapture(sketch)
 * drawDotDebug(sketch, gridObj, gridObj.colSize, 8, font, capture.state)
 */
export function drawDotDebug(sketch, grid, colSize, size = 8, font = null, captureState = null) {
  const points = [...grid]
  const numCols = Math.ceil(points.length / colSize)
  const capturing = captureState?.active ?? false

  sketch.push()

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < colSize; row++) {
      const pt = points[col * colSize + row]
      if (!pt) continue

      const [x, y] = pt
      const hovered = sketch.dist(sketch.mouseX, sketch.mouseY, x, y) < size / 2

      const selectionIndex = captureState
        ? captureState.selected.findIndex(s => s.col === col && s.row === row)
        : -1
      const selected = selectionIndex >= 0

      // Colour priority: selected > hovered > capture-mode idle > normal
      let dotColor
      if (selected)         dotColor = sketch.color(80, 220, 120)     // green
      else if (hovered)     dotColor = sketch.color(255, 80, 80)       // red
      else if (capturing)   dotColor = sketch.color(255, 200, 80, 200) // amber in capture mode
      else                  dotColor = sketch.color(255, 255, 255, 180)

      sketch.noStroke()
      sketch.fill(dotColor)
      sketch.circle(x, y, selected ? size * 1.4 : size)

      // Order number on selected dots
      if (selected && font) {
        sketch.textFont(font)
        sketch.fill(0)
        sketch.textSize(9)
        sketch.textAlign(sketch.CENTER, sketch.CENTER)
        sketch.text(selectionIndex + 1, x, y)
      }

      // Hover label
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
