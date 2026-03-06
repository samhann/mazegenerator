#!/usr/bin/env node

import { Maze } from "./maze";
import { SpanningTreeAlgorithm } from "./spanningtreealgorithm";
import { Kruskal } from "./algorithms/kruskal";
import { DepthFirstSearch } from "./algorithms/depthfirstsearch";
import { BreadthFirstSearch } from "./algorithms/breadthfirstsearch";
import { LoopErasedRandomWalk } from "./algorithms/looperasedrandomwalk";
import { Prim } from "./algorithms/prim";
import { RectangularMaze } from "./mazetypes/rectangularmaze";
import { HexagonalMaze } from "./mazetypes/hexagonalmaze";
import { HoneyCombMaze } from "./mazetypes/honeycombmaze";
import { CircularMaze } from "./mazetypes/circularmaze";
import { CircularHexagonMaze } from "./mazetypes/circularhexagonmaze";
import { TriangularMaze } from "./mazetypes/triangularmaze";

function usage(): void {
  console.log("Usage: mazegen [--help] [-m <maze type>] [-a <algorithm type>]");
  console.log("               [-s <size> | -w <width> -h <height>]");
  console.log("               [-t <output type>] [-o <output prefix>]");
  console.log("               [-r <random seed>]");
  console.log();
  console.log("Optional arguments");
  console.log("  --help  Show this message and exit");
  console.log("  -m      Maze type");
  console.log("          0: Rectangular (default)");
  console.log("          1: Hexagonal (triangular lattice)");
  console.log("          2: Honeycomb");
  console.log("          3: Circular");
  console.log("          4: Circular (triangular lattice)");
  console.log("          6: Triangular");
  console.log("  -a      Algorithm type");
  console.log("          0: Kruskal's algorithm (default)");
  console.log("          1: Depth-first search");
  console.log("          2: Breadth-first search");
  console.log("          3: Loop-erased random walk");
  console.log("          4: Prim's algorithm");
  console.log("  -s      Size (non-rectangular mazes, default: 20)");
  console.log("  -w,-h   Width and height (rectangular maze, default: 20)");
  console.log("  -t      Output type");
  console.log("          0: svg output (default)");
  console.log("  -o      Prefix for .svg outputs (default: maze)");
  console.log("  -r      Random seed for deterministic maze generation");
}

function main(): void {
  const args = process.argv.slice(2);
  const options: Record<string, number> = {
    "-m": 0, "-a": 0, "-s": 20, "-w": 20, "-h": 20, "-t": 0,
  };
  let outputprefix = "maze";
  let seed: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help") {
      usage();
      process.exit(0);
    }
    if (args[i] === "-o") {
      outputprefix = args[++i];
      continue;
    }
    if (args[i] === "-r") {
      seed = parseInt(args[++i], 10);
      continue;
    }
    if (args[i] in options) {
      options[args[i]] = parseInt(args[++i], 10);
      continue;
    }
    console.error(`Unknown argument ${args[i]}`);
    usage();
    process.exit(1);
  }

  let maze: Maze;
  switch (options["-m"]) {
    case 0:
      console.log(`Rectangular maze of size ${options["-w"]}x${options["-h"]}`);
      maze = new RectangularMaze(options["-w"], options["-h"]);
      break;
    case 1:
      console.log(`Hexagonal maze with triangular lattice of size ${options["-s"]}`);
      maze = new HexagonalMaze(options["-s"]);
      break;
    case 2:
      console.log(`Honeycomb maze of size ${options["-s"]}`);
      maze = new HoneyCombMaze(options["-s"]);
      break;
    case 3:
      console.log(`Circular maze of size ${options["-s"]}`);
      maze = new CircularMaze(options["-s"]);
      break;
    case 4:
      console.log(`Circular maze with triangular lattice of size ${options["-s"]}`);
      maze = new CircularHexagonMaze(options["-s"]);
      break;
    case 6:
      console.log(`Triangular maze of size ${options["-s"]}`);
      maze = new TriangularMaze(options["-s"]);
      break;
    default:
      console.error(`Unknown maze type ${options["-m"]}`);
      process.exit(1);
  }

  if (seed !== undefined) {
    console.log(`Using random seed: ${seed}`);
  }

  let algorithm: SpanningTreeAlgorithm;
  switch (options["-a"]) {
    case 0:
      console.log("Maze generation using Kruskal's algorithm");
      algorithm = new Kruskal(seed);
      break;
    case 1:
      console.log("Maze generation using Depth-first search");
      algorithm = new DepthFirstSearch(seed);
      break;
    case 2:
      console.log("Maze generation using Breadth-first search");
      algorithm = new BreadthFirstSearch(seed);
      break;
    case 3:
      console.log("Maze generation using Loop-erased random walk");
      algorithm = new LoopErasedRandomWalk(seed);
      break;
    case 4:
      console.log("Maze generation using Prim's algorithm");
      algorithm = new Prim(seed);
      break;
    default:
      console.error(`Unknown algorithm type ${options["-a"]}`);
      process.exit(1);
  }

  console.log("Initialising graph...");
  maze.initializeGraph();
  console.log("Generating maze...");
  maze.generateMaze(algorithm);
  console.log(`Rendering maze to '${outputprefix}.svg'...`);
  maze.printMazeSVG(outputprefix);
}

main();
