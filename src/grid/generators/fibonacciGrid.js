export function fibonacciGrid(config) {
  function fibSequence(max) {
    const sequence = []
    let a = 1, b = 1
    while (a * config.cellSize < max) {
      sequence.push(a * config.cellSize)
      ;[a, b] = [b, a + b]
    }
    return sequence
  }

  const xSequence = fibSequence(config.width)
  const ySequence = fibSequence(config.height)

  return {
    colSize: ySequence.length,
    width: xSequence[xSequence.length - 1] ?? 0,
    height: ySequence[ySequence.length - 1] ?? 0,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      for (const x of xSequence) {
        for (const y of ySequence) {
          yield [x, y]
        }
      }
    }
  }
}
