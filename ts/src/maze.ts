import { CellBorder } from "./cellborder";
import { SpanningTreeAlgorithm } from "./spanningtreealgorithm";
import { DepthFirstSearch } from "./algorithms/depthfirstsearch";
import { MazeTheme, getTheme } from "./themes";
// fs is only used by CLI (printMazeSVG), not by the browser bundle
let fs: any;
try { fs = require("fs"); } catch (_) { /* browser */ }

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
  protected showSolution: boolean = false;

  constructor(vertices: number = 0, startvertex: number = 0, endvertex: number = 1) {
    this.vertices = vertices;
    this.startvertex = startvertex;
    this.endvertex = endvertex;
    this.adjacencylist = [];
    this.solution = [];
  }

  setShowSolution(show: boolean): void {
    this.showSolution = show;
  }

  /** Returns the (x, y) center of a cell in the maze's coordinate system. */
  getCellCenter(_vertex: number): [number, number] {
    throw new Error("getCellCenter not implemented for this maze type");
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

    if (this.showSolution) {
      for (let u = 0; u < this.vertices; u++) {
        for (const edge of this.solution[u]) {
          const v = edge[0];
          const [x1, y1] = this.getCellCenter(u);
          const [x2, y2] = this.getCellCenter(v);
          svg += `<line x1="${fmtStream(x1 * 30)}" y1="${fmtStream(y1 * 30)}" x2="${fmtStream(x2 * 30)}" y2="${fmtStream(y2 * 30)}" stroke="red" stroke-width="2" stroke-linecap="round"/>\n`;
        }
      }
    }

    svg += `</g>\n`;
    svg += `</svg>\n`;

    fs.writeFileSync(outputprefix + ".svg", svg);
  }

  // ===== Browser rendering (used by web bundle) =====

  private _setupSVG(theme?: MazeTheme): { svg: any; g: any; scale: number } {
    const [xmin, ymin, xmax, ymax] = this.getCoordinateBounds();
    const pad = 1;
    const w = xmax - xmin + 2 * pad, h = ymax - ymin + 2 * pad;
    const targetPx = Math.min(800, window.innerWidth - 40, window.innerHeight - 200);
    const scale = Math.min(30, Math.max(4, targetPx / Math.max(w, h)));
    const svgW = Math.round(w * scale), svgH = Math.round(h * scale);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(svgW));
    svg.setAttribute('height', String(svgH));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${(pad - xmin) * scale},${svgH - (pad - ymin) * scale}) scale(1,-1)`);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String((xmin - pad) * scale));
    rect.setAttribute('y', String((ymin - pad) * scale));
    rect.setAttribute('width', String(svgW));
    rect.setAttribute('height', String(svgH));
    rect.setAttribute('fill', theme ? theme.backgroundColor : 'white');
    g.appendChild(rect);
    svg.appendChild(g);
    return { svg, g, scale };
  }

  renderSolution(g: any, scale: number, theme?: MazeTheme): void {
    for (let u = 0; u < this.vertices; u++) {
      for (const edge of this.solution[u]) {
        const v = edge[0];
        try {
          const [x1, y1] = this.getCellCenter(u);
          const [x2, y2] = this.getCellCenter(v);
          const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          l.setAttribute('x1', String(x1 * scale));
          l.setAttribute('y1', String(y1 * scale));
          l.setAttribute('x2', String(x2 * scale));
          l.setAttribute('y2', String(y2 * scale));
          l.setAttribute('stroke', theme ? theme.solutionColor : '#e94560');
          l.setAttribute('stroke-width', String(Math.max(2, scale / 10)));
          l.setAttribute('stroke-linecap', 'round');
          g.appendChild(l);
        } catch (_) { /* getCellCenter not implemented yet */ }
      }
    }
  }

  renderSVG(showSolution: boolean = false, themeName?: string): any {
    const theme = getTheme(themeName || 'classic');
    const { svg, g, scale } = this._setupSVG(theme);
    for (let i = 0; i < this.vertices; i++) {
      for (const edge of this.adjacencylist[i]) {
        if (edge[0] < i) g.appendChild(edge[1].svgEl(theme.wallColor, scale));
      }
    }
    if (showSolution) this.renderSolution(g, scale, theme);
    return svg;
  }

  renderSVGFull(themeName?: string): { svg: any; borderMap: Map<CellBorder, any> } {
    const theme = getTheme(themeName || 'classic');
    const { svg, g, scale } = this._setupSVG(theme);
    const borderMap = new Map<CellBorder, any>();
    const seen = new Set<CellBorder>();
    for (let i = 0; i < this.vertices; i++) {
      for (const edge of this.adjacencylist[i]) {
        const border = edge[1];
        if (seen.has(border)) continue;
        seen.add(border);
        const el = border.svgEl(theme.wallColor, scale);
        el.classList.add('maze-wall');
        g.appendChild(el);
        borderMap.set(border, el);
      }
    }
    return { svg, borderMap };
  }

  abstract getCoordinateBounds(): [number, number, number, number];
}
