import { SpanningTreeAlgorithm } from "../spanningtreealgorithm";
import { Graph } from "../maze";

export class Kruskal extends SpanningTreeAlgorithm {
  private parent: number[] = [];

  private getParent(u: number): number {
    return this.parent[u] === u ? u : (this.parent[u] = this.getParent(this.parent[u]));
  }

  spanningTree(vertices: number, adjacencylist: Graph): [number, number][] {
    const edges: [number, number][] = [];
    for (let i = 0; i < vertices; i++) {
      for (const edge of adjacencylist[i]) {
        if (edge[0] > i) edges.push([i, edge[0]]);
      }
    }
    this.generator.shuffle(edges);

    this.parent = [];
    for (let i = 0; i < vertices; i++) this.parent.push(i);

    this.spanningtree = [];
    for (const edge of edges) {
      const u = this.getParent(edge[0]);
      const v = this.getParent(edge[1]);
      if (u === v) continue;
      this.parent[u] = v;
      this.spanningtree.push(edge);
    }
    return this.spanningtree;
  }
}
