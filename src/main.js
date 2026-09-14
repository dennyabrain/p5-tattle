import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, pipe } from './grid'

const { squareGrid, fibonacciGrid, randomGrid } = generators
const { gridWithPerlin, offset, zigzagOffset } = modifiers
const { drawDots, drawLines } = renderers

const WIDTH = 600
const HEIGHT = 600

const gridConfig = {
  width: 800,
  height: 800,
  cellSize: 40
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
    sketch.vertex(...cells(grid, gridConfig, i1, j1))
    sketch.vertex(...cells(grid, gridConfig, i2, j1))
    sketch.vertex(...cells(grid, gridConfig, i2, j2))
    sketch.vertex(...cells(grid, gridConfig, i1, j2))
    sketch.endShape(sketch.CLOSE)
  }

  const colSize = Math.floor(gridConfig.height / gridConfig.cellSize) + 1

  // const grid = [...pipe(randomGrid())]
  // const grid = [...pipe(squareGrid(gridConfig))]
  // const grid = [...pipe(fibonacciGrid(gridConfig))]
  // const grid = [...pipe(squareGrid(gridConfig), gridWithPerlin(sketch, { level: 400 }))]
  // const grid = [...pipe(fibonacciGrid(gridConfig), gridWithPerlin(sketch, { level: 4 }))]
  // const grid = [...pipe(squareGrid(gridConfig), offset({ axis: 'column', amount: 10, colSize }))]
  // const grid = [...pipe(squareGrid(gridConfig), offset({ axis: 'row', amount: 10, colSize }))]
  // const grid = [...pipe(squareGrid(gridConfig), zigzagOffset({ axis: 'column', amount: 10, colSize }))]
  const grid = [...pipe(
    squareGrid(gridConfig),
    zigzagOffset({ axis: 'column', amount: 10, colSize })
  )]

  console.log({ grid })

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT)
  }

  sketch.draw = () => {
    sketch.background(colors[0])
    sketch.fill(colors[4])
    sketch.stroke(colors[4])

    drawLines(sketch, grid, colSize)

    // drawLines(sketch, [...pipe(squareGrid(gridConfig), zigzagOffset({ axis: 'row', amount: 10, colSize }))], colSize)

    sketch.noFill()
    sketch.stroke(colors[7])
    // drawCell(grid, 1, 1, 5, 5);
    // drawCell(grid, 4, 4, 8, 8);
    // sketch.rect(...cells(grid, gridConfig, 1, 1), 4 * gridConfig.cellSize, 4 * gridConfig.cellSize)
    // console.log({ x: cells(grid, gridConfig, 1, 1) })
  }
})

