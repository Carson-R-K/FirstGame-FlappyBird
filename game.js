const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ASPECT_RATIO = 2 / 3; // width / height

let bird, pipes, pipeWidth, pipeGap, frame, score;

// --- RESIZE CANVAS ---
function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let canvasWidth, canvasHeight;

  if (windowWidth / windowHeight > ASPECT_RATIO) {
    // Screen wider than 2:3 → fit by height
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * ASPECT_RATIO;
  } else {
    // Screen taller than 2:3 → fit by width
    canvasWidth = windowWidth;
    canvasHeight = canvasWidth / ASPECT_RATIO;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Center canvas
  canvas.style.marginTop = `${(windowHeight - canvasHeight) / 2}px`;
  canvas.style.marginLeft = `${(windowWidth - canvasWidth) / 2}px`;

  // Scale game elements
  pipeWidth = canvas.width * 0.12;
  pipeGap = canvas.height * 0.25;
  bird.width = canvas.width * 0.07;
  bird.height = canvas.width * 0.07;

  // Reset bird position to center
  bird.x = canvas.width * 0.2;
  bird.y = canvas.height / 2;
}

window.addEventListener('resize', resizeCanvas);

// --- RESET GAME ---
function reset() {
  bird = { x: 0, y: 0, width: 0, height: 0, dy: 0 };
  pipes = [];
  frame = 0;
  score = 0;
  resizeCanvas();
}

// --- INPUT ---
const JUMP = -10;
document.addEventListener('keydown', e => { if (e.code === 'Space') bird.dy = JUMP; });
canvas.addEventListener('touchstart', () => bird.dy = JUMP);

// --- TILT / ACCELEROMETER ---
window.addEventListener('deviceorientation', e => {
  if (e.gamma !== null) {
    const tilt = e.gamma / 45; // scale [-90,90] to approx [-1,1]
    bird.x += tilt * canvas.width * 0.005;
    bird.x = Math.max(0, Math.min(canvas.width - bird.width, bird.x));
  }
});

// --- SPAWN PIPES ---
function spawnPipe() {
  const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
  pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + pipeGap });
}

// --- DRAW ---
function drawBird() {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  ctx.fillStyle = 'green';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = `${canvas.width * 0.07}px Arial`;
  ctx.fillText(`Score: ${score}`, canvas.width * 0.05, canvas.height * 0.08);
}

// --- GAME LOOP ---
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.dy += 0.5; // gravity
  bird.y += bird.dy;

  if (frame % 90 === 0) spawnPipe();
  pipes.forEach(pipe => pipe.x -= 2);

  // collision
  pipes.forEach(pipe => {
    if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)) reset();
    if (pipe.x + pipeWidth === bird.x) score++;
  });

  // remove offscreen pipes
  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

  // ground & ceiling
  if (bird.y + bird.height > canvas.height || bird.y < 0) reset();

  drawPipes();
  drawBird();
  drawScore();

  frame++;
  requestAnimationFrame(update);
}

// --- START ---
reset();
update();
