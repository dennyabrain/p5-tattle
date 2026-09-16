/**
 * Generates a grid whose column and row positions follow the Fibonacci sequence
 * scaled by `cellSize`. Spacing grows exponentially, creating a natural
 * logarithmic distribution of cells across the canvas.
 *
 * @param {object} config
 * @param {number} config.width    - Maximum x extent in pixels.
 * @param {number} config.height   - Maximum y extent in pixels.
 * @param {number} config.cellSize - Multiplier applied to each Fibonacci number.
 * @returns {EnhancedIterable}
 *
 * @example
 * const grid = fibonacciGrid({ width: 600, height: 600, cellSize: 10 })
 * drawLines(sketch, grid, grid.colSize)
 *
 * @example
 * // Smaller cellSize → more Fibonacci steps, denser grid near origin
 * pipe(
 *   fibonacciGrid({ width: 600, height: 600, cellSize: 5 }),
 *   gridWithPerlin(sketch, { level: 6 })
 * )
 */
export function fibonacciGrid(config) {
  function fibSequence(max) {
    const sequence = []
    let a = 1, b = 1
    while (a * config.cellSize < max) {
      sequence.push(a * config.cellSize)
      ;[a, b] = [b, a + b]
    }
    return sequence
  }

  const xSequence = fibSequence(config.width)
  const ySequence = fibSequence(config.height)

  return {
    colSize: ySequence.length,
    width: xSequence[xSequence.length - 1] ?? 0,
    height: ySequence[ySequence.length - 1] ?? 0,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      for (const x of xSequence) {
        for (const y of ySequence) {
          yield [x, y]
        }
      }
    }
  }
}
