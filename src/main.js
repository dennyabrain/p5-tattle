import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, walkers, pipe } from './grid'
import { darken, lighten } from './colors'
import { drawDiamond, drawDotDebug, drawImageCrop, drawImageFull, drawRect } from './grid/renderers'
import { randomAccess } from './grid/walkers'
import { sine } from './grid/modifiers'

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
    zigzagOffset({ amount: 4 }),
    // gridWithPerlin(sketch, { level: 8 }),
    // sine({ amplitude: 20, frequency: 20 }),
    // sine({ amplitude: 60, frequency: 10, phase: 3, axis: 'x', inputAxis: 'y' })
  )

  // const regions = [...radialWalker(gridObj, { origin: [300, 300] })]
  let regions, imgRegion
  let img, font


  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT, sketch.WEBGL)
    sketch.textureMode(sketch.NORMAL)
    sketch.loadImage('/tmp/dithered-image.png', (loaded) => { img = loaded })
    sketch.loadFont('/tmp/roboto.ttf', (loaded) => { font = loaded })
    regions = [...linearWalker(gridObj)]
  }

  sketch.draw = () => {
    if (!img) return
    if (!font) return

    sketch.background(colors[0])
    // WEBGL origin is canvas center — shift it to top-left to keep grid coords working
    sketch.translate(-WIDTH / 2, -HEIGHT / 2)

    // drawLines(sketch, gridObj, gridObj.colSize)
    // drawDotDebug(sketch, gridObj, gridObj.colSize, 8, font)

    for (const region of regions) {
      // colour each cell based on its column index
      // var colorMap = Math.floor(sketch.map(region.distanceToOrigin, 0, 600, 0, colors.length - 1))
      // var darkOffset = sketch.map(region.distanceToOrigin, 0, 600, 0, 360)
      // var baseColor = colors[5]
      // var colorbg = darken(sketch, colorMap, darkOffset)
      sketch.fill(colors[1])
      // drawDots(sketch, region, 8)



      // drawImageFull(sketch, region, img)
      // drawImageCrop(sketch, region, img, 0, 1, 0.2, 0.5)
      // console.log(region.distanceToOrigin);
    }

    // let i = 0
    // while (i < 16) {
    //   imgRegion = randomAccess(gridObj, { top: 0, left: i, bottom: 40, right: i + 1 })
    //   // drawImageFull(sketch, imgRegion, img)
    //   sketch.noStroke()
    //   let uix1 = sketch.map(i, 0, 16, 0, 1)
    //   drawImageCrop(sketch, imgRegion, img, uix1, 0, Math.sin(140), 1)
    //   i += 2
    // }

    imgRegion = randomAccess(gridObj, { top: 2, left: 2, bottom: 10, right: 9 })
    drawImageFull(sketch, imgRegion, img)
    // drawImageCrop(sketch, imgRegion, img, 0, 1, 1, 0.2)


    // sketch.noStroke()
    // let uix1 = sketch.map(i, 0, 16, 0, 1)

  }
})
