export function pipe(seed, ...fns) {
  return fns.reduce((v, f) => f(v), seed)
}
