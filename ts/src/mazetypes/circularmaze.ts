import { Maze } from "../maze";
import { ArcBorder, LineBorder } from "../cellborder";

const M_PI = Math.PI;

export class CircularMaze extends Maze {
  protected size: number;
  protected ringnodecount: number[];
  protected ringnodeprefixsum: number[];

  constructor(size: number) {
    super(); // vertices computed below
    this.size = size;
    this.ringnodecount = new Array(size);
    this.ringnodeprefixsum = new Array(size);
    this.ringnodecount[0] = 1;
    this.ringnodeprefixsum[0] = 0;

    for (let i = 1; i < size; i++) {
      this.ringnodecount[i] = this.ringnodecount[i - 1];
      if (2 * M_PI * i / this.ringnodecount[i - 1] > 2) this.ringnodecount[i] *= 2;
      this.ringnodeprefixsum[i] = this.ringnodeprefixsum[i - 1] + this.ringnodecount[i - 1];
    }
    this.vertices = this.ringnodecount[size - 1] + this.ringnodeprefixsum[size - 1];
    this.startvertex = this.ringnodeprefixsum[size - 1];
    this.endvertex = this.startvertex + Math.floor(this.ringnodecount[size - 1] / 2);
  }

  initializeGraph(): void {
    super.initializeGraph();

    for (let i = 1; i < this.size; i++) {
      for (let j = 0; j < this.ringnodecount[i]; j++) {
        const node = this.ringnodeprefixsum[i] + j;

        const nnode1 = this.ringnodeprefixsum[i - 1] +
          Math.floor((this.ringnodecount[i - 1] * j) / this.ringnodecount[i]);
        const arcBorder = new ArcBorder(
          0, 0, i,
          j * 2 * M_PI / this.ringnodecount[i] - M_PI / 2,
          (j + 1) * 2 * M_PI / this.ringnodecount[i] - M_PI / 2
        );
        this.adjacencylist[node].push([nnode1, arcBorder]);
        this.adjacencylist[nnode1].push([node, arcBorder]);

        const nnode2 = this.ringnodeprefixsum[i] + ((j + 1) % this.ringnodecount[i]);
        const theta = (j + 1) * 2 * M_PI / this.ringnodecount[i] - M_PI / 2;
        const lineBorder = new LineBorder(
          i * Math.cos(theta), i * Math.sin(theta),
          (i + 1) * Math.cos(theta), (i + 1) * Math.sin(theta)
        );
        this.adjacencylist[node].push([nnode2, lineBorder]);
        this.adjacencylist[nnode2].push([node, lineBorder]);

        if (i === this.size - 1 && node !== this.startvertex && node !== this.endvertex) {
          const outerArc = new ArcBorder(
            0, 0, this.size,
            j * 2 * M_PI / this.ringnodecount[i] - M_PI / 2,
            (j + 1) * 2 * M_PI / this.ringnodecount[i] - M_PI / 2
          );
          this.adjacencylist[node].push([-1, outerArc]);
        }
      }
    }
  }

  getCellCenter(vertex: number): [number, number] {
    // Ring 0 is the single center cell
    if (vertex === 0) return [0, 0];
    // Find which ring and cell
    for (let i = 1; i < this.size; i++) {
      const start = this.ringnodeprefixsum[i];
      const count = this.ringnodecount[i];
      if (vertex >= start && vertex < start + count) {
        const j = vertex - start;
        const midAngle = (j + 0.5) * 2 * M_PI / count - M_PI / 2;
        const midRadius = i + 0.5;
        return [midRadius * Math.cos(midAngle), midRadius * Math.sin(midAngle)];
      }
    }
    throw new Error("Invalid vertex");
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [-this.size, -this.size, this.size, this.size];
  }
}
