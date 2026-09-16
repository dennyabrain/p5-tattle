import { drawInRegion } from './drawInRegion.js'

/**
 * Draws a filled quadrilateral that covers the full extent of a region,
 * mapping corners via bilinear interpolation. Works correctly on distorted
 * grids (isometric, perlin, perspective).
 *
 * @param {p5}     sketch - The p5 instance.
 * @param {Region} region - A region object from a walker.
 *
 * @example
 * for (const region of linearWalker(gridObj)) {
 *   sketch.fill(colors[region.index.row % colors.length])
 *   drawRect(sketch, region)
 * }
 *
 * @example
 * // Draw a single merged block
 * drawRect(sketch, randomAccess(gridObj, { top: 2, left: 2, bottom: 5, right: 5 }))
 */
export function drawRect(sketch, region) {
  drawInRegion(sketch, region, (map) => {
    sketch.beginShape()
    sketch.vertex(...map(0, 0))
    sketch.vertex(...map(1, 0))
    sketch.vertex(...map(1, 1))
    sketch.vertex(...map(0, 1))
    sketch.endShape(sketch.CLOSE)
  })
}
