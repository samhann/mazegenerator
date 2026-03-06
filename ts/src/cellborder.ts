/** Format a number to match C++ std::to_string(double) which uses %f (6 decimal places) */
function fmt(n: number): string {
  // Preserve negative zero like C++ std::to_string
  if (Object.is(n, -0)) return "-0.000000";
  return n.toFixed(6);
}

declare function document_createElementNS(ns: string, tag: string): any;
function svgNode(tag: string): any {
  return (typeof document !== 'undefined') ?
    document.createElementNS('http://www.w3.org/2000/svg', tag) : null;
}

export interface CellBorder {
  svgPrintString(color: string): string;
  gnuplotPrintString(color: string): string;
  svgEl(color: string, scale: number): any;
}

export class LineBorder implements CellBorder {
  constructor(
    public readonly x1: number,
    public readonly y1: number,
    public readonly x2: number,
    public readonly y2: number
  ) {}

  svgPrintString(color: string): string {
    return `<line x1="${fmt(this.x1 * 30)}" x2="${fmt(this.x2 * 30)}" y1="${fmt(this.y1 * 30)}" y2="${fmt(this.y2 * 30)}" stroke="${color}" stroke-linecap="round" stroke-width="3"/>`;
  }

  svgEl(color: string, scale: number): any {
    const l = svgNode('line');
    l.setAttribute('x1', this.x1 * scale); l.setAttribute('y1', this.y1 * scale);
    l.setAttribute('x2', this.x2 * scale); l.setAttribute('y2', this.y2 * scale);
    l.setAttribute('stroke', color); l.setAttribute('stroke-linecap', 'round');
    l.setAttribute('stroke-width', scale < 20 ? 2 : 3);
    return l;
  }

  gnuplotPrintString(color: string): string {
    return `set arrow from ${fmt(this.x1)},${fmt(this.y1)} to ${fmt(this.x2)},${fmt(this.y2)} nohead lc'${color}' lw 2`;
  }
}

export class ArcBorder implements CellBorder {
  constructor(
    public readonly cx: number,
    public readonly cy: number,
    public readonly r: number,
    public readonly theta1: number,
    public readonly theta2: number
  ) {}

  svgPrintString(color: string): string {
    const x1 = this.cx + this.r * Math.cos(this.theta1);
    const y1 = this.cy + this.r * Math.sin(this.theta1);
    const x2 = this.cx + this.r * Math.cos(this.theta2);
    const y2 = this.cy + this.r * Math.sin(this.theta2);
    return `<path d="M ${fmt(x2 * 30)} ${fmt(y2 * 30)} A ${fmt(this.r * 30)} ${fmt(this.r * 30)}, 0, 0, 0, ${fmt(x1 * 30)} ${fmt(y1 * 30)}" stroke="${color}" stroke-linecap="round" stroke-width="3" fill="none"/>`;
  }

  svgEl(color: string, scale: number): any {
    const x1 = this.cx + this.r * Math.cos(this.theta1);
    const y1 = this.cy + this.r * Math.sin(this.theta1);
    const x2 = this.cx + this.r * Math.cos(this.theta2);
    const y2 = this.cy + this.r * Math.sin(this.theta2);
    const p = svgNode('path');
    p.setAttribute('d', `M ${x2*scale} ${y2*scale} A ${this.r*scale} ${this.r*scale} 0 0 0 ${x1*scale} ${y1*scale}`);
    p.setAttribute('stroke', color); p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-width', scale < 20 ? 2 : 3); p.setAttribute('fill', 'none');
    return p;
  }

  gnuplotPrintString(color: string): string {
    return `set parametric; plot [${fmt(this.theta1)}:${fmt(this.theta2)}] ${fmt(this.cx)}+cos(t)*${fmt(this.r)},${fmt(this.cy)}+sin(t)*${fmt(this.r)} w l lc'${color}' lw 2 notitle;unset parametric`;
  }
}
