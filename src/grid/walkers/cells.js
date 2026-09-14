/**
 * Builds all cell regions from a grid object.
 * Shared by all walkers so the cell-extraction logic lives in one place.
 *
 * @param {object} grid - A grid object (generator or pipe result).
 * @returns {Array<Region>} Flat array of all regions in column-major order.
 */
export function cellsFromGrid(grid) {
  const points = [...grid]
  const colSize = grid.colSize
  const numCols = Math.ceil(points.length / colSize)
  const regions = []

  for (let col = 0; col < numCols - 1; col++) {
    for (let row = 0; row < colSize - 1; row++) {
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

      regions.push({ corners, center, index: { col, row } })
    }
  }

  return regions
}
