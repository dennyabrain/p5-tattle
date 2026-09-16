/**
 * Shifts all grid points by a fixed [dx, dy] vector and updates the grid's
 * `origin` metadata accordingly. Useful for repositioning a grid on canvas
 * without recomputing it.
 *
 * @param {[number, number]} delta - [dx, dy] translation vector in pixels.
 * @returns {function(grid): EnhancedIterable}
 *
 * @example
 * // Move a grid 100px right and 50px down
 * pipe(squareGrid(config), translate([100, 50]))
 *
 * @example
 * // Centre a grid that starts at the origin
 * const grid = squareGrid({ width: 400, height: 400, cellSize: 40 })
 * pipe(grid, translate([100, 100]))
 */
export function translate([dx, dy]) {
  return function (grid) {
    return {
      ...grid,
      origin: [grid.origin[0] + dx, grid.origin[1] + dy],
      [Symbol.iterator]: function* () {
        for (const [x, y] of grid) {
          yield [x + dx, y + dy]
        }
      }
    }
  }
}
