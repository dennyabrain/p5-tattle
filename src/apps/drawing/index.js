import p5 from 'p5'
import uli from '../../brand/uli.json'

/**
 * Color palette from the Uli brand token scale (light to dark), plus black and white.
 *
 * @example
 * import { PALETTE } from './src/apps/drawing/index.js'
 * PALETTE.forEach(hex => console.log(hex))
 */
export const PALETTE = [
  '#ffffff',
  ...Object.values(uli.colors),
  '#000000',
]

const GRID = 4
const DRAW_SIZE = 400
const SIZE_CELLS = { s: 1, m: 2, l: 3 }
const ZOOM_LEVELS = [0.5, 1, 2, 4, 8]

// ── state ────────────────────────────────────────────────────────
let currentColor = '#e58224'
let sizeKey = 's'
let pixelShape = 'square' // 'square' | 'circle'
let isEraser = false
let activeTool = 'pixel' // 'pixel' | 'line'
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

// line tool tracking
let lineStart = null // { x, y } snapped logical coords

// keyboard state
let isSpaceDown = false

// undo history (ImageData snapshots)
const MAX_HISTORY = 30
let history = []

/**
 * Snapshot the current drawing layer into the history stack.
 * Call this before any operation that modifies the layer.
 *
 * @example
 * saveHistory()
 * drawCell(drawingLayer, x, y)
 */
function saveHistory() {
  const snapshot = drawingLayer.drawingContext.getImageData(0, 0, DRAW_SIZE, DRAW_SIZE)
  history.push(snapshot)
  if (history.length > MAX_HISTORY) history.shift()
  updateUndoBtn()
}

/**
 * Restore the drawing layer to the state before the last stroke.
 *
 * @example
 * document.getElementById('undo-btn').addEventListener('click', undo)
 */
function undo() {
  if (history.length === 0) return
  drawingLayer.drawingContext.putImageData(history.pop(), 0, 0)
  updateUndoBtn()
}

function updateUndoBtn() {
  const btn = document.getElementById('undo-btn')
  if (btn) btn.disabled = history.length === 0
}

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
 * Return all grid-snapped cell positions along the straight path between two points.
 *
 * @param {number} x1 - Logical X start.
 * @param {number} y1 - Logical Y start.
 * @param {number} x2 - Logical X end.
 * @param {number} y2 - Logical Y end.
 * @param {number} [step] - Distance between cell centres; defaults to GRID (touching cells).
 * @returns {Array<[number, number]>}
 *
 * @example
 * const px = SIZE_CELLS[sizeKey] * GRID
 * const cells = getLineCells(0, 0, 40, 40, px)
 * cells.forEach(([cx, cy]) => drawCell(layer, cx, cy))
 */
function getLineCells(x1, y1, x2, y2, step = GRID) {
  const sx1 = snapToGrid(x1), sy1 = snapToGrid(y1)
  const sx2 = snapToGrid(x2), sy2 = snapToGrid(y2)
  const dx = sx2 - sx1, dy = sy2 - sy1
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) / step

  const seen = new Set()
  const cells = []
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps
    const cx = snapToGrid(sx1 + dx * t)
    const cy = snapToGrid(sy1 + dy * t)
    const key = `${cx},${cy}`
    if (seen.has(key)) continue
    seen.add(key)
    cells.push([cx, cy])
  }
  return cells
}

// Spray tool: scatter radius (logical px) and dots-per-call per brush size
const SPRAY_CONFIG = {
  s: { radius: 16, count: 4 },
  m: { radius: 28, count: 7 },
  l: { radius: 40, count: 12 },
}

/**
 * Paint random grid-snapped cells within a spray radius around a logical point.
 *
 * @param {p5.Graphics} g
 * @param {number} lx - Logical X of the cursor.
 * @param {number} ly - Logical Y of the cursor.
 *
 * @example
 * drawSpray(drawingLayer, lx, ly)
 */
function drawSpray(g, lx, ly) {
  const { radius, count } = SPRAY_CONFIG[sizeKey]
  g.noStroke()
  if (isEraser) g.erase()
  else g.fill(currentColor)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * radius
    renderShape(g, snapToGrid(lx + r * Math.cos(angle)), snapToGrid(ly + r * Math.sin(angle)), GRID)
  }
  if (isEraser) g.noErase()
}

/**
 * Draw a single cell shape (square or circle) on any p5 context.
 *
 * @param {p5 | p5.Graphics} ctx
 * @param {number} cellX - Grid-snapped logical X.
 * @param {number} cellY - Grid-snapped logical Y.
 * @param {number} px - Cell size in pixels.
 *
 * @example
 * renderShape(drawingLayer, cx, cy, SIZE_CELLS[sizeKey] * GRID)
 */
function renderShape(ctx, cellX, cellY, px) {
  if (pixelShape === 'circle') {
    ctx.ellipse(cellX + px / 2, cellY + px / 2, px, px)
  } else {
    ctx.rect(cellX, cellY, px, px)
  }
}

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
    renderShape(g, cellX, cellY, px)
    g.noErase()
  } else {
    g.fill(currentColor)
    renderShape(g, cellX, cellY, px)
  }
}

/**
 * Draw all cells along the path between two logical points onto a graphics buffer.
 *
 * @param {p5.Graphics} g
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 *
 * @example
 * drawPath(drawingLayer, lpx, lpy, lx, ly)
 */
