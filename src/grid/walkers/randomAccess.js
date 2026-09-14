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

  const W = right - left
  const H = bottom - top

  // Full perimeter polygon — useful for drawing exact outlines on distorted grids
  const boundary = [
    ...Array.from({ length: W + 2 }, (_, i) => pt(left + i,  top)),
    ...Array.from({ length: H + 1 }, (_, i) => pt(right + 1, top + 1 + i)),
    ...Array.from({ length: W + 1 }, (_, i) => pt(right - i, bottom + 1)),
    ...Array.from({ length: H },     (_, i) => pt(left,       bottom - i)),
  ].filter(c => c != null)

  // UV coords (0–1) for each boundary point, derived from its grid position in the block.
  // Parallel to `boundary` — use together for texture-mapped polygon drawing.
  const boundaryUVs = [
    ...Array.from({ length: W + 2 }, (_, i) => [i / (W + 1),       0]),
    ...Array.from({ length: H + 1 }, (_, j) => [1,                  (j + 1) / (H + 1)]),
    ...Array.from({ length: W + 1 }, (_, k) => [(W - k) / (W + 1), 1]),
    ...Array.from({ length: H },     (_, l) => [0,                  (H - l) / (H + 1)]),
  ]

  const center = [
    corners.reduce((s, [x]) => s + x, 0) / corners.length,
    corners.reduce((s, [, y]) => s + y, 0) / corners.length,
  ]

  return { corners, boundary, boundaryUVs, center, index: { top, left, bottom, right } }
}
