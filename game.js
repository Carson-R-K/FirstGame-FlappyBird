const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird = { x: 80, y: 300, width: 30, height: 30, dy: 0 };
let gravity = 0.5;
let jump = -10;
let pipes = [];
let pipeWidth = 50;
let pipeGap = 150;
let frame = 0;
let score = 0;

// Listen for spacebar or tap
document.addEventListener('keydown', e => { if(e.code === 'Space') bird.dy = jump; });
canvas.addEventListener('touchstart', () => bird.dy = jump);

function spawnPipe() {
  let topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
  pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + pipeGap });
}

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

function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  bird.dy += gravity;
  bird.y += bird.dy;

  // spawn pipes
  if(frame % 90 === 0) spawnPipe();
  pipes.forEach(pipe => pipe.x -= 2);

  // collision
  pipes.forEach(pipe => {
    if(bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)) reset();
    if(pipe.x + pipeWidth === bird.x) score++;
  });

  // remove offscreen pipes
  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

  drawPipes();
  drawBird();

  // ground & ceiling
  if(bird.y + bird.height > canvas.height || bird.y < 0) reset();

  // draw score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  frame++;
  requestAnimationFrame(update);
}

function reset() {
  bird.y = 300;
  bird.dy = 0;
  pipes = [];
  score = 0;
  frame = 0;
}

update();
