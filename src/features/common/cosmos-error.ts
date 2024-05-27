export function handleCosmosError(error: Error & { code?: number }): void {
  if (error.code) {
    switch (error.code) {
      case 404:
        //TODO handle error
        console.error("Item or resource not found.")
        break
      case 429:
        //TODO handle error
        console.error("Too many requests. You're being throttled!")
        break
      default:
        //TODO handle error
        console.error(`An error occurred: ${error.message}`)
    }
  } else {
    //TODO handle error
    console.error(`An unknown error occurred: ${error.message}`)
  }
}
