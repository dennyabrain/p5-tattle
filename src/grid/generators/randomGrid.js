/**
 * Placeholder grid with a small fixed set of points.
 * Useful as a quick stand-in while designing a custom generator.
 * `colSize` is null — walkers and renderers that depend on column structure
 * will fall back to sequential behaviour.
 *
 * @returns {EnhancedIterable}
 *
 * @example
 * drawDots(sketch, randomGrid())
 */
export function randomGrid() {
  return {
    colSize: null,
    width: 400,
    height: 400,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      yield [0, 0]
      yield [100, 100]
      yield [400, 400]
    }
  }
}
