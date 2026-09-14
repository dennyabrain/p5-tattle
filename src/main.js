import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, walkers, pipe } from './grid'
import { darken, lighten } from './colors'
import { drawDiamond, drawImageCrop, drawImageFull, drawRect } from './grid/renderers'

const { isometricGrid, squareGrid, fibonacciGrid, randomGrid, perspectiveGrid1 } = generators
const { gridWithPerlin, offset, zigzagOffset, translate } = modifiers
const { drawDots, drawLines } = renderers
const { linearWalker, radialWalker } = walkers

const WIDTH = 600
const HEIGHT = 600

const colors = Object.keys(brand)
  .filter((name) => name.indexOf("visuals-") != -1)
  .reduce((acc, cur) => {
    acc.push(brand[cur])
    return acc
  }, [])

new p5((sketch) => {
  const gridConfig = { width: 600, height: 600, cellSize: 40, vanishingPoints: [[300, 300]] }
  const gridObj = pipe(
    squareGrid(gridConfig),
    // zigzagOffset({ amount: 0 }),
    gridWithPerlin(sketch, { level: 20 })
  )

  // const regions = [...radialWalker(gridObj, { origin: [300, 300] })]
  const regions = [...linearWalker(gridObj)]

  let img

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT, sketch.WEBGL)
    sketch.textureMode(sketch.NORMAL)
    sketch.loadImage('/tmp/dithered-image.png', (loaded) => { img = loaded })
  }

  sketch.draw = () => {
    if (!img) return

    sketch.background(colors[0])
    // WEBGL origin is canvas center — shift it to top-left to keep grid coords working
    sketch.translate(-WIDTH / 2, -HEIGHT / 2)

    for (const region of regions) {
      // colour each cell based on its column index
      // var colorMap = Math.floor(sketch.map(region.distanceToOrigin, 0, 600, 0, colors.length - 1))
      // var darkOffset = sketch.map(region.distanceToOrigin, 0, 600, 0, 360)
      // var baseColor = colors[5]
      // var colorbg = darken(sketch, colorMap, darkOffset)
      sketch.fill(colors[1])
      // drawDots(sketch, region, gridConfig.cellSize)
      // drawImageFull(sketch, region, img)
      drawImageCrop(sketch, region, img, 0, 1, 0.2, 0.5)
      // console.log(region.distanceToOrigin);
    }

  }
})
