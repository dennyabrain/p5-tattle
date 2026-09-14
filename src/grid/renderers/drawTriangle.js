import { drawInRegion } from './drawInRegion.js'

export function drawTriangle(sketch, region) {
  drawInRegion(sketch, region, (map) => {
    sketch.triangle(...map(0.5, 0), ...map(1, 1), ...map(0, 1))
  })
}
