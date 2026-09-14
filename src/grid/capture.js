/**
 * Creates an interactive region-capture utility. Press 'i' to enter capture
 * mode, click dot-debug markers to collect cell indices, press 'i' again to
 * finish and log the array — ready to paste into arbitraryRegion().
 *
 * Wire the returned handlers into your p5 sketch:
 *
 * @example
 * const capture = createCapture(sketch)
 *
 * sketch.keyPressed  = () => capture.keyPressed()
 * sketch.mousePressed = () => capture.mousePressed(gridObj, gridObj.colSize)
 *
 * // In draw — pass capture.state to drawDotDebug so selections are visible
 * drawDotDebug(sketch, gridObj, gridObj.colSize, 8, font, capture.state)
 *
 * // After capturing, paste the logged output into:
 * // arbitraryRegion(gridObj, [ ...logged indices... ])
 *
 * @param {p5} sketch - The p5 instance.
 * @returns {{ state: CaptureState, keyPressed: Function, mousePressed: Function }}
 */
export function createCapture(sketch) {
  const state = { active: false, selected: [] }

  return {
    state,

    keyPressed() {
      if (sketch.key !== 'i') return
      if (state.active) {
        console.log('Capture complete. Paste into arbitraryRegion():')
        console.log(JSON.stringify(state.selected, null, 2))
        state.active = false
      } else {
        state.selected = []
        state.active = true
        console.log('Capture mode ON — click dots to select/deselect, press i to finish')
      }
    },

    mousePressed(grid, colSize, hitRadius = 8) {
      if (!state.active) return
      const points = [...grid]
      const numCols = Math.ceil(points.length / colSize)

      for (let col = 0; col < numCols; col++) {
        for (let row = 0; row < colSize; row++) {
          const pt = points[col * colSize + row]
          if (!pt) continue
          if (sketch.dist(sketch.mouseX, sketch.mouseY, pt[0], pt[1]) < hitRadius) {
            const idx = state.selected.findIndex(s => s.col === col && s.row === row)
            if (idx >= 0) {
              state.selected.splice(idx, 1)
            } else {
              state.selected.push({ col, row })
            }
            return
          }
        }
      }
    }
  }
}
