import { HexagonalMaze } from "./hexagonalmaze";
import { CellBorder, LineBorder, ArcBorder } from "../cellborder";

const M_PI = Math.PI;

export class CircularHexagonMaze extends HexagonalMaze {
  constructor(size: number) {
    super(size);
  }

  protected getEdge(sector: number, row: number, column: number, edge: number): CellBorder {
    if (edge === 0) {
      return new ArcBorder(
        0, 0, row + 1,
        (sector - 2) * M_PI / 3 + column * M_PI / 3 / (row + 1),
        (sector - 2) * M_PI / 3 + (column + 1) * M_PI / 3 / (row + 1)
      );
    }

    let ex1: number, ey1: number, ex2: number, ey2: number;
    if (edge === 1) {
      let theta1 = (sector - 2) * M_PI / 3;
      let theta2 = (sector - 2) * M_PI / 3;
      if (row > 0) theta1 += column * M_PI / 3 / row;
      theta2 += (column + 1) * M_PI / 3 / (row + 1);
      ex1 = row * Math.cos(theta1);
      ey1 = row * Math.sin(theta1);
      ex2 = (row + 1) * Math.cos(theta2);
      ey2 = (row + 1) * Math.sin(theta2);
    } else {
      let theta1 = (sector - 2) * M_PI / 3;
      let theta2 = (sector - 2) * M_PI / 3;
      if (row > 0) theta1 += column * M_PI / 3 / row;
      theta2 += column * M_PI / 3 / (row + 1);
      ex1 = row * Math.cos(theta1);
      ey1 = row * Math.sin(theta1);
      ex2 = (row + 1) * Math.cos(theta2);
      ey2 = (row + 1) * Math.sin(theta2);
    }
    return new LineBorder(ex1, ey1, ex2, ey2);
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

    // Compute Cartesian centroid from the 3 vertex positions
    const sectorBase = (sector - 2) * M_PI / 3;
    let r1: number, a1: number, r2: number, a2: number, r3: number, a3: number;
    if (ud === 0) {
      r1 = row;
      a1 = row > 0 ? sectorBase + col * M_PI / 3 / row : sectorBase;
      r2 = row + 1;
      a2 = sectorBase + col * M_PI / 3 / (row + 1);
      r3 = row + 1;
      a3 = sectorBase + (col + 1) * M_PI / 3 / (row + 1);
    } else {
      r1 = row + 1;
      a1 = sectorBase + col * M_PI / 3 / (row + 1);
      r2 = row + 1;
      a2 = sectorBase + (col + 1) * M_PI / 3 / (row + 1);
      r3 = row + 2;
      a3 = sectorBase + (col + 1) * M_PI / 3 / (row + 2);
    }
    return [
      (r1 * Math.cos(a1) + r2 * Math.cos(a2) + r3 * Math.cos(a3)) / 3,
      (r1 * Math.sin(a1) + r2 * Math.sin(a2) + r3 * Math.sin(a3)) / 3
    ];
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [-this.size, -this.size, this.size, this.size];
  }
}
