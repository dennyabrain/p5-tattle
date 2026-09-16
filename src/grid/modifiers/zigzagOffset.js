/**
 * Alternates the shift direction each column (or row), producing a zigzag
 * or brick-like stagger. Even indices shift by `+amount`, odd by `-amount`.
 *
 * @param {object} config
 * @param {string} [config.axis='column'] - Which index alternates.
 *   'column': alternate vertically per column (brick-row effect).
 *   'row':    alternate horizontally per row.
 * @param {number} config.amount - Pixels to shift in each direction.
 * @returns {function(grid): EnhancedIterable}
 *
 * @example
 * // Classic brick-offset — every other column shifted down
 * pipe(squareGrid(config), zigzagOffset({ amount: 20 }))
 *
 * @example
 * // Horizontal zigzag per row
 * pipe(squareGrid(config), zigzagOffset({ axis: 'row', amount: 15 }))
 */
export function zigzagOffset({ axis = 'column', amount }) {
  return function (grid) {
    const colSize = grid.colSize
    return {
      ...grid,
      [Symbol.iterator]: function* () {
        let i = 0
        for (const [x, y] of grid) {
          const col = Math.floor(i / colSize)
          const row = i % colSize
          const sign = (axis === 'column' ? col : row) % 2 === 0 ? 1 : -1
          yield axis === 'column'
            ? [x, y + sign * amount]
            : [x + sign * amount, y]
          i++
        }
      }
    }
  }
}
