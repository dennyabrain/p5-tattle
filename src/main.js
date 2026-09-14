import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, pipe } from './grid'

const { isometricGrid, squareGrid, fibonacciGrid, randomGrid } = generators
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
  const gridConfigA = { width: 400, height: 1200, cellSize: 40 }
  const gridObjA = pipe(
    isometricGrid(gridConfigA),
    gridWithPerlin(sketch, { level: 10 }),
    translate([0, -180])
  )
  const baseGrid = [...gridObjA]


  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT)
  }

  sketch.draw = () => {
    sketch.background(colors[0])

    sketch.fill(colors[4])
    sketch.stroke(colors[4])
    drawDots(sketch, baseGrid)
    drawLines(sketch, baseGrid, gridObjA.colSize)

    sketch.fill(colors[7])
    sketch.stroke(colors[7])
  }
})
