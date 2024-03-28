export function handleCosmosError(error: Error & { code?: number }): void {
  if (error.code) {
    switch (error.code) {
      case 404:
        console.error("Item or resource not found.")
        break
      case 429:
        console.error("Too many requests. You're being throttled!")
        break
      default:
        console.error(`An error occurred: ${error.message}`)
    }
  } else {
    console.error(`An unknown error occurred: ${error.message}`)
  }
}
