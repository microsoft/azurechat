export async function register() {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}
