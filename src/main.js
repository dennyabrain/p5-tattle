import p5 from 'p5'
import { pipe, walkers } from './grid'
import { squareGrid, radialGrid } from './grid/generators'
import { gridWithPerlin, sine } from './grid/modifiers'
import { drawImageCrop } from './grid/renderers'

// p5.brush checks `typeof p5 !== "undefined"` at module-load time to register
// its lifecycle addon (which flushes composites to the canvas in postdraw).
// p5.js 2.x never sets window.p5 from an ES-module import, so the check fails
// and nothing ever renders. Dynamic import runs after we set window.p5.
window.p5 = p5
const Brush = await import('p5.brush')

const { linearWalker } = walkers

const WIDTH = 644
const HEIGHT = 966

const RINGS = 6
const SPOKES = 8

// --- Palette ---
const BG = '#ffebcb'
const STROKE = '#4d5182'

new p5((sketch) => {
  Brush.instance(sketch)

  // radial grid for the border ring and cross-hatch fill
  const grid = pipe(
    radialGrid({
      width: WIDTH,
      height: HEIGHT,
      spokes: SPOKES,
      rings: RINGS,
      outerRadius: WIDTH * 0.4,
    }),
    sine({ frequency: 20, amplitude: 45, phase: 4 })
  )

  // image grid — high perlin level warps cell positions for an organic look
  const imageGrid = pipe(
    squareGrid({ width: WIDTH, height: HEIGHT, cellSize: 24 }),
    gridWithPerlin(sketch, { level: 12 })
  )

  let img

  sketch.setup = async () => {
    sketch.createCanvas(WIDTH, HEIGHT, sketch.WEBGL)
    sketch.textureMode(sketch.NORMAL)
    sketch.noLoop()
    img = await sketch.loadImage('/tmp/dithered-image.png')
    sketch.redraw()
  }

  sketch.draw = () => {
    if (!img) return
    sketch.background(BG)
    sketch.translate(-WIDTH / 2, -HEIGHT / 2)

    // --- image layer: each cell samples its proportional slice of the image ---
    const imageCells = [...linearWalker(imageGrid)]
    const maxCol = Math.max(...imageCells.map(r => r.index.col)) + 1
    const maxRow = Math.max(...imageCells.map(r => r.index.row)) + 1

    // sketch.noStroke()
    // for (const region of imageCells) {
    //   const { col, row } = region.index
    //   drawImageCrop(sketch, region, img,
    //     col / maxCol, row / maxRow,
    //     (col + 1) / maxCol, (row + 1) / maxRow
    //   )
    // }

    const cells = [...linearWalker(grid)]

    // --- cross-hatch fill over the radial cells ---
    Brush.noFill()
    Brush.noStroke()
    Brush.hatchStyle('HB', STROKE, 0.4)

    Brush.hatch(10, 45)
    for (const region of cells) Brush.polygon(region.corners)

    Brush.hatch(10, -45)
    for (const region of cells) Brush.polygon(region.corners)

    Brush.noHatch()

    // --- outer ring: smooth closed brush stroke ---
    const outerPoints = cells
      .filter(r => r.index.row === RINGS - 1)
      .map(r => r.corners[3])

    Brush.set('HB', STROKE, 1.5)
    Brush.beginShape(0.5)
    for (const [x, y] of outerPoints) Brush.vertex(x, y, 1)
    Brush.endShape(true)
  }
})
