import { cellsFromGrid } from './cells.js'
/**
 * @typedef {object} Region
 * @property {Array<[number, number]>} corners - Corner points of the cell (n points).
 * @property {[number, number]}        center  - Centroid of the corners.
 * @property {{ col: number, row: number }} index - Grid position of this cell.
 */

/**
 * Wraps any walker with repeating symmetry — for each region the inner walker
 * yields, the corresponding mirrored region(s) are also yielded. Duplicates
 * are suppressed, so cells on the axis of symmetry appear exactly once.
 *
 * This produces *repeating* symmetry: the same unflipped shape is drawn at
 * each mirrored position. If you need the content itself to be reflected
 * (flipped), that requires canvas transforms and is not handled here.
 *
 * @param {Iterable}           walker           - Any walker (linearWalker, radialWalker, …).
 * @param {object}             grid             - The same grid the walker was built from.
 * @param {object}             [config]         - Symmetry options.
 * @param {boolean}            [config.horizontal=false] - Mirror left ↔ right.
 * @param {boolean}            [config.vertical=false]   - Mirror top ↔ bottom.
 * @returns {Iterable<Region>}
 *
 * @example
 * // Horizontal symmetry: draw in left half, mirror to right half
 * const grid = squareGrid({ width: 600, height: 600, cellSize: 40 })
 * for (const region of withSymmetry(linearWalker(grid), grid, { horizontal: true })) {
 *   sketch.fill(colors[region.index.col % colors.length])
 *   drawRect(sketch, region)
 * }
 *
 * @example
 * // Four-way symmetry: one quadrant mirrored to all four
 * const grid = squareGrid({ width: 600, height: 600, cellSize: 40 })
 * for (const region of withSymmetry(linearWalker(grid), grid, { horizontal: true, vertical: true })) {
 *   sketch.fill(colors[region.index.row % colors.length])
 *   drawDiamond(sketch, region)
 * }
 *
 * @example
 * // Works with any walker — here using radialWalker for an expanding ring effect
 * const grid = squareGrid({ width: 600, height: 600, cellSize: 40 })
 * const walker = radialWalker(grid, { origin: [300, 300] })
 * for (const region of withSymmetry(walker, grid, { vertical: true })) {
 *   if (region.distanceToOrigin < sketch.frameCount * 2) drawRect(sketch, region)
 * }
 */
export function withSymmetry(walker, grid, config = {}) {
  const { horizontal = false, vertical = false } = config

  return {
    [Symbol.iterator]: function* () {
      const cells = cellsFromGrid(grid)

      const lookup = new Map()
      let maxCol = 0
      let maxRow = 0

      for (const cell of cells) {
        lookup.set(`${cell.index.col}_${cell.index.row}`, cell)
        if (cell.index.col > maxCol) maxCol = cell.index.col
        if (cell.index.row > maxRow) maxRow = cell.index.row
      }

      const seen = new Set()

      for (const region of walker) {
        const { col, row } = region.index

        const mirrors = [{ col, row }]
        if (horizontal) mirrors.push({ col: maxCol - col, row })
        if (vertical) mirrors.push({ col, row: maxRow - row })
        if (horizontal && vertical) mirrors.push({ col: maxCol - col, row: maxRow - row })

        for (const { col: c, row: r } of mirrors) {
          const key = `${c}_${r}`
          if (seen.has(key)) continue
          seen.add(key)
          const cell = lookup.get(key)
          if (cell) yield cell
        }
      }
    }
  }
}
