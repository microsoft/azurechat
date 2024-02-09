export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('Node.js instrumentation');
    await import('./instrumentation.node');
  }
}
