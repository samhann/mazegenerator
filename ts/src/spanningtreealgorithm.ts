import { MT19937 } from "./mt19937";
import { Graph } from "./maze";

export abstract class SpanningTreeAlgorithm {
  protected spanningtree: [number, number][];
  protected generator: MT19937;

  constructor(seed?: number) {
    this.spanningtree = [];
    if (seed !== undefined) {
      this.generator = new MT19937(seed);
    } else {
      // Use a random seed like C++ std::random_device
      this.generator = new MT19937((Math.random() * 0xffffffff) >>> 0);
    }
  }

  abstract spanningTree(vertices: number, adjacencylist: Graph): [number, number][];
}
