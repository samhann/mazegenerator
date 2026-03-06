import { SpanningTreeAlgorithm } from "../spanningtreealgorithm";
import { Graph } from "../maze";

export class DepthFirstSearch extends SpanningTreeAlgorithm {
  private parent: number[] = [];

  private dfs(vertex: number, adjacencylist: Graph): void {
    const nodeorder: number[] = [];
    for (let i = 0; i < adjacencylist[vertex].length; i++) nodeorder.push(i);
    this.generator.shuffle(nodeorder);

    for (const index of nodeorder) {
      const nextvertex = adjacencylist[vertex][index][0];
      if (nextvertex < 0 || this.parent[nextvertex] >= 0) continue;
      this.spanningtree.push([vertex, nextvertex]);
      this.parent[nextvertex] = vertex;
      this.dfs(nextvertex, adjacencylist);
    }
  }

  spanningTree(vertices: number, adjacencylist: Graph): [number, number][] {
    this.spanningtree = [];
    this.parent = new Array(vertices).fill(-1);
    const startVertex = this.generator.uniformInt(0, vertices - 1);
    this.dfs(startVertex, adjacencylist);
    return this.spanningtree;
  }

  solveMaze(vertices: number, adjacencylist: Graph, startvertex: number): number[] {
    this.spanningtree = [];
    this.parent = new Array(vertices).fill(-1);
    this.parent[startvertex] = startvertex;
    this.dfs(startvertex, adjacencylist);
    return this.parent;
  }
}
