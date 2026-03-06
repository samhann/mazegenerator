import { CellBorder } from "./cellborder";
import { SpanningTreeAlgorithm } from "./spanningtreealgorithm";
import { DepthFirstSearch } from "./algorithms/depthfirstsearch";
import * as fs from "fs";

export type Edge = [number, CellBorder]; // [destination vertex, border]
export type Graph = Edge[][];

/** Match C++ ostream << double (defaultfloat, precision 6 = like %g with 6 sig digits) */
function fmtStream(n: number): string {
  return parseFloat(n.toPrecision(6)).toString();
}

export abstract class Maze {
  protected vertices: number;
  protected adjacencylist: Graph;
  protected solution: Graph;
  protected startvertex: number;
  protected endvertex: number;

  constructor(vertices: number = 0, startvertex: number = 0, endvertex: number = 1) {
    this.vertices = vertices;
    this.startvertex = startvertex;
    this.endvertex = endvertex;
    this.adjacencylist = [];
    this.solution = [];
  }

  initializeGraph(): void {
    this.adjacencylist = [];
    for (let i = 0; i < this.vertices; i++) {
      this.adjacencylist.push([]);
    }
  }

  generateMaze(algorithm: SpanningTreeAlgorithm): void {
    const spanningtree = algorithm.spanningTree(this.vertices, this.adjacencylist);
    this.solve(spanningtree);
    this.removeBorders(spanningtree);
  }

  private solve(edges: [number, number][]): void {
    const spanningtreegraph: Graph = [];
    for (let i = 0; i < this.vertices; i++) {
      spanningtreegraph.push([]);
    }

    for (const [u, v] of edges) {
      const edgeUV = this.adjacencylist[u].find(e => e[0] === v);
      if (edgeUV) spanningtreegraph[u].push(edgeUV);
      const edgeVU = this.adjacencylist[v].find(e => e[0] === u);
      if (edgeVU) spanningtreegraph[v].push(edgeVU);
    }

    const dfs = new DepthFirstSearch();
    const parent = dfs.solveMaze(this.vertices, spanningtreegraph, this.startvertex);
    this.solution = [];
    for (let i = 0; i < this.vertices; i++) {
      this.solution.push([]);
    }
    for (let u = this.endvertex; parent[u] !== u; u = parent[u]) {
      const edge = spanningtreegraph[u].find(e => e[0] === parent[u]);
      if (edge) this.solution[u].push(edge);
    }
  }

  private removeBorders(edges: [number, number][]): void {
    for (const [u, v] of edges) {
      const idxU = this.adjacencylist[u].findIndex(e => e[0] === v);
      if (idxU >= 0) this.adjacencylist[u].splice(idxU, 1);
      const idxV = this.adjacencylist[v].findIndex(e => e[0] === u);
      if (idxV >= 0) this.adjacencylist[v].splice(idxV, 1);
    }
  }

  printMazeSVG(outputprefix: string): void {
    const [xmin, ymin, xmax, ymax] = this.getCoordinateBounds();
    // C++ truncates to int via implicit conversion
    const xresolution = Math.trunc((xmax - xmin + 2) * 30);
    const yresolution = Math.trunc((ymax - ymin + 2) * 30);

    let svg = `<svg width="${xresolution}" height="${yresolution}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `<g transform="translate(${fmtStream((1 - xmin) * 30)},${fmtStream(yresolution - (1 - ymin) * 30)}) scale(1,-1)">\n`;
    svg += `<rect x="${fmtStream((xmin - 1) * 30)}" y="${fmtStream((ymin - 1) * 30)}" width="${xresolution}" height="${yresolution}" fill="white"/>\n`;

    for (let i = 0; i < this.vertices; i++) {
      for (const edge of this.adjacencylist[i]) {
        if (edge[0] < i) {
          svg += edge[1].svgPrintString("black") + "\n";
        }
      }
    }
    svg += `</g>\n`;
    svg += `</svg>\n`;

    fs.writeFileSync(outputprefix + ".svg", svg);
  }

  abstract getCoordinateBounds(): [number, number, number, number];
}
