/**
 * Mersenne Twister MT19937 implementation matching C++ std::mt19937 exactly.
 * Uses 32-bit unsigned integer arithmetic via bitwise operations.
 */
export class MT19937 {
  private mt: Uint32Array;
  private index: number;

  private static readonly N = 624;
  private static readonly M = 397;
  private static readonly MATRIX_A = 0x9908b0df;
  private static readonly UPPER_MASK = 0x80000000;
  private static readonly LOWER_MASK = 0x7fffffff;

  constructor(seed: number) {
    this.mt = new Uint32Array(MT19937.N);
    this.index = MT19937.N + 1;
    this.seed(seed >>> 0);
  }

  private seed(s: number): void {
    this.mt[0] = s >>> 0;
    for (let i = 1; i < MT19937.N; i++) {
      // mt[i] = 1812433253 * (mt[i-1] ^ (mt[i-1] >> 30)) + i
      const prev = this.mt[i - 1];
      const xor = prev ^ (prev >>> 30);
      // Multiply using 16-bit chunks to avoid precision loss
      this.mt[i] = (Math.imul(1812433253, xor) + i) >>> 0;
    }
    this.index = MT19937.N;
  }

  private generateNumbers(): void {
    const { N, M, MATRIX_A, UPPER_MASK, LOWER_MASK } = MT19937;
    const mag01 = [0, MATRIX_A];

    for (let i = 0; i < N; i++) {
      const y = (this.mt[i] & UPPER_MASK) | (this.mt[(i + 1) % N] & LOWER_MASK);
      this.mt[i] = this.mt[(i + M) % N] ^ (y >>> 1) ^ mag01[y & 1];
    }
    this.index = 0;
  }

  /** Generate a random 32-bit unsigned integer (matches std::mt19937 output) */
  next(): number {
    if (this.index >= MT19937.N) {
      this.generateNumbers();
    }

    let y = this.mt[this.index++];
    // Tempering
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  /**
   * Generate a uniform random integer in [min, max] (inclusive).
   * Matches libstdc++ std::uniform_int_distribution using downscaling.
   *
   * libstdc++ algorithm:
   *   scaling = urngrange / (range + 1)
   *   past = (range + 1) * scaling
   *   reject values >= past, then divide by scaling
   */
  uniformInt(min: number, max: number): number {
    const urange = (max - min) >>> 0;
    if (urange === 0) return min;

    const urngrange = 0xFFFFFFFF; // mt19937 max - min = 2^32 - 1
    const uerange = (urange + 1) >>> 0;

    // Use BigInt for accurate 32-bit division to match C++ integer arithmetic
    const scaling = Number(BigInt(urngrange) / BigInt(uerange));
    const past = Math.imul(uerange, scaling) >>> 0;

    let ret: number;
    do {
      ret = this.next();
    } while (ret >= past);

    // Integer division matching C++ behavior
    ret = Math.trunc(ret / scaling);
    return ret + min;
  }

  /**
   * Shuffle matching libstdc++ std::shuffle exactly.
   *
   * libstdc++ has a two-for-one optimization when urngrange >= urange^2:
   * - If n is even (odd number of swaps), do the first swap separately
   * - Then process remaining swaps in pairs using __gen_two_uniform_ints
   *
   * __gen_two_uniform_ints(b0, b1, g):
   *   x = uniform_int(0, b0*b1 - 1)
   *   return (x / b1, x % b1)
   */
  shuffle<T>(arr: T[]): void {
    const n = arr.length;
    if (n <= 1) return;

    const urngrange = 0xFFFFFFFF;
    const urange = n;

    // Check if two-for-one optimization applies (urngrange / urange >= urange)
    if (Math.trunc(urngrange / urange) >= urange) {
      let i = 1;

      // Even element count = odd number of swaps: do first swap separately
      if (urange % 2 === 0) {
        const j = this.uniformInt(0, 1);
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        i++;
      }

      // Process remaining swaps in pairs
      while (i < n) {
        const swapRange = i + 1; // __i - __first + 1
        // __gen_two_uniform_ints(swapRange, swapRange + 1)
        const x = this.uniformInt(0, swapRange * (swapRange + 1) - 1);
        const j1 = Math.trunc(x / (swapRange + 1));
        const j2 = x % (swapRange + 1);

        // First swap: arr[i] with arr[j1]
        let tmp = arr[i]; arr[i] = arr[j1]; arr[j1] = tmp;
        i++;
        // Second swap: arr[i] with arr[j2]
        tmp = arr[i]; arr[i] = arr[j2]; arr[j2] = tmp;
        i++;
      }
    } else {
      // Fallback: standard forward Fisher-Yates
      for (let i = 1; i < n; i++) {
        const j = this.uniformInt(0, i);
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
    }
  }
}
