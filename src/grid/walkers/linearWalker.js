import { cellsFromGrid } from './cells.js'

/**
 * Walks a grid linearly, emitting one region (cell) at a time.
 *
 * @param {object} grid   - A grid object as returned by a generator or pipe.
 * @param {object} config - Optional configuration.
 * @param {string} [config.direction='row-first'] - Iteration order.
 *   'row-first': sweep left→right across columns, then advance rows (default).
 *   'col-first': sweep top→bottom across rows, then advance columns.
 * @returns {Iterable<Region>}
 *
 * @typedef {object} Region
 * @property {Array<[number, number]>} corners - Corner points of the cell (n points).
 * @property {[number, number]}        center  - Centroid of the corners.
 * @property {{ col: number, row: number }} index - Grid position of this cell.
 */
export function linearWalker(grid, config = {}) {
  const { direction = 'row-first' } = config

  return {
    [Symbol.iterator]: function* () {
      const regions = cellsFromGrid(grid)

      const sorted = [...regions].sort((a, b) => {
        const [primaryA, secondaryA] = direction === 'row-first'
          ? [a.index.row, a.index.col]
          : [a.index.col, a.index.row]
        const [primaryB, secondaryB] = direction === 'row-first'
          ? [b.index.row, b.index.col]
          : [b.index.col, b.index.row]

        return primaryA !== primaryB ? primaryA - primaryB : secondaryA - secondaryB
      })

      yield* sorted
    }
  }
}
