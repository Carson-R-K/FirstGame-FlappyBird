const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIG ---
const ASPECT_RATIO = 2/3; // width:height
let bird, pipes, pipeWidth, pipeGap, frame, score;

// --- RESIZE CANVAS ---
function resizeCanvas() {
  let w = window.innerWidth;
  let h = window.innerHeight;

  if (w/h > ASPECT_RATIO) {
    canvas.height = h;
    canvas.width = h * ASPECT_RATIO;
  } else {
    canvas.width = w;
    canvas.height = w / ASPECT_RATIO;
  }

  canvas.style.marginLeft = `${(window.innerWidth - canvas.width)/2}px`;
  canvas.style.marginTop = `${(window.innerHeight - canvas.height)/2}px`;

  // Scale game elements
  pipeWidth = canvas.width * 0.12;
  pipeGap = canvas.height * 0.25;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- GAME STATE ---
function reset() {
  bird = { x: canvas.width * 0.2, y: canvas.height/2, width: canvas.width*0.07, height: canvas.width*0.07, dy:0 };
  pipes = [];
  frame = 0;
  score = 0;
}

// --- INPUT ---
const JUMP = -10;
document.addEventListener('keydown', e => { if(e.code === 'Space') bird.dy = JUMP; });
canvas.addEventListener('touchstart', () => bird.dy = JUMP);

// --- TILT / ACCELEROMETER ---
window.addEventListener('deviceorientation', event => {
  // gamma: left/right tilt [-90,90]
  if(event.gamma !== null) {
    const tilt = event.gamma / 45; // scale to [-1,1]
    bird.x += tilt * 5; // move bird left/right with tilt
    bird.x = Math.max(0, Math.min(canvas.width - bird.width, bird.x));
  }
});

// --- SPAWN PIPES ---
function spawnPipe() {
  let topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
  pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + pipeGap });
}

// --- DRAW FUNCTIONS ---
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
  ctx.font = `${canvas.width*0.07}px Arial`;
  ctx.fillText(`Score: ${score}`, canvas.width*0.05, canvas.height*0.08);
}

// --- GAME LOOP ---
function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  bird.dy += 0.5; // gravity
  bird.y += bird.dy;

  if(frame % 90 === 0) spawnPipe();
  pipes.forEach(pipe => pipe.x -= 2);

  // collision
  pipes.forEach(pipe => {
    if(bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)) reset();
    if(pipe.x + pipeWidth === bird.x) score++;
  });

  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

  // ground & ceiling
  if(bird.y + bird.height > canvas.height || bird.y < 0) reset();

  drawPipes();
  drawBird();
  drawScore();

  frame++;
  requestAnimationFrame(update);
}

// --- START GAME ---
reset();
update();
