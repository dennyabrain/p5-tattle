import p5 from 'p5'
import { brand } from './brand'
import { generators, modifiers, renderers, walkers, pipe } from './grid'
import { darken, lighten } from './colors'
import { drawDiamond, drawDotDebug, drawImageCrop, drawImageFull, drawInRegion, drawPolygon, drawRect, drawTriangle } from './grid/renderers'
import { randomAccess, arbitraryRegion, withSymmetry } from './grid/walkers'
import { sine } from './grid/modifiers'
import { createCapture } from './grid/capture'
import { radialGrid } from './grid/generators'

const { isometricGrid, squareGrid, fibonacciGrid, randomGrid, perspectiveGrid1, regionGrid } = generators
const { gridWithPerlin, offset, zigzagOffset, translate } = modifiers
const { drawDots, drawLines } = renderers
const { linearWalker, radialWalker } = walkers

const WIDTH = 610
const HEIGHT = 960

const colors = Object.keys(brand)
    .filter((name) => name.indexOf("visuals-") != -1)
    .reduce((acc, cur) => {
        acc.push(brand[cur])
        return acc
    }, [])


function drawPattern(sketch, region, img) {
    const dotSize = 1

    sketch.beginClip()
    drawPolygon(sketch, region)
    sketch.endClip()

    const localGrid = pipe(
        regionGrid(region, { cols: 40, rows: 20 }),
        // sine({ amplitude: 20, frequency: 1, axis: 'x', inputAxis: 'y' })
        // gridWithPerlin(sketch, { level: 30 })
    )

    for (const cell of linearWalker(localGrid)) {
        // drawDiamond(sketch, cell, dotSize)
        // drawImageFull(sketch, cell, img)
        drawImageCrop(sketch, cell, img, 0.3, 0.3, 0.8, 0.8)
    }

    sketch.resetClip()
}



new p5((sketch) => {

    let img, font

    const capture = createCapture(sketch)

    const grid = pipe(
        squareGrid({ width: WIDTH, height: HEIGHT, cellSize: 12 }),
        // sine({ frequency: 8, amplitude: 24 }),
        gridWithPerlin(sketch, { level: 4 }),
        // squareGrid({ width: 600, height: 600, cellSize: 40 }),
        // gridWithPerlin(sketch, { level: 12 })
    )

    const grid2 = pipe(
        squareGrid({ width: WIDTH, height: HEIGHT, cellSize: 36 }),
        // sine({ frequency: 8, amplitude: 24 }),
        gridWithPerlin(sketch, { level: 4 }),
        // squareGrid({ width: 600, height: 600, cellSize: 40 }),
        // gridWithPerlin(sketch, { level: 12 })
    )

    let computedGrid;

    sketch.setup = () => {
        sketch.createCanvas(WIDTH, HEIGHT, sketch.WEBGL)
        sketch.textureMode(sketch.NORMAL)
        sketch.loadImage('/tmp/fish-sketch.jpg', (loaded) => { img = loaded })
        sketch.loadFont('/tmp/roboto.ttf', (loaded) => { font = loaded })
        sketch.angleMode(sketch.DEGREES)

        computedGrid = [...withSymmetry(linearWalker(grid), grid, { horizontal: true, vertical: true })]


    }

    sketch.keyPressed = () => capture.keyPressed()
    sketch.mousePressed = () => capture.mousePressed(grid, grid.colSize)

    sketch.draw = () => {
        if (!img) return
        if (!font) return

        sketch.background(colors[0])
        // WEBGL origin is canvas center — shift it to top-left to keep grid coords working
        sketch.translate(-WIDTH / 2, -HEIGHT / 2)


        sketch.stroke(colors[3])
        sketch.push()
        sketch.scale(0.95)
        sketch.translate(12, 12)
        // drawLines(sketch, grid)

        sketch.stroke(colors[4])
        drawLines(sketch, grid2)


        sketch.noStroke()
        for (const region of withSymmetry(linearWalker(grid), grid, { vertical: true, horizontal: true })) {
            if (region.canonicalSeed > 0.5) continue
            const { col, row } = region.canonicalIndex
            const color = col % 2 == 0 && row % 2 == 0 ? "#645089" : "#a296b8"
            sketch.fill(color)
            drawRect(sketch, region)
        }

        sketch.noLoop()
    }
})

