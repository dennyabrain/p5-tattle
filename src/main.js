import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, walkers, pipe } from './grid'
import { darken, lighten } from './colors'

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
    zigzagOffset({ amount: 20 }),
    gridWithPerlin(sketch, { level: 16 })
  )

  // const regions = [...radialWalker(gridObj, { origin: [300, 300] })]
  const regions = [...linearWalker(gridObj)]

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT)
  }

  sketch.draw = () => {
    sketch.background(colors[0])

    for (const region of regions) {
      // colour each cell based on its column index
      // var colorMap = Math.floor(sketch.map(region.distanceToOrigin, 0, 600, 0, colors.length - 1))
      // var darkOffset = sketch.map(region.distanceToOrigin, 0, 600, 0, 360)
      // var baseColor = colors[5]
      // var colorbg = darken(sketch, colorMap, darkOffset)
      sketch.fill(colors[3])
      sketch.stroke(darken(sketch, colors[3], 10))
      sketch.beginShape()
      for (const [x, y] of region.corners) sketch.vertex(x, y)
      sketch.endShape(sketch.CLOSE)
      // console.log(region.distanceToOrigin);
    }

  }
})
