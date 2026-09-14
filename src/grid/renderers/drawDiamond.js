import { drawInRegion } from './drawInRegion.js'

export function drawDiamond(sketch, region) {
  drawInRegion(sketch, region, (map) => {
    sketch.beginShape()
    sketch.vertex(...map(0.5, 0))
    sketch.vertex(...map(1,   0.5))
    sketch.vertex(...map(0.5, 1))
    sketch.vertex(...map(0,   0.5))
    sketch.endShape(sketch.CLOSE)
  })
}
