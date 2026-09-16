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
        translate([2, 2])
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


        const regions = [...withSymmetry(linearWalker(grid), grid, { vertical: true, horizontal: true })]
        const maxRow = Math.max(...regions.map(r => r.index.row))
        const maxCol = Math.max(...regions.map(r => r.index.col))

        const drawCell = new Map()
        for (const r of regions) {
            const key = `${Math.min(r.index.col, maxCol - r.index.col)}_${Math.min(r.index.row, maxRow - r.index.row)}`
            if (!drawCell.has(key)) drawCell.set(key, Math.random() > 0.5)
        }

        sketch.noStroke()
        for (const region of regions) {
            const key = `${Math.min(region.index.col, maxCol - region.index.col)}_${Math.min(region.index.row, maxRow - region.index.row)}`
            if (!drawCell.get(key)) continue
            const canonicalCol = Math.min(region.index.col, maxCol - region.index.col)
            const canonicalRow = Math.min(region.index.row, maxRow - region.index.row)
            const activate = canonicalCol % 2 == 0 && canonicalRow % 2 == 0
            const color = activate ? "#645089" : "#a296b8"
            // sketch.stroke(darken(sketch, color, 4))
            sketch.fill(color)
            drawRect(sketch, region)
        }

        sketch.noLoop()
    }
})

