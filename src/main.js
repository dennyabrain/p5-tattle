import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers } from './grid'

const { squareGrid, fibonacciGrid, randomGrid } = generators
const { gridWithPerlin } = modifiers

const WIDTH = 600
const HEIGHT = 600

const CANVAS = {
  width: 600,
  height: 600,
  cellSize: 20
}

const colors = Object.keys(brand)
  .filter((name) => name.indexOf("visuals-") != -1)
  .reduce((acc, cur) => {
    acc.push(brand[cur])
    return acc
  }, [])




new p5((sketch) => {
  function cells(grid, canvas, i, j) {
    var x = i
    var y = j % canvas.height

    return grid[(x * y) + j]
  }

  function drawCell(grid, i1, j1, i2, j2) {
    sketch.beginShape()
    sketch.vertex(...cells(grid, CANVAS, i1, j1))
    sketch.vertex(...cells(grid, CANVAS, i2, j1))
    sketch.vertex(...cells(grid, CANVAS, i2, j2))
    sketch.vertex(...cells(grid, CANVAS, i1, j2))
    sketch.endShape(sketch.CLOSE)
  }

  // const grid = [...randomGrid()]
  const grid = [...squareGrid(CANVAS)]
  // const grid = [...gridWithPerlin(sketch, squareGrid(CANVAS), 400)]
  // const grid = [...fibonacciGrid(CANVAS)]
  // const grid = [...gridWithPerlin(sketch, fibonacciGrid(CANVAS), 4)]

  console.log({ grid })

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT)
  }

  sketch.draw = () => {
    sketch.background(colors[0])
    sketch.fill(colors[4])
    sketch.stroke(colors[4])

    for (const [cellx, celly] of grid) {
      sketch.circle(cellx, celly, 4)
    }

    sketch.noFill()
    sketch.stroke(colors[7])
    // drawCell(grid, 1, 1, 5, 5);
    drawCell(grid, 4, 4, 8, 8);
    // sketch.rect(...cells(grid, CANVAS, 1, 1), 4 * CANVAS.cellSize, 4 * CANVAS.cellSize)
    // console.log({ x: cells(grid, CANVAS, 1, 1) })
  }
})

