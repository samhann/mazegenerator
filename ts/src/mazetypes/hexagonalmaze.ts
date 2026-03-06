import { Maze } from "../maze";
import { CellBorder, LineBorder } from "../cellborder";

const M_PI = Math.PI;

export class HexagonalMaze extends Maze {
  protected size: number;

  constructor(size: number) {
    super(6 * size * size);
    this.size = size;
    this.startvertex = this.vertexIndex(0, 1, size - 1, 0);
    this.endvertex = this.vertexIndex(3, 1, size - 1, 0);
  }

  protected vertexIndex(sector: number, updown: number, row: number, column: number): number {
    let vertexindex = sector * this.size * this.size;
    if (updown === 1) vertexindex += (this.size * (this.size + 1)) / 2;
    vertexindex += (row * (row + 1)) / 2 + column;
    return vertexindex;
  }

  protected getEdge(sector: number, row: number, column: number, edge: number): CellBorder {
    const x1 = 0, y1 = 0;
    const x2 = -this.size / 2.0, y2 = Math.sqrt(3) * x2;
    const x3 = -x2, y3 = y2;
    const dx12 = (x2 - x1) / this.size, dy12 = (y2 - y1) / this.size;
    const dx23 = (x3 - x2) / this.size, dy23 = (y3 - y2) / this.size;

    let ex1: number, ey1: number, ex2: number, ey2: number;
    if (edge === 0) {
      ex1 = x1 + dx12 * (row + 1) + dx23 * column;
      ey1 = y1 + dy12 * (row + 1) + dy23 * column;
      ex2 = ex1 + dx23;
      ey2 = ey1 + dy23;
    } else if (edge === 1) {
      ex1 = x1 + dx12 * row + dx23 * column;
      ey1 = y1 + dy12 * row + dy23 * column;
      ex2 = ex1 + dx12 + dx23;
      ey2 = ey1 + dy12 + dy23;
    } else {
      ex1 = x1 + dx12 * row + dx23 * column;
      ey1 = y1 + dy12 * row + dy23 * column;
      ex2 = ex1 + dx12;
      ey2 = ey1 + dy12;
    }

    const theta = sector * M_PI / 3;
    const sintheta = Math.sin(theta), costheta = Math.cos(theta);
    return new LineBorder(
      ex1 * costheta - ey1 * sintheta, ex1 * sintheta + ey1 * costheta,
      ex2 * costheta - ey2 * sintheta, ex2 * sintheta + ey2 * costheta
    );
  }

  initializeGraph(): void {
    super.initializeGraph();

    for (let sector = 0; sector < 6; sector++) {
      // Outer boundary, except entry and exit
      for (let i = 0; i < this.size; i++) {
        if (i > 0 || sector % 3 !== 0) {
          const ptr = this.getEdge(sector, this.size - 1, i, 0);
          this.adjacencylist[this.vertexIndex(sector, 0, this.size - 1, i)].push([-1, ptr]);
        }
      }

      // Border between the 6 major triangles
      for (let i = 0; i < this.size; i++) {
        const ptr = this.getEdge(sector, i, i, 1);
        this.adjacencylist[this.vertexIndex(sector, 0, i, i)].push(
          [this.vertexIndex((sector + 1) % 6, 0, i, 0), ptr]
        );
        this.adjacencylist[this.vertexIndex((sector + 1) % 6, 0, i, 0)].push(
          [this.vertexIndex(sector, 0, i, i), ptr]
        );
      }

      // 0-type edge
      for (let i = 0; i < this.size - 1; i++) {
        for (let j = 0; j <= i; j++) {
          const ptr = this.getEdge(sector, i, j, 0);
          this.adjacencylist[this.vertexIndex(sector, 0, i, j)].push(
            [this.vertexIndex(sector, 1, i, j), ptr]
          );
          this.adjacencylist[this.vertexIndex(sector, 1, i, j)].push(
            [this.vertexIndex(sector, 0, i, j), ptr]
          );
        }
      }

      // 1-type edge
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < i; j++) {
          const ptr = this.getEdge(sector, i, j, 1);
          this.adjacencylist[this.vertexIndex(sector, 0, i, j)].push(
            [this.vertexIndex(sector, 1, i - 1, j), ptr]
          );
          this.adjacencylist[this.vertexIndex(sector, 1, i - 1, j)].push(
            [this.vertexIndex(sector, 0, i, j), ptr]
          );
        }
      }

      // 2-type edge
      for (let i = 0; i < this.size; i++) {
        for (let j = 1; j <= i; j++) {
          const ptr = this.getEdge(sector, i, j, 2);
          this.adjacencylist[this.vertexIndex(sector, 0, i, j)].push(
            [this.vertexIndex(sector, 1, i - 1, j - 1), ptr]
          );
          this.adjacencylist[this.vertexIndex(sector, 1, i - 1, j - 1)].push(
            [this.vertexIndex(sector, 0, i, j), ptr]
          );
        }
      }
    }
  }

  getCellCenter(vertex: number): [number, number] {
    const sz = this.size;
    const sector = Math.floor(vertex / (sz * sz));
    let rem = vertex - sector * sz * sz;
    const halfCount = (sz * (sz + 1)) / 2;
    let ud: number, row: number, col: number;
    if (rem < halfCount) {
      ud = 0;
      row = 0;
      while ((row + 1) * (row + 2) / 2 <= rem) row++;
      col = rem - (row * (row + 1)) / 2;
    } else {
      ud = 1;
      rem -= halfCount;
      row = 0;
      while ((row + 1) * (row + 2) / 2 <= rem) row++;
      col = rem - (row * (row + 1)) / 2;
    }

    const dx12 = -0.5 / sz, dy12 = -Math.sqrt(3) / 2 / sz;
    const dx23 = 1.0 / sz;
    let lx: number, ly: number;
    if (ud === 0) {
      lx = dx12 * (row + 2 / 3) + dx23 * (col + 1 / 3);
      ly = dy12 * (row + 2 / 3);
    } else {
      lx = dx12 * (row + 4 / 3) + dx23 * (col + 2 / 3);
      ly = dy12 * (row + 4 / 3);
    }

    const theta = sector * M_PI / 3;
    const cos = Math.cos(theta), sin = Math.sin(theta);
    return [lx * cos - ly * sin, lx * sin + ly * cos];
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [-this.size, -Math.sqrt(3) / 2 * this.size, this.size, Math.sqrt(3) / 2 * this.size];
  }
}
