import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, walkers, pipe } from './grid'

const { isometricGrid, squareGrid, fibonacciGrid, randomGrid, perspectiveGrid1 } = generators
const { gridWithPerlin, offset, zigzagOffset, translate } = modifiers
const { drawDots, drawLines } = renderers
const { linearWalker } = walkers

const WIDTH = 600
const HEIGHT = 600

const colors = Object.keys(brand)
  .filter((name) => name.indexOf("visuals-") != -1)
  .reduce((acc, cur) => {
    acc.push(brand[cur])
    return acc
  }, [])

new p5((sketch) => {
  const gridConfig = { width: 600, height: 600, cellSize: 40 }
  const gridObj = pipe(
    squareGrid(gridConfig),
    gridWithPerlin(sketch, { level: 4 })
  )

  const regions = [...linearWalker(gridObj)]

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT)
  }

  sketch.draw = () => {
    sketch.background(colors[0])

    for (const region of regions) {
      // colour each cell based on its column index
      if (region.index.col % 2 == 0) {
        sketch.fill(colors[(region.index.col % colors.length) + 1])
        sketch.stroke(colors[0])
        sketch.beginShape()
        for (const [x, y] of region.corners) sketch.vertex(x, y)
        sketch.endShape(sketch.CLOSE)
      }
    }
  }
})
