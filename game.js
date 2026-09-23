(() => {
  "use strict";

  const canvas = document.querySelector("#court");
  const ctx = canvas.getContext("2d");
  const ui = {
    playerScore: document.querySelector("#playerScore"),
    aiScore: document.querySelector("#aiScore"),
    server: document.querySelector("#serverLabel"),
    rally: document.querySelector("#rallyLabel"),
    message: document.querySelector("#message"),
    messageTitle: document.querySelector("#messageTitle"),
    messageBody: document.querySelector("#messageBody"),
    messageButton: document.querySelector("#messageButton"),
    serve: document.querySelector("#serveButton"),
    serveSpeed: document.querySelector("#serveSpeedButton"),
    random: document.querySelector("#randomButton"),
    mode: document.querySelector("#modeButton"),
    modeLabel: document.querySelector("#modeLabel"),
    modeMenu: document.querySelector("#modeMenu"),
    faces: document.querySelector("#facesButton"),
    emojiPanel: document.querySelector("#emojiPanel"),
    emojiDone: document.querySelector("#emojiDoneButton"),
    restart: document.querySelector("#restartButton"),
    sound: document.querySelector("#soundButton"),
    challenges: document.querySelector("#challengesButton"),
    challengePanel: document.querySelector("#challengePanel"),
    challengeClose: document.querySelector("#challengeCloseButton"),
    challengeDone: document.querySelector("#challengeDoneButton"),
    streakProgress: document.querySelector("#streakProgress"),
    streakBest: document.querySelector("#streakBest"),
    warmupProgress: document.querySelector("#warmupProgress"),
    proProgress: document.querySelector("#proProgress"),
    allCourtProgress: document.querySelector("#allCourtProgress"),
    warmupChallenge: document.querySelector("#warmupChallenge"),
    proChallenge: document.querySelector("#proChallenge"),
    allCourtChallenge: document.querySelector("#allCourtChallenge"),
    fireReward: document.querySelector("#fireReward"),
    lightningReward: document.querySelector("#lightningReward"),
    goldReward: document.querySelector("#goldReward"),
    normalBallEquip: document.querySelector("#normalBallEquip"),
    fireBallEquip: document.querySelector("#fireBallEquip"),
    lightningBallEquip: document.querySelector("#lightningBallEquip"),
    normalPaddleEquip: document.querySelector("#normalPaddleEquip"),
    goldPaddleEquip: document.querySelector("#goldPaddleEquip")
  };

  const W = canvas.width, H = canvas.height;
  const court = {
    left: 58, right: W - 58, top: 42, bottom: H - 42, netY: H / 2,
    topKitchen: H / 2 - 105, bottomKitchen: H / 2 + 105
  };
  const difficulty = {
    learn: { aiSpeed: 4.1, returnSpeed: 7.2, error: 72, reaction: 0.075 },
    beginner: { aiSpeed: 5.0, returnSpeed: 8.2, error: 48, reaction: 0.10 },
    club: { aiSpeed: 6.6, returnSpeed: 10.3, error: 28, reaction: 0.15 },
    pro: { aiSpeed: 8.1, returnSpeed: 11.4, error: 14, reaction: 0.21 },
    champion: { aiSpeed: 8.5, returnSpeed: 11.2, error: 7, reaction: 0.24 }
  };
  const modeLabels = {
    learn: "How to Play",
    beginner: "Beginner",
    club: "Club Player",
    pro: "Pro"
  };

  let level = "learn";
  let soundOn = true;
  let running = false;
  let waitingForServe = true;
  let server = "player";
  let lastHitter = "player";
  let playerScore = 0, aiScore = 0, rally = 0, tutorialStep = 0;
  let lastTime = performance.now();
  let serveGeneration = 0;
  const speedNames = ["Slow", "Normal", "Fast"];
  const levelShotSpeeds = {
    learn: [7.4, 8.6, 9.8],
    beginner: [8.6, 10.2, 12.0],
    club: [9.8, 11.8, 13.8],
    pro: [11.0, 13.0, 15.2],
    champion: [10.6, 12.6, 14.8]
  };
  let serveSpeedIndex = 1;
  let randomSpeedOn = false;
  let playerEmoji = "🙂";
  let rivalEmoji = "😎";

  const challengeKey = "picklePopChallengesV25";
  const defaultChallengeState = {
    winStreak: 0, proBest: 0, levelsPlayed: [], levelsWon: [],
    fireBall: false, lightningBall: false, goldPaddle: false,
    equippedBall: "normal", equippedPaddle: "normal", dailyStreak: 0, bestDailyStreak: 0, lastPlayDate: ""
  };
  let challengeState;
  try {
    challengeState = { ...defaultChallengeState, ...JSON.parse(localStorage.getItem(challengeKey) || "{}") };
  } catch (_) { challengeState = { ...defaultChallengeState }; }
  if (!Array.isArray(challengeState.levelsPlayed)) challengeState.levelsPlayed = [];
  if (!Array.isArray(challengeState.levelsWon)) challengeState.levelsWon = [];

  function saveChallenges() {
    try { localStorage.setItem(challengeKey, JSON.stringify(challengeState)); } catch (_) {}
  }

  function updateChallengeUI() {
    const won = challengeState.levelsWon || [];
    ui.warmupProgress.textContent = challengeState.fireBall ? "✓ COMPLETE · 🔥 Fire Ball unlocked" : `${Math.min(2, challengeState.winStreak)} / 2 consecutive wins · Reward: 🔥 Fire Ball`;
    ui.proProgress.textContent = challengeState.lightningBall ? "✓ COMPLETE · ⚡ Lightning Ball unlocked" : `Best: ${Math.min(7, challengeState.proBest)} / 7 · Reward: ⚡ Lightning Ball`;
    ui.allCourtProgress.textContent = challengeState.goldPaddle ? "✓ COMPLETE · 🏆 Gold Paddle unlocked" : `${won.length} / 3 levels won · Beginner ${won.includes("beginner") ? "✓" : "○"} · Club ${won.includes("club") ? "✓" : "○"} · Pro ${won.includes("pro") ? "✓" : "○"}`;
    ui.warmupChallenge.classList.toggle("complete", challengeState.fireBall);
    ui.proChallenge.classList.toggle("complete", challengeState.lightningBall);
    ui.allCourtChallenge.classList.toggle("complete", challengeState.goldPaddle);
    ui.fireReward.textContent = challengeState.fireBall ? "🔥 Fire Ball · UNLOCKED" : "🔒 Fire Ball · Win 2 consecutive matches";
    ui.lightningReward.textContent = challengeState.lightningBall ? "⚡ Lightning Ball · UNLOCKED" : "🔒 Lightning Ball · Score 7 against Pro";
    ui.goldReward.textContent = challengeState.goldPaddle ? "🏆 Gold Paddle · UNLOCKED" : "🔒 Gold Paddle · Win Beginner + Club + Pro";
    ui.normalBallEquip.textContent = challengeState.equippedBall === "normal" ? "EQUIPPED" : "EQUIP";
    ui.fireBallEquip.disabled = !challengeState.fireBall; ui.fireBallEquip.textContent = !challengeState.fireBall ? "LOCKED" : (challengeState.equippedBall === "fire" ? "EQUIPPED" : "EQUIP");
    ui.lightningBallEquip.disabled = !challengeState.lightningBall; ui.lightningBallEquip.textContent = !challengeState.lightningBall ? "LOCKED" : (challengeState.equippedBall === "lightning" ? "EQUIPPED" : "EQUIP");
    ui.normalPaddleEquip.textContent = challengeState.equippedPaddle === "normal" ? "EQUIPPED" : "EQUIP";
    ui.goldPaddleEquip.disabled = !challengeState.goldPaddle; ui.goldPaddleEquip.textContent = !challengeState.goldPaddle ? "LOCKED" : (challengeState.equippedPaddle === "gold" ? "EQUIPPED" : "EQUIP");
    ui.streakProgress.textContent = `${challengeState.dailyStreak} day streak`;
    ui.streakBest.textContent = `Best: ${challengeState.bestDailyStreak} days · Complete one match each day to keep it growing.`;
  }

  function recordDailyPlay() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    if (challengeState.lastPlayDate === today) return;
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,"0")}-${String(yesterday.getDate()).padStart(2,"0")}`;
    challengeState.dailyStreak = challengeState.lastPlayDate === y ? challengeState.dailyStreak + 1 : 1;
    challengeState.bestDailyStreak = Math.max(challengeState.bestDailyStreak, challengeState.dailyStreak);
    challengeState.lastPlayDate = today;
  }

  function recordCompletedMatch(playerWon) {
    if (level === "learn") return null;
    recordDailyPlay();
    if (!challengeState.levelsPlayed.includes(level)) challengeState.levelsPlayed.push(level);
    if (playerWon && !challengeState.levelsWon.includes(level)) challengeState.levelsWon.push(level);
    challengeState.winStreak = playerWon ? challengeState.winStreak + 1 : 0;
    if (level === "pro") challengeState.proBest = Math.max(challengeState.proBest, playerScore);
    let unlocked = null;
    if (!challengeState.fireBall && challengeState.winStreak >= 2) {
      challengeState.fireBall = true; challengeState.equippedBall = "fire"; unlocked = "fire";
    }
    if (!challengeState.lightningBall && challengeState.proBest >= 7) { challengeState.lightningBall = true; unlocked ||= "lightning"; }
    if (!challengeState.goldPaddle && ["beginner","club","pro"].every(x => challengeState.levelsWon.includes(x))) { challengeState.goldPaddle = true; challengeState.equippedPaddle = "gold"; unlocked ||= "gold"; }
    saveChallenges(); updateChallengeUI(); return unlocked;
  }

  const player = { x: W / 2, y: court.bottom - 34, w: 138, h: 24, targetX: W / 2 };
  const ai = { x: W / 2, y: court.top + 34, w: 138, h: 24, targetX: W / 2 };
  const ball = { x: W / 2, y: player.y - 34, r: 15, vx: 0, vy: 0, curve: 0, trail: [], serving: false };
  const serveTarget = { x: W / 2, y: court.top + 180, visible: false };

  let audio;
  function tone(freq = 440, length = .055) {
    if (!soundOn) return;
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.frequency.value = freq; gain.gain.setValueAtTime(.11, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + length);
    osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + length);
  }

  function resetBall() {
    const thisServe = ++serveGeneration;
    waitingForServe = true; running = false; rally = 0; ball.trail.length = 0;
    ball.vx = ball.vy = ball.curve = 0;
    ball.serving = false; serveTarget.visible = false;
    const score = server === "player" ? playerScore : aiScore;
    const evenSide = score % 2 === 0;
    const halfCourtWidth = (court.right - court.left) / 2;
    const leftBoxCenter = court.left + halfCourtWidth / 2;
    const rightBoxCenter = court.right - halfCourtWidth / 2;
    if (server === "player") {
      player.x = player.targetX = evenSide ? rightBoxCenter : leftBoxCenter;
      ai.x = ai.targetX = evenSide ? leftBoxCenter : rightBoxCenter;
      ball.x = player.x; ball.y = player.y - 34;
      ui.serve.textContent = "TAP TO SERVE"; ui.serve.classList.remove("hidden");
    } else {
      ai.x = ai.targetX = evenSide ? leftBoxCenter : rightBoxCenter;
      player.x = player.targetX = evenSide ? rightBoxCenter : leftBoxCenter;
      ball.x = ai.x; ball.y = ai.y + 34; ui.serve.classList.add("hidden");
      setTimeout(() => {
        if (thisServe === serveGeneration && waitingForServe && server === "ai") serveBall();
      }, 2300);
    }
    updateUI();
  }

  function chooseShotSpeed(baseSpeed, shotType) {
    let useRandomSpeed = false;
    if (level === "pro") {
      useRandomSpeed = true;
    } else if (level === "club" && shotType === "return") {
      useRandomSpeed = Math.random() < .5;
    } else if (shotType === "serve") {
      useRandomSpeed = randomSpeedOn;
    }

    if (!useRandomSpeed) {
      ball.curve = 0;
      return baseSpeed;
    }

    // Every serve and every return independently uses one of the same three
    // exact speeds. Direction remains controlled only by paddle contact.
    ball.curve = 0;
    const choices = levelShotSpeeds[level];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function serveBall() {
    waitingForServe = false; running = true; ui.serve.classList.add("hidden");
    const dir = server === "player" ? -1 : 1;
    lastHitter = server;
    const serverScore = server === "player" ? playerScore : aiScore;
    const servesFromRight = serverScore % 2 === 0;
    // A legal serve must cross diagonally and land beyond the non-volley line.
    const halfCourtWidth = (court.right - court.left) / 2;
    const leftBoxCenter = court.left + halfCourtWidth / 2;
    const rightBoxCenter = court.right - halfCourtWidth / 2;
    if (server === "player") {
      serveTarget.x = servesFromRight ? leftBoxCenter : rightBoxCenter;
    } else {
      serveTarget.x = servesFromRight ? rightBoxCenter : leftBoxCenter;
    }
    serveTarget.y = server === "player"
      ? (court.top + court.topKitchen) / 2
      : (court.bottomKitchen + court.bottom) / 2;
    // Fair-serve guard: at the instant an AI serve launches, place the player
    // in the service box the ball is actually targeting. This prevents a
    // stale drag/target position during the pre-serve delay from stranding
    // the receiver on the wrong side of the court.
    if (server === "ai") {
      player.x = player.targetX = serveTarget.x;
    }
    serveTarget.visible = true; ball.serving = true;
    const serveSpeed = chooseShotSpeed(levelShotSpeeds[level][serveSpeedIndex], "serve");
    const travelFrames = Math.abs(serveTarget.y - ball.y) / serveSpeed;
    ball.vx = (serveTarget.x - ball.x) / travelFrames;
    ball.vy = dir * serveSpeed;
    tone(520);
  }

  function updateUI() {
    ui.playerScore.textContent = playerScore;
    ui.aiScore.textContent = aiScore;
    ui.server.textContent = server === "player" ? "YOUR SERVE" : "RIVAL SERVES";
    ui.rally.textContent = `Rally: ${rally}`;
  }

  function showMessage(title, body, button = "CONTINUE", action) {
    running = false;
    ui.messageTitle.textContent = title; ui.messageBody.textContent = body;
    ui.messageButton.textContent = button; ui.message.classList.add("visible");
    ui.messageButton.onclick = () => {
      ui.message.classList.remove("visible");
      action?.();
    };
  }

  function point(winner) {
    running = false; tone(winner === "player" ? 760 : 190, .12);
    let sideOut = false;
    if (winner === server) {
      if (winner === "player") playerScore++; else aiScore++;
    } else {
      server = winner;
      sideOut = true;
    }
    updateUI();
    if (sideOut) ui.server.textContent = "SIDE OUT";

    const won = (playerScore >= 11 || aiScore >= 11) && Math.abs(playerScore - aiScore) >= 2;
    if (won) {
      const playerWon = playerScore > aiScore;
      const unlocked = recordCompletedMatch(playerWon);
      if (unlocked === "fire") {
        showMessage("🏆 CHALLENGE COMPLETE!", "Two wins in a row! 🔥 FIRE BALL UNLOCKED — and equipped for your next match.", "PLAY WITH FIRE BALL", startMatch);
      } else if (unlocked === "lightning") {
        showMessage("🏆 PRO CHALLENGE COMPLETE!", "You scored 7 against Pro! ⚡ LIGHTNING BALL UNLOCKED.", "PLAY AGAIN", startMatch);
      } else if (unlocked === "gold") {
        showMessage("🏆 ALL-COURT COMPLETE!", "You WON Beginner, Club and Pro! 🏆 GOLD PADDLE UNLOCKED — and equipped.", "PLAY AGAIN", startMatch);
      } else {
        showMessage(playerWon ? "You won!" : "Good match!", playerWon
          ? "Nice court coverage. Your challenge progress has been saved."
          : "You are learning the angles. Your challenge progress has been saved.",
          "PLAY AGAIN", startMatch);
      }
      return;
    }

    if (level === "learn" && tutorialStep === 1 && rally >= 2) {
      tutorialStep = 2;
      showMessage("Aim with movement", "Meet the ball left or right of center to send it at an angle.", "GOT IT", resetBall);
    } else {
      setTimeout(resetBall, sideOut ? 950 : 480);
    }
  }

  function paddleHit(p, towardTop) {
    const offset = (ball.x - p.x) / (p.w / 2);
    const base = chooseShotSpeed(p === player ? levelShotSpeeds[level][serveSpeedIndex] : difficulty[level].returnSpeed, "return");
    const receivingServe = ball.serving;
    lastHitter = p === player ? "player" : "ai";
    ball.serving = false; serveTarget.visible = false;
    ball.vy = (towardTop ? -1 : 1) * base;
    // A broad sweet spot makes direction deliberate without turning a tiny
    // paddle movement into an automatic out ball.
    const contact = Math.min(1, Math.abs(offset));
    let angleStrength;
    if (contact <= .8) {
      angleStrength = (contact / .8) * 1.15;
    } else {
      // The outer 10% at each end is the action zone: a clean edge contact
      // ramps quickly into a sharp cross-court return.
      angleStrength = 1.15 + ((contact - .8) / .2) * 3.15;
    }
    const playerAngle = Math.sign(offset) * angleStrength;
    // Keep Beginner fair: the rival should not paint unreachable sidelines.
    // Club can use wider angles; Pro keeps the full dangerous court.
    const aiAngleLimit = level === "beginner" ? 1.65 : level === "club" ? 2.65 : 3.7;
    const aiAngle = Math.max(-aiAngleLimit, Math.min(aiAngleLimit, offset * 3.2 + (Math.random() - .5) * difficulty[level].error / 18));
    if (receivingServe && level === "learn") {
      // Keep the first return in play during instruction. Directional
      // control begins with the next shot in the rally.
      const destinationFrames = 62;
      ball.vx = (W / 2 - ball.x) / destinationFrames;
    } else {
      ball.vx = p === player ? playerAngle : aiAngle;
    }
    ball.y = towardTop ? p.y - p.h / 2 - ball.r - 1 : p.y + p.h / 2 + ball.r + 1;
    rally++;
    updateUI(); tone(330 + Math.min(280, rally * 15));
    if (level === "learn" && tutorialStep === 0) {
      tutorialStep = 1;
    }
  }

  function update(dt) {
    const scale = dt / 16.667;
    if (waitingForServe) {
      const owner = server === "player" ? player : ai;
      ball.x = owner.x; ball.y = owner.y + (server === "player" ? -34 : 34);
      return;
    }
    player.x += (player.targetX - player.x) * Math.min(1, .16 * scale);
    player.x = Math.max(court.left + player.w / 2, Math.min(court.right - player.w / 2, player.x));

    const d = difficulty[level];
    if (ball.vy < 0 && ball.y < court.netY + 120) {
      const prediction = ball.x + ball.vx * Math.max(0, (ai.y - ball.y) / Math.min(-.1, ball.vy));
      ai.targetX += (prediction - ai.targetX) * d.reaction * scale;
    } else ai.targetX += (W / 2 - ai.targetX) * .02 * scale;
    const aiDelta = Math.max(-d.aiSpeed * scale, Math.min(d.aiSpeed * scale, ai.targetX - ai.x));
    ai.x += aiDelta;
    ai.x = Math.max(court.left + ai.w / 2, Math.min(court.right - ai.w / 2, ai.x));

    if (!running) return;

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 7) ball.trail.shift();
    ball.x += ball.vx * scale; ball.y += ball.vy * scale;
    ball.vx += ball.curve * scale;

    // Pickleballs do not rebound from a wall. Crossing a sideline is out.
    if (ball.x + ball.r < court.left || ball.x - ball.r > court.right) {
      point(lastHitter === "player" ? "ai" : "player");
      return;
    }

    if (ball.vy > 0 && ball.y + ball.r >= player.y - player.h / 2 && ball.y < player.y + player.h && Math.abs(ball.x - player.x) < player.w / 2 + ball.r) {
      paddleHit(player, true);
    }
    if (ball.vy < 0 && ball.y - ball.r <= ai.y + ai.h / 2 && ball.y > ai.y - ai.h && Math.abs(ball.x - ai.x) < ai.w / 2 + ball.r) {
      paddleHit(ai, false);
    }

    if (ball.y < court.top - 30) point("player");
    if (ball.y > court.bottom + 30) point("ai");
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  }

  function draw() {
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "#287f78"); grd.addColorStop(1, "#36a077");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,.045)";
    for (let y = 0; y < H; y += 56) ctx.fillRect(0, y, W, 28);

    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 5;
    ctx.strokeRect(court.left, court.top, court.right - court.left, court.bottom - court.top);
    ctx.beginPath(); ctx.moveTo(W / 2, court.top); ctx.lineTo(W / 2, court.netY - 105); ctx.moveTo(W / 2, court.netY + 105); ctx.lineTo(W / 2, court.bottom); ctx.stroke();
    ctx.fillStyle = "rgba(230,190,70,.23)";
    ctx.fillRect(court.left, court.topKitchen, court.right - court.left, court.bottomKitchen - court.topKitchen);
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(court.left, court.topKitchen); ctx.lineTo(court.right, court.topKitchen);
    ctx.moveTo(court.left, court.bottomKitchen); ctx.lineTo(court.right, court.bottomKitchen);
    ctx.stroke();
    ctx.strokeStyle = "#f6f0db"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(court.left - 10, court.netY); ctx.lineTo(court.right + 10, court.netY); ctx.stroke();
    ctx.strokeStyle = "rgba(16,42,67,.65)"; ctx.lineWidth = 2;
    for (let x = court.left; x < court.right; x += 18) { ctx.beginPath(); ctx.moveTo(x, court.netY - 5); ctx.lineTo(x, court.netY + 5); ctx.stroke(); }

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "700 18px Segoe UI"; ctx.textAlign = "center";
    ctx.fillText("NON-VOLLEY ZONE", W / 2, court.netY - 65);
    ctx.fillText("NON-VOLLEY ZONE", W / 2, court.netY + 82);
    ctx.restore();

    if (serveTarget.visible) {
      ctx.save(); ctx.strokeStyle = "rgba(229,255,56,.85)"; ctx.lineWidth = 5;
      ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.arc(serveTarget.x, serveTarget.y, 42, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = "rgba(229,255,56,.13)"; ctx.beginPath(); ctx.arc(serveTarget.x, serveTarget.y, 42, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    if (waitingForServe) {
      const activeServer = server === "player" ? player : ai;
      ctx.save(); ctx.strokeStyle = "#e5ff38"; ctx.lineWidth = 8; ctx.globalAlpha = .82;
      ctx.beginPath(); ctx.roundRect(activeServer.x - activeServer.w / 2 - 10, activeServer.y - activeServer.h / 2 - 10, activeServer.w + 20, activeServer.h + 20, 20); ctx.stroke();
      ctx.restore();
    }

    // The paddles do not enter the kitchen in this arcade version, so each
    // personality stays large, visible, and out of the action there.
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.font = '82px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rivalEmoji, W / 2, (court.topKitchen + court.netY) / 2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.font = '82px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(playerEmoji, W / 2, (court.netY + court.bottomKitchen) / 2);
    ctx.restore();

    /* Duplicate server highlight disabled; the activeServer block above is authoritative.
    if (waitingForServe) {
      const servingPaddle = server === "player" ? player : ai;
      ctx.strokeStyle = "#e5ff38"; ctx.lineWidth = 9;луп://;
eti;
      ctx.beginPath(); ctx.roundRect(servingPaddle.x - servingPaddle.w / 2 - 7, servingPaddle.y - servingPaddle.h / 2 - 7, servingPaddle.w + 14, servingPaddle.h + 14, 16); ctx.stroke();
    }
    */
    ctx.fillStyle = challengeState.equippedPaddle === "gold" && challengeState.goldPaddle ? "#ffd54a" : "#ff8c42"; ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 12;
    roundedRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h, 12);
    ctx.fillStyle = "#c5e7ff"; roundedRect(ai.x - ai.w / 2, ai.y - ai.h / 2, ai.w, ai.h, 12);
    ctx.shadowBlur = 0;

    ball.trail.forEach((p, i) => {
      ctx.globalAlpha = (i + 1) / ball.trail.length * .22; ctx.fillStyle = "#e7ff55";
      ctx.beginPath(); ctx.arc(p.x, p.y, ball.r * (i + 1) / ball.trail.length, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (challengeState.equippedBall === "fire" && challengeState.fireBall) {
      ctx.shadowColor = "rgba(255,120,20,.75)"; ctx.shadowBlur = 16;
      ctx.font = '38px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🔥", ball.x, ball.y); ctx.shadowBlur = 0;
    } else if (challengeState.equippedBall === "lightning" && challengeState.lightningBall) {
      ctx.shadowColor = "rgba(255,235,80,.8)"; ctx.shadowBlur = 16;
      ctx.font = '38px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("⚡", ball.x, ball.y); ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = "#e5ff38"; ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(30,55,20,.55)";
      [[-5,-4],[5,3],[-2,7]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(ball.x+x,ball.y+y,1.8,0,Math.PI*2);ctx.fill(); });
    }
  }

  function frame(now) {
    const dt = Math.min(34, now - lastTime); lastTime = now;
    update(dt); draw(); requestAnimationFrame(frame);
  }

  function pointerX(e) {
    const rect = canvas.getBoundingClientRect();
    return (e.clientX - rect.left) * W / rect.width;
  }
  canvas.addEventListener("pointerdown", e => { player.targetX = pointerX(e); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => { if (e.buttons || e.pointerType === "touch") player.targetX = pointerX(e); });
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") player.targetX -= 85;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") player.targetX += 85;
    if (e.code === "Space" && waitingForServe && server === "player") serveBall();
  });

  function startMatch() {
    playerScore = aiScore = rally = tutorialStep = 0; server = "player";
    player.x = player.targetX = ai.x = ai.targetX = W / 2; resetBall();
  }

  function chooseLevel(nextLevel) {
    level = nextLevel;
    ui.modeLabel.textContent = modeLabels[level];
    ui.random.disabled = level === "pro";
    ui.random.textContent = level === "pro"
      ? "Random: Always"
      : randomSpeedOn ? "Random serves: On" : "Random serves: Off";
    ui.random.classList.toggle("active", level === "pro" || randomSpeedOn);
    ui.modeMenu.classList.add("hidden");
    ui.message.classList.remove("visible");
    if (level === "learn") {
      showMessage(
        "How to Play",
        "Drag anywhere on the court. The orange paddle follows your finger. Only the server can score.",
        "READY",
        startMatch
      );
    } else {
      startMatch();
    }
  }

  ui.serve.addEventListener("click", serveBall);
  ui.serveSpeed.addEventListener("click", () => {
    serveSpeedIndex = (serveSpeedIndex + 1) % speedNames.length;
    ui.serveSpeed.textContent = `Serve: ${speedNames[serveSpeedIndex]}`;
  });
  ui.random.addEventListener("click", () => {
    randomSpeedOn = !randomSpeedOn;
    ui.random.textContent = randomSpeedOn ? "Random serves: On" : "Random serves: Off";
    ui.random.classList.toggle("active", randomSpeedOn);
    if (!randomSpeedOn) ball.curve = 0;
  });
  ui.faces.addEventListener("click", () => ui.emojiPanel.classList.remove("hidden"));
  ui.emojiDone.addEventListener("click", () => ui.emojiPanel.classList.add("hidden"));
  document.querySelectorAll(".emoji-row button").forEach(button => {
    button.addEventListener("click", () => {
      const row = button.closest(".emoji-row");
      row.querySelectorAll("button").forEach(choice => choice.classList.remove("selected"));
      button.classList.add("selected");
      if (row.dataset.side === "player") {
        playerEmoji = button.textContent;
        ui.faces.textContent = playerEmoji;
      } else {
        rivalEmoji = button.textContent;
      }
    });
  });
  let challengeWasRunning = false;
  function openChallenges() {
    challengeWasRunning = running;
    running = false;
    ui.serve.classList.add("hidden");
    ui.emojiPanel.classList.add("hidden");
    ui.challengePanel.classList.remove("hidden");
  }
  function closeChallenges() {
    ui.challengePanel.classList.add("hidden");
    running = challengeWasRunning;
    if (waitingForServe && server === "player") ui.serve.classList.remove("hidden");
  }

  function equipReward(kind, value) {
    if (kind === "ball") {
      if (value === "fire" && !challengeState.fireBall) return;
      if (value === "lightning" && !challengeState.lightningBall) return;
      challengeState.equippedBall = value;
    } else {
      if (value === "gold" && !challengeState.goldPaddle) return;
      challengeState.equippedPaddle = value;
    }
    saveChallenges(); updateChallengeUI(); draw();
  }
  ui.normalBallEquip.addEventListener("click", () => equipReward("ball", "normal"));
  ui.fireBallEquip.addEventListener("click", () => equipReward("ball", "fire"));
  ui.lightningBallEquip.addEventListener("click", () => equipReward("ball", "lightning"));
  ui.normalPaddleEquip.addEventListener("click", () => equipReward("paddle", "normal"));
  ui.goldPaddleEquip.addEventListener("click", () => equipReward("paddle", "gold"));
  ui.challenges.addEventListener("click", openChallenges);
  ui.challengeClose.addEventListener("click", closeChallenges);
  ui.challengeDone.addEventListener("click", closeChallenges);

  ui.restart.addEventListener("click", () => showMessage("Restart this match?", "Your current score will be cleared.", "RESTART", startMatch));
  ui.sound.addEventListener("click", () => { soundOn = !soundOn; ui.sound.textContent = soundOn ? "🔊" : "🔇"; });
  document.querySelectorAll("#modeMenu [data-level]").forEach(button => {
    button.addEventListener("click", () => chooseLevel(button.dataset.level));
  });
  ui.mode.addEventListener("click", () => {
    running = false;
    waitingForServe = true;
    serveGeneration++;
    ui.serve.classList.add("hidden");
    ui.message.classList.remove("visible");
    ui.emojiPanel.classList.add("hidden");
    ui.challengePanel.classList.add("hidden");
    ui.modeMenu.classList.remove("hidden");
  });

  updateChallengeUI(); updateUI(); draw(); requestAnimationFrame(frame);
})();
