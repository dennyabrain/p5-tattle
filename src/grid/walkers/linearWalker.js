/**
 * Walks a grid linearly, emitting one region (cell) at a time in row-major
 * order (left→right across columns, then top→bottom across rows).
 *
 * Each region is formed by the four adjacent grid points that enclose a cell.
 * Works for any grid shape — square, isometric, perspective — since it only
 * relies on the flat point array and colSize from the grid object.
 *
 * @param {object} grid   - A grid object as returned by a generator or pipe.
 * @param {object} config - Optional configuration.
 * @param {string} [config.direction='row-first'] - Iteration order.
 *   'row-first': sweep left→right, then advance rows (default).
 *   'col-first': sweep top→bottom, then advance columns.
 * @returns {Iterable<Region>} An iterable of region objects.
 *
 * @typedef {object} Region
 * @property {Array<[number, number]>} corners - Ordered corner points of the cell.
 * @property {[number, number]}        center  - Centroid of the corners.
 * @property {{ col: number, row: number }} index - Grid position of this cell.
 */
export function linearWalker(grid, config = {}) {
  const { direction = 'row-first' } = config

  return {
    [Symbol.iterator]: function* () {
      const points = [...grid]
      const colSize = grid.colSize
      const numCols = Math.ceil(points.length / colSize)

      const outerMax = direction === 'row-first' ? colSize - 1  : numCols - 1
      const innerMax = direction === 'row-first' ? numCols - 1  : colSize - 1

      for (let outer = 0; outer < outerMax; outer++) {
        for (let inner = 0; inner < innerMax; inner++) {
          const col = direction === 'row-first' ? inner : outer
          const row = direction === 'row-first' ? outer : inner

          const corners = [
            points[ col      * colSize + row    ],
            points[(col + 1) * colSize + row    ],
            points[(col + 1) * colSize + row + 1],
            points[ col      * colSize + row + 1],
          ]

          if (corners.some(c => c == null)) continue

          const center = [
            corners.reduce((s, [x]) => s + x, 0) / corners.length,
            corners.reduce((s, [, y]) => s + y, 0) / corners.length,
          ]

          yield { corners, center, index: { col, row } }
        }
      }
    }
  }
}
