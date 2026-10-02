import p5 from 'p5'
import { brand } from '../../brand.js'

/**
 * Color palette drawn from the project's brand tokens.
 *
 * @example
 * import { PALETTE } from './src/apps/drawing/index.js'
 * PALETTE.forEach(hex => console.log(hex))
 */
export const PALETTE = [
  '#1a1820',
  '#ffffff',
  ...Object.values(brand).filter((_, i) => i > 0),
]

const GRID = 8
const DRAW_SIZE = 400
const SIZE_CELLS = { s: 1, m: 2, l: 4 }
const ZOOM_LEVELS = [0.5, 1, 2, 4, 8]

// ── state ────────────────────────────────────────────────────────
let currentColor = '#1a1820'
let sizeKey = 's'
let isEraser = false
let showBgImage = true
let zoomIndex = 1
let panX = 0
let panY = 0
let bgImage = null
let drawingLayer = null
let pRef = null

// pan drag tracking
let isPanning = false
let panDragStartX = 0
let panDragStartY = 0
let panDragOriginX = 0
let panDragOriginY = 0

// ── coordinate helpers ───────────────────────────────────────────
function zoom() {
  return ZOOM_LEVELS[zoomIndex]
}

/**
 * Convert p5 canvas coords to logical drawing-layer coords.
 *
 * @param {number} x - Canvas X.
 * @param {number} y - Canvas Y.
 * @returns {[number, number]}
 *
 * @example
 * const [lx, ly] = toLogical(p.mouseX, p.mouseY)
 */
function toLogical(x, y) {
  return [(x - panX) / zoom(), (y - panY) / zoom()]
}

function inDrawArea(lx, ly) {
  return lx >= 0 && lx < DRAW_SIZE && ly >= 0 && ly < DRAW_SIZE
}

function snapToGrid(v) {
  return Math.floor(v / GRID) * GRID
}

// ── drawing ──────────────────────────────────────────────────────
/**
 * Fill one grid-aligned cell on the target graphics buffer.
 *
 * @param {p5.Graphics} g
 * @param {number} cellX - Grid-snapped logical X.
 * @param {number} cellY - Grid-snapped logical Y.
 *
 * @example
 * drawCell(drawingLayer, snapToGrid(lx), snapToGrid(ly))
 */
function drawCell(g, cellX, cellY) {
  const px = SIZE_CELLS[sizeKey] * GRID
  g.noStroke()
  if (isEraser) {
    g.erase()
    g.rect(cellX, cellY, px, px)
    g.noErase()
  } else {
    g.fill(currentColor)
    g.rect(cellX, cellY, px, px)
  }
}

/**
 * Fill all grid cells along the path between two logical points (no gaps on fast moves).
 *
 * @param {p5.Graphics} g
 * @param {number} x1 - Previous logical X.
 * @param {number} y1 - Previous logical Y.
 * @param {number} x2 - Current logical X.
 * @param {number} y2 - Current logical Y.
 *
 * @example
 * const [lx, ly] = toLogical(p.mouseX, p.mouseY)
 * const [lpx, lpy] = toLogical(p.pmouseX, p.pmouseY)
 * drawPath(drawingLayer, lpx, lpy, lx, ly)
 */
function drawPath(g, x1, y1, x2, y2) {
  const sx1 = snapToGrid(x1), sy1 = snapToGrid(y1)
  const sx2 = snapToGrid(x2), sy2 = snapToGrid(y2)
  const dx = sx2 - sx1, dy = sy2 - sy1
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) / GRID

  const seen = new Set()
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps
    const cx = snapToGrid(sx1 + dx * t)
    const cy = snapToGrid(sy1 + dy * t)
    const key = `${cx},${cy}`
    if (seen.has(key)) continue
    seen.add(key)
    drawCell(g, cx, cy)
  }
}

