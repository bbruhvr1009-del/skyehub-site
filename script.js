// ---- Starry Canvas ----
const STAR_COUNT = 150;
const PROXIMITY_LINE_MAX_DISTANCE = 80;
const MAX_PROXIMITY_CONNECTIONS_PER_POINT = 2;
const MAX_MAX_PROXIMITY_CONNECTIONS_PER_POINT = 5;

let pause_simulation = false;
let is_ready_for_drawing = false;
let last_timestamp = 0;
let delta_time = 0;

const canvas = document.getElementById("starry-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener("visibilitychange", () => {
  pause_simulation = document.hidden;
  if (!pause_simulation) last_timestamp = performance.now();
});

function randomMinMax(min, max) {
  return Math.random() * (max - min) + min;
}

class Star {
  constructor() {
    this.x = randomMinMax(-canvas.width / 2, canvas.width / 2);
    this.y = randomMinMax(-canvas.height / 2, canvas.height / 2);
    this.x_vel = randomMinMax(-18, 18);
    this.y_vel = randomMinMax(-18, 18);
    this.rot_vel = randomMinMax(-60, 60);
    this.size = randomMinMax(1.5, 3);
    this.color = `hsla(0, 0%, 100%, ${randomMinMax(0.3, 0.7)})`;
    this.rotation = 0;
    this.real_x = 0;
    this.real_y = 0;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.save();
    ctx.translate(this.real_x + this.size / 2, this.real_y + this.size / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }

  physicsStep() {
    const future_x = this.x + this.x_vel * delta_time;
    const future_y = this.y + this.y_vel * delta_time;
    const future_real_x = future_x + canvas.width / 2;
    const future_real_y = future_y + canvas.height / 2;

    if (future_real_x > canvas.width) this.x_vel = -Math.abs(this.x_vel);
    if (future_real_x < 0) this.x_vel = Math.abs(this.x_vel);
    if (future_real_y < 0) this.y_vel = Math.abs(this.y_vel);
    if (future_real_y > canvas.height) this.y_vel = -Math.abs(this.y_vel);

    this.x += this.x_vel * delta_time;
    this.y += this.y_vel * delta_time;
    this.rotation += this.rot_vel * delta_time;
    this.real_x = future_real_x;
    this.real_y = future_real_y;
  }
}

const all_stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
  all_stars.push(new Star());
}

function draw() {
  if (pause_simulation) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < all_stars.length; i++) {
    const star = all_stars[i];
    star.physicsStep();
    star.draw();

    let connections = 0;
    for (let a = 0; a < all_stars.length; a++) {
      if (connections >= MAX_MAX_PROXIMITY_CONNECTIONS_PER_POINT) break;
      const other = all_stars[a];
      const dist = Math.sqrt(Math.pow(other.x - star.x, 2) + Math.pow(other.y - star.y, 2));
      if (dist <= PROXIMITY_LINE_MAX_DISTANCE) {
        ctx.strokeStyle = connections >= MAX_PROXIMITY_CONNECTIONS_PER_POINT ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.moveTo(star.real_x, star.real_y);
        ctx.lineTo(other.real_x, other.real_y);
        ctx.stroke();
        connections++;
      }
    }
  }
}

function animationFrame(timestamp) {
  delta_time = (timestamp - last_timestamp) / 1000;
  if (!is_ready_for_drawing) is_ready_for_drawing = true;
  else draw();
  last_timestamp = timestamp;
  requestAnimationFrame(animationFrame);
}

requestAnimationFrame(animationFrame);
