/**
 * Shifts each grid point along one axis by an amount that accumulates with
 * each column (or row). Column 0 is unshifted, column 1 shifts by `amount`,
 * column 2 by `2 * amount`, and so on — creating a shear effect.
 *
 * @param {object} config
 * @param {string} [config.axis='column'] - Which index drives the shift.
 *   'column': shift vertically, increasing per column.
 *   'row':    shift horizontally, increasing per row.
 * @param {number} config.amount - Pixels to shift per step.
 * @returns {function(grid): EnhancedIterable}
 *
 * @example
 * // Shear columns downward — each column 5px lower than the last
 * pipe(squareGrid(config), offset({ amount: 5 }))
 *
 * @example
 * // Shear rows rightward
 * pipe(squareGrid(config), offset({ axis: 'row', amount: 8 }))
 */
export function offset({ axis = 'column', amount }) {
  return function (grid) {
    const colSize = grid.colSize
    return {
      ...grid,
      [Symbol.iterator]: function* () {
        let i = 0
        for (const [x, y] of grid) {
          const col = Math.floor(i / colSize)
          const row = i % colSize
          yield axis === 'column'
            ? [x, y + col * amount]
            : [x + row * amount, y]
          i++
        }
      }
    }
  }
}
