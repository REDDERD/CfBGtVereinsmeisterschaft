export function pyramidLevelsToArray(data) {
  const levels = []
  let i = 1
  while (data[`level${i}`]) {
    levels.push(data[`level${i}`])
    i++
  }
  return levels
}
