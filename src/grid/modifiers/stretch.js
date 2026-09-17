/**
 * Scales grid points non-uniformly along x and y axes relative to a pivot
 * point. Useful for squishing a circular radial grid into an ellipse without
 * changing the spoke/ring structure.
 *
 * @param {[number, number]} scale        - `[sx, sy]` scale factors. Values < 1 compress, > 1 expand.
 * @param {[number, number]} [pivot=null] - `[x, y]` point to scale around.
 *   Defaults to the grid's `origin` property (its center).
 * @returns {function(grid): EnhancedIterable}
 *
 * @example
 * // Squish a radial grid to 70% width — makes it elliptical
 * pipe(
 *   radialGrid({ width: 600, height: 600, spokes: 16, rings: 6, outerRadius: 200 }),
 *   stretch([0.7, 1.0])
 * )
 *
 * @example
 * // Stretch vertically around a custom pivot
 * pipe(squareGrid(config), stretch([1.0, 1.4], [300, 300]))
 */
export function stretch([sx, sy], pivot = null) {
  return function (grid) {
    return {
      ...grid,
      [Symbol.iterator]: function* () {
        const [px, py] = pivot ?? grid.origin ?? [0, 0]
        for (const [x, y] of grid) {
          yield [px + (x - px) * sx, py + (y - py) * sy]
        }
      }
    }
  }
}
