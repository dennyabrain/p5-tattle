/**
 * Finds where a ray from (ox, oy) in direction (dx, dy) first exits the
 * canvas boundary.  Returns the intersection point.
 */
function boundaryIntersect(ox, oy, dx, dy, width, height) {
  const candidates = []
  if (dx >  1e-10) candidates.push((width  - ox) / dx)
  if (dx < -1e-10) candidates.push(-ox / dx)
  if (dy >  1e-10) candidates.push((height - oy) / dy)
  if (dy < -1e-10) candidates.push(-oy / dy)
  const t = Math.min(...candidates.filter(t => t > 1e-10))
  return [ox + t * dx, oy + t * dy]
}

/**
 * Generates a one-point perspective grid that fills the entire canvas.
 *
 * Reference points are sampled along a single continuous arc of the canvas
 * boundary (the "lower U": left edge from vpY downward → bottom edge →
 * right edge back up to vpY).  For each reference point P on the arc, the
 * chord is extended through the vanishing point to the exit point Q on the
 * opposite boundary.  Because P moves continuously along the arc, adjacent
 * chords always share nearby endpoints — eliminating the angle-flip that
 * caused cross-lines to jump.
 *
 * With drawLines:
 *   - within-column connections  → the converging radial lines
 *   - same-step across columns   → concentric cross-lines that converge at VP
 *
 * Config is forward-compatible with multi-point perspective.  Future
 * generators (perspectiveGrid2, perspectiveGrid3, …) accept the same fields
 * with additional entries in vanishingPoints.
 *
 * @param {object} config
 * @param {number} config.width    - Canvas width in pixels.
 * @param {number} config.height   - Canvas height in pixels.
 * @param {number} config.cellSize - Spacing between radial lines along the
 *   reference arc, and approximate spacing between cross-lines.
 * @param {Array<[number, number]>} config.vanishingPoints - Array of [x, y]
 *   vanishing point coordinates.  perspectiveGrid1 reads only
 *   vanishingPoints[0].  Keep this consistent across all perspective variants.
 *
 * @example
 * perspectiveGrid1({
 *   width: 600, height: 600, cellSize: 60,
 *   vanishingPoints: [[300, 300]]
 * })
 */
export function perspectiveGrid1(config) {
  const { width, height, cellSize } = config
  const [vpX, vpY] = config.vanishingPoints[0]

  // The reference arc is the lower U-shape of the canvas boundary:
  //   (0, vpY)  →  down left edge  →  (0, height)
  //             →  rightward bottom edge  →  (width, height)
  //             →  up right edge  →  (width, vpY)
  // Arc length = (height - vpY) + width + (height - vpY)
  const legLen = height - vpY
  const arcLength = legLen * 2 + width
  const numLines = Math.ceil(arcLength / cellSize)

  // Steps per half-chord — sized to reach the farthest canvas corner.
  const maxDist = Math.max(
    Math.hypot(vpX,         vpY),
    Math.hypot(width - vpX, vpY),
    Math.hypot(vpX,         height - vpY),
    Math.hypot(width - vpX, height - vpY)
  )
  const numSteps = Math.ceil(maxDist / cellSize)

  return {
    colSize: numSteps * 2 + 1,
    width,
    height,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      for (let i = 0; i < numLines; i++) {
        const s = i * cellSize

        // Map arc position s → boundary point P
        let px, py
        if (s <= legLen) {
          // Left edge: going down from (0, vpY) to (0, height)
          px = 0
          py = vpY + s
        } else if (s <= legLen + width) {
          // Bottom edge: going right from (0, height) to (width, height)
          px = s - legLen
          py = height
        } else {
          // Right edge: going up from (width, height) to (width, vpY)
          px = width
          py = height - (s - legLen - width)
        }

        // Q is the exit point on the other side: start at VP, head away from P.
        const [qx, qy] = boundaryIntersect(vpX, vpY, vpX - px, vpY - py, width, height)

        // Emit points: P → VP (steps 0..numSteps) then VP → Q (steps numSteps..2*numSteps).
        // VP is shared at the junction so the chord is geometrically continuous.
        for (let step = 0; step <= numSteps * 2; step++) {
          if (step <= numSteps) {
            const t = step / numSteps
            yield [px + t * (vpX - px), py + t * (vpY - py)]
          } else {
            const t = (step - numSteps) / numSteps
            yield [vpX + t * (qx - vpX), vpY + t * (qy - vpY)]
          }
        }
      }
    }
  }
}
