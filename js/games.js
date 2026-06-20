/* ============================================================
   games.js —— 小游戏合集 v2
   三款 Canvas 小游戏：贪吃蛇、滚动的天空、星际战机
   - 自适应屏幕大小，充分利用可视区域
   - 每款游戏支持简单/中等/困难三级难度
   - 纯原生 JS，零依赖，与博客风格统一
   ============================================================ */

(function () {
  "use strict";

  // ============================================================
  // 0. 工具函数
  // ============================================================

  function getCtx(canvas) {
    return canvas.getContext("2d");
  }

  function rectCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /** 渲染难度选择器 HTML */
  function renderDifficultySelector(prefix, current) {
    var diffs = [
      { id: "easy", label: "简单" },
      { id: "medium", label: "中等" },
      { id: "hard", label: "困难" },
    ];
    var btns = diffs
      .map(function (d) {
        return (
          '<button class="diff-btn' +
          (current === d.id ? " active" : "") +
          '" id="' + prefix + "-" + d.id + '">' +
          d.label +
          "</button>"
        );
      })
      .join("");
    return '<div class="difficulty-selector"><span class="diff-label">难度</span>' + btns + "</div>";
  }

  /** 启动实时时钟（返回停止函数） */
  function startClock(elId) {
    function tick() {
      var el = document.getElementById(elId);
      if (!el) return;
      var now = new Date();
      var h = String(now.getHours()).padStart(2, "0");
      var m = String(now.getMinutes()).padStart(2, "0");
      var s = String(now.getSeconds()).padStart(2, "0");
      el.textContent = h + ":" + m + ":" + s;
    }
    tick();
    var id = setInterval(tick, 1000);
    return function () { clearInterval(id); };
  }

  /** 计算响应式 Canvas 显示尺寸
   *  尽量填满可视区域，同时保证不过度拉伸 */
  function calcScale(container, W, H) {
    var pad = 32;
    var availW = Math.min(container.clientWidth - pad, 900);
    var availH = Math.min(window.innerHeight * 0.66, H * 3);
    return Math.min(availW / W, availH / H, 2.5);
  }

  // ============================================================
  // 1. 游戏大厅
  // ============================================================

  function renderGameHub() {
    var games = [
      {
        id: "snake",
        title: "贪吃蛇",
        icon: "🐍",
        desc: "经典贪吃蛇游戏。方向键控制蛇的移动，吃到食物变长，撞墙或撞到自己则游戏结束。",
        color: "#4a9e4a",
      },
      {
        id: "rolling-sky",
        title: "滚动的天空",
        icon: "⚡",
        desc: "控制小球在三条赛道间移动，躲避从上方滚落的障碍物，收集金币获取额外分数。",
        color: "#4a7cb5",
      },
      {
        id: "space-shooter",
        title: "星际战机",
        icon: "🚀",
        desc: "驾驶战机消灭敌机。方向键移动，空格键发射子弹，消灭越多敌人分数越高。",
        color: "#c0392b",
      },
    ];

    var cards = games
      .map(function (g) {
        return (
          '<li class="game-item">' +
          '<a href="#/game/' + g.id + '" class="game-card">' +
          '<div class="game-card-icon" style="background:' + g.color + '">' + g.icon + "</div>" +
          '<h3 class="game-card-title">' + g.title + "</h3>" +
          '<p class="game-card-desc">' + g.desc + "</p>" +
          '<span class="game-card-play">开始游戏 →</span>' +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<main class="main">' +
      '<section class="games-hero">' +
      '<span class="hero-greeting">🎮 小憩一下</span>' +
      '<h1 class="hero-title">小游戏</h1>' +
      '<p class="hero-subtitle">学习累了？来玩会儿小游戏放松一下吧。选择难度，开始挑战！</p>' +
      "</section>" +
      '<section class="article-grid-section">' +
      '<div class="section-header">' +
      '<span class="section-label">游戏列表</span>' +
      '<span style="font-size:0.78rem;color:var(--color-text-tertiary)">' + games.length + " 款</span>" +
      "</div>" +
      '<ul class="game-grid">' + cards + "</ul>" +
      "</section>" +
      "</main>"
    );
  }

  // ============================================================
  // 2. 贪吃蛇（扩大画布 + 三级难度）
  // ============================================================

  function initSnake(container) {
    var CELL = 24; // 每格像素（增大）
    var COLS = 25;
    var ROWS = 20;
    var W = COLS * CELL;
    var H = ROWS * CELL;

    var difficulty = "medium";

    var scale = calcScale(container, W, H);
    var canvasW = Math.round(W * scale);
    var canvasH = Math.round(H * scale);

    var html =
      '<div class="game-container">' +
      '<div class="game-header">' +
      '<a href="#/games" class="back-link"><span class="arrow">←</span> 返回游戏大厅</a>' +
      '<div class="game-scoreboard">' +
      '<span class="game-label">🐍 贪吃蛇</span>' +
      '<span class="game-score">得分：<strong id="snake-score">0</strong></span>' +
      '<span class="game-clock" id="snake-clock">--:--:--</span>' +
      "</div>" +
      renderDifficultySelector("snake-diff", difficulty) +
      "</div>" +
      '<div class="game-canvas-wrap">' +
      '<canvas id="snake-canvas" width="' + W + '" height="' + H +
      '" style="width:' + canvasW + "px;height:" + canvasH + 'px"></canvas>' +
      "</div>" +
      '<div class="game-controls">' +
      '<p class="game-hint">↑ ↓ ← → 或 W A S D 控制方向 · 空格键暂停</p>' +
      '<button class="game-btn" id="snake-restart">重新开始</button>' +
      "</div>" +
      "</div>";

    container.innerHTML = html;

    var canvas = document.getElementById("snake-canvas");
    var ctx = getCtx(canvas);
    var scoreEl = document.getElementById("snake-score");

    // --- 游戏状态 ---
    var snake = [];
    var food = {};
    var dir = { x: 1, y: 0 };
    var nextDir = { x: 1, y: 0 };
    var score = 0;
    var gameOver = false;
    var paused = false;
    var ticker = null;
    var gameStarted = false;

    function getSpeed() {
      if (difficulty === "easy") return 220;
      if (difficulty === "hard") return 70;
      return 115; // medium
    }

    function placeFood() {
      var ok = false;
      var fx, fy;
      while (!ok) {
        fx = randInt(0, COLS);
        fy = randInt(0, ROWS);
        ok = true;
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === fx && snake[i].y === fy) { ok = false; break; }
        }
      }
      food = { x: fx, y: fy };
    }

    function reset() {
      if (ticker) clearInterval(ticker);
      var cx = Math.floor(COLS / 2);
      var cy = Math.floor(ROWS / 2);
      snake = [
        { x: cx, y: cy },
        { x: cx - 1, y: cy },
        { x: cx - 2, y: cy },
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      gameOver = false;
      paused = false;
      gameStarted = false;
      scoreEl.textContent = "0";
      placeFood();
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // 背景网格
      ctx.fillStyle = "#fafaf8";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#f0efe9";
      ctx.lineWidth = 0.5;
      for (var x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, H);
        ctx.stroke();
      }
      for (var y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(W, y * CELL);
        ctx.stroke();
      }

      // 食物
      var fx = food.x * CELL + CELL / 2;
      var fy = food.y * CELL + CELL / 2;
      ctx.fillStyle = "#e74c3c";
      ctx.beginPath();
      ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // 蛇身
      for (var i = 0; i < snake.length; i++) {
        var seg = snake[i];
        var alpha = 1 - i / (snake.length + 8);
        ctx.fillStyle = "rgba(26, 26, 26, " + Math.max(0.35, alpha) + ")";
        var pad = i === 0 ? 2 : 3;
        ctx.fillRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
      }

      // 蛇头 + 眼睛
      if (snake.length > 0) {
        var head = snake[0];
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(head.x * CELL + 2, head.y * CELL + 2, CELL - 4, CELL - 4);
        ctx.fillStyle = "#fff";
        var ex = head.x * CELL + CELL / 2;
        var ey = head.y * CELL + CELL / 2;
        var eoff = 4;
        if (dir.x === 1) {
          ctx.fillRect(ex + 3, ey - eoff, 4, 4);
          ctx.fillRect(ex + 3, ey + eoff - 3, 4, 4);
        } else if (dir.x === -1) {
          ctx.fillRect(ex - 7, ey - eoff, 4, 4);
          ctx.fillRect(ex - 7, ey + eoff - 3, 4, 4);
        } else if (dir.y === -1) {
          ctx.fillRect(ex - eoff, ey - 7, 4, 4);
          ctx.fillRect(ex + eoff - 3, ey - 7, 4, 4);
        } else {
          ctx.fillRect(ex - eoff, ey + 3, 4, 4);
          ctx.fillRect(ex + eoff - 3, ey + 3, 4, 4);
        }
      }

      // 覆盖层
      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("游戏结束", W / 2, H / 2 - 14);
        ctx.font = "15px 'Noto Sans SC', sans-serif";
        ctx.fillText("得分：" + score + "  |  按 R 键重新开始", W / 2, H / 2 + 22);
        ctx.textAlign = "start";
      } else if (paused) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("暂停中", W / 2, H / 2);
        ctx.textAlign = "start";
      } else if (!gameStarted) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("按方向键开始", W / 2, H / 2);
        ctx.textAlign = "start";
      }
    }

    function tick() {
      if (gameOver || paused || !gameStarted) return;
      dir = { x: nextDir.x, y: nextDir.y };
      var head = snake[0];
      var newHead = { x: head.x + dir.x, y: head.y + dir.y };

      if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        endGame();
        return;
      }
      for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === newHead.x && snake[i].y === newHead.y) { endGame(); return; }
      }

      snake.unshift(newHead);
      if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        placeFood();
        // 加速（随得分递增，简单模式几乎不加速）
        var spd = getSpeed();
        var minSpd = difficulty === "hard" ? 50 : difficulty === "easy" ? 180 : 70;
        var dec = difficulty === "easy" ? 1 : 4;
        if (spd > minSpd) {
          spd = Math.max(minSpd, getSpeed() - Math.floor(score / 80) * dec);
          if (ticker) clearInterval(ticker);
          ticker = setInterval(tick, spd);
        }
      } else {
        snake.pop();
      }
      draw();
    }

    function endGame() {
      gameOver = true;
      if (ticker) clearInterval(ticker);
      ticker = null;
      draw();
    }

    function setDir(dx, dy) {
      if (gameOver || paused) return;
      if (dx === -dir.x && dy === -dir.y) return;
      if (dx === 0 && dy === 0) return;
      nextDir = { x: dx, y: dy };
      if (!gameStarted) {
        gameStarted = true;
        ticker = setInterval(tick, getSpeed());
        tick();
      }
    }

    function onKey(e) {
      var key = e.key.toLowerCase();
      if (key === "arrowup" || key === "w") { e.preventDefault(); setDir(0, -1); }
      else if (key === "arrowdown" || key === "s") { e.preventDefault(); setDir(0, 1); }
      else if (key === "arrowleft" || key === "a") { e.preventDefault(); setDir(-1, 0); }
      else if (key === "arrowright" || key === "d") { e.preventDefault(); setDir(1, 0); }
      else if (key === " " && !gameOver) { e.preventDefault(); paused = !paused; draw(); }
      else if (key === "r" && gameOver) { reset(); }
    }

    // 难度按钮事件
    function bindDifficulty() {
      ["easy", "medium", "hard"].forEach(function (d) {
        var btn = document.getElementById("snake-diff-" + d);
        if (btn) {
          btn.addEventListener("click", function () {
            difficulty = d;
            updateDiffBtns();
            reset();
          });
        }
      });
    }

    function updateDiffBtns() {
      ["easy", "medium", "hard"].forEach(function (d) {
        var btn = document.getElementById("snake-diff-" + d);
        if (btn) btn.classList.toggle("active", difficulty === d);
      });
    }

    document.addEventListener("keydown", onKey);
    document.getElementById("snake-restart").addEventListener("click", reset);
    bindDifficulty();
    reset();

    var stopClock = startClock("snake-clock");

    return function cleanup() {
      stopClock();
      document.removeEventListener("keydown", onKey);
      if (ticker) clearInterval(ticker);
    };
  }

  // ============================================================
  // 3. 滚动的天空（扩大画布 + 三级难度 + 生命值）
  // ============================================================

  function initRollingSky(container) {
    var LANES = 3;
    var W = 480;
    var H = 640;
    var LANE_W = W / LANES;

    var difficulty = "medium";

    var scale = calcScale(container, W, H);
    var canvasW = Math.round(W * scale);
    var canvasH = Math.round(H * scale);

    var html =
      '<div class="game-container">' +
      '<div class="game-header">' +
      '<a href="#/games" class="back-link"><span class="arrow">←</span> 返回游戏大厅</a>' +
      '<div class="game-scoreboard">' +
      '<span class="game-label">⚡ 滚动的天空</span>' +
      '<span class="game-score">得分：<strong id="rs-score">0</strong></span>' +
      '<span class="game-score" id="rs-lives-display"></span>' +
      '<span class="game-clock" id="rs-clock">--:--:--</span>' +
      "</div>" +
      renderDifficultySelector("rs-diff", difficulty) +
      "</div>" +
      '<div class="game-canvas-wrap">' +
      '<canvas id="rs-canvas" width="' + W + '" height="' + H +
      '" style="width:' + canvasW + "px;height:" + canvasH + 'px"></canvas>' +
      "</div>" +
      '<div class="game-controls">' +
      '<p class="game-hint">← → 或 A D 切换赛道 · 空格键暂停</p>' +
      '<button class="game-btn" id="rs-restart">重新开始</button>' +
      "</div>" +
      "</div>";

    container.innerHTML = html;

    var canvas = document.getElementById("rs-canvas");
    var ctx = getCtx(canvas);
    var scoreEl = document.getElementById("rs-score");
    var livesEl = document.getElementById("rs-lives-display");

    // --- 游戏状态 ---
    var playerLane = 1;
    var playerX = LANE_W / 2 + playerLane * LANE_W;
    var playerY = H - 120;
    var playerR = 20;
    var obstacles = [];
    var coins = [];
    var score = 0;
    var gameOver = false;
    var paused = false;
    var gameStarted = false;
    var frameId = null;
    var spawnTimer = 0;
    var frameCount = 0;
    var particles = [];
    var lives = 1;
    var invincible = 0;
    var curSpeed = 3.8;
    var curSpawnInt = 50;

    var targetX = playerX;

    function getParams() {
      if (difficulty === "easy") return { speed: 1.5, spawnInterval: 110, lives: 5 };
      if (difficulty === "hard") return { speed: 5.5, spawnInterval: 32, lives: 1 };
      return { speed: 3.8, spawnInterval: 50, lives: 1 }; // medium
    }

    function reset() {
      if (frameId) cancelAnimationFrame(frameId);
      var p = getParams();
      lives = p.lives;
      curSpeed = p.speed;
      curSpawnInt = p.spawnInterval;
      playerLane = 1;
      playerX = LANE_W / 2 + playerLane * LANE_W;
      targetX = playerX;
      obstacles = [];
      coins = [];
      particles = [];
      score = 0;
      gameOver = false;
      paused = false;
      gameStarted = false;
      spawnTimer = 0;
      frameCount = 0;
      invincible = 0;
      scoreEl.textContent = "0";
      updateLivesDisplay();
      draw();
    }

    function updateLivesDisplay() {
      if (lives > 1) {
        livesEl.textContent = "生命：" + Array(Math.max(0, lives)).fill("❤").join("");
      } else {
        livesEl.textContent = "";
      }
    }

    function spawnObstacle() {
      var doubleChance = difficulty === "easy" ? 0.08 : 0.3;
      var count = Math.random() < doubleChance ? 2 : 1;
      var occupied = [];
      for (var c = 0; c < count; c++) {
        var lane;
        var tries = 0;
        do {
          lane = randInt(0, LANES);
          tries++;
        } while (occupied.indexOf(lane) !== -1 && tries < 10);
        if (occupied.indexOf(lane) !== -1) continue;
        occupied.push(lane);

        var types = ["rock", "spike", "block"];
        var type = types[randInt(0, types.length)];
        var w = LANE_W - 20;
        var h = randInt(30, 55);
        obstacles.push({
          x: lane * LANE_W + 10,
          y: -h - randInt(0, 150),
          w: w, h: h, type: type,
        });
      }
      if (Math.random() < 0.5) {
        var cl = randInt(0, LANES);
        coins.push({ x: cl * LANE_W + LANE_W / 2, y: -30, r: 9, alive: true });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // 道路背景
      var bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#2c3e50");
      bgGrad.addColorStop(1, "#1a252f");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 车道虚线（滚动）
      var scrollY = (frameCount * curSpeed) % 40;
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      for (var l = 1; l < LANES; l++) {
        ctx.beginPath();
        ctx.moveTo(l * LANE_W, 0);
        ctx.lineTo(l * LANE_W, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 道路边框
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 0, W - 4, H);

      // 金币
      for (var ci = 0; ci < coins.length; ci++) {
        var coin = coins[ci];
        if (!coin.alive) continue;
        ctx.fillStyle = "#f1c40f";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f9e74a";
        ctx.beginPath();
        ctx.arc(coin.x - 2, coin.y - 2, coin.r / 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 障碍物
      for (var oi = 0; oi < obstacles.length; oi++) {
        var ob = obstacles[oi];
        ctx.fillStyle = ob.type === "rock" ? "#7f8c8d" : ob.type === "spike" ? "#e74c3c" : "#8e44ad";
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
        if (ob.type === "spike") {
          ctx.fillStyle = "#c0392b";
          for (var sx = ob.x; sx < ob.x + ob.w; sx += 12) {
            ctx.beginPath();
            ctx.moveTo(sx, ob.y);
            ctx.lineTo(sx + 6, ob.y - 8);
            ctx.lineTo(sx + 12, ob.y);
            ctx.fill();
          }
        }
      }

      // 玩家球
      playerX += (targetX - playerX) * 0.25;
      var px = playerX;
      var py = playerY;

      // 无敌闪烁
      if (invincible > 0 && Math.floor(invincible / 5) % 2 === 0) {
        // 半透明绘制（受伤闪烁效果）
        ctx.globalAlpha = 0.4;
      }

      // 光晕
      var glow = ctx.createRadialGradient(px, py, playerR * 0.5, px, py, playerR * 2.2);
      glow.addColorStop(0, "rgba(52, 152, 219, 0.5)");
      glow.addColorStop(1, "rgba(52, 152, 219, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, playerR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 主体
      var ballGrad = ctx.createRadialGradient(px - 5, py - 5, 3, px, py, playerR);
      ballGrad.addColorStop(0, "#85c1e9");
      ballGrad.addColorStop(0.7, "#2e86c1");
      ballGrad.addColorStop(1, "#1a5276");
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(px, py, playerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.globalAlpha = 1;

      // 粒子
      for (var pi = particles.length - 1; pi >= 0; pi--) {
        var p = particles[pi];
        p.y -= p.vy;
        p.life--;
        ctx.fillStyle = "rgba(255,255,255," + (p.life / p.maxLife) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(pi, 1);
      }

      // 覆盖层
      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("游戏结束", W / 2, H / 2 - 14);
        ctx.font = "15px 'Noto Sans SC', sans-serif";
        ctx.fillText("得分：" + score + "  |  按 R 键重新开始", W / 2, H / 2 + 22);
        ctx.textAlign = "start";
      } else if (paused) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("暂停中", W / 2, H / 2);
        ctx.textAlign = "start";
      } else if (!gameStarted) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("按 ← → 开始游戏", W / 2, H / 2);
        ctx.textAlign = "start";
      }
    }

    function update() {
      if (gameOver) { frameId = requestAnimationFrame(loop); return; }
      if (paused || !gameStarted) { frameId = requestAnimationFrame(loop); draw(); return; }

      frameCount++;
      if (invincible > 0) invincible--;
      score++;
      scoreEl.textContent = score;

      // 难度递增（简单模式几乎不递增）
      if (difficulty === "easy" && frameCount % 600 === 0) {
        curSpeed += 0.08;
        if (curSpawnInt > 80) curSpawnInt -= 1;
      } else if (difficulty !== "easy" && frameCount % 350 === 0) {
        curSpeed += 0.25;
        if (curSpawnInt > 15) curSpawnInt -= 2;
      }

      spawnTimer++;
      if (spawnTimer >= curSpawnInt) {
        spawnTimer = 0;
        spawnObstacle();
        if (Math.random() < (difficulty === "easy" ? 0.05 : 0.2)) spawnObstacle();
      }

      // 更新障碍物
      for (var oi = obstacles.length - 1; oi >= 0; oi--) {
        obstacles[oi].y += curSpeed;
        if (obstacles[oi].y > H + 100) obstacles.splice(oi, 1);
      }

      // 更新金币
      for (var ci = coins.length - 1; ci >= 0; ci--) {
        coins[ci].y += curSpeed;
        if (coins[ci].y > H + 50) coins.splice(ci, 1);
      }

      // 碰撞：玩家 vs 障碍
      if (invincible <= 0) {
        var pr = playerR * 0.55;
        for (var oi2 = 0; oi2 < obstacles.length; oi2++) {
          var ob2 = obstacles[oi2];
          var cx = Math.max(ob2.x, Math.min(playerX, ob2.x + ob2.w));
          var cy = Math.max(ob2.y, Math.min(playerY, ob2.y + ob2.h));
          var dx = playerX - cx;
          var dy = playerY - cy;
          if (dx * dx + dy * dy < pr * pr) {
            hitPlayer();
            break;
          }
        }
      }

      // 金币收集
      for (var ci2 = coins.length - 1; ci2 >= 0; ci2--) {
        var coin2 = coins[ci2];
        if (!coin2.alive) continue;
        var cdx = playerX - coin2.x;
        var cdy = playerY - coin2.y;
        if (cdx * cdx + cdy * cdy < (playerR + coin2.r) * (playerR + coin2.r)) {
          coin2.alive = false;
          coins.splice(ci2, 1);
          score += 20;
          scoreEl.textContent = score;
          for (var ep = 0; ep < 8; ep++) {
            particles.push({
              x: coin2.x, y: coin2.y,
              r: randInt(2, 5),
              vy: Math.random() * 2 + 1,
              life: 15, maxLife: 15,
            });
          }
        }
      }

      draw();
      frameId = requestAnimationFrame(loop);
    }

    function hitPlayer() {
      lives--;
      updateLivesDisplay();
      // 爆炸粒子
      for (var ep = 0; ep < 25; ep++) {
        particles.push({
          x: playerX, y: playerY,
          r: randInt(2, 7),
          vy: Math.random() * 5 + 2,
          life: 28, maxLife: 28,
        });
      }
      if (lives <= 0) {
        gameOver = true;
        draw();
      } else {
        invincible = 90;
        // 清除前方一小段距离内的障碍物，避免连续受伤
        for (var oi = obstacles.length - 1; oi >= 0; oi--) {
          if (obstacles[oi].y > playerY - 80 && obstacles[oi].y < playerY + playerR + 10) {
            obstacles.splice(oi, 1);
          }
        }
      }
    }

    function loop() { update(); }

    function onKey(e) {
      var key = e.key.toLowerCase();
      if (key === "arrowleft" || key === "a") {
        e.preventDefault();
        if (gameOver) return;
        if (!gameStarted) { gameStarted = true; frameId = requestAnimationFrame(loop); }
        if (playerLane > 0) { playerLane--; targetX = LANE_W / 2 + playerLane * LANE_W; }
      } else if (key === "arrowright" || key === "d") {
        e.preventDefault();
        if (gameOver) return;
        if (!gameStarted) { gameStarted = true; frameId = requestAnimationFrame(loop); }
        if (playerLane < LANES - 1) { playerLane++; targetX = LANE_W / 2 + playerLane * LANE_W; }
      } else if (key === " " && !gameOver) {
        e.preventDefault();
        paused = !paused;
        draw();
      } else if (key === "r" && gameOver) {
        reset();
        frameId = requestAnimationFrame(loop);
      }
    }

    // 触摸滑动
    var touchStartX = 0;
    function onTouchStart(e) { if (!gameOver) touchStartX = e.touches[0].clientX; }
    function onTouchEnd(e) {
      if (gameOver) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 30) {
        if (dx < 0 && playerLane > 0) { playerLane--; targetX = LANE_W / 2 + playerLane * LANE_W; }
        else if (dx > 0 && playerLane < LANES - 1) { playerLane++; targetX = LANE_W / 2 + playerLane * LANE_W; }
        if (!gameStarted) { gameStarted = true; frameId = requestAnimationFrame(loop); }
      }
    }

    function bindDifficulty() {
      ["easy", "medium", "hard"].forEach(function (d) {
        var btn = document.getElementById("rs-diff-" + d);
        if (btn) {
          btn.addEventListener("click", function () {
            difficulty = d;
            ["easy", "medium", "hard"].forEach(function (x) {
              var b = document.getElementById("rs-diff-" + x);
              if (b) b.classList.toggle("active", x === d);
            });
            reset();
            frameId = requestAnimationFrame(loop);
          });
        }
      });
    }

    document.addEventListener("keydown", onKey);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    document.getElementById("rs-restart").addEventListener("click", function () {
      reset();
      frameId = requestAnimationFrame(loop);
    });
    bindDifficulty();
    reset();
    draw();

    var stopClock = startClock("rs-clock");

    return function cleanup() {
      stopClock();
      document.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }

  // ============================================================
  // 4. 星际战机（扩大画布 + 三级难度）
  // ============================================================

  function initSpaceShooter(container) {
    var W = 480;
    var H = 640;

    var difficulty = "medium";

    var scale = calcScale(container, W, H);
    var canvasW = Math.round(W * scale);
    var canvasH = Math.round(H * scale);

    var html =
      '<div class="game-container">' +
      '<div class="game-header">' +
      '<a href="#/games" class="back-link"><span class="arrow">←</span> 返回游戏大厅</a>' +
      '<div class="game-scoreboard">' +
      '<span class="game-label">🚀 星际战机</span>' +
      '<span class="game-score">得分：<strong id="ss-score">0</strong></span>' +
      '<span class="game-score">生命：<strong id="ss-lives">❤❤❤</strong></span>' +
      '<span class="game-clock" id="ss-clock">--:--:--</span>' +
      "</div>" +
      renderDifficultySelector("ss-diff", difficulty) +
      "</div>" +
      '<div class="game-canvas-wrap">' +
      '<canvas id="ss-canvas" width="' + W + '" height="' + H +
      '" style="width:' + canvasW + "px;height:" + canvasH + 'px"></canvas>' +
      "</div>" +
      '<div class="game-controls">' +
      '<p class="game-hint">↑ ↓ ← → 或 W A S D 移动 · 空格键发射子弹 · P 暂停</p>' +
      '<button class="game-btn" id="ss-restart">重新开始</button>' +
      "</div>" +
      "</div>";

    container.innerHTML = html;

    var canvas = document.getElementById("ss-canvas");
    var ctx = getCtx(canvas);
    var scoreEl = document.getElementById("ss-score");
    var livesEl = document.getElementById("ss-lives");

    // --- 游戏状态 ---
    var player = { x: W / 2, y: H - 85, w: 40, h: 44 };
    var bullets = [];
    var enemies = [];
    var enemyBullets = [];
    var explosions = [];
    var stars = [];
    var score = 0;
    var lives = 3;
    var gameOver = false;
    var paused = false;
    var gameStarted = false;
    var frameId = null;
    var shootCooldown = 0;
    var spawnTimer = 0;
    var frameCount = 0;
    var invincible = 0;
    var curSpawnInt = 48;
    var keys = {};

    for (var s = 0; s < 70; s++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.5,
        speed: Math.random() * 1.5 + 0.3,
        brightness: Math.random(),
      });
    }

    function getParams() {
      if (difficulty === "easy") return { lives: 5, spawnInterval: 110, enemySpeedMul: 0.4, enemyShootMul: 3.0 };
      if (difficulty === "hard") return { lives: 2, spawnInterval: 30, enemySpeedMul: 1.4, enemyShootMul: 0.6 };
      return { lives: 3, spawnInterval: 48, enemySpeedMul: 1.0, enemyShootMul: 1.0 }; // medium
    }

    function reset() {
      if (frameId) cancelAnimationFrame(frameId);
      var p = getParams();
      player = { x: W / 2, y: H - 85, w: 40, h: 44 };
      bullets = [];
      enemies = [];
      enemyBullets = [];
      explosions = [];
      score = 0;
      lives = p.lives;
      curSpawnInt = p.spawnInterval;
      gameOver = false;
      paused = false;
      gameStarted = false;
      shootCooldown = 0;
      spawnTimer = 0;
      frameCount = 0;
      invincible = 0;
      keys = {};
      scoreEl.textContent = "0";
      livesEl.innerHTML = Array(Math.max(0, lives)).fill("❤").join("");
      draw();
    }

    function spawnEnemy() {
      var types = ["basic", "fast", "tough"];
      var type = types[randInt(0, types.length)];
      var ew = type === "tough" ? 42 : 32;
      var eh = type === "tough" ? 38 : 28;
      enemies.push({
        x: randInt(10, W - ew - 10),
        y: -eh - randInt(0, 100),
        w: ew, h: eh, type: type,
        hp: type === "tough" ? 3 : 1,
        speed: (type === "fast" ? 3.5 : type === "tough" ? 1.2 : 2.2) * getParams().enemySpeedMul,
        shootTimer: randInt(25, 90),
      });
    }

    function fireBullet() {
      bullets.push({
        x: player.x + player.w / 2 - 2.5,
        y: player.y - 6,
        w: 5, h: 16, speed: 8,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // 星空
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, W, H);
      for (var si = 0; si < stars.length; si++) {
        var star = stars[si];
        ctx.fillStyle = "rgba(255,255,255," + (0.4 + star.brightness * 0.6) + ")";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 爆炸效果
      for (var ei = explosions.length - 1; ei >= 0; ei--) {
        var exp = explosions[ei];
        exp.life--;
        var alpha = exp.life / exp.maxLife;
        ctx.fillStyle = "rgba(255, " + Math.floor(200 * alpha) + ", 50, " + alpha + ")";
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.r * (1 + (exp.maxLife - exp.life) * 0.4), 0, Math.PI * 2);
        ctx.fill();
        if (exp.life <= 0) explosions.splice(ei, 1);
      }

      // 子弹
      ctx.fillStyle = "#f1c40f";
      for (var bi = 0; bi < bullets.length; bi++) {
        var b = bullets[bi];
        ctx.shadowColor = "#f1c40f";
        ctx.shadowBlur = 6;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur = 0;
      }

      // 敌方子弹
      ctx.fillStyle = "#e74c3c";
      for (var ebi = 0; ebi < enemyBullets.length; ebi++) {
        var eb = enemyBullets[ebi];
        ctx.shadowColor = "#e74c3c";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 敌人
      for (var eni = 0; eni < enemies.length; eni++) {
        var en = enemies[eni];
        var col = en.type === "basic" ? "#95a5a6" : en.type === "fast" ? "#e67e22" : "#8e44ad";
        ctx.fillStyle = col;
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(en.x + en.w * 0.2, en.y + en.h * 0.15, en.w * 0.6, en.h * 0.4);

        // 翅膀
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(en.x - 8, en.y + en.h * 0.4);
        ctx.lineTo(en.x, en.y + en.h * 0.3);
        ctx.lineTo(en.x, en.y + en.h * 0.6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(en.x + en.w + 8, en.y + en.h * 0.4);
        ctx.lineTo(en.x + en.w, en.y + en.h * 0.3);
        ctx.lineTo(en.x + en.w, en.y + en.h * 0.6);
        ctx.fill();

        if (en.type === "tough" && en.hp > 1) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(en.x - 2, en.y - 8, en.w + 4, 5);
          ctx.fillStyle = "#2ecc71";
          ctx.fillRect(en.x - 2, en.y - 8, (en.w + 4) * (en.hp / 3), 5);
        }
      }

      // 玩家（无敌闪烁）
      var drawPlayer = invincible <= 0 || Math.floor(invincible / 4) % 2 === 0;
      if (!gameOver && drawPlayer) {
        // 引擎火焰
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.moveTo(player.x + player.w * 0.28, player.y + player.h);
        ctx.lineTo(player.x + player.w / 2, player.y + player.h + 14 + Math.random() * 8);
        ctx.lineTo(player.x + player.w * 0.72, player.y + player.h);
        ctx.fill();
        ctx.fillStyle = "#f39c12";
        ctx.beginPath();
        ctx.moveTo(player.x + player.w * 0.33, player.y + player.h);
        ctx.lineTo(player.x + player.w / 2, player.y + player.h + 7 + Math.random() * 5);
        ctx.lineTo(player.x + player.w * 0.67, player.y + player.h);
        ctx.fill();

        // 机身
        ctx.fillStyle = "#3498db";
        ctx.beginPath();
        ctx.moveTo(player.x + player.w / 2, player.y);
        ctx.lineTo(player.x + player.w, player.y + player.h * 0.75);
        ctx.lineTo(player.x + player.w * 0.7, player.y + player.h);
        ctx.lineTo(player.x + player.w * 0.3, player.y + player.h);
        ctx.lineTo(player.x, player.y + player.h * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#2980b9";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 驾驶舱
        var cockpitGrad = ctx.createRadialGradient(
          player.x + player.w / 2, player.y + player.h * 0.28, 2,
          player.x + player.w / 2, player.y + player.h * 0.28, 9
        );
        cockpitGrad.addColorStop(0, "#fff");
        cockpitGrad.addColorStop(1, "#85c1e9");
        ctx.fillStyle = cockpitGrad;
        ctx.beginPath();
        ctx.ellipse(player.x + player.w / 2, player.y + player.h * 0.28, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 覆盖层
      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("游戏结束", W / 2, H / 2 - 14);
        ctx.font = "15px 'Noto Sans SC', sans-serif";
        ctx.fillText("最终得分：" + score + "  |  按 R 键重新开始", W / 2, H / 2 + 22);
        ctx.textAlign = "start";
      } else if (paused) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("暂停中", W / 2, H / 2);
        ctx.textAlign = "start";
      } else if (!gameStarted) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("按方向键开始游戏", W / 2, H / 2);
        ctx.textAlign = "start";
      }
    }

    function update() {
      if (gameOver) { frameId = requestAnimationFrame(loop); return; }
      if (paused || !gameStarted) { frameId = requestAnimationFrame(loop); draw(); return; }

      frameCount++;
      if (invincible > 0) invincible--;
      if (shootCooldown > 0) shootCooldown--;

      // 自动射击
      if (keys[" "] && shootCooldown <= 0) { fireBullet(); shootCooldown = 8; }

      // 玩家移动
      var spd = 5.5;
      if (keys["arrowleft"] || keys["a"]) player.x -= spd;
      if (keys["arrowright"] || keys["d"]) player.x += spd;
      if (keys["arrowup"] || keys["w"]) player.y -= spd;
      if (keys["arrowdown"] || keys["s"]) player.y += spd;
      player.x = Math.max(0, Math.min(W - player.w, player.x));
      player.y = Math.max(H * 0.3, Math.min(H - player.h, player.y));

      // 星星滚动
      for (var si = 0; si < stars.length; si++) {
        stars[si].y += stars[si].speed;
        if (stars[si].y > H) { stars[si].y = 0; stars[si].x = Math.random() * W; }
      }

      // 生成敌人
      spawnTimer++;
      if (spawnTimer >= curSpawnInt) { spawnTimer = 0; spawnEnemy(); }
      if (difficulty === "easy" && frameCount % 600 === 0 && curSpawnInt > 70) {
        curSpawnInt = Math.max(70, curSpawnInt - 1);
      } else if (difficulty !== "easy" && frameCount % 400 === 0 && curSpawnInt > 18) {
        curSpawnInt = Math.max(18, curSpawnInt - 3);
      }

      // 更新子弹
      for (var bi = bullets.length - 1; bi >= 0; bi--) {
        bullets[bi].y -= bullets[bi].speed;
        if (bullets[bi].y < -20) bullets.splice(bi, 1);
      }

      // 更新敌方子弹
      for (var ebi = enemyBullets.length - 1; ebi >= 0; ebi--) {
        enemyBullets[ebi].y += enemyBullets[ebi].speed;
        if (enemyBullets[ebi].y > H + 20) enemyBullets.splice(ebi, 1);
      }

      // 更新敌人
      for (var eni = enemies.length - 1; eni >= 0; eni--) {
        var en2 = enemies[eni];
        en2.y += en2.speed;

        // 敌人射击
        en2.shootTimer--;
        if (en2.shootTimer <= 0 && en2.y > 0 && en2.y < H) {
          enemyBullets.push({
            x: en2.x + en2.w / 2, y: en2.y + en2.h,
            r: 5, speed: en2.type === "fast" ? 5.5 : 3.5,
          });
          en2.shootTimer = randInt(35, 110) * getParams().enemyShootMul;
        }

        if (en2.y > H + 100) { enemies.splice(eni, 1); continue; }

        // 子弹 vs 敌人
        for (var bj = bullets.length - 1; bj >= 0; bj--) {
          var b2 = bullets[bj];
          if (rectCollide({ x: b2.x, y: b2.y, w: b2.w, h: b2.h }, { x: en2.x, y: en2.y, w: en2.w, h: en2.h })) {
            bullets.splice(bj, 1);
            en2.hp--;
            if (en2.hp <= 0) {
              explosions.push({ x: en2.x + en2.w / 2, y: en2.y + en2.h / 2, r: en2.w, life: 18, maxLife: 18 });
              score += en2.type === "tough" ? 30 : en2.type === "fast" ? 20 : 10;
              scoreEl.textContent = score;
              enemies.splice(eni, 1);
            }
            break;
          }
        }
        if (en2.hp <= 0 || enemies.length <= eni) continue;
      }

      // 敌方子弹 vs 玩家
      if (invincible <= 0) {
        for (var ebj = enemyBullets.length - 1; ebj >= 0; ebj--) {
          var eb2 = enemyBullets[ebj];
          if (rectCollide(
            { x: eb2.x - eb2.r, y: eb2.y - eb2.r, w: eb2.r * 2, h: eb2.r * 2 },
            { x: player.x, y: player.y, w: player.w, h: player.h }
          )) {
            enemyBullets.splice(ebj, 1);
            hitPlayer();
          }
        }
      }

      // 敌人 vs 玩家
      if (invincible <= 0) {
        for (var enj = enemies.length - 1; enj >= 0; enj--) {
          var en3 = enemies[enj];
          if (rectCollide({ x: en3.x, y: en3.y, w: en3.w, h: en3.h }, { x: player.x, y: player.y, w: player.w, h: player.h })) {
            explosions.push({ x: en3.x + en3.w / 2, y: en3.y + en3.h / 2, r: en3.w, life: 18, maxLife: 18 });
            enemies.splice(enj, 1);
            hitPlayer();
          }
        }
      }

      draw();
      frameId = requestAnimationFrame(loop);
    }

    function hitPlayer() {
      lives--;
      livesEl.innerHTML = Array(Math.max(0, lives)).fill("❤").join("");
      invincible = 100;
      explosions.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, r: 24, life: 22, maxLife: 22 });
      if (lives <= 0) { gameOver = true; draw(); }
    }

    function loop() { update(); }

    function onKeyDown(e) {
      var key = e.key.toLowerCase();
      keys[key] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(key) !== -1) e.preventDefault();
      if (!gameStarted && !gameOver) { gameStarted = true; frameId = requestAnimationFrame(loop); }
      if (key === "p" && !gameOver) { paused = !paused; draw(); }
      if (key === "r" && gameOver) { reset(); frameId = requestAnimationFrame(loop); }
    }

    function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }

    // 移动端虚拟摇杆
    function setupMobileControls() {
      var ctrlDiv = document.createElement("div");
      ctrlDiv.className = "mobile-ctrl";
      ctrlDiv.innerHTML =
        '<div class="mc-dpad">' +
        '<button class="mc-btn" data-key="arrowup">▲</button>' +
        '<div class="mc-dpad-mid">' +
        '<button class="mc-btn" data-key="arrowleft">◀</button>' +
        '<button class="mc-btn mc-fire" data-key=" ">🔥</button>' +
        '<button class="mc-btn" data-key="arrowright">▶</button>' +
        "</div>" +
        '<button class="mc-btn" data-key="arrowdown">▼</button>' +
        "</div>";
      canvas.parentNode.appendChild(ctrlDiv);

      ctrlDiv.querySelectorAll(".mc-btn").forEach(function (btn) {
        btn.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          keys[btn.dataset.key] = true;
          if (!gameStarted && !gameOver) { gameStarted = true; frameId = requestAnimationFrame(loop); }
        });
        btn.addEventListener("pointerup", function (e) { e.preventDefault(); keys[btn.dataset.key] = false; });
        btn.addEventListener("pointerleave", function () { keys[btn.dataset.key] = false; });
      });
    }

    function bindDifficulty() {
      ["easy", "medium", "hard"].forEach(function (d) {
        var btn = document.getElementById("ss-diff-" + d);
        if (btn) {
          btn.addEventListener("click", function () {
            difficulty = d;
            ["easy", "medium", "hard"].forEach(function (x) {
              var b = document.getElementById("ss-diff-" + x);
              if (b) b.classList.toggle("active", x === d);
            });
            reset();
            frameId = requestAnimationFrame(loop);
          });
        }
      });
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.getElementById("ss-restart").addEventListener("click", function () {
      reset();
      frameId = requestAnimationFrame(loop);
    });
    bindDifficulty();
    reset();
    draw();
    setupMobileControls();

    var stopClock = startClock("ss-clock");

    return function cleanup() {
      stopClock();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }

  // ============================================================
  // 5. 导出到全局
  // ============================================================

  window.Games = {
    renderHub: renderGameHub,
    initSnake: initSnake,
    initRollingSky: initRollingSky,
    initSpaceShooter: initSpaceShooter,
  };
})();
