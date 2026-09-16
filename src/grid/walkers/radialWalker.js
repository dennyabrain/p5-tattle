import { cellsFromGrid } from './cells.js'

/**
 * @typedef {object} RadialRegion
 * @property {Array<[number, number]>} corners          - Corner points of the cell (n points).
 * @property {[number, number]}        center           - Centroid of the corners.
 * @property {number}                  distanceToOrigin - Euclidean distance from origin to center.
 * @property {{ col: number, row: number }} index       - Grid position of this cell.
 */

/**
 * Walks a grid radially, emitting regions in order of their distance from a
 * given origin point — closest regions first. Works for any grid shape since
 * distance is measured from each region's centroid.
 *
 * @param {object}           grid          - A grid object as returned by a generator or pipe.
 * @param {object}           config        - Configuration.
 * @param {[number, number]} config.origin - [x, y] point to measure distance from.
 * @returns {Iterable<RadialRegion>}
 *
 * @example
 * // Colour cells by distance from canvas centre
 * for (const region of radialWalker(gridObj, { origin: [300, 300] })) {
 *   const t = sketch.map(region.distanceToOrigin, 0, 420, 0, colors.length - 1)
 *   sketch.fill(colors[Math.floor(t)])
 *   drawRect(sketch, region)
 * }
 *
 * @example
 * // Animate an expanding ring effect
 * const maxDist = sketch.frameCount * 2
 * for (const region of radialWalker(gridObj, { origin: [300, 300] })) {
 *   if (region.distanceToOrigin < maxDist) drawDiamond(sketch, region)
 * }
 */
export function radialWalker(grid, config = {}) {
  const { origin = [0, 0] } = config

  return {
    [Symbol.iterator]: function* () {
      const [ox, oy] = origin

      const regions = cellsFromGrid(grid).map(region => ({
        ...region,
        distanceToOrigin: Math.hypot(region.center[0] - ox, region.center[1] - oy)
      }))

      yield* regions.sort((a, b) => a.distanceToOrigin - b.distanceToOrigin)
    }
  }
}
