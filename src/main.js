import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, pipe } from './grid'

const { isometricGrid, squareGrid, fibonacciGrid, randomGrid, perspectiveGrid1 } = generators
const { gridWithPerlin, offset, zigzagOffset, translate } = modifiers
const { drawDots, drawLines } = renderers

const WIDTH = 600
const HEIGHT = 600

const colors = Object.keys(brand)
  .filter((name) => name.indexOf("visuals-") != -1)
  .reduce((acc, cur) => {
    acc.push(brand[cur])
    return acc
  }, [])

new p5((sketch) => {
  const gridConfig = {
    width: 600, height: 600, cellSize: 40,
  }
  const gridObjA = pipe(
    squareGrid(gridConfig),
    // gridWithPerlin(sketch, { level: 20 }),
    // translate([-100, 20])
  )
  const baseGrid = [...gridObjA]

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT)
  }

  sketch.draw = () => {
    sketch.background(colors[0])

    sketch.fill(colors[4])
    sketch.stroke("#6f6ff6")
    // drawDots(sketch, baseGrid)
    drawLines(sketch, baseGrid, gridObjA.colSize)
  }
})
