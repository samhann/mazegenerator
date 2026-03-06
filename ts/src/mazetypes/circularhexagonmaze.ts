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

    // Compute angular midpoint from the 3 vertex angles
    const sectorBase = (sector - 2) * M_PI / 3;
    let t1: number, t2: number, t3: number;
    if (ud === 0) {
      t1 = row > 0 ? sectorBase + col * M_PI / 3 / row : sectorBase;
      t2 = sectorBase + col * M_PI / 3 / (row + 1);
      t3 = sectorBase + (col + 1) * M_PI / 3 / (row + 1);
      const midTheta = (t1 + t2 + t3) / 3;
      const midR = row + 2 / 3;
      return [midR * Math.cos(midTheta), midR * Math.sin(midTheta)];
    } else {
      t1 = sectorBase + col * M_PI / 3 / (row + 1);
      t2 = sectorBase + (col + 1) * M_PI / 3 / (row + 1);
      t3 = sectorBase + (col + 1) * M_PI / 3 / (row + 2);
      const midTheta = (t1 + t2 + t3) / 3;
      const midR = row + 4 / 3;
      return [midR * Math.cos(midTheta), midR * Math.sin(midTheta)];
    }
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [-this.size, -this.size, this.size, this.size];
  }
}
