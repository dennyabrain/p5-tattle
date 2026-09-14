import { drawInRegion } from './drawInRegion.js'

export function drawRect(sketch, region) {
  drawInRegion(sketch, region, (map) => {
    sketch.beginShape()
    sketch.vertex(...map(0, 0))
    sketch.vertex(...map(1, 0))
    sketch.vertex(...map(1, 1))
    sketch.vertex(...map(0, 1))
    sketch.endShape(sketch.CLOSE)
  })
}
