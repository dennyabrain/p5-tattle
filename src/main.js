import p5 from 'p5'
import * as Brush from 'p5.brush'

const WIDTH = 644
const HEIGHT = 966

const OUTER_RADIUS = WIDTH * 0.4  // diameter = 0.8 * canvas width
const CX = WIDTH / 2
const CY = HEIGHT / 2

new p5((sketch) => {
  // bind brush to this instance before setup/draw
  Brush.instance(sketch)

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT, sketch.WEBGL)
    sketch.noLoop()
  }

  sketch.draw = () => {
    sketch.background('#f4ede0')
    sketch.translate(-WIDTH / 2, -HEIGHT / 2)

    // outer ring only — smooth arc, no inner spokes or rings
    Brush.noFill()
    Brush.set('HB', '#6b4226', 1.5)
    Brush.circle(CX, CY, OUTER_RADIUS)
  }
})
