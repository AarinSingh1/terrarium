// Terrarium — Day 1
// A minimal continuous-space ecosystem: plants grow and spread, herbivores
// wander, eat, reproduce, and die. Everything else added later in the week
// (day/night, predators, weather, interactivity, evolution, dashboard)
// plugs into this same loop.

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const CONFIG = {
  initialPlants: 40,
  initialHerbivores: 18,
  plantMaxSize: 6,
  plantGrowthRate: 0.01,
  plantSpreadChance: 0.0015,
  herbivoreSpeed: 0.6,
  herbivoreVisionRadius: 60,
  herbivoreEatRadius: 8,
  herbivoreEnergyDrain: 0.03,
  herbivoreEnergyFromPlant: 30,
  herbivoreReproduceThreshold: 90,
  herbivoreReproduceCost: 45,
  herbivoreStartEnergy: 50,
  maxPlants: 260,
  maxHerbivores: 140,
};

let plants = [];
let herbivores = [];
let tick = 0;
let running = true;
let speed = 1;

function rand(min, max) { return min + Math.random() * (max - min); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function makePlant(x, y) {
  return { x, y, size: rand(0.5, 1.5) };
}

function makeHerbivore(x, y, energy) {
  const angle = rand(0, Math.PI * 2);
  return {
    x, y,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    energy: energy ?? CONFIG.herbivoreStartEnergy,
  };
}

function reset() {
  plants = [];
  herbivores = [];
  tick = 0;
  for (let i = 0; i < CONFIG.initialPlants; i++) {
    plants.push(makePlant(rand(20, W - 20), rand(20, H - 20)));
  }
  for (let i = 0; i < CONFIG.initialHerbivores; i++) {
    herbivores.push(makeHerbivore(rand(20, W - 20), rand(20, H - 20)));
  }
}

function stepPlants() {
  const next = [];
  for (const p of plants) {
    if (p.size < CONFIG.plantMaxSize) p.size += CONFIG.plantGrowthRate;
    if (p.size >= CONFIG.plantMaxSize * 0.8 && Math.random() < CONFIG.plantSpreadChance
        && plants.length + next.length < CONFIG.maxPlants) {
      const angle = rand(0, Math.PI * 2);
      const r = rand(10, 30);
      const nx = p.x + Math.cos(angle) * r;
      const ny = p.y + Math.sin(angle) * r;
      if (nx > 5 && nx < W - 5 && ny > 5 && ny < H - 5) {
        next.push(makePlant(nx, ny));
      }
    }
  }
  plants.push(...next);
}

function nearestPlant(h) {
  let best = null;
  let bestDist = CONFIG.herbivoreVisionRadius;
  for (const p of plants) {
    const d = dist(h, p);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

function stepHerbivores() {
  const babies = [];
  herbivores = herbivores.filter(h => h.energy > 0);

  for (const h of herbivores) {
    const target = nearestPlant(h);

    if (target) {
      const dx = target.x - h.x;
      const dy = target.y - h.y;
      const d = Math.hypot(dx, dy) || 1;
      h.vx = dx / d;
      h.vy = dy / d;

      if (d < CONFIG.herbivoreEatRadius) {
        h.energy = Math.min(150, h.energy + CONFIG.herbivoreEnergyFromPlant);
        plants.splice(plants.indexOf(target), 1);
      }
    } else {
      // wander
      h.vx += rand(-0.2, 0.2);
      h.vy += rand(-0.2, 0.2);
      const norm = Math.hypot(h.vx, h.vy) || 1;
      h.vx /= norm;
      h.vy /= norm;
    }

    h.x += h.vx * CONFIG.herbivoreSpeed;
    h.y += h.vy * CONFIG.herbivoreSpeed;

    if (h.x < 5) { h.x = 5; h.vx *= -1; }
    if (h.x > W - 5) { h.x = W - 5; h.vx *= -1; }
    if (h.y < 5) { h.y = 5; h.vy *= -1; }
    if (h.y > H - 5) { h.y = H - 5; h.vy *= -1; }

    h.energy -= CONFIG.herbivoreEnergyDrain;

    if (h.energy > CONFIG.herbivoreReproduceThreshold && herbivores.length + babies.length < CONFIG.maxHerbivores) {
      h.energy -= CONFIG.herbivoreReproduceCost;
      babies.push(makeHerbivore(h.x + rand(-10, 10), h.y + rand(-10, 10), CONFIG.herbivoreReproduceCost * 0.6));
    }
  }

  herbivores.push(...babies);
  herbivores = herbivores.filter(h => h.energy > 0);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  for (const p of plants) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(110, 231, 160, ${0.35 + p.size / CONFIG.plantMaxSize * 0.5})`;
    ctx.fill();
  }

  for (const h of herbivores) {
    const t = Math.max(0, Math.min(1, h.energy / 100));
    ctx.beginPath();
    ctx.arc(h.x, h.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${255 - t * 155}, ${180 + t * 60}, 120, 0.9)`;
    ctx.fill();
  }
}

function updateStats() {
  document.getElementById("stat-day").textContent = Math.floor(tick / 600) + 1;
  document.getElementById("stat-plants").textContent = plants.length;
  document.getElementById("stat-herbivores").textContent = herbivores.length;
  const avgEnergy = herbivores.length
    ? Math.round(herbivores.reduce((s, h) => s + h.energy, 0) / herbivores.length)
    : 0;
  document.getElementById("stat-energy").textContent = avgEnergy;
}

function loop() {
  if (running) {
    for (let i = 0; i < speed; i++) {
      stepPlants();
      stepHerbivores();
      tick++;
      if (plants.length === 0 && Math.random() < 0.05) {
        plants.push(makePlant(rand(20, W - 20), rand(20, H - 20)));
      }
    }
    draw();
    updateStats();
  }
  requestAnimationFrame(loop);
}

function renderRoadmap() {
  const list = document.getElementById("roadmap-list");
  list.innerHTML = "";
  for (const item of ROADMAP) {
    const li = document.createElement("li");
    li.textContent = `Day ${item.day}: ${item.title}`;
    li.className = item.done ? "done" : "pending";
    list.appendChild(li);
  }
}

document.getElementById("btn-pause").addEventListener("click", (e) => {
  running = !running;
  e.target.textContent = running ? "Pause" : "Resume";
});

document.getElementById("btn-reset").addEventListener("click", reset);

document.getElementById("speed").addEventListener("input", (e) => {
  speed = Number(e.target.value);
});

renderRoadmap();
reset();
loop();
