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
 *
 * @example
 * // Sample the top-left quadrant of an image into each cell
 * for (const region of linearWalker(gridObj)) {
 *   drawImageCrop(sketch, region, img, 0, 0, 0.5, 0.5)
 * }
 *
 * @example
 * // Tile different horizontal slices of an image across columns
 * for (const region of linearWalker(gridObj)) {
 *   const u1 = region.index.col / numCols
 *   const u2 = (region.index.col + 1) / numCols
 *   drawImageCrop(sketch, region, img, u1, 0, u2, 1)
 * }
 */
export function drawImageCrop(sketch, region, img, u1, v1, u2, v2) {
  if (region.boundary && region.boundaryUVs) {
    sketch.texture(img)
    sketch.beginShape()
    for (let i = 0; i < region.boundary.length; i++) {
      const [x, y] = region.boundary[i]
      const [u, v] = region.boundaryUVs[i]
      sketch.vertex(x, y, 0, u1 + (u2 - u1) * u, v1 + (v2 - v1) * v)
    }
    sketch.endShape(sketch.CLOSE)
    return
  }

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
