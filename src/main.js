import p5 from 'p5'
import { brand } from './brand'

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
  function* squareGrid(canvas) {
    for (var i = 0; i < canvas.width + 1; i += canvas.cellSize) {
      for (var j = 0; j < canvas.height + 1; j += canvas.cellSize) {
        yield [i, j]
      }
    }
  }

  /**
   * Return a grid whose vertical lines adhere to fibonacci sequence
   * @param {*} canvas 
   * 
   * first generate a fibonnaci sequence of size Math.ceil(canvas.width/canvas.cellSize)
   */
  function* fibonacciGrid(canvas) {
    const sequenceLength = Math.ceil(canvas.width / canvas.cellSize)
    var seq = [1, 1]
    for (var x = 1; x < sequenceLength; x++) {
      seq.push(seq[x] + seq[x - 1])
    }
    console.log({ seq })

    function fibSequence(max) {
      const sequence = []
      let a = 1, b = 1
      while (a * canvas.cellSize < max) {
        sequence.push(a * canvas.cellSize)
          ;[a, b] = [b, a + b]
      }
      return sequence
    }

    const xSequence = fibSequence(canvas.width)
    const ySequence = fibSequence(canvas.height)

    for (const x of xSequence) {
      for (const y of ySequence) {
        yield [x, y]
      }
    }
  }

  function* gridWithPerlin(grid, level = 4) {
    for (const [cellX, cellY] of grid) {
      var n = sketch.noise(cellX, cellY)
      var x = sketch.map(
        n,
        0, 1,
        cellX - level,
        cellX + level,
        true
      )
      var y = sketch.map(
        n,
        0, 1,
        cellY - level,
        cellY + level,
        true
      )
      yield [x, y]
    }
  }

  function* randomGrid() {
    yield [0, 0]
    yield [100, 100]
    yield [400, 400]
  }

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
  // const grid = [...gridWithPerlin(squareGrid(CANVAS), 400)]
  // const grid = [...fibonacciGrid(CANVAS)]
  // const grid = [...gridWithPerlin(fibonacciGrid(CANVAS), 4)]

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

