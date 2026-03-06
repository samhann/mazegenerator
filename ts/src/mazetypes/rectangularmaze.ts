import { Maze } from "../maze";
import { LineBorder } from "../cellborder";

export class RectangularMaze extends Maze {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    super(width * height, 0, width * height - 1);
    this.width = width;
    this.height = height;
  }

  private vertexIndex(row: number, column: number): number {
    return row * this.width + column;
  }

  initializeGraph(): void {
    super.initializeGraph();

    // Lower and upper boundaries
    for (let i = 0; i < this.width; i++) {
      this.adjacencylist[this.vertexIndex(0, i)].push(
        [-1, new LineBorder(i, 0, i + 1, 0)]
      );
      this.adjacencylist[this.vertexIndex(this.height - 1, i)].push(
        [-1, new LineBorder(i, this.height, i + 1, this.height)]
      );
    }

    // Left and right boundaries, leaving space for entry and exit
    for (let i = 0; i < this.height; i++) {
      if (i !== 0)
        this.adjacencylist[this.vertexIndex(i, 0)].push(
          [-1, new LineBorder(0, i, 0, i + 1)]
        );
      if (i !== this.height - 1)
        this.adjacencylist[this.vertexIndex(i, 0)].push(
          [-1, new LineBorder(this.width, i, this.width, i + 1)]
        );
    }

    // Horizontally adjacent cells
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width - 1; j++) {
        const border = new LineBorder(j + 1, i, j + 1, i + 1);
        this.adjacencylist[this.vertexIndex(i, j)].push([this.vertexIndex(i, j + 1), border]);
        this.adjacencylist[this.vertexIndex(i, j + 1)].push([this.vertexIndex(i, j), border]);
      }
    }

    // Vertically adjacent cells
    for (let i = 0; i < this.height - 1; i++) {
      for (let j = 0; j < this.width; j++) {
        const border = new LineBorder(j, i + 1, j + 1, i + 1);
        this.adjacencylist[this.vertexIndex(i, j)].push([this.vertexIndex(i + 1, j), border]);
        this.adjacencylist[this.vertexIndex(i + 1, j)].push([this.vertexIndex(i, j), border]);
      }
    }
  }

  getCellCenter(vertex: number): [number, number] {
    const row = Math.floor(vertex / this.width);
    const col = vertex % this.width;
    return [col + 0.5, row + 0.5];
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [0, 0, this.width, this.height];
  }
}
