import { cellsFromGrid } from '../walkers/cells.js'
import { drawPolygon } from './drawPolygon.js'

/**
 * Draws a debug overlay of all cells in a grid. Hovering a cell shows its
 * col/row index. Pass a captureState from createRegionCapture() to enable
 * interactive selection — selected cells are highlighted in green.
 *
 * @param {p5}           sketch         - The p5 instance.
 * @param {object}       grid           - A grid object from a generator or pipe.
 * @param {object}       [captureState] - State object from createRegionCapture().state.
 * @param {p5.Font}      [font]         - Font loaded via loadFont (required in WEBGL for labels).
 *
 * @example
 * // Basic usage — shows cell boundaries and hover labels
 * drawRegionDebug(sketch, gridObj, null, font)
 *
 * @example
 * // With interactive region capture
 * const capture = createRegionCapture(sketch)
 * sketch.keyPressed   = () => capture.keyPressed()
 * sketch.mousePressed = () => capture.mousePressed(gridObj)
 *
 * // In draw:
 * drawRegionDebug(sketch, gridObj, capture.state, font)
 */
export function drawRegionDebug(sketch, grid, captureState = null, font = null) {
  const cells = cellsFromGrid(grid)
  const capturing = captureState?.active ?? false

  let hoveredCell = null
  let closestDist = Infinity
  for (const cell of cells) {
    const d = sketch.dist(sketch.mouseX, sketch.mouseY, cell.center[0], cell.center[1])
    if (d < closestDist) { closestDist = d; hoveredCell = cell }
  }

  sketch.push()

  for (const cell of cells) {
    const { col, row } = cell.index
    const isHovered = hoveredCell === cell
    const selectionIndex = captureState
      ? captureState.selected.findIndex(s => s.col === col && s.row === row)
      : -1
    const isSelected = selectionIndex >= 0

    if (isSelected) {
      sketch.fill(80, 220, 120, 160)
      sketch.stroke(80, 220, 120)
      sketch.strokeWeight(1.5)
    } else if (isHovered && capturing) {
      sketch.fill(255, 200, 80, 120)
      sketch.stroke(255, 200, 80)
      sketch.strokeWeight(1)
    } else if (isHovered) {
      sketch.fill(255, 80, 80, 80)
      sketch.stroke(255, 80, 80)
      sketch.strokeWeight(1)
    } else if (capturing) {
      sketch.fill(255, 255, 255, 20)
      sketch.stroke(255, 255, 255, 80)
      sketch.strokeWeight(0.5)
    } else {
      sketch.fill(255, 255, 255, 10)
      sketch.stroke(255, 255, 255, 40)
      sketch.strokeWeight(0.5)
    }

    drawPolygon(sketch, cell)

    if (isSelected && font) {
      sketch.textFont(font)
      sketch.noStroke()
      sketch.fill(0)
      sketch.textSize(9)
      sketch.textAlign(sketch.CENTER, sketch.CENTER)
      sketch.text(selectionIndex + 1, cell.center[0], cell.center[1])
    }

    if (isHovered && font) {
      sketch.textFont(font)
      sketch.noStroke()
      sketch.fill(255)
      sketch.textSize(11)
      sketch.textAlign(sketch.LEFT, sketch.BOTTOM)
      sketch.text(`col:${col}, row:${row}`, cell.center[0] + 6, cell.center[1] - 2)
    }
  }

  sketch.pop()
}
