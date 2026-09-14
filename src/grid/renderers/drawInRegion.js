/**
 * Calls `fn` with a `map(u, v)` function that converts proportional
 * coordinates (u and v each in 0–1) to actual pixel coordinates inside
 * the region using bilinear interpolation across its corners.
 *
 * Corner winding (matching cells.js):
 *   corners[0] = top-left, corners[1] = top-right,
 *   corners[2] = bottom-right, corners[3] = bottom-left
 *
 * @param {p5}      sketch - The p5 instance.
 * @param {Region}  region - A region object from a walker (has `.corners`).
 * @param {Function} fn    - Callback receiving `map(u, v) => [x, y]`.
 *
 * @example
 * drawInRegion(sketch, region, (map) => {
 *   sketch.beginShape()
 *   sketch.vertex(...map(0, 0))
 *   sketch.vertex(...map(1, 0))
 *   sketch.vertex(...map(1, 1))
 *   sketch.vertex(...map(0, 1))
 *   sketch.endShape(sketch.CLOSE)
 * })
 */
export function drawInRegion(sketch, region, fn) {
  const [c0, c1, c2, c3] = region.corners

  fn((u, v) => [
    (1 - u) * (1 - v) * c0[0] + u * (1 - v) * c1[0] + u * v * c2[0] + (1 - u) * v * c3[0],
    (1 - u) * (1 - v) * c0[1] + u * (1 - v) * c1[1] + u * v * c2[1] + (1 - u) * v * c3[1],
  ])
}
