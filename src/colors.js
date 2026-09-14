/**
 * Returns a hex string that is `degrees` lighter than the input hex color.
 * Uses HSB color space (all components on 0–360 scale) so that `degrees`
 * maps naturally onto the brightness axis.
 *
 * @param {p5}     sketch  - The p5 instance (needed for color functions).
 * @param {string} hex     - Input color as a hex string, e.g. "#ff8800".
 * @param {number} degrees - How many degrees (0–360) to increase brightness by.
 * @returns {string} Hex color string of the lightened color.
 */
export function lighten(sketch, hex, degrees) {
  sketch.colorMode(sketch.HSB, 360, 360, 360)

  const c = sketch.color(hex)
  const h = sketch.hue(c)
  const s = sketch.saturation(c)
  const b = sketch.brightness(c)

  const lightened = sketch.color(h, s, Math.min(360, b + degrees))

  sketch.colorMode(sketch.RGB, 255, 255, 255)

  return sketch.color(sketch.red(lightened), sketch.green(lightened), sketch.blue(lightened))
}

/**
 * Returns a hex string that is `degrees` darker than the input hex color.
 * Uses HSB color space (all components on 0–360 scale) so that `degrees`
 * maps naturally onto the brightness axis.
 *
 * @param {p5}     sketch  - The p5 instance (needed for color functions).
 * @param {string} hex     - Input color as a hex string, e.g. "#ff8800".
 * @param {number} degrees - How many degrees (0–360) to reduce brightness by.
 * @returns {string} Hex color string of the darkened color.
 */
export function darken(sketch, hex, degrees) {
  sketch.colorMode(sketch.HSB, 360, 360, 360)

  const c = sketch.color(hex)
  const h = sketch.hue(c)
  const s = sketch.saturation(c)
  const b = sketch.brightness(c)

  const darkened = sketch.color(h, s, Math.max(0, b - degrees))

  sketch.colorMode(sketch.RGB, 255, 255, 255)

  return sketch.color(sketch.red(darkened), sketch.green(darkened), sketch.blue(darkened))
}
