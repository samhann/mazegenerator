import { SpanningTreeAlgorithm } from "../spanningtreealgorithm";
import { Graph } from "../maze";

export class Prim extends SpanningTreeAlgorithm {
  spanningTree(vertices: number, adjacencylist: Graph): [number, number][] {
    this.spanningtree = [];
    this.primAlgorithm(vertices, adjacencylist);
    return this.spanningtree;
  }

  private primAlgorithm(vertices: number, adjacencylist: Graph): void {
    const visited = new Array(vertices).fill(false);
    const boundary: [number, number][] = [];
    let vertex = this.generator.uniformInt(0, vertices - 1);

    for (let i = 1; i < vertices; i++) {
      visited[vertex] = true;
      for (const p of adjacencylist[vertex]) {
        if (p[0] !== -1 && !visited[p[0]]) {
          boundary.push([vertex, p[0]]);
        }
      }

      let nextedge: [number, number] = [-1, -1];
      do {
        const index = this.generator.uniformInt(0, boundary.length - 1);
        // swap boundary[index] with boundary[boundary.length - 1]
        const tmp = boundary[index];
        boundary[index] = boundary[boundary.length - 1];
        boundary[boundary.length - 1] = tmp;

        if (!visited[boundary[boundary.length - 1][1]]) {
          nextedge = boundary[boundary.length - 1];
        }
        boundary.pop();
      } while (nextedge[0] === -1);

      this.spanningtree.push(nextedge);
      vertex = nextedge[1];
    }
  }
}
