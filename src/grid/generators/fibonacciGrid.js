export function* fibonacciGrid(canvas) {
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
