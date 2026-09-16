import { drawInRegion } from './drawInRegion.js'

/**
 * Draws an upward-pointing triangle inscribed within a region. The apex sits
 * at the top-centre and the base spans the full bottom edge, mapped via
 * bilinear interpolation so it follows distorted grid cells correctly.
 *
 * @param {p5}     sketch - The p5 instance.
 * @param {Region} region - A region object from a walker.
 *
 * @example
 * for (const region of linearWalker(gridObj)) {
 *   sketch.fill(colors[2])
 *   drawTriangle(sketch, region)
 * }
 *
 * @example
 * // Alternate triangles and diamonds for a decorative pattern
 * for (const region of linearWalker(gridObj)) {
 *   region.index.col % 2 === 0
 *     ? drawTriangle(sketch, region)
 *     : drawDiamond(sketch, region)
 * }
 */
export function drawTriangle(sketch, region) {
  drawInRegion(sketch, region, (map) => {
    sketch.triangle(...map(0.5, 0), ...map(1, 1), ...map(0, 1))
  })
}
