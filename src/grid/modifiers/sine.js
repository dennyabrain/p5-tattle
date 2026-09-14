/**
 * Displaces grid points along one axis using a sine wave driven by the other axis.
 *
 * @param {object} config
 * @param {number} [config.amplitude=20]   - Peak displacement in pixels.
 * @param {number} [config.frequency=1]    - Cycles across the full grid width/height.
 * @param {number} [config.phase=0]        - Phase offset in radians.
 * @param {string} [config.axis='y']       - Axis to displace: 'x' or 'y'.
 * @param {string} [config.inputAxis='x']  - Axis used as the sine input: 'x' or 'y'.
 *
 * @example
 * // Ripple rows vertically — one full wave across the grid width
 * pipe(squareGrid(config), sine({ amplitude: 30, frequency: 1 }))
 *
 * @example
 * // Animate the wave by advancing the phase each frame
 * pipe(squareGrid(config), sine({ amplitude: 20, frequency: 2, phase: sketch.frameCount * 0.05 }))
 *
 * @example
 * // Stack two waves — vertical ripple on rows, horizontal ripple on columns
 * pipe(
 *   squareGrid(config),
 *   sine({ amplitude: 20, frequency: 2 }),
 *   sine({ amplitude: 20, frequency: 2, axis: 'x', inputAxis: 'y' })
 * )
 */
export function sine({ amplitude = 20, frequency = 1, phase = 0, axis = 'y', inputAxis = 'x' } = {}) {
  return function (grid) {
    const span = inputAxis === 'x' ? grid.width : grid.height

    return {
      ...grid,
      [Symbol.iterator]: function* () {
        for (const [x, y] of grid) {
          const input = inputAxis === 'x' ? x : y
          const displacement = amplitude * Math.sin((input / span) * frequency * Math.PI * 2 + phase)
          yield axis === 'x'
            ? [x + displacement, y]
            : [x, y + displacement]
        }
      }
    }
  }
}
