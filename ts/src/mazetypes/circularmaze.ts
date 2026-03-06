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

  private getCellRingAndIndex(vertex: number): [number, number] {
    if (vertex === 0) return [0, 0];
    for (let i = 1; i < this.size; i++) {
      const start = this.ringnodeprefixsum[i];
      const count = this.ringnodecount[i];
      if (vertex >= start && vertex < start + count) {
        return [i, vertex - start];
      }
    }
    throw new Error("Invalid vertex");
  }

  renderSolution(g: any, scale: number): void {
    const strokeColor = '#e94560';
    const strokeWidth = String(Math.max(2, scale / 10));

    for (let u = 0; u < this.vertices; u++) {
      for (const edge of this.solution[u]) {
        const v = edge[0];
        try {
          const [ringU, idxU] = this.getCellRingAndIndex(u);
          const [ringV, idxV] = this.getCellRingAndIndex(v);

          if (ringU === ringV) {
            // Same ring: draw an arc at midRadius
            const count = this.ringnodecount[ringU];
            const midRadius = ringU + 0.5;
            const angleU = (idxU + 0.5) * 2 * M_PI / count - M_PI / 2;
            const angleV = (idxV + 0.5) * 2 * M_PI / count - M_PI / 2;
            const x1 = midRadius * Math.cos(angleU) * scale;
            const y1 = midRadius * Math.sin(angleU) * scale;
            const x2 = midRadius * Math.cos(angleV) * scale;
            const y2 = midRadius * Math.sin(angleV) * scale;
            const r = midRadius * scale;
            // Determine sweep direction: shortest arc
            let sweep = 1;
            let diff = angleV - angleU;
            if (diff < -M_PI) diff += 2 * M_PI;
            if (diff > M_PI) diff -= 2 * M_PI;
            if (diff < 0) sweep = 0;
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2}`);
            p.setAttribute('stroke', strokeColor);
            p.setAttribute('stroke-width', strokeWidth);
            p.setAttribute('stroke-linecap', 'round');
            p.setAttribute('fill', 'none');
            g.appendChild(p);
          } else {
            // Radial connection: route through a waypoint at the shared boundary
            // The boundary between ring i and ring i-1 is at radius i (the larger ring index)
            const outerRing = Math.max(ringU, ringV);
            const outerIdx = ringU > ringV ? idxU : idxV;
            const outerCount = this.ringnodecount[outerRing];
            const innerVertex = ringU < ringV ? u : v;

            // Waypoint: at boundary radius, at the outer cell's mid-angle
            const outerMidAngle = (outerIdx + 0.5) * 2 * M_PI / outerCount - M_PI / 2;
            const boundaryRadius = outerRing;
            const wx = boundaryRadius * Math.cos(outerMidAngle) * scale;
            const wy = boundaryRadius * Math.sin(outerMidAngle) * scale;

            const [x1, y1] = this.getCellCenter(u);
            const [x2, y2] = this.getCellCenter(v);

            // Draw outer cell center -> waypoint
            const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l1.setAttribute('x1', String(x1 * scale));
            l1.setAttribute('y1', String(y1 * scale));
            l1.setAttribute('x2', String(wx));
            l1.setAttribute('y2', String(wy));
            l1.setAttribute('stroke', strokeColor);
            l1.setAttribute('stroke-width', strokeWidth);
            l1.setAttribute('stroke-linecap', 'round');
            g.appendChild(l1);

            // Draw waypoint -> inner cell center
            // If inner cell is ring 0 (center), just go straight
            if (innerVertex === 0) {
              const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              l2.setAttribute('x1', String(wx));
              l2.setAttribute('y1', String(wy));
              l2.setAttribute('x2', String(x2 * scale));
              l2.setAttribute('y2', String(y2 * scale));
              l2.setAttribute('stroke', strokeColor);
              l2.setAttribute('stroke-width', strokeWidth);
              l2.setAttribute('stroke-linecap', 'round');
              g.appendChild(l2);
            } else {
              // Inner cell: arc from waypoint angle to inner cell's mid-angle at boundary radius,
              // then radial line to inner cell center
              const innerRing = Math.min(ringU, ringV);
              const innerIdx = ringU < ringV ? idxU : idxV;
              const innerCount = this.ringnodecount[innerRing];
              const innerMidAngle = (innerIdx + 0.5) * 2 * M_PI / innerCount - M_PI / 2;

              // Check if angles differ enough to need an arc
              const angleDiff = Math.abs(outerMidAngle - innerMidAngle);
              if (angleDiff > 0.001 && angleDiff < 2 * M_PI - 0.001) {
                // Arc along boundary radius from outer angle to inner angle
                const ax1 = boundaryRadius * Math.cos(outerMidAngle) * scale;
                const ay1 = boundaryRadius * Math.sin(outerMidAngle) * scale;
                const ax2 = boundaryRadius * Math.cos(innerMidAngle) * scale;
                const ay2 = boundaryRadius * Math.sin(innerMidAngle) * scale;
                const r = boundaryRadius * scale;
                let sweep = 1;
                let diff = innerMidAngle - outerMidAngle;
                if (diff < -M_PI) diff += 2 * M_PI;
                if (diff > M_PI) diff -= 2 * M_PI;
                if (diff < 0) sweep = 0;
                const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                arc.setAttribute('d', `M ${ax1} ${ay1} A ${r} ${r} 0 0 ${sweep} ${ax2} ${ay2}`);
                arc.setAttribute('stroke', strokeColor);
                arc.setAttribute('stroke-width', strokeWidth);
                arc.setAttribute('stroke-linecap', 'round');
                arc.setAttribute('fill', 'none');
                g.appendChild(arc);

                // Radial line from arc endpoint to inner cell center
                const innerCenter = this.getCellCenter(innerVertex === u ? u : v);
                const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                l2.setAttribute('x1', String(ax2));
                l2.setAttribute('y1', String(ay2));
                l2.setAttribute('x2', String(innerCenter[0] * scale));
                l2.setAttribute('y2', String(innerCenter[1] * scale));
                l2.setAttribute('stroke', strokeColor);
                l2.setAttribute('stroke-width', strokeWidth);
                l2.setAttribute('stroke-linecap', 'round');
                g.appendChild(l2);
              } else {
                // Angles are close enough, straight line is fine
                const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                l2.setAttribute('x1', String(wx));
                l2.setAttribute('y1', String(wy));
                l2.setAttribute('x2', String(x2 * scale));
                l2.setAttribute('y2', String(y2 * scale));
                l2.setAttribute('stroke', strokeColor);
                l2.setAttribute('stroke-width', strokeWidth);
                l2.setAttribute('stroke-linecap', 'round');
                g.appendChild(l2);
              }
            }
          }
        } catch (_) { /* skip */ }
      }
    }
  }

  getCoordinateBounds(): [number, number, number, number] {
    return [-this.size, -this.size, this.size, this.size];
  }
}
