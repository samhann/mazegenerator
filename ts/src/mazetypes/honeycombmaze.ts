import { Maze } from "../maze";
import { LineBorder } from "../cellborder";

const M_PI = Math.PI;

const NEIGH = [[-1, 0], [-1, 1], [0, 1], [1, 0], [1, -1], [0, -1]];

export class HoneyCombMaze extends Maze {
  protected size: number;

  constructor(size: number) {
    super(3 * size * (size - 1) + 1, 0, 3 * size * (size - 1));
    this.size = size;
  }

  protected vertexIndex(u: number, v: number): number {
    if (u <= 0)
      return ((3 * this.size + u) * (this.size + u - 1)) / 2 + v;
    else
      return (3 * this.size * (this.size - 1) + (4 * this.size - u - 1) * u) / 2 + v;
  }

  protected getEdgeCoords(u: number, v: number, edge: number): [number, number, number, number] {
    const dxu = Math.sqrt(3) / 2, dyu = 1.5, dxv = Math.sqrt(3), dyv = 0;
    const cx = dxu * u + dxv * v, cy = dyu * u + dyv * v;
    const theta1 = (edge - 2.5) * M_PI / 3, theta2 = theta1 + M_PI / 3;
    return [cx + Math.cos(theta1), cy + Math.sin(theta1), cx + Math.cos(theta2), cy + Math.sin(theta2)];
  }

  private vExtent(u: number): [number, number] {
    if (u < 0) return [-this.size - u + 1, this.size - 1];
    else return [-this.size + 1, this.size - 1 - u];
  }

  private isValidNode(u: number, v: number): boolean {
    if (u <= -this.size || u >= this.size) return false;
    const [vmin, vmax] = this.vExtent(u);
    return v >= vmin && v <= vmax;
  }

  initializeGraph(): void {
    super.initializeGraph();

    for (let u = -this.size + 1; u < this.size; u++) {
      const [vmin, vmax] = this.vExtent(u);
      for (let v = vmin; v <= vmax; v++) {
        const node = this.vertexIndex(u, v);
        for (let n = 0; n < 6; n++) {
          const uu = u + NEIGH[n][0], vv = v + NEIGH[n][1];
          if (this.isValidNode(uu, vv)) {
            const nnode = this.vertexIndex(uu, vv);
            if (nnode > node) continue;
            const border = new LineBorder(...this.getEdgeCoords(u, v, n));
            this.adjacencylist[node].push([nnode, border]);
            this.adjacencylist[nnode].push([node, border]);
          } else {
            if ((node === this.startvertex && n === 0) ||
                (node === this.endvertex && n === 3)) continue;
            this.adjacencylist[node].push([-1, new LineBorder(...this.getEdgeCoords(u, v, n))]);
          }
        }
      }
    }
  }

  getCellCenter(vertex: number): [number, number] {
    // Invert vertexIndex: iterate over all (u,v) to find the match
    for (let u = -this.size + 1; u < this.size; u++) {
      const [vmin, vmax] = this.vExtent(u);
      for (let v = vmin; v <= vmax; v++) {
        if (this.vertexIndex(u, v) === vertex) {
          const dxu = Math.sqrt(3) / 2, dxv = Math.sqrt(3);
          const dyu = 1.5;
          return [dxu * u + dxv * v, dyu * u];
        }
      }
    }
    throw new Error("Invalid vertex");
  }

  getCoordinateBounds(): [number, number, number, number] {
    const xlim = Math.sqrt(3) * (this.size - 0.5), ylim = 1.5 * this.size - 0.5;
    return [-xlim, -ylim, xlim, ylim];
  }
}
