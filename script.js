const score = document.querySelector(".score");
const startBtn = document.querySelector(".start");
const gameArea = document.querySelector(".gameArea");
const pauseScreen = document.querySelector("#pauseScreen");
const pauseScore = document.querySelector("#pauseScore");
const resumeBtn = document.querySelector(".resumeBtn");
const gameOverScreen = document.querySelector("#gameOverScreen");
const gameOverScore = document.querySelector("#gameOverScore");
const gameOverSpeed = document.querySelector("#gameOverSpeed");
const playAgainBtn = document.querySelector(".playAgainBtn");

let player = {
  speed: 5,
  score: 0,
  isGamePaused: false,
  start: false,
  x: 0,
  y: 0,
  displaySpeed: 30, // Display speed in km/h
  lastSpeedIncrease: 0 // Track last speed increase score
};

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowRight: false,
  ArrowLeft: false,
  Space: false,
};

let lines = [];
let enemies = [];
let car;

// Touch handling variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

startBtn.addEventListener("click", () => start(1));
playAgainBtn.addEventListener("click", () => start(1));
resumeBtn.addEventListener("click", () => togglePause());
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

// Touch event listeners
gameArea.addEventListener("touchstart", handleTouchStart, { passive: false });
gameArea.addEventListener("touchend", handleTouchEnd, { passive: false });

// Prevent default touch behaviors
document.addEventListener("touchstart", (e) => {
  e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", (e) => {
  e.preventDefault();
}, { passive: false });

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
  
  handleSwipe();
}

function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const minSwipeDistance = 30;
  
  // Only handle left/right swipes for mobile
  if (Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      // Swipe right
      keys.ArrowRight = true;
      setTimeout(() => keys.ArrowRight = false, 200);
    } else {
      // Swipe left
      keys.ArrowLeft = true;
      setTimeout(() => keys.ArrowLeft = false, 200);
    }
  }
}

function pressOn(e) {
  e.preventDefault();
  keys[e.key] = true;
  if (e.code === "Space") {
    togglePause();
  }
}

function pressOff(e) {
  e.preventDefault();
  keys[e.key] = false;
}

function togglePause() {
  player.isGamePaused = !player.isGamePaused;
  if (player.isGamePaused) {
    pauseScreen.classList.remove("hide");
    pauseScore.textContent = `Score: ${player.score}`;
  } else {
    pauseScreen.classList.add("hide");
    if (player.start) {
      window.requestAnimationFrame(playGame);
    }
  }
}

function moveLines() {
  lines.forEach(function (item) {
    if (item.y >= gameArea.offsetHeight) {
      item.y -= gameArea.offsetHeight + 100;
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function isCollide(a, b) {
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function moveEnemy() {
  enemies.forEach(function (item) {
    if (isCollide(car, item)) {
      // Game over immediately on collision
      endGame();
      return;
    }
    if (item.y >= gameArea.offsetHeight) {
      item.y = -600;
      item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + "px";
      item.style.backgroundColor = randomColor();
      // Add score for avoiding enemy
      player.score += 10;
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function playGame() {
  if (player.isGamePaused) {
    return;
  }
  moveLines();
  moveEnemy();
  let road = gameArea.getBoundingClientRect();

  if (player.start) {
    // Simple left/right movement only - 2x speed for mobile
    if (keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed * 2; // 2x speed for mobile
    }
    if (keys.ArrowRight && player.x < road.width - 50) {
      player.x += player.speed * 2; // 2x speed for mobile
    }

    car.style.left = `${player.x}px`;
    car.style.top = `${player.y}px`;

    // Score increases over time
    player.score += 0.1;

    // Update display with speed only
    score.innerHTML = `Score: ${Math.floor(player.score)} | Speed: ${player.displaySpeed}km/h`;

    // Speed increases every 50 points
    const currentScore = Math.floor(player.score);
    if (currentScore > 0 && currentScore % 50 === 0 && currentScore > player.lastSpeedIncrease) {
      player.speed += 0.5; // Increase actual speed
      player.displaySpeed += 5; // Increase display speed by 5km/h
      player.lastSpeedIncrease = currentScore; // Update last speed increase
    }
  }

  window.requestAnimationFrame(playGame);
}

function endGame() {
  player.start = false;
  const highScore = localStorage.getItem("highScore");
  const finalScore = Math.floor(player.score);
  const finalSpeed = player.displaySpeed;
  
  // Update game over screen
  gameOverScore.textContent = `Score: ${finalScore}`;
  gameOverSpeed.textContent = `Speed: ${finalSpeed}km/h`;
  
  if (finalScore > highScore) {
    localStorage.setItem("highScore", finalScore);
    gameOverScore.textContent = `New High Score! Score: ${finalScore}`;
  }
  
  // Show game over screen
  gameOverScreen.classList.remove("hide");
  gameArea.classList.add("fadeOut");
}

function start(level) {
  // Hide all screens
  gameOverScreen.classList.add("hide");
  gameArea.classList.remove("fadeOut");
  startBtn.classList.add("hide");
  gameArea.innerHTML = "";

  // Reset game state
  player.start = true;
  player.speed = 5; // Reset actual speed
  player.displaySpeed = 30; // Reset display speed to 30km/h
  player.lastSpeedIncrease = 0; // Reset speed increase tracking
  player.score = 0;
  lines = [];
  enemies = [];

  // Create road lines
  for (let x = 0; x < 10; x++) {
    let div = document.createElement("div");
    div.classList.add("line");
    div.y = x * 150;
    div.style.top = `${div.y}px`;
    gameArea.appendChild(div);
    lines.push(div);
  }

  // Create player car
  car = document.createElement("div");
  car.setAttribute("class", "car");
  gameArea.appendChild(car);
  
  // Position car at bottom center
  const gameAreaRect = gameArea.getBoundingClientRect();
  player.x = (gameAreaRect.width - 50) / 2;
  player.y = gameAreaRect.height - 120;
  car.style.left = `${player.x}px`;
  car.style.top = `${player.y}px`;

  // Create enemies
  const numEnemies = 3;

  for (let x = 0; x < numEnemies; x++) {
    let enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.innerHTML = `<br>${x + 1}`;
    enemy.y = (x + 1) * 600 * -1;
    enemy.style.top = `${enemy.y}px`;
    enemy.style.left = `${Math.floor(Math.random() * (gameAreaRect.width - 50))}px`;
    enemy.style.backgroundColor = randomColor();
    gameArea.appendChild(enemy);
    enemies.push(enemy);
  }

  window.requestAnimationFrame(playGame);
}

function randomColor() {
  let hex = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + ("000000" + hex).slice(-6);
}

// Prevent context menu and zoom on mobile
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

let lastTouchEnd = 0;
document.addEventListener("touchend", (e) => {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);