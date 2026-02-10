/*
PLAYABLE MAZE PUZZLE (2 LEVELS) — FIXED
- Circles spawn ONLY on tiles reachable from the player spawn (no blocked circles)
- Collect all circles, then reach the green exit to advance / win
Controls: Arrow keys or WASD
Reset: R
*/

const TS = 32;

// Tile legend:
// 0 = floor
// 1 = wall
// 2 = exit

class Level {
  constructor(grid, tileSize) {
    this.grid = grid;
    this.ts = tileSize;
    this.collectibles = [];
  }

  cols() {
    return this.grid[0].length;
  }
  rows() {
    return this.grid.length;
  }
  pixelWidth() {
    return this.cols() * this.ts;
  }
  pixelHeight() {
    return this.rows() * this.ts;
  }

  inBounds(r, c) {
    return r >= 0 && r < this.rows() && c >= 0 && c < this.cols();
  }

  tileAt(r, c) {
    if (!this.inBounds(r, c)) return 1;
    return this.grid[r][c];
  }

  isWall(r, c) {
    return this.tileAt(r, c) === 1;
  }
  isExit(r, c) {
    return this.tileAt(r, c) === 2;
  }

  // BFS flood-fill from spawn to mark all reachable non-wall tiles
  _reachableFrom(spawnR, spawnC) {
    const visited = Array.from({ length: this.rows() }, () =>
      Array(this.cols()).fill(false),
    );

    if (this.isWall(spawnR, spawnC)) return visited;

    const q = [{ r: spawnR, c: spawnC }];
    visited[spawnR][spawnC] = true;

    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    while (q.length > 0) {
      const cur = q.shift();
      for (const d of dirs) {
        const nr = cur.r + d.dr;
        const nc = cur.c + d.dc;

        if (!this.inBounds(nr, nc)) continue;
        if (visited[nr][nc]) continue;
        if (this.isWall(nr, nc)) continue;

        visited[nr][nc] = true;
        q.push({ r: nr, c: nc });
      }
    }
    return visited;
  }

  // Build circles only on reachable floor tiles (0), excluding spawn tile
  buildCollectiblesFromSpawn(spawnR, spawnC) {
    const reachable = this._reachableFrom(spawnR, spawnC);
    this.collectibles = [];

    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        if (!reachable[r][c]) continue;
        if (this.grid[r][c] !== 0) continue;
        if (r === spawnR && c === spawnC) continue;

        this.collectibles.push({ r, c, eaten: false });
      }
    }
  }

  eatAt(r, c) {
    for (let i = 0; i < this.collectibles.length; i++) {
      const p = this.collectibles[i];
      if (!p.eaten && p.r === r && p.c === c) {
        p.eaten = true;
        return true;
      }
    }
    return false;
  }

  remaining() {
    let left = 0;
    for (const p of this.collectibles) if (!p.eaten) left++;
    return left;
  }

  draw() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        const tileValue = this.grid[r][c];

        if (tileValue === 1) fill(30, 50, 60);
        else if (tileValue === 2) fill(80, 180, 110);
        else fill(230);

        rect(c * this.ts, r * this.ts, this.ts, this.ts);
      }
    }

    for (const p of this.collectibles) {
      if (p.eaten) continue;
      fill(255, 160, 70);
      circle(
        p.c * this.ts + this.ts / 2,
        p.r * this.ts + this.ts / 2,
        this.ts * 0.45,
      );
    }
  }
}

const grid1 = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const grid2 = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let levels = [];
let levelIndex = 0;
let level;

let player = { r: 1, c: 1 };
let gameWon = false;

function loadLevel(i) {
  levelIndex = i;
  level = levels[levelIndex];

  if (levelIndex === 0) {
    player.r = 1;
    player.c = 1;
  } else {
    player.r = 9;
    player.c = 1;
  }

  level.buildCollectiblesFromSpawn(player.r, player.c);
  gameWon = false;

  resizeCanvas(level.pixelWidth(), level.pixelHeight());
}

function tryMove(dr, dc) {
  if (gameWon) return;

  const nr = player.r + dr;
  const nc = player.c + dc;

  if (level.isWall(nr, nc)) return;

  player.r = nr;
  player.c = nc;

  level.eatAt(player.r, player.c);

  if (level.remaining() === 0 && level.isExit(player.r, player.c)) {
    if (levelIndex < levels.length - 1) loadLevel(levelIndex + 1);
    else gameWon = true;
  }
}

function setup() {
  levels = [new Level(grid1, TS), new Level(grid2, TS)];
  createCanvas(levels[0].pixelWidth(), levels[0].pixelHeight());

  noStroke();
  textFont("sans-serif");
  textSize(14);

  loadLevel(0);
}

function draw() {
  background(240);

  level.draw();

  // player
  fill(70, 120, 255);
  circle(player.c * TS + TS / 2, player.r * TS + TS / 2, TS * 0.6);

  // HUD
  fill(0);
  rect(0, 0, width, 28);
  fill(255);
  text(
    `Level: ${levelIndex + 1}/2   Circles left: ${level.remaining()}   (R = reset)`,
    10,
    18,
  );

  fill(0);
  text("Collect all circles, then go to the green exit.", 10, height - 10);

  if (gameWon) {
    fill(0, 180);
    rect(0, 0, width, height);
    fill(255);
    textSize(28);
    textAlign(CENTER, CENTER);
    text("YOU WIN", width / 2, height / 2);
    textAlign(LEFT, BASELINE);
    textSize(14);
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    loadLevel(levelIndex);
    return;
  }

  if (keyCode === LEFT_ARROW) tryMove(0, -1);
  if (keyCode === RIGHT_ARROW) tryMove(0, 1);
  if (keyCode === UP_ARROW) tryMove(-1, 0);
  if (keyCode === DOWN_ARROW) tryMove(1, 0);

  if (key === "a" || key === "A") tryMove(0, -1);
  if (key === "d" || key === "D") tryMove(0, 1);
  if (key === "w" || key === "W") tryMove(-1, 0);
  if (key === "s" || key === "S") tryMove(1, 0);
}
