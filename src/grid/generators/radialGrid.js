/**
 * Generates a radial (polar) grid of concentric rings crossed by evenly-spaced
 * spokes. Points are laid out column-major where each column is one spoke and
 * each row is one ring, so `drawLines` produces radial lines (within-column)
 * and concentric arcs (across-column) automatically.
 *
 * The last spoke is a duplicate of the first so the outermost ring closes into
 * a full circle without special-casing in walkers or renderers.
 *
 * @param {object}           config
 * @param {number}           config.width                   - Canvas width in pixels.
 * @param {number}           config.height                  - Canvas height in pixels.
 * @param {number}           config.spokes                  - Number of radial lines.
 * @param {number}           config.rings                   - Number of concentric rings.
 * @param {number}           [config.outerRadius]           - Radius of the outermost ring.
 *   Defaults to half of the smaller canvas dimension.
 * @param {number}           [config.innerRadius=0]         - Radius of the innermost ring.
 *   Use a value > 0 to create an annular (donut) grid.
 * @param {[number, number]} [config.center]                - [x, y] centre of the grid.
 *   Defaults to the canvas centre.
 * @returns {EnhancedIterable}
 *
 * @example
 * // Basic radial grid drawn as lines
 * const grid = radialGrid({ width: 600, height: 600, spokes: 12, rings: 6 })
 * drawLines(sketch, grid)
 *
 * @example
 * // Colour cells by ring (distance from centre)
 * for (const region of linearWalker(radialGrid(config))) {
 *   sketch.fill(colors[region.index.row % colors.length])
 *   drawRect(sketch, region)
 * }
 *
 * @example
 * // Annular grid — hollow centre
 * radialGrid({ width: 600, height: 600, spokes: 16, rings: 4, innerRadius: 80, outerRadius: 260 })
 */
export function radialGrid(config) {
  const {
    width,
    height,
    spokes,
    rings,
    outerRadius = Math.min(width, height) / 2,
    innerRadius = 0,
    center = [width / 2, height / 2],
  } = config

  const [cx, cy] = center

  return {
    colSize: rings + 1,
    width,
    height,
    origin: center,
    [Symbol.iterator]: function* () {
      // spokes + 1 columns: the extra column duplicates angle 0 to close the circle
      for (let col = 0; col <= spokes; col++) {
        const angle = (col / spokes) * Math.PI * 2 - Math.PI / 2
        for (let row = 0; row <= rings; row++) {
          const radius = innerRadius + (row / rings) * (outerRadius - innerRadius)
          yield [
            cx + radius * Math.cos(angle),
            cy + radius * Math.sin(angle),
          ]
        }
      }
    }
  }
}
