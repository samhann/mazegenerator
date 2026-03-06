#!/usr/bin/env node

/**
 * Oracle test: Compare TypeScript output against C++ output for identical seeds.
 * Both should produce identical SVG files when given the same parameters.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CPP_BINARY = path.resolve(__dirname, "../../src/mazegen");
const TS_MAIN = path.resolve(__dirname, "main.js");

interface TestCase {
  name: string;
  args: string;
}

const testCases: TestCase[] = [
  { name: "rect-5x5-kruskal", args: "-m 0 -w 5 -h 5 -a 0 -r 42" },
  { name: "rect-10x10-dfs", args: "-m 0 -w 10 -h 10 -a 1 -r 123" },
  { name: "rect-8x6-bfs", args: "-m 0 -w 8 -h 6 -a 2 -r 7" },
  { name: "rect-5x5-prim", args: "-m 0 -w 5 -h 5 -a 4 -r 99" },
  { name: "rect-5x5-lerw", args: "-m 0 -w 5 -h 5 -a 3 -r 55" },
  { name: "hex-3-kruskal", args: "-m 1 -s 3 -a 0 -r 42" },
  { name: "honeycomb-3-kruskal", args: "-m 2 -s 3 -a 0 -r 42" },
  { name: "circular-5-kruskal", args: "-m 3 -s 5 -a 0 -r 42" },
  { name: "circhex-3-kruskal", args: "-m 4 -s 3 -a 0 -r 42" },
  { name: "tri-5-kruskal", args: "-m 6 -s 5 -a 0 -r 42" },
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const cppOutput = `/tmp/oracle_cpp_${tc.name}`;
  const tsOutput = `/tmp/oracle_ts_${tc.name}`;

  try {
    // Generate C++ output
    execSync(`${CPP_BINARY} ${tc.args} -o ${cppOutput}`, { stdio: "pipe" });

    // Generate TypeScript output
    execSync(`node ${TS_MAIN} ${tc.args} -o ${tsOutput}`, { stdio: "pipe" });

    // Compare SVG files
    const cppSvg = fs.readFileSync(cppOutput + ".svg", "utf-8");
    const tsSvg = fs.readFileSync(tsOutput + ".svg", "utf-8");

    if (cppSvg === tsSvg) {
      console.log(`PASS: ${tc.name}`);
      passed++;
    } else {
      console.log(`FAIL: ${tc.name} - SVG output differs`);
      // Show first difference
      const cppLines = cppSvg.split("\n");
      const tsLines = tsSvg.split("\n");
      for (let i = 0; i < Math.max(cppLines.length, tsLines.length); i++) {
        if (cppLines[i] !== tsLines[i]) {
          console.log(`  First diff at line ${i + 1}:`);
          console.log(`  C++: ${(cppLines[i] || "(missing)").substring(0, 120)}`);
          console.log(`  TS:  ${(tsLines[i] || "(missing)").substring(0, 120)}`);
          break;
        }
      }
      failed++;
    }

    // Cleanup
    try { fs.unlinkSync(cppOutput + ".svg"); } catch {}
    try { fs.unlinkSync(tsOutput + ".svg"); } catch {}
  } catch (err: any) {
    console.log(`ERROR: ${tc.name} - ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${testCases.length} tests`);
process.exit(failed > 0 ? 1 : 0);
