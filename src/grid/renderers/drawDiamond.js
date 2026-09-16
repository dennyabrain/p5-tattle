import { drawInRegion } from './drawInRegion.js'

/**
 * Draws a diamond (rotated square) inscribed within a region by connecting
 * the mid-points of each edge via bilinear interpolation.
 *
 * @param {p5}     sketch - The p5 instance.
 * @param {Region} region - A region object from a walker.
 *
 * @example
 * for (const region of linearWalker(gridObj)) {
 *   sketch.fill(colors[3])
 *   drawDiamond(sketch, region)
 * }
 *
 * @example
 * // Layer a diamond over a filled rect for a nested effect
 * drawRect(sketch, region)
 * sketch.fill(accentColor)
 * drawDiamond(sketch, region)
 */
export function drawDiamond(sketch, region) {
  drawInRegion(sketch, region, (map) => {
    sketch.beginShape()
    sketch.vertex(...map(0.5, 0))
    sketch.vertex(...map(1,   0.5))
    sketch.vertex(...map(0.5, 1))
    sketch.vertex(...map(0,   0.5))
    sketch.endShape(sketch.CLOSE)
  })
}
