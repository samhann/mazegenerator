import { SpanningTreeAlgorithm } from "../spanningtreealgorithm";
import { Graph } from "../maze";

export class LoopErasedRandomWalk extends SpanningTreeAlgorithm {
  private visited: number[] = [];

  private lerw(vertex: number, round: number, adjacencylist: Graph): void {
    const current: number[] = [];

    while (!this.visited[vertex]) {
      this.visited[vertex] = round;
      current.push(vertex);
      let nextvertex: number;
      do {
        nextvertex = adjacencylist[vertex][
          this.generator.uniformInt(0, adjacencylist[vertex].length - 1)
        ][0];
      } while (nextvertex < 0);

      if (this.visited[nextvertex] === round) {
        // Erase the loop
        do {
          vertex = current[current.length - 1];
          this.visited[vertex] = 0;
          current.pop();
        } while (vertex !== nextvertex);
      }

      vertex = nextvertex;
    }
    current.push(vertex);
    for (let i = 0; i + 1 < current.length; i++) {
      this.spanningtree.push([current[i], current[i + 1]]);
    }
  }

  spanningTree(vertices: number, adjacencylist: Graph): [number, number][] {
    this.spanningtree = [];
    this.visited = new Array(vertices).fill(0);

    const nodes: number[] = [];
    for (let i = 0; i < vertices; i++) nodes.push(i);
    this.generator.shuffle(nodes);
    this.visited[nodes[0]] = 1;
    for (let round = 1, i = 1; i < vertices; i++) {
      if (this.visited[nodes[i]]) continue;
      ++round;
      this.lerw(nodes[i], round, adjacencylist);
    }

    return this.spanningtree;
  }
}
