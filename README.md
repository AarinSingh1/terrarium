# 🌱 Terrarium

A tiny digital ecosystem that lives in your browser — plants grow, herbivores
wander and graze, energy flows, generations rise and fall. No dependencies,
no build step: open `index.html` and watch it run.

This project grows for real, too: one new capability gets added each day for
a week.

## 7-day build log

- [x] **Day 1** — Core ecosystem: plants that grow and spread, herbivores that
      hunt for food, gain energy, reproduce, and die.
- [ ] **Day 2** — Day/night cycle affecting plant growth and creature behavior.
- [ ] **Day 3** — Predators join the food chain.
- [ ] **Day 4** — Seasons & weather (droughts, storms).
- [ ] **Day 5** — Click to plant, water, or drop food — direct interaction.
- [ ] **Day 6** — Evolving traits: speed, size, and diet drift across generations.
- [ ] **Day 7** — History dashboard: population graphs over time + save/load.

Progress is also tracked in [`roadmap.js`](roadmap.js), which drives the
build-log panel shown in the app itself.

## Running it

Just open `index.html` in a browser. Everything is plain HTML/CSS/JS.

## How it works (so far)

- **Plants** grow slowly over time and spread nearby copies of themselves
  once mature.
- **Herbivores** wander until a plant enters their vision radius, move toward
  it, eat it for energy, and spend energy just by being alive. Enough energy
  banked and they reproduce; run out and they die.
- The whole thing runs on a single `requestAnimationFrame` loop so future
  systems (predators, weather, evolution...) can hook into the same tick.
