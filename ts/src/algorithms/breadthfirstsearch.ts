import { SpanningTreeAlgorithm } from "../spanningtreealgorithm";
import { Graph } from "../maze";

export class BreadthFirstSearch extends SpanningTreeAlgorithm {
  spanningTree(vertices: number, adjacencylist: Graph): [number, number][] {
    const visited = new Array(vertices).fill(false);

    const startvertex = this.generator.uniformInt(0, vertices - 1);
    let currentlevel: number[] = [startvertex];
    visited[startvertex] = true;

    this.spanningtree = [];
    while (currentlevel.length > 0) {
      const nextlevel: number[] = [];
      for (const vertex of currentlevel) {
        for (const edge of adjacencylist[vertex]) {
          const nextvertex = edge[0];
          if (nextvertex < 0 || visited[nextvertex]) continue;
          visited[nextvertex] = true;
          this.spanningtree.push([vertex, nextvertex]);
          nextlevel.push(nextvertex);
        }
      }

      currentlevel = nextlevel;
      this.generator.shuffle(currentlevel);
    }
    return this.spanningtree;
  }
}
