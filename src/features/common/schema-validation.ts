export const refineFromEmpty = (value: string): boolean => {
  if (value.length === 0) {
    return true
  }
  return value.trim() !== ""
}
