export function* fibonacciGrid(config) {
  const sequenceLength = Math.ceil(config.width / config.cellSize)
  var seq = [1, 1]
  for (var x = 1; x < sequenceLength; x++) {
    seq.push(seq[x] + seq[x - 1])
  }
  console.log({ seq })

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

  for (const x of xSequence) {
    for (const y of ySequence) {
      yield [x, y]
    }
  }
}
