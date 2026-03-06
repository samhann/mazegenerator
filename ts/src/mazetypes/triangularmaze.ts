import { Maze } from "../maze";
import { LineBorder } from "../cellborder";

export class TriangularMaze extends Maze {
  private rows: number;

  constructor(rows: number) {
    super();
    this.rows = rows;
    this.vertices = rows * (rows + 1) / 2;
    this.startvertex = 0;
    this.endvertex = this.vertices - 1;
  }

  private cellsInRow(row: number): number {
    return this.rows - row;
  }

  private cellsBeforeRow(row: number): number {
    let total = 0;
    for (let r = 0; r < row; r++) {
      total += this.cellsInRow(r);
    }
    return total;
  }

  private vertexIndex(row: number, col: number): number {
    return this.cellsBeforeRow(row) + col;
  }

  initializeGraph(): void {
    super.initializeGraph();

    // Top boundary
    for (let i = 0; i < this.cellsInRow(0); i++) {
      this.adjacencylist[this.vertexIndex(0, i)].push(
        [-1, new LineBorder(i, 0, i + 1, 0)]
      );
    }

    // Bottom boundary
    this.adjacencylist[this.vertexIndex(this.rows - 1, 0)].push(
      [-1, new LineBorder(0, this.rows, 1, this.rows)]
    );

    // Left and right boundaries
    for (let row = 0; row < this.rows; row++) {
      const cellsInRow = this.cellsInRow(row);

      if (row !== 0) {
        this.adjacencylist[this.vertexIndex(row, 0)].push(
          [-1, new LineBorder(0, row, 0, row + 1)]
        );
      }

      if (!(row === this.rows - 1 && cellsInRow === 1)) {
        this.adjacencylist[this.vertexIndex(row, cellsInRow - 1)].push(
          [-1, new LineBorder(cellsInRow, row, cellsInRow, row + 1)]
        );
      }
    }

    // Diagonal boundary walls on the right edge
    for (let row = 0; row < this.rows - 1; row++) {
      const cellsInRow = this.cellsInRow(row);
      const cellsInNextRow = this.cellsInRow(row + 1);

      if (!(row === this.rows - 2 && cellsInNextRow === 1)) {
        this.adjacencylist[this.vertexIndex(row, cellsInRow - 1)].push(
          [-1, new LineBorder(cellsInRow, row + 1, cellsInNextRow, row + 1)]
        );
      }
    }

    // Horizontal connections within each row
    for (let row = 0; row < this.rows; row++) {
      const cellsInRow = this.cellsInRow(row);
      for (let col = 0; col < cellsInRow - 1; col++) {
        const border = new LineBorder(col + 1, row, col + 1, row + 1);
        this.adjacencylist[this.vertexIndex(row, col)].push([this.vertexIndex(row, col + 1), border]);
        this.adjacencylist[this.vertexIndex(row, col + 1)].push([this.vertexIndex(row, col), border]);
      }
    }

    // Vertical connections between rows
    for (let row = 0; row < this.rows - 1; row++) {
      const cellsInNextRow = this.cellsInRow(row + 1);
      for (let col = 0; col < cellsInNextRow; col++) {
        const border = new LineBorder(col, row + 1, col + 1, row + 1);
        this.adjacencylist[this.vertexIndex(row, col)].push([this.vertexIndex(row + 1, col), border]);
        this.adjacencylist[this.vertexIndex(row + 1, col)].push([this.vertexIndex(row, col), border]);
      }
    }
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [0, 0, this.rows, this.rows];
  }
}
