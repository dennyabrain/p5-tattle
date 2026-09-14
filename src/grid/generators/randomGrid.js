export function randomGrid() {
  return {
    colSize: null,
    width: 400,
    height: 400,
    origin: [0, 0],
    [Symbol.iterator]: function* () {
      yield [0, 0]
      yield [100, 100]
      yield [400, 400]
    }
  }
}