// ── p5 sketch ────────────────────────────────────────────────────
const sketchFn = (p) => {
  pRef = p

  p.setup = () => {
    const container = document.getElementById('canvas-container')
    p.createCanvas(container.clientWidth, container.clientHeight).parent('canvas-container')
    drawingLayer = p.createGraphics(DRAW_SIZE, DRAW_SIZE)
    drawingLayer.clear()
    // Center the drawing area
    panX = Math.floor((p.width - DRAW_SIZE) / 2)
    panY = Math.floor((p.height - DRAW_SIZE) / 2)
    p.frameRate(60)
    document.getElementById('zoom-label').textContent = `${zoom()}×`
  }

  p.draw = () => {
    p.background(180, 178, 174) // area outside the drawing canvas

    p.push()
    p.translate(panX, panY)
    p.scale(zoom())

    // Drawing area background
    p.noStroke()
    p.fill(248, 246, 242)
    p.rect(0, 0, DRAW_SIZE, DRAW_SIZE)

    if (bgImage && showBgImage) {
      p.push()
      p.tint(255, 128)
      const s = Math.min(DRAW_SIZE / bgImage.width, DRAW_SIZE / bgImage.height)
      const dw = bgImage.width * s
      const dh = bgImage.height * s
      p.image(bgImage, (DRAW_SIZE - dw) / 2, (DRAW_SIZE - dh) / 2, dw, dh)
      p.noTint()
      p.pop()
    }

    p.image(drawingLayer, 0, 0)

    if (zoom() >= 2) {
      p.push()
      p.stroke(140, 140, 140, 50)
      p.strokeWeight(0.5 / zoom())
      for (let x = 0; x <= DRAW_SIZE; x += GRID) p.line(x, 0, x, DRAW_SIZE)
      for (let y = 0; y <= DRAW_SIZE; y += GRID) p.line(0, y, DRAW_SIZE, y)
      p.pop()
    }

    // Subtle border around drawing area
    p.noFill()
    p.stroke(0, 0, 0, 30)
    p.strokeWeight(1 / zoom())
    p.rect(0, 0, DRAW_SIZE, DRAW_SIZE)

    p.pop()

    // Update cursor based on whether mouse is over the draw area
    const [lx, ly] = toLogical(p.mouseX, p.mouseY)
    p.canvas.style.cursor = inDrawArea(lx, ly) ? 'crosshair' : 'grab'
  }

  p.mousePressed = () => {
    const [lx, ly] = toLogical(p.mouseX, p.mouseY)
    if (!inDrawArea(lx, ly)) {
      // Begin pan drag
      isPanning = true
      panDragStartX = p.mouseX
      panDragStartY = p.mouseY
      panDragOriginX = panX
      panDragOriginY = panY
      return
    }
    drawCell(drawingLayer, snapToGrid(lx), snapToGrid(ly))
  }

  p.mouseDragged = () => {
    if (isPanning) {
      panX = panDragOriginX + (p.mouseX - panDragStartX)
      panY = panDragOriginY + (p.mouseY - panDragStartY)
      return
    }
    const [lx, ly] = toLogical(p.mouseX, p.mouseY)
    const [lpx, lpy] = toLogical(p.pmouseX, p.pmouseY)
    drawPath(drawingLayer, lpx, lpy, lx, ly)
  }

  p.mouseReleased = () => {
    isPanning = false
  }

  p.windowResized = () => {
    const container = document.getElementById('canvas-container')
    p.resizeCanvas(container.clientWidth, container.clientHeight)
  }
}

new p5(sketchFn)

// ── zoom ─────────────────────────────────────────────────────────
/**
 * Change zoom level, keeping the logical center of the view fixed.
 *
 * @param {number} newIndex - Index into ZOOM_LEVELS.
 *
 * @example
 * updateZoom(zoomIndex + 1)
 */
function updateZoom(newIndex) {
  if (!pRef) return
  const oldZoom = zoom()
  const newZoom = ZOOM_LEVELS[newIndex]

  // Zoom toward the center of the display canvas
  const cx = pRef.width / 2
  const cy = pRef.height / 2
  const lx = (cx - panX) / oldZoom
  const ly = (cy - panY) / oldZoom
  panX = Math.round(cx - lx * newZoom)
  panY = Math.round(cy - ly * newZoom)

  zoomIndex = newIndex
  document.getElementById('zoom-label').textContent = `${newZoom}×`
}

// ── UI wiring ────────────────────────────────────────────────────
function buildColorGrid() {
  const grid = document.getElementById('color-grid')
  PALETTE.forEach((hex) => {
    const swatch = document.createElement('button')
    swatch.className = 'color-swatch' + (hex === currentColor ? ' active' : '')
    swatch.style.background = hex
    if (hex === '#ffffff') swatch.style.outline = '1px solid #d0ceca'
    swatch.title = hex
    swatch.addEventListener('click', () => {
      currentColor = hex
      isEraser = false
      grid.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'))
      swatch.classList.add('active')
      document.getElementById('eraser-btn').classList.remove('active')
    })
    grid.appendChild(swatch)
  })
}

function buildSizeRow() {
  document.getElementById('size-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn')
    if (!btn) return
    sizeKey = btn.dataset.size
    document.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
  })
}

function wireEraser() {
  const btn = document.getElementById('eraser-btn')
  btn.addEventListener('click', () => {
    isEraser = !isEraser
    btn.classList.toggle('active', isEraser)
    if (isEraser) {
      document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'))
    }
  })
}

function wireZoom() {
  document.getElementById('zoom-in').addEventListener('click', () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) updateZoom(zoomIndex + 1)
  })
  document.getElementById('zoom-out').addEventListener('click', () => {
    if (zoomIndex > 0) updateZoom(zoomIndex - 1)
  })
}

function wireToggleBg() {
  const btn = document.getElementById('toggle-bg-btn')
  btn.addEventListener('click', () => {
    showBgImage = !showBgImage
    btn.textContent = showBgImage ? 'Hide Image' : 'Show Image'
  })
}

function wireFileUpload() {
  const fileInput = document.getElementById('file-input')
  document.getElementById('upload-btn').addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file || !pRef) return
    const url = URL.createObjectURL(file)
    pRef.loadImage(url, (img) => {
      bgImage = img
      showBgImage = true
      document.getElementById('toggle-bg-btn').textContent = 'Hide Image'
      URL.revokeObjectURL(url)
    })
    fileInput.value = ''
  })
}

function wireClear() {
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (drawingLayer) drawingLayer.clear()
  })
}

function wireDownload() {
  document.getElementById('download-btn').addEventListener('click', () => {
    if (!drawingLayer) return
    const link = document.createElement('a')
    link.download = 'uli-illustration.png'
    link.href = drawingLayer.canvas.toDataURL('image/png')
    link.click()
  })
}

buildColorGrid()
buildSizeRow()
wireEraser()
wireZoom()
wireToggleBg()
wireFileUpload()
wireClear()
wireDownload()
