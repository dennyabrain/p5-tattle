/**
 * Constructs a region from an arbitrary ordered list of cell indices.
 * Corners are the actual grid points at those indices, in the order given.
 * UV coordinates are approximated from the bounding box of the corners.
 *
 * Pair with createCapture() to interactively collect indices, then paste
 * the logged output here.
 *
 * @param {object}                   grid    - A grid object from a generator or pipe.
 * @param {Array<{col: number, row: number}>} indices - Ordered list of cell indices.
 * @returns {Region}
 *
 * @example
 * // Indices collected via createCapture, then pasted in:
 * const region = arbitraryRegion(gridObj, [
 *   { col: 1, row: 2 },
 *   { col: 4, row: 2 },
 *   { col: 4, row: 5 },
 *   { col: 1, row: 5 },
 * ])
 * drawImageFull(sketch, region, img)
 *
 * @example
 * // Works with any draw_ function
 * drawRect(sketch, arbitraryRegion(gridObj, indices))
 */
export function arbitraryRegion(grid, indices) {
  const points = [...grid]
  const colSize = grid.colSize

  const corners = indices
    .map(({ col, row }) => points[col * colSize + row])
    .filter(pt => pt != null)

  const xs = corners.map(([x]) => x)
  const ys = corners.map(([, y]) => y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  const boundary = corners
  const boundaryUVs = corners.map(([x, y]) => [
    (x - minX) / rangeX,
    (y - minY) / rangeY,
  ])

  const center = [
    corners.reduce((s, [x]) => s + x, 0) / corners.length,
    corners.reduce((s, [, y]) => s + y, 0) / corners.length,
  ]

  return { corners, boundary, boundaryUVs, center, index: { indices } }
}
