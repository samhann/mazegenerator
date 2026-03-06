"use strict";
var MazeGen = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/web.ts
  var web_exports = {};
  __export(web_exports, {
    BreadthFirstSearch: () => BreadthFirstSearch,
    CircularHexagonMaze: () => CircularHexagonMaze,
    CircularMaze: () => CircularMaze,
    DepthFirstSearch: () => DepthFirstSearch,
    HexagonalMaze: () => HexagonalMaze,
    HoneyCombMaze: () => HoneyCombMaze,
    Kruskal: () => Kruskal,
    LoopErasedRandomWalk: () => LoopErasedRandomWalk,
    Maze: () => Maze,
    Prim: () => Prim,
    RectangularMaze: () => RectangularMaze,
    SpanningTreeAlgorithm: () => SpanningTreeAlgorithm,
    TriangularMaze: () => TriangularMaze
  });

  // src/mt19937.ts
  var MT19937 = class _MT19937 {
    static {
      this.N = 624;
    }
    static {
      this.M = 397;
    }
    static {
      this.MATRIX_A = 2567483615;
    }
    static {
      this.UPPER_MASK = 2147483648;
    }
    static {
      this.LOWER_MASK = 2147483647;
    }
    constructor(seed) {
      this.mt = new Uint32Array(_MT19937.N);
      this.index = _MT19937.N + 1;
      this.seed(seed >>> 0);
    }
    seed(s) {
      this.mt[0] = s >>> 0;
      for (let i = 1; i < _MT19937.N; i++) {
        const prev = this.mt[i - 1];
        const xor = prev ^ prev >>> 30;
        this.mt[i] = Math.imul(1812433253, xor) + i >>> 0;
      }
      this.index = _MT19937.N;
    }
    generateNumbers() {
      const { N, M, MATRIX_A, UPPER_MASK, LOWER_MASK } = _MT19937;
      const mag01 = [0, MATRIX_A];
      for (let i = 0; i < N; i++) {
        const y = this.mt[i] & UPPER_MASK | this.mt[(i + 1) % N] & LOWER_MASK;
        this.mt[i] = this.mt[(i + M) % N] ^ y >>> 1 ^ mag01[y & 1];
      }
      this.index = 0;
    }
    /** Generate a random 32-bit unsigned integer (matches std::mt19937 output) */
    next() {
      if (this.index >= _MT19937.N) {
        this.generateNumbers();
      }
      let y = this.mt[this.index++];
      y ^= y >>> 11;
      y ^= y << 7 & 2636928640;
      y ^= y << 15 & 4022730752;
      y ^= y >>> 18;
      return y >>> 0;
    }
    /**
     * Generate a uniform random integer in [min, max] (inclusive).
     * Matches libstdc++ std::uniform_int_distribution using downscaling.
     *
     * libstdc++ algorithm:
     *   scaling = urngrange / (range + 1)
     *   past = (range + 1) * scaling
     *   reject values >= past, then divide by scaling
     */
    uniformInt(min, max) {
      const urange = max - min >>> 0;
      if (urange === 0) return min;
      const urngrange = 4294967295;
      const uerange = urange + 1 >>> 0;
      const scaling = Number(BigInt(urngrange) / BigInt(uerange));
      const past = Math.imul(uerange, scaling) >>> 0;
      let ret;
      do {
        ret = this.next();
      } while (ret >= past);
      ret = Math.trunc(ret / scaling);
      return ret + min;
    }
    /**
     * Shuffle matching libstdc++ std::shuffle exactly.
     *
     * libstdc++ has a two-for-one optimization when urngrange >= urange^2:
     * - If n is even (odd number of swaps), do the first swap separately
     * - Then process remaining swaps in pairs using __gen_two_uniform_ints
     *
     * __gen_two_uniform_ints(b0, b1, g):
     *   x = uniform_int(0, b0*b1 - 1)
     *   return (x / b1, x % b1)
     */
    shuffle(arr) {
      const n = arr.length;
      if (n <= 1) return;
      const urngrange = 4294967295;
      const urange = n;
      if (Math.trunc(urngrange / urange) >= urange) {
        let i = 1;
        if (urange % 2 === 0) {
          const j = this.uniformInt(0, 1);
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
          i++;
        }
        while (i < n) {
          const swapRange = i + 1;
          const x = this.uniformInt(0, swapRange * (swapRange + 1) - 1);
          const j1 = Math.trunc(x / (swapRange + 1));
          const j2 = x % (swapRange + 1);
          let tmp = arr[i];
          arr[i] = arr[j1];
          arr[j1] = tmp;
          i++;
          tmp = arr[i];
          arr[i] = arr[j2];
          arr[j2] = tmp;
          i++;
        }
      } else {
        for (let i = 1; i < n; i++) {
          const j = this.uniformInt(0, i);
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }
      }
    }
  };

  // src/spanningtreealgorithm.ts
  var SpanningTreeAlgorithm = class {
    constructor(seed) {
      this.spanningtree = [];
      if (seed !== void 0) {
        this.generator = new MT19937(seed);
      } else {
        this.generator = new MT19937(Math.random() * 4294967295 >>> 0);
      }
    }
  };

  // src/algorithms/depthfirstsearch.ts
  var DepthFirstSearch = class extends SpanningTreeAlgorithm {
    constructor() {
      super(...arguments);
      this.parent = [];
    }
    dfs(vertex, adjacencylist) {
      const nodeorder = [];
      for (let i = 0; i < adjacencylist[vertex].length; i++) nodeorder.push(i);
      this.generator.shuffle(nodeorder);
      for (const index of nodeorder) {
        const nextvertex = adjacencylist[vertex][index][0];
        if (nextvertex < 0 || this.parent[nextvertex] >= 0) continue;
        this.spanningtree.push([vertex, nextvertex]);
        this.parent[nextvertex] = vertex;
        this.dfs(nextvertex, adjacencylist);
      }
    }
    spanningTree(vertices, adjacencylist) {
      this.spanningtree = [];
      this.parent = new Array(vertices).fill(-1);
      const startVertex = this.generator.uniformInt(0, vertices - 1);
      this.dfs(startVertex, adjacencylist);
      return this.spanningtree;
    }
    solveMaze(vertices, adjacencylist, startvertex) {
      this.spanningtree = [];
      this.parent = new Array(vertices).fill(-1);
      this.parent[startvertex] = startvertex;
      this.dfs(startvertex, adjacencylist);
      return this.parent;
    }
  };

  // src/maze.ts
  var fs;
  try {
    fs = __require("fs");
  } catch (_) {
  }
  function fmtStream(n) {
    return parseFloat(n.toPrecision(6)).toString();
  }
  var Maze = class {
    constructor(vertices = 0, startvertex = 0, endvertex = 1) {
      this.showSolution = false;
      this.vertices = vertices;
      this.startvertex = startvertex;
      this.endvertex = endvertex;
      this.adjacencylist = [];
      this.solution = [];
    }
    setShowSolution(show) {
      this.showSolution = show;
    }
    /** Returns the (x, y) center of a cell in the maze's coordinate system. */
    getCellCenter(_vertex) {
      throw new Error("getCellCenter not implemented for this maze type");
    }
    initializeGraph() {
      this.adjacencylist = [];
      for (let i = 0; i < this.vertices; i++) {
        this.adjacencylist.push([]);
      }
    }
    generateMaze(algorithm) {
      const spanningtree = algorithm.spanningTree(this.vertices, this.adjacencylist);
      this.solve(spanningtree);
      this.removeBorders(spanningtree);
    }
    solve(edges) {
      const spanningtreegraph = [];
      for (let i = 0; i < this.vertices; i++) {
        spanningtreegraph.push([]);
      }
      for (const [u, v] of edges) {
        const edgeUV = this.adjacencylist[u].find((e) => e[0] === v);
        if (edgeUV) spanningtreegraph[u].push(edgeUV);
        const edgeVU = this.adjacencylist[v].find((e) => e[0] === u);
        if (edgeVU) spanningtreegraph[v].push(edgeVU);
      }
      const dfs = new DepthFirstSearch();
      const parent = dfs.solveMaze(this.vertices, spanningtreegraph, this.startvertex);
      this.solution = [];
      for (let i = 0; i < this.vertices; i++) {
        this.solution.push([]);
      }
      for (let u = this.endvertex; parent[u] !== u; u = parent[u]) {
        const edge = spanningtreegraph[u].find((e) => e[0] === parent[u]);
        if (edge) this.solution[u].push(edge);
      }
    }
    removeBorders(edges) {
      for (const [u, v] of edges) {
        const idxU = this.adjacencylist[u].findIndex((e) => e[0] === v);
        if (idxU >= 0) this.adjacencylist[u].splice(idxU, 1);
        const idxV = this.adjacencylist[v].findIndex((e) => e[0] === u);
        if (idxV >= 0) this.adjacencylist[v].splice(idxV, 1);
      }
    }
    printMazeSVG(outputprefix) {
      const [xmin, ymin, xmax, ymax] = this.getCoordinateBounds();
      const xresolution = Math.trunc((xmax - xmin + 2) * 30);
      const yresolution = Math.trunc((ymax - ymin + 2) * 30);
      let svg = `<svg width="${xresolution}" height="${yresolution}" xmlns="http://www.w3.org/2000/svg">
`;
      svg += `<g transform="translate(${fmtStream((1 - xmin) * 30)},${fmtStream(yresolution - (1 - ymin) * 30)}) scale(1,-1)">
`;
      svg += `<rect x="${fmtStream((xmin - 1) * 30)}" y="${fmtStream((ymin - 1) * 30)}" width="${xresolution}" height="${yresolution}" fill="white"/>
`;
      for (let i = 0; i < this.vertices; i++) {
        for (const edge of this.adjacencylist[i]) {
          if (edge[0] < i) {
            svg += edge[1].svgPrintString("black") + "\n";
          }
        }
      }
      if (this.showSolution) {
        for (let u = 0; u < this.vertices; u++) {
          for (const edge of this.solution[u]) {
            const v = edge[0];
            const [x1, y1] = this.getCellCenter(u);
            const [x2, y2] = this.getCellCenter(v);
            svg += `<line x1="${fmtStream(x1 * 30)}" y1="${fmtStream(y1 * 30)}" x2="${fmtStream(x2 * 30)}" y2="${fmtStream(y2 * 30)}" stroke="red" stroke-width="2" stroke-linecap="round"/>
`;
          }
        }
      }
      svg += `</g>
`;
      svg += `</svg>
`;
      fs.writeFileSync(outputprefix + ".svg", svg);
    }
    // ===== Browser rendering (used by web bundle) =====
    _setupSVG() {
      const [xmin, ymin, xmax, ymax] = this.getCoordinateBounds();
      const pad = 1;
      const w = xmax - xmin + 2 * pad, h = ymax - ymin + 2 * pad;
      const targetPx = Math.min(800, window.innerWidth - 40, window.innerHeight - 200);
      const scale = Math.min(30, Math.max(4, targetPx / Math.max(w, h)));
      const svgW = Math.round(w * scale), svgH = Math.round(h * scale);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(svgW));
      svg.setAttribute("height", String(svgH));
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${(pad - xmin) * scale},${svgH - (pad - ymin) * scale}) scale(1,-1)`);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String((xmin - pad) * scale));
      rect.setAttribute("y", String((ymin - pad) * scale));
      rect.setAttribute("width", String(svgW));
      rect.setAttribute("height", String(svgH));
      rect.setAttribute("fill", "white");
      g.appendChild(rect);
      svg.appendChild(g);
      return { svg, g, scale };
    }
    renderSolution(g, scale) {
      for (let u = 0; u < this.vertices; u++) {
        for (const edge of this.solution[u]) {
          const v = edge[0];
          try {
            const [x1, y1] = this.getCellCenter(u);
            const [x2, y2] = this.getCellCenter(v);
            const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l.setAttribute("x1", String(x1 * scale));
            l.setAttribute("y1", String(y1 * scale));
            l.setAttribute("x2", String(x2 * scale));
            l.setAttribute("y2", String(y2 * scale));
            l.setAttribute("stroke", "#e94560");
            l.setAttribute("stroke-width", String(Math.max(2, scale / 10)));
            l.setAttribute("stroke-linecap", "round");
            g.appendChild(l);
          } catch (_) {
          }
        }
      }
    }
    renderSVG(showSolution = false) {
      const { svg, g, scale } = this._setupSVG();
      for (let i = 0; i < this.vertices; i++) {
        for (const edge of this.adjacencylist[i]) {
          if (edge[0] < i) g.appendChild(edge[1].svgEl("#1a1a2e", scale));
        }
      }
      if (showSolution) this.renderSolution(g, scale);
      return svg;
    }
    renderSVGFull() {
      const { svg, g, scale } = this._setupSVG();
      const borderMap = /* @__PURE__ */ new Map();
      const seen = /* @__PURE__ */ new Set();
      for (let i = 0; i < this.vertices; i++) {
        for (const edge of this.adjacencylist[i]) {
          const border = edge[1];
          if (seen.has(border)) continue;
          seen.add(border);
          const el = border.svgEl("#1a1a2e", scale);
          el.classList.add("maze-wall");
          g.appendChild(el);
          borderMap.set(border, el);
        }
      }
      return { svg, borderMap };
    }
  };

  // src/algorithms/kruskal.ts
  var Kruskal = class extends SpanningTreeAlgorithm {
    constructor() {
      super(...arguments);
      this.parent = [];
    }
    getParent(u) {
      return this.parent[u] === u ? u : this.parent[u] = this.getParent(this.parent[u]);
    }
    spanningTree(vertices, adjacencylist) {
      const edges = [];
      for (let i = 0; i < vertices; i++) {
        for (const edge of adjacencylist[i]) {
          if (edge[0] > i) edges.push([i, edge[0]]);
        }
      }
      this.generator.shuffle(edges);
      this.parent = [];
      for (let i = 0; i < vertices; i++) this.parent.push(i);
      this.spanningtree = [];
      for (const edge of edges) {
        const u = this.getParent(edge[0]);
        const v = this.getParent(edge[1]);
        if (u === v) continue;
        this.parent[u] = v;
        this.spanningtree.push(edge);
      }
      return this.spanningtree;
    }
  };

  // src/algorithms/breadthfirstsearch.ts
  var BreadthFirstSearch = class extends SpanningTreeAlgorithm {
    spanningTree(vertices, adjacencylist) {
      const visited = new Array(vertices).fill(false);
      const startvertex = this.generator.uniformInt(0, vertices - 1);
      let currentlevel = [startvertex];
      visited[startvertex] = true;
      this.spanningtree = [];
      while (currentlevel.length > 0) {
        const nextlevel = [];
        for (const vertex of currentlevel) {
          for (const edge of adjacencylist[vertex]) {
            const nextvertex = edge[0];
            if (nextvertex < 0 || visited[nextvertex]) continue;
            visited[nextvertex] = true;
            this.spanningtree.push([vertex, nextvertex]);
            nextlevel.push(nextvertex);
          }
        }
        currentlevel = nextlevel;
        this.generator.shuffle(currentlevel);
      }
      return this.spanningtree;
    }
  };

  // src/algorithms/looperasedrandomwalk.ts
  var LoopErasedRandomWalk = class extends SpanningTreeAlgorithm {
    constructor() {
      super(...arguments);
      this.visited = [];
    }
    lerw(vertex, round, adjacencylist) {
      const current = [];
      while (!this.visited[vertex]) {
        this.visited[vertex] = round;
        current.push(vertex);
        let nextvertex;
        do {
          nextvertex = adjacencylist[vertex][this.generator.uniformInt(0, adjacencylist[vertex].length - 1)][0];
        } while (nextvertex < 0);
        if (this.visited[nextvertex] === round) {
          do {
            vertex = current[current.length - 1];
            this.visited[vertex] = 0;
            current.pop();
          } while (vertex !== nextvertex);
        }
        vertex = nextvertex;
      }
      current.push(vertex);
      for (let i = 0; i + 1 < current.length; i++) {
        this.spanningtree.push([current[i], current[i + 1]]);
      }
    }
    spanningTree(vertices, adjacencylist) {
      this.spanningtree = [];
      this.visited = new Array(vertices).fill(0);
      const nodes = [];
      for (let i = 0; i < vertices; i++) nodes.push(i);
      this.generator.shuffle(nodes);
      this.visited[nodes[0]] = 1;
      for (let round = 1, i = 1; i < vertices; i++) {
        if (this.visited[nodes[i]]) continue;
        ++round;
        this.lerw(nodes[i], round, adjacencylist);
      }
      return this.spanningtree;
    }
  };

  // src/algorithms/prim.ts
  var Prim = class extends SpanningTreeAlgorithm {
    spanningTree(vertices, adjacencylist) {
      this.spanningtree = [];
      this.primAlgorithm(vertices, adjacencylist);
      return this.spanningtree;
    }
    primAlgorithm(vertices, adjacencylist) {
      const visited = new Array(vertices).fill(false);
      const boundary = [];
      let vertex = this.generator.uniformInt(0, vertices - 1);
      for (let i = 1; i < vertices; i++) {
        visited[vertex] = true;
        for (const p of adjacencylist[vertex]) {
          if (p[0] !== -1 && !visited[p[0]]) {
            boundary.push([vertex, p[0]]);
          }
        }
        let nextedge = [-1, -1];
        do {
          const index = this.generator.uniformInt(0, boundary.length - 1);
          const tmp = boundary[index];
          boundary[index] = boundary[boundary.length - 1];
          boundary[boundary.length - 1] = tmp;
          if (!visited[boundary[boundary.length - 1][1]]) {
            nextedge = boundary[boundary.length - 1];
          }
          boundary.pop();
        } while (nextedge[0] === -1);
        this.spanningtree.push(nextedge);
        vertex = nextedge[1];
      }
    }
  };

  // src/cellborder.ts
  function fmt(n) {
    if (Object.is(n, -0)) return "-0.000000";
    return n.toFixed(6);
  }
  function svgNode(tag) {
    return typeof document !== "undefined" ? document.createElementNS("http://www.w3.org/2000/svg", tag) : null;
  }
  var LineBorder = class {
    constructor(x1, y1, x2, y2) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    }
    svgPrintString(color) {
      return `<line x1="${fmt(this.x1 * 30)}" x2="${fmt(this.x2 * 30)}" y1="${fmt(this.y1 * 30)}" y2="${fmt(this.y2 * 30)}" stroke="${color}" stroke-linecap="round" stroke-width="3"/>`;
    }
    svgEl(color, scale) {
      const l = svgNode("line");
      l.setAttribute("x1", this.x1 * scale);
      l.setAttribute("y1", this.y1 * scale);
      l.setAttribute("x2", this.x2 * scale);
      l.setAttribute("y2", this.y2 * scale);
      l.setAttribute("stroke", color);
      l.setAttribute("stroke-linecap", "round");
      l.setAttribute("stroke-width", scale < 20 ? 2 : 3);
      return l;
    }
    gnuplotPrintString(color) {
      return `set arrow from ${fmt(this.x1)},${fmt(this.y1)} to ${fmt(this.x2)},${fmt(this.y2)} nohead lc'${color}' lw 2`;
    }
  };
  var ArcBorder = class {
    constructor(cx, cy, r, theta1, theta2) {
      this.cx = cx;
      this.cy = cy;
      this.r = r;
      this.theta1 = theta1;
      this.theta2 = theta2;
    }
    svgPrintString(color) {
      const x1 = this.cx + this.r * Math.cos(this.theta1);
      const y1 = this.cy + this.r * Math.sin(this.theta1);
      const x2 = this.cx + this.r * Math.cos(this.theta2);
      const y2 = this.cy + this.r * Math.sin(this.theta2);
      return `<path d="M ${fmt(x2 * 30)} ${fmt(y2 * 30)} A ${fmt(this.r * 30)} ${fmt(this.r * 30)}, 0, 0, 0, ${fmt(x1 * 30)} ${fmt(y1 * 30)}" stroke="${color}" stroke-linecap="round" stroke-width="3" fill="none"/>`;
    }
    svgEl(color, scale) {
      const x1 = this.cx + this.r * Math.cos(this.theta1);
      const y1 = this.cy + this.r * Math.sin(this.theta1);
      const x2 = this.cx + this.r * Math.cos(this.theta2);
      const y2 = this.cy + this.r * Math.sin(this.theta2);
      const p = svgNode("path");
      p.setAttribute("d", `M ${x2 * scale} ${y2 * scale} A ${this.r * scale} ${this.r * scale} 0 0 0 ${x1 * scale} ${y1 * scale}`);
      p.setAttribute("stroke", color);
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-width", scale < 20 ? 2 : 3);
      p.setAttribute("fill", "none");
      return p;
    }
    gnuplotPrintString(color) {
      return `set parametric; plot [${fmt(this.theta1)}:${fmt(this.theta2)}] ${fmt(this.cx)}+cos(t)*${fmt(this.r)},${fmt(this.cy)}+sin(t)*${fmt(this.r)} w l lc'${color}' lw 2 notitle;unset parametric`;
    }
  };

  // src/mazetypes/rectangularmaze.ts
  var RectangularMaze = class extends Maze {
    constructor(width, height) {
      super(width * height, 0, width * height - 1);
      this.width = width;
      this.height = height;
    }
    vertexIndex(row, column) {
      return row * this.width + column;
    }
    initializeGraph() {
      super.initializeGraph();
      for (let i = 0; i < this.width; i++) {
        this.adjacencylist[this.vertexIndex(0, i)].push(
          [-1, new LineBorder(i, 0, i + 1, 0)]
        );
        this.adjacencylist[this.vertexIndex(this.height - 1, i)].push(
          [-1, new LineBorder(i, this.height, i + 1, this.height)]
        );
      }
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
      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width - 1; j++) {
          const border = new LineBorder(j + 1, i, j + 1, i + 1);
          this.adjacencylist[this.vertexIndex(i, j)].push([this.vertexIndex(i, j + 1), border]);
          this.adjacencylist[this.vertexIndex(i, j + 1)].push([this.vertexIndex(i, j), border]);
        }
      }
      for (let i = 0; i < this.height - 1; i++) {
        for (let j = 0; j < this.width; j++) {
          const border = new LineBorder(j, i + 1, j + 1, i + 1);
          this.adjacencylist[this.vertexIndex(i, j)].push([this.vertexIndex(i + 1, j), border]);
          this.adjacencylist[this.vertexIndex(i + 1, j)].push([this.vertexIndex(i, j), border]);
        }
      }
    }
    getCellCenter(vertex) {
      const row = Math.floor(vertex / this.width);
      const col = vertex % this.width;
      return [col + 0.5, row + 0.5];
    }
    getCoordinateBounds() {
      return [0, 0, this.width, this.height];
    }
  };

  // src/mazetypes/hexagonalmaze.ts
  var M_PI = Math.PI;
  var HexagonalMaze = class extends Maze {
    constructor(size) {
      super(6 * size * size);
      this.size = size;
      this.startvertex = this.vertexIndex(0, 0, size - 1, 0);
      this.endvertex = this.vertexIndex(3, 0, size - 1, 0);
    }
    vertexIndex(sector, updown, row, column) {
      let vertexindex = sector * this.size * this.size;
      if (updown === 1) vertexindex += this.size * (this.size + 1) / 2;
      vertexindex += row * (row + 1) / 2 + column;
      return vertexindex;
    }
    getEdge(sector, row, column, edge) {
      const x1 = 0, y1 = 0;
      const x2 = -this.size / 2, y2 = Math.sqrt(3) * x2;
      const x3 = -x2, y3 = y2;
      const dx12 = (x2 - x1) / this.size, dy12 = (y2 - y1) / this.size;
      const dx23 = (x3 - x2) / this.size, dy23 = (y3 - y2) / this.size;
      let ex1, ey1, ex2, ey2;
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
        ex1 * costheta - ey1 * sintheta,
        ex1 * sintheta + ey1 * costheta,
        ex2 * costheta - ey2 * sintheta,
        ex2 * sintheta + ey2 * costheta
      );
    }
    initializeGraph() {
      super.initializeGraph();
      for (let sector = 0; sector < 6; sector++) {
        for (let i = 0; i < this.size; i++) {
          if (i > 0 || sector % 3 !== 0) {
            const ptr = this.getEdge(sector, this.size - 1, i, 0);
            this.adjacencylist[this.vertexIndex(sector, 0, this.size - 1, i)].push([-1, ptr]);
          }
        }
        for (let i = 0; i < this.size; i++) {
          const ptr = this.getEdge(sector, i, i, 1);
          this.adjacencylist[this.vertexIndex(sector, 0, i, i)].push(
            [this.vertexIndex((sector + 1) % 6, 0, i, 0), ptr]
          );
          this.adjacencylist[this.vertexIndex((sector + 1) % 6, 0, i, 0)].push(
            [this.vertexIndex(sector, 0, i, i), ptr]
          );
        }
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
    getCellCenter(vertex) {
      const sz = this.size;
      const sector = Math.floor(vertex / (sz * sz));
      let rem = vertex - sector * sz * sz;
      const halfCount = sz * (sz + 1) / 2;
      let ud, row, col;
      if (rem < halfCount) {
        ud = 0;
        row = 0;
        while ((row + 1) * (row + 2) / 2 <= rem) row++;
        col = rem - row * (row + 1) / 2;
      } else {
        ud = 1;
        rem -= halfCount;
        row = 0;
        while ((row + 1) * (row + 2) / 2 <= rem) row++;
        col = rem - row * (row + 1) / 2;
      }
      const dx12 = -0.5, dy12 = -Math.sqrt(3) / 2;
      const dx23 = 1;
      let lx, ly;
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
    getCoordinateBounds() {
      return [-this.size, -Math.sqrt(3) / 2 * this.size, this.size, Math.sqrt(3) / 2 * this.size];
    }
  };

  // src/mazetypes/honeycombmaze.ts
  var M_PI2 = Math.PI;
  var NEIGH = [[-1, 0], [-1, 1], [0, 1], [1, 0], [1, -1], [0, -1]];
  var HoneyCombMaze = class extends Maze {
    constructor(size) {
      super(3 * size * (size - 1) + 1, 0, 3 * size * (size - 1));
      this.size = size;
    }
    vertexIndex(u, v) {
      if (u <= 0)
        return (3 * this.size + u) * (this.size + u - 1) / 2 + v;
      else
        return (3 * this.size * (this.size - 1) + (4 * this.size - u - 1) * u) / 2 + v;
    }
    getEdgeCoords(u, v, edge) {
      const dxu = Math.sqrt(3) / 2, dyu = 1.5, dxv = Math.sqrt(3), dyv = 0;
      const cx = dxu * u + dxv * v, cy = dyu * u + dyv * v;
      const theta1 = (edge - 2.5) * M_PI2 / 3, theta2 = theta1 + M_PI2 / 3;
      return [cx + Math.cos(theta1), cy + Math.sin(theta1), cx + Math.cos(theta2), cy + Math.sin(theta2)];
    }
    vExtent(u) {
      if (u < 0) return [-this.size - u + 1, this.size - 1];
      else return [-this.size + 1, this.size - 1 - u];
    }
    isValidNode(u, v) {
      if (u <= -this.size || u >= this.size) return false;
      const [vmin, vmax] = this.vExtent(u);
      return v >= vmin && v <= vmax;
    }
    initializeGraph() {
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
              if (node === this.startvertex && n === 0 || node === this.endvertex && n === 3) continue;
              this.adjacencylist[node].push([-1, new LineBorder(...this.getEdgeCoords(u, v, n))]);
            }
          }
        }
      }
    }
    getCellCenter(vertex) {
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
    getCoordinateBounds() {
      const xlim = Math.sqrt(3) * (this.size - 0.5), ylim = 1.5 * this.size - 0.5;
      return [-xlim, -ylim, xlim, ylim];
    }
  };

  // src/mazetypes/circularmaze.ts
  var M_PI3 = Math.PI;
  var CircularMaze = class extends Maze {
    constructor(size) {
      super();
      this.size = size;
      this.ringnodecount = new Array(size);
      this.ringnodeprefixsum = new Array(size);
      this.ringnodecount[0] = 1;
      this.ringnodeprefixsum[0] = 0;
      for (let i = 1; i < size; i++) {
        this.ringnodecount[i] = this.ringnodecount[i - 1];
        if (2 * M_PI3 * i / this.ringnodecount[i - 1] > 2) this.ringnodecount[i] *= 2;
        this.ringnodeprefixsum[i] = this.ringnodeprefixsum[i - 1] + this.ringnodecount[i - 1];
      }
      this.vertices = this.ringnodecount[size - 1] + this.ringnodeprefixsum[size - 1];
      this.startvertex = this.ringnodeprefixsum[size - 1];
      this.endvertex = this.startvertex + Math.floor(this.ringnodecount[size - 1] / 2);
    }
    initializeGraph() {
      super.initializeGraph();
      for (let i = 1; i < this.size; i++) {
        for (let j = 0; j < this.ringnodecount[i]; j++) {
          const node = this.ringnodeprefixsum[i] + j;
          const nnode1 = this.ringnodeprefixsum[i - 1] + Math.floor(this.ringnodecount[i - 1] * j / this.ringnodecount[i]);
          const arcBorder = new ArcBorder(
            0,
            0,
            i,
            j * 2 * M_PI3 / this.ringnodecount[i] - M_PI3 / 2,
            (j + 1) * 2 * M_PI3 / this.ringnodecount[i] - M_PI3 / 2
          );
          this.adjacencylist[node].push([nnode1, arcBorder]);
          this.adjacencylist[nnode1].push([node, arcBorder]);
          const nnode2 = this.ringnodeprefixsum[i] + (j + 1) % this.ringnodecount[i];
          const theta = (j + 1) * 2 * M_PI3 / this.ringnodecount[i] - M_PI3 / 2;
          const lineBorder = new LineBorder(
            i * Math.cos(theta),
            i * Math.sin(theta),
            (i + 1) * Math.cos(theta),
            (i + 1) * Math.sin(theta)
          );
          this.adjacencylist[node].push([nnode2, lineBorder]);
          this.adjacencylist[nnode2].push([node, lineBorder]);
          if (i === this.size - 1 && node !== this.startvertex && node !== this.endvertex) {
            const outerArc = new ArcBorder(
              0,
              0,
              this.size,
              j * 2 * M_PI3 / this.ringnodecount[i] - M_PI3 / 2,
              (j + 1) * 2 * M_PI3 / this.ringnodecount[i] - M_PI3 / 2
            );
            this.adjacencylist[node].push([-1, outerArc]);
          }
        }
      }
    }
    getCellCenter(vertex) {
      if (vertex === 0) return [0, 0];
      for (let i = 1; i < this.size; i++) {
        const start = this.ringnodeprefixsum[i];
        const count = this.ringnodecount[i];
        if (vertex >= start && vertex < start + count) {
          const j = vertex - start;
          const midAngle = (j + 0.5) * 2 * M_PI3 / count - M_PI3 / 2;
          const midRadius = i + 0.5;
          return [midRadius * Math.cos(midAngle), midRadius * Math.sin(midAngle)];
        }
      }
      throw new Error("Invalid vertex");
    }
    getCoordinateBounds() {
      return [-this.size, -this.size, this.size, this.size];
    }
  };

  // src/mazetypes/circularhexagonmaze.ts
  var M_PI4 = Math.PI;
  var CircularHexagonMaze = class extends HexagonalMaze {
    constructor(size) {
      super(size);
    }
    getEdge(sector, row, column, edge) {
      if (edge === 0) {
        return new ArcBorder(
          0,
          0,
          row + 1,
          (sector - 2) * M_PI4 / 3 + column * M_PI4 / 3 / (row + 1),
          (sector - 2) * M_PI4 / 3 + (column + 1) * M_PI4 / 3 / (row + 1)
        );
      }
      let ex1, ey1, ex2, ey2;
      if (edge === 1) {
        let theta1 = (sector - 2) * M_PI4 / 3;
        let theta2 = (sector - 2) * M_PI4 / 3;
        if (row > 0) theta1 += column * M_PI4 / 3 / row;
        theta2 += (column + 1) * M_PI4 / 3 / (row + 1);
        ex1 = row * Math.cos(theta1);
        ey1 = row * Math.sin(theta1);
        ex2 = (row + 1) * Math.cos(theta2);
        ey2 = (row + 1) * Math.sin(theta2);
      } else {
        let theta1 = (sector - 2) * M_PI4 / 3;
        let theta2 = (sector - 2) * M_PI4 / 3;
        if (row > 0) theta1 += column * M_PI4 / 3 / row;
        theta2 += column * M_PI4 / 3 / (row + 1);
        ex1 = row * Math.cos(theta1);
        ey1 = row * Math.sin(theta1);
        ex2 = (row + 1) * Math.cos(theta2);
        ey2 = (row + 1) * Math.sin(theta2);
      }
      return new LineBorder(ex1, ey1, ex2, ey2);
    }
    getCellCenter(vertex) {
      const sz = this.size;
      const sector = Math.floor(vertex / (sz * sz));
      let rem = vertex - sector * sz * sz;
      const halfCount = sz * (sz + 1) / 2;
      let ud, row, col;
      if (rem < halfCount) {
        ud = 0;
        row = 0;
        while ((row + 1) * (row + 2) / 2 <= rem) row++;
        col = rem - row * (row + 1) / 2;
      } else {
        ud = 1;
        rem -= halfCount;
        row = 0;
        while ((row + 1) * (row + 2) / 2 <= rem) row++;
        col = rem - row * (row + 1) / 2;
      }
      const sectorBase = (sector - 2) * M_PI4 / 3;
      let r1, a1, r2, a2, r3, a3;
      if (ud === 0) {
        r1 = row;
        a1 = row > 0 ? sectorBase + col * M_PI4 / 3 / row : sectorBase;
        r2 = row + 1;
        a2 = sectorBase + col * M_PI4 / 3 / (row + 1);
        r3 = row + 1;
        a3 = sectorBase + (col + 1) * M_PI4 / 3 / (row + 1);
      } else {
        r1 = row + 1;
        a1 = sectorBase + col * M_PI4 / 3 / (row + 1);
        r2 = row + 1;
        a2 = sectorBase + (col + 1) * M_PI4 / 3 / (row + 1);
        r3 = row + 2;
        a3 = sectorBase + (col + 1) * M_PI4 / 3 / (row + 2);
      }
      return [
        (r1 * Math.cos(a1) + r2 * Math.cos(a2) + r3 * Math.cos(a3)) / 3,
        (r1 * Math.sin(a1) + r2 * Math.sin(a2) + r3 * Math.sin(a3)) / 3
      ];
    }
    getCoordinateBounds() {
      return [-this.size, -this.size, this.size, this.size];
    }
  };

  // src/mazetypes/triangularmaze.ts
  var TriangularMaze = class extends Maze {
    constructor(rows) {
      super();
      this.rows = rows;
      this.vertices = rows * (rows + 1) / 2;
      this.startvertex = 0;
      this.endvertex = this.vertices - 1;
    }
    cellsInRow(row) {
      return this.rows - row;
    }
    cellsBeforeRow(row) {
      let total = 0;
      for (let r = 0; r < row; r++) {
        total += this.cellsInRow(r);
      }
      return total;
    }
    vertexIndex(row, col) {
      return this.cellsBeforeRow(row) + col;
    }
    initializeGraph() {
      super.initializeGraph();
      for (let i = 0; i < this.cellsInRow(0); i++) {
        this.adjacencylist[this.vertexIndex(0, i)].push(
          [-1, new LineBorder(i, 0, i + 1, 0)]
        );
      }
      this.adjacencylist[this.vertexIndex(this.rows - 1, 0)].push(
        [-1, new LineBorder(0, this.rows, 1, this.rows)]
      );
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
      for (let row = 0; row < this.rows - 1; row++) {
        const cellsInRow = this.cellsInRow(row);
        const cellsInNextRow = this.cellsInRow(row + 1);
        if (!(row === this.rows - 2 && cellsInNextRow === 1)) {
          this.adjacencylist[this.vertexIndex(row, cellsInRow - 1)].push(
            [-1, new LineBorder(cellsInRow, row + 1, cellsInNextRow, row + 1)]
          );
        }
      }
      for (let row = 0; row < this.rows; row++) {
        const cellsInRow = this.cellsInRow(row);
        for (let col = 0; col < cellsInRow - 1; col++) {
          const border = new LineBorder(col + 1, row, col + 1, row + 1);
          this.adjacencylist[this.vertexIndex(row, col)].push([this.vertexIndex(row, col + 1), border]);
          this.adjacencylist[this.vertexIndex(row, col + 1)].push([this.vertexIndex(row, col), border]);
        }
      }
      for (let row = 0; row < this.rows - 1; row++) {
        const cellsInNextRow = this.cellsInRow(row + 1);
        for (let col = 0; col < cellsInNextRow; col++) {
          const border = new LineBorder(col, row + 1, col + 1, row + 1);
          this.adjacencylist[this.vertexIndex(row, col)].push([this.vertexIndex(row + 1, col), border]);
          this.adjacencylist[this.vertexIndex(row + 1, col)].push([this.vertexIndex(row, col), border]);
        }
      }
    }
    getCellCenter(vertex) {
      let row = 0;
      let remaining = vertex;
      while (remaining >= this.cellsInRow(row)) {
        remaining -= this.cellsInRow(row);
        row++;
      }
      return [remaining + 0.5, row + 0.5];
    }
    getCoordinateBounds() {
      return [0, 0, this.rows, this.rows];
    }
  };
  return __toCommonJS(web_exports);
})();
