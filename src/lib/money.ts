/** Round a MAD amount to 2 decimals using bankers-safe half-up. */
export function roundMad(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function assertPositiveMoney(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite amount >= 0`);
  }
}

export function applyBps(amount: number, bps: number): number {
  return roundMad((amount * bps) / 10_000);
}
