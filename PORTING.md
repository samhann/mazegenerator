# Porting razimantv/mazegenerator from C++ to TypeScript

## Overview

We forked [razimantv/mazegenerator](https://github.com/razimantv/mazegenerator) and ported it to TypeScript with **byte-identical SVG output** when given the same random seed. This means the C++ version can serve as an oracle to verify the TypeScript port is correct.

## What the Original Does

The maze generator creates mazes of different shapes using graph theory:
- **6 maze types**: rectangular, hexagonal (triangular lattice), honeycomb, circular, circular-hexagonal, triangular
- **5 algorithms**: Kruskal's, depth-first search, breadth-first search, loop-erased random walk (Wilson's), Prim's
- **Output**: SVG or PNG (via gnuplot)

All algorithms work by computing a random spanning tree of the maze's graph, then removing the borders corresponding to tree edges to carve passages.

## The Porting Process

### Step 1: Make C++ Deterministic

The original C++ code seeds its Mersenne Twister PRNG from `std::random_device` (non-deterministic). We added:
- A `-r <seed>` command-line flag
- A `SpanningtreeAlgorithm(unsigned int seed)` constructor
- `using SpanningtreeAlgorithm::SpanningtreeAlgorithm` in all algorithm subclasses

This lets us generate the same maze twice: `./mazegen -r 42` always produces the same output.

### Step 2: Implement MT19937 in TypeScript

The core challenge was reproducing C++ randomness exactly. Three components needed to match:

#### 2a. MT19937 Engine (`mt19937.ts`)

The Mersenne Twister itself was straightforward — it's a well-specified algorithm. We used `Uint32Array` for 32-bit unsigned arithmetic and `Math.imul` for multiplication. The raw output matched C++ immediately.

#### 2b. `uniform_int_distribution` — The Tricky Part

Our first attempt used a simple modulo-with-rejection approach. **It produced wrong results.** The issue: libstdc++ uses a **downscaling** algorithm, not modulo:

```
scaling = (2^32 - 1) / (range + 1)    // integer division
past = (range + 1) * scaling           // reject threshold
value = next() while value >= past     // rejection sampling
result = value / scaling               // integer division to get index
```

This is mathematically equivalent to modulo for bias elimination, but produces different mappings from random bits to output values. We had to match libstdc++ exactly.

#### 2c. `std::shuffle` — The Really Tricky Part

Even after fixing `uniformInt`, shuffle results differed. Investigation of `/usr/include/c++/13/bits/stl_algo.h` revealed that libstdc++ has a **two-for-one optimization** in `std::shuffle`:

1. When `urngrange >= urange^2` (generator range is large enough), it processes swaps in **pairs**
2. If the array has an even number of elements (odd swaps), it does the first swap separately
3. For each pair, it calls `__gen_two_uniform_ints(b0, b1)` which generates **one** random value in `[0, b0*b1)` and splits it: `(x / b1, x % b1)`
4. This uses half the random values compared to naive Fisher-Yates

For a 10-element array, standard Fisher-Yates uses 9 generator calls; libstdc++ uses only **5**.

### Step 3: Port the Architecture

The C++ class hierarchy mapped cleanly to TypeScript:

| C++ | TypeScript | Location |
|-----|-----------|----------|
| `CellBorder` (abstract) | `CellBorder` interface | `ts/src/cellborder.ts` |
| `LineBorder`, `ArcBorder` | Same names | `ts/src/cellborder.ts` |
| `Maze` (abstract) | `Maze` abstract class | `ts/src/maze.ts` |
| `SpanningtreeAlgorithm` | `SpanningTreeAlgorithm` | `ts/src/spanningtreealgorithm.ts` |
| Algorithm subclasses | Same structure | `ts/src/algorithms/` |
| Maze type subclasses | Same structure | `ts/src/mazetypes/` |
| `std::tuple<int, shared_ptr<CellBorder>>` | `[number, CellBorder]` tuple | Type alias `Edge` |
| `std::vector<std::vector<Edge>>` | `Edge[][]` | Type alias `Graph` |

### Step 4: Match Number Formatting

C++ uses two different float-to-string formats:
- `std::to_string(double)` → `%f` format (6 decimal places): `"0.000000"`, `"-25.980762"`
- `ostream << double` → default precision (6 significant digits): `"120"`, `"107.058"`

We used `n.toFixed(6)` for `std::to_string` and `parseFloat(n.toPrecision(6)).toString()` for stream format.

One edge case: C++ `std::to_string(-0.0)` produces `"-0.000000"` but JavaScript `(-0).toFixed(6)` produces `"0.000000"`. We added explicit negative-zero handling.

SVG dimension values required `Math.trunc()` to match C++ implicit `double` → `int` conversion.

### Step 5: Oracle Testing

`ts/src/test-oracle.ts` runs both C++ and TypeScript with the same parameters and compares SVG output byte-for-byte. Test cases cover:
- All 5 algorithms with rectangular mazes
- All 6 maze types with Kruskal's algorithm
- Multiple seed values

**Result: 10/10 tests pass with identical output.**

## How to Use

### Build C++ (with seed support)
```bash
cd src && make
./mazegen -m 0 -w 10 -h 10 -a 0 -r 42 -o my_maze
```

### Build & Run TypeScript
```bash
cd ts && npm install && npx tsc
node dist/main.js -m 0 -w 10 -h 10 -a 0 -r 42 -o my_maze
```

### Run Oracle Tests
```bash
cd ts && npm test
```

## Key Files

- `src/algorithms/spanningtreealgorithm.{h,cpp}` — Added seed constructor
- `src/main.cpp` — Added `-r` flag
- `ts/src/mt19937.ts` — MT19937 + libstdc++-compatible `uniformInt` + `shuffle`
- `ts/src/test-oracle.ts` — Oracle comparison test suite

## Lessons Learned

1. **Standard library implementations matter.** `std::uniform_int_distribution` and `std::shuffle` have no mandated implementation — libstdc++, libc++, and MSVC all differ. Our port matches libstdc++ (GCC).

2. **Shuffle optimizations are invisible but impactful.** libstdc++'s two-for-one optimization in `std::shuffle` consumes random values at a different rate than naive Fisher-Yates. You can't just implement "a correct shuffle" — you must match the exact consumption pattern.

3. **Float formatting has edge cases.** Negative zero, integer truncation, and the difference between `std::to_string` and `<<` formatting all needed explicit handling.
