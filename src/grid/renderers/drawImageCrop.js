import { drawInRegion } from './drawInRegion.js'

/**
 * Maps a cropped portion of an image into the region using texture mapping.
 * Crop bounds are proportional (0–1) relative to the image size.
 * Requires WEBGL mode.
 *
 * @param {p5}       sketch - The p5 instance.
 * @param {Region}   region - A region object from a walker.
 * @param {p5.Image} img    - The image to sample from.
 * @param {number}   u1     - Left edge of crop (0–1).
 * @param {number}   v1     - Top edge of crop (0–1).
 * @param {number}   u2     - Right edge of crop (0–1).
 * @param {number}   v2     - Bottom edge of crop (0–1).
 */
export function drawImageCrop(sketch, region, img, u1, v1, u2, v2) {
  drawInRegion(sketch, region, (map) => {
    sketch.texture(img)
    sketch.beginShape()
    sketch.vertex(...map(0, 0), u1, v1)
    sketch.vertex(...map(1, 0), u2, v1)
    sketch.vertex(...map(1, 1), u2, v2)
    sketch.vertex(...map(0, 1), u1, v2)
    sketch.endShape(sketch.CLOSE)
  })
}
