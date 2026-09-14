import { drawInRegion } from './drawInRegion.js'

/**
 * Maps the entire image across the region using texture mapping.
 * Requires WEBGL mode.
 *
 * @param {p5}       sketch - The p5 instance.
 * @param {Region}   region - A region object from a walker.
 * @param {p5.Image} img    - The image to draw.
 */
export function drawImageFull(sketch, region, img) {
  if (region.boundary && region.boundaryUVs) {
    sketch.texture(img)
    sketch.beginShape()
    for (let i = 0; i < region.boundary.length; i++) {
      const [x, y] = region.boundary[i]
      const [u, v] = region.boundaryUVs[i]
      sketch.vertex(x, y, 0, u, v)
    }
    sketch.endShape(sketch.CLOSE)
    return
  }

  drawInRegion(sketch, region, (map) => {
    sketch.texture(img)
    sketch.beginShape()
    sketch.vertex(...map(0, 0), 0, 0)
    sketch.vertex(...map(1, 0), 1, 0)
    sketch.vertex(...map(1, 1), 1, 1)
    sketch.vertex(...map(0, 1), 0, 1)
    sketch.endShape(sketch.CLOSE)
  })
}
