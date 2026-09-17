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
 * Each yielded region is augmented with:
 * - `canonicalIndex` — `{ col, row }` folded to the first quadrant; same for a cell and all its mirrors.
 * - `canonicalSeed` — a stable `Math.random()` value (0–1) shared by a cell and all its mirrors.
 *   Use it to make a decision once per canonical position, e.g. `if (region.canonicalSeed > 0.5) continue`.
 *
 * @example
 * // Horizontal symmetry: draw in left half, mirror to right half
 * const grid = squareGrid({ width: 600, height: 600, cellSize: 40 })
 * for (const region of withSymmetry(linearWalker(grid), grid, { horizontal: true })) {
 *   sketch.fill(colors[region.canonicalIndex.col % colors.length])
 *   drawRect(sketch, region)
 * }
 *
 * @example
 * // Four-way symmetry with stable random decisions per canonical position
 * const grid = squareGrid({ width: 600, height: 600, cellSize: 40 })
 * for (const region of withSymmetry(linearWalker(grid), grid, { horizontal: true, vertical: true })) {
 *   if (region.canonicalSeed > 0.5) continue
 *   const { col, row } = region.canonicalIndex
 *   sketch.fill(col % 2 == 0 && row % 2 == 0 ? '#645089' : '#a296b8')
 *   drawRect(sketch, region)
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
      const seeds = new Map()

      for (const region of walker) {
        const { col, row } = region.index

        const canonicalCol = Math.min(col, maxCol - col)
        const canonicalRow = Math.min(row, maxRow - row)
        const canonicalKey = `${canonicalCol}_${canonicalRow}`
        if (!seeds.has(canonicalKey)) seeds.set(canonicalKey, Math.random())

        const mirrors = [{ col, row }]
        if (horizontal)             mirrors.push({ col: maxCol - col, row })
        if (vertical)               mirrors.push({ col,               row: maxRow - row })
        if (horizontal && vertical) mirrors.push({ col: maxCol - col, row: maxRow - row })

        for (const { col: c, row: r } of mirrors) {
          const key = `${c}_${r}`
          if (seen.has(key)) continue
          seen.add(key)
          const cell = lookup.get(key)
          if (cell) yield {
            ...cell,
            canonicalIndex: { col: canonicalCol, row: canonicalRow },
            canonicalSeed: seeds.get(canonicalKey),
          }
        }
      }
    }
  }
}