function drawPath(g, x1, y1, x2, y2) {
  const step = SIZE_CELLS[sizeKey] * GRID
  for (const [cx, cy] of getLineCells(x1, y1, x2, y2, step)) {
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
    panX = Math.floor((p.width - DRAW_SIZE) / 2)
    panY = Math.floor((p.height - DRAW_SIZE) / 2)
    p.frameRate(60)
    document.getElementById('zoom-label').textContent = `${zoom()}×`
  }

  p.draw = () => {
    p.background(180, 178, 174)

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

    // Line tool preview while dragging
    if (activeTool === 'line' && lineStart !== null && p.mouseIsPressed) {
      const [lx, ly] = toLogical(p.mouseX, p.mouseY)
      const px = SIZE_CELLS[sizeKey] * GRID
      const previewCells = getLineCells(lineStart.x, lineStart.y, lx, ly, px)
      p.push()
      p.noStroke()
      if (isEraser) {
        p.fill(255, 255, 255, 180)
      } else {
        const c = p.color(currentColor)
        c.setAlpha(180)
        p.fill(c)
      }
      for (const [cx, cy] of previewCells) {
        renderShape(p, cx, cy, px)
      }
      p.pop()
    }

    if (zoom() >= 2) {
      p.push()
      p.stroke(140, 140, 140, 50)
      p.strokeWeight(0.5 / zoom())
      for (let x = 0; x <= DRAW_SIZE; x += GRID) p.line(x, 0, x, DRAW_SIZE)
      for (let y = 0; y <= DRAW_SIZE; y += GRID) p.line(0, y, DRAW_SIZE, y)
      p.pop()
    }

    p.noFill()
    p.stroke(0, 0, 0, 30)
    p.strokeWeight(1 / zoom())
    p.rect(0, 0, DRAW_SIZE, DRAW_SIZE)

    p.pop()

    const [lx, ly] = toLogical(p.mouseX, p.mouseY)
    if (isPanning) p.canvas.style.cursor = 'grabbing'
    else if (isSpaceDown || !inDrawArea(lx, ly)) p.canvas.style.cursor = 'grab'
    else p.canvas.style.cursor = 'crosshair'
  }

  p.mouseWheel = (e) => {
    const dir = e.delta < 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex + dir))
    if (newIndex !== zoomIndex) updateZoom(newIndex, p.mouseX, p.mouseY)
    return false // prevent page scroll
  }

  p.mousePressed = () => {
    const [lx, ly] = toLogical(p.mouseX, p.mouseY)
    if (isSpaceDown || !inDrawArea(lx, ly)) {
      isPanning = true
      panDragStartX = p.mouseX
      panDragStartY = p.mouseY
      panDragOriginX = panX
      panDragOriginY = panY
      return
    }
    if (activeTool === 'line') {
      saveHistory()
      lineStart = { x: snapToGrid(lx), y: snapToGrid(ly) }
      return
    }
    saveHistory()
    if (activeTool === 'spray') {
      drawSpray(drawingLayer, lx, ly)
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
    if (activeTool === 'line') return // preview handled in draw()
    const [lx, ly] = toLogical(p.mouseX, p.mouseY)
    if (activeTool === 'spray') {
      drawSpray(drawingLayer, lx, ly)
      return
    }
    const [lpx, lpy] = toLogical(p.pmouseX, p.pmouseY)
    drawPath(drawingLayer, lpx, lpy, lx, ly)
  }

  p.mouseReleased = () => {
    if (isPanning) {
      isPanning = false
      return
    }
    if (activeTool === 'line' && lineStart !== null) {
      const [lx, ly] = toLogical(p.mouseX, p.mouseY)
      drawPath(drawingLayer, lineStart.x, lineStart.y, lx, ly)
      lineStart = null
    }
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
/**
 * Change zoom level, keeping a given canvas point fixed in place.
 * Defaults to the centre of the display canvas when no focus is provided.
 *
 * @param {number} newIndex - Index into ZOOM_LEVELS.
 * @param {number} [focusX] - Canvas X to zoom toward (defaults to centre).
 * @param {number} [focusY] - Canvas Y to zoom toward (defaults to centre).
 *
 * @example
 * updateZoom(zoomIndex + 1, p.mouseX, p.mouseY)
 */
function updateZoom(newIndex, focusX, focusY) {
  if (!pRef) return
  const oldZoom = zoom()
  const newZoom = ZOOM_LEVELS[newIndex]
  const fx = focusX ?? pRef.width / 2
  const fy = focusY ?? pRef.height / 2
  const lx = (fx - panX) / oldZoom
  const ly = (fy - panY) / oldZoom
  panX = Math.round(fx - lx * newZoom)
  panY = Math.round(fy - ly * newZoom)
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
    if (hex === '#ffffff') swatch.style.outline = '1px solid #e5e0da'
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
    document.querySelectorAll('#size-row .size-btn').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
  })
}

function wireShapeRow() {
  document.getElementById('shape-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn')
    if (!btn) return
    pixelShape = btn.dataset.shape
    document.querySelectorAll('#shape-row .size-btn').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
  })
}

function wireToolRow() {
  document.getElementById('tool-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn')
    if (!btn) return
    activeTool = btn.dataset.tool
    lineStart = null
    document.querySelectorAll('#tool-row .size-btn').forEach((b) => b.classList.remove('active'))
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
    if (!drawingLayer) return
    saveHistory()
    drawingLayer.clear()
  })
}

function wireUndo() {
  document.getElementById('undo-btn').addEventListener('click', undo)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault()
      undo()
    }
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault()
      isSpaceDown = true
    }
  })
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') isSpaceDown = false
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
wireShapeRow()
wireToolRow()
wireUndo()
wireEraser()
wireZoom()
wireToggleBg()
wireFileUpload()
wireClear()
wireDownload()
