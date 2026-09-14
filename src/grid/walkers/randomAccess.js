/**
 * Returns a single merged region whose corners trace the outer boundary of
 * the rectangular block of cells from (left, top) to (right, bottom).
 *
 * For distorted grids the boundary will have more than 4 corners since each
 * grid point is independently positioned.
 *
 * @param {object} grid          - A grid object as returned by a generator or pipe.
 * @param {object} bounds        - Cell index bounds (all inclusive).
 * @param {number} bounds.top    - First row to include.
 * @param {number} bounds.left   - First col to include.
 * @param {number} bounds.bottom - Last row to include.
 * @param {number} bounds.right  - Last col to include.
 * @returns {Region}
 */
export function randomAccess(grid, { top, left, bottom, right }) {
  const points = [...grid]
  const colSize = grid.colSize

  const pt = (c, r) => points[c * colSize + r]

  // 4 extreme corners in the winding order expected by drawInRegion (TL, TR, BR, BL)
  const corners = [
    pt(left,       top),
    pt(right + 1,  top),
    pt(right + 1,  bottom + 1),
    pt(left,       bottom + 1),
  ].filter(c => c != null)

  // Full perimeter polygon — useful for drawing exact outlines on distorted grids
  const boundary = [
    ...Array.from({ length: right - left + 2 }, (_, i) => pt(left + i,     top)),
    ...Array.from({ length: bottom - top + 1 }, (_, i) => pt(right + 1,    top + 1 + i)),
    ...Array.from({ length: right - left + 1 }, (_, i) => pt(right - i,    bottom + 1)),
    ...Array.from({ length: bottom - top },     (_, i) => pt(left,         bottom - i)),
  ].filter(c => c != null)

  const center = [
    corners.reduce((s, [x]) => s + x, 0) / corners.length,
    corners.reduce((s, [, y]) => s + y, 0) / corners.length,
  ]

  return { corners, boundary, center, index: { top, left, bottom, right } }
}
