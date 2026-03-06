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

  getCoordinateBounds(): [number, number, number, number] {
    return [-this.size, -this.size, this.size, this.size];
  }
}
