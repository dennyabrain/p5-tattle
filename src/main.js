import p5 from 'p5'
import { generators, modifiers, walkers, pipe } from './grid'
import { drawDiamond, drawRect, drawTriangle } from './grid/renderers'
import { withSymmetry } from './grid/walkers'
import { radialGrid } from './grid/generators'

const { squareGrid } = generators
const { gridWithPerlin, translate, stretch } = modifiers

const { linearWalker } = walkers

const WIDTH = 644   // 46 * 14
const HEIGHT = 966   // 46 * 21

// const P1 = '#342037'  // darkest
// const P2 = '#4d3052'
// const P3 = '#67406e'
// const P4 = '#815089'  // mid
// const P5 = '#9a73a1'
// const P6 = '#b396b8'
// const P7 = '#cdb9d0'
// const P8 = '#e6dce7'  // lightest

// const P1 = '#100505'  // darkest
// const P2 = '#1f0a0a'
// const P3 = '#2f0e0e'
// const P4 = '#3e1313'  // mid
// const P5 = '#4e1818'
// const P6 = '#714646'
// const P7 = '#957474'
// const P8 = '#b8a3a3'  // lightest


// const P1 = '#332e2b'  // darkest
// const P2 = '#665c57'
// const P3 = '#998b82'
// const P4 = '#ccb9ae'  // mid
// const P5 = '#ffe7d9'
// const P6 = '#ffece1'
// const P7 = '#fff1e8'
// const P8 = '#fff5f0'  // lightest

const P1 = '#2f0e0e'  // darkest
const P2 = '#2f0e0e'
const P3 = '#2f0e0e'
const P4 = '#2f0e0e'  // mid
const P5 = '#2f0e0e'
const P6 = '#2f0e0e'
const P7 = '#2f0e0e'
const P8 = '#2f0e0e'  // lightest



new p5((sketch) => {

  // --- Grids (created once, outside draw) ---

  // Border: coarse grid, cells colored by depth from edge
  const borderGrid = squareGrid({ width: WIDTH, height: HEIGHT, cellSize: 12 })

  // Field: confined to inner area (inside the 3-cell-deep border)
  const BORDER_CELL = 12
  const INSET = 4 * BORDER_CELL  // 69px on each side
  const fieldGrid = pipe(
    squareGrid({ width: WIDTH - 2 * INSET, height: HEIGHT - 2 * INSET, cellSize: 12 }),
    gridWithPerlin(sketch, { level: 3 }),
    translate([INSET, INSET])
  )

  // Medallion: lobed elliptical ring
  const CELL_SIZE = 24
  const R = Math.min(WIDTH, HEIGHT) * 0.40
  const medallion = pipe(
    squareGrid({
      width: WIDTH / 2, height: HEIGHT / 2, cellSize: 24

    }),
    gridWithPerlin(sketch, { level: 4 }),
    translate([7 * CELL_SIZE, 10 * CELL_SIZE])
  )

  // Core: small lobed central star
  const core = pipe(
    radialGrid({
      width: WIDTH, height: HEIGHT,
      spokes: 16, rings: 3,
      outerRadius: R * 0.15,
      lobes: 4, lobeDepth: 0.2,
    }),
    stretch([1.2, 1.2])
  )

  sketch.setup = () => {
    sketch.createCanvas(WIDTH, HEIGHT, sketch.WEBGL)
    sketch.noLoop()
  }

  sketch.draw = () => {
    sketch.background(P3)
    sketch.translate(-WIDTH / 2, -HEIGHT / 2)
    // sketch.noStroke()
    sketch.stroke("#dcd1d1")

    // --- Layer 1: nested border bands ---
    const borderCells = [...linearWalker(borderGrid)]
    const bMaxCol = Math.max(...borderCells.map(r => r.index.col))
    const bMaxRow = Math.max(...borderCells.map(r => r.index.row))

    for (const r of borderCells) {
      const { col, row } = r.index
      const depth = Math.min(col, bMaxCol - col, row, bMaxRow - row)
      const n = sketch.noise(r.center[0] * 0.03, r.center[1] * 0.03)
      if (depth === 0) { sketch.fill(n > 0.5 ? P4 : P8); drawRect(sketch, r) }
      else if (depth === 1) { sketch.fill(n > 0.45 ? P5 : P2); drawDiamond(sketch, r) }
      else if (depth === 2) { sketch.fill(n > 0.5 ? P3 : P7); drawRect(sketch, r) }
    }

    // --- Layer 2: field — 4-way symmetric diamond scatter ---
    for (const region of withSymmetry(linearWalker(fieldGrid), fieldGrid, { horizontal: true, vertical: true })) {
      if (region.canonicalSeed > 0.55) continue
      const { col, row } = region.canonicalIndex
      sketch.fill((col + row) % 2 === 0 ? P8 : P5)
      drawRect(sketch, region)
    }

    // --- Layer 3: medallion rings-- -
    for (const region of withSymmetry(linearWalker(medallion), medallion, { horizontal: true, vertical: true })) {
      const color = region.index.row % 2 === 0
        ? P7
        : (region.index.col % 2 === 0 ? P6 : P8)
      sketch.fill(P3)
      sketch.noStroke()
      // drawRect(sketch, region)
      sketch.fill(color)
      drawDiamond(sketch, region)
    }
  }
})
